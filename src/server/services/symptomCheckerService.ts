import OpenAI from 'openai';
import { Op, Sequelize } from 'sequelize';
import HealthMetric from '../models/HealthMetric.js';
import User from '../models/User.js';

export interface SymptomInput {
  primarySymptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  onset: 'gradual' | 'sudden';
  location?: string;
  triggers?: string[];
  aggravatingFactors?: string[];
  relievingFactors?: string[];
  associatedSymptoms?: string[];
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  lifestyleFactors?: {
    diet?: string;
    exercise?: string;
    sleep?: string;
    stress?: string;
    smoking?: boolean;
    alcohol?: boolean;
    drugUse?: boolean;
  };
  vitals?: {
    temperature?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  demographics?: {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    weight?: number;
    height?: number;
  };
}

export interface SymptomAnalysisResult {
  id: string;
  userId?: number;
  symptoms: SymptomInput;
  possibleConditions: Array<{
    name: string;
    likelihood: 'low' | 'moderate' | 'high';
    description: string;
    commonSymptoms: string[];
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
    recommendedActions: string[];
  }>;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  redFlags: string[];
  recommendations: {
    immediate: string[];
    homeCare: string[];
    whenToSeekCare: string[];
    selfMonitoring: string[];
  };
  followUpQuestions: string[];
  riskFactors: string[];
  preventionTips: string[];
  disclaimer: string;
  createdAt: Date;
}

export interface MedicalResource {
  id: string;
  title: string;
  type: 'emergency_service' | 'hospital' | 'clinic' | 'pharmacy' | 'specialist';
  description: string;
  symptoms: string[];
  contact: {
    phone?: string;
    website?: string;
    address?: string;
    emergencyNumber?: boolean;
  };
  availability: {
    hours?: string;
    emergency?: boolean;
  };
  distance?: number;
  rating?: number;
}

export interface EmergencyGuideline {
  condition: string;
  symptoms: string[];
  urgencyLevel: 'emergency' | 'urgent' | 'routine';
  actions: string[];
  timeframe: string;
  whatToExpect: string;
}

class SymptomCheckerService {
  private openai: OpenAI;
  private sequelize: Sequelize;
  private emergencyKeywords = [
    'chest pain', 'difficulty breathing', 'shortness of breath', 'severe headache',
    'loss of consciousness', 'fainting', 'confusion', 'slurred speech',
    'vision changes', 'numbness', 'weakness', 'severe bleeding',
    'high fever', 'stiff neck', 'suicidal thoughts', 'self harm',
    'severe abdominal pain', 'vomiting blood', 'black stool',
    'allergic reaction', 'swelling', 'difficulty swallowing'
  ];

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.sequelize = new Sequelize(process.env.DATABASE_URL || '');
  }

  async analyzeSymptoms(symptoms: SymptomInput, userId?: number): Promise<SymptomAnalysisResult> {
    // Check for emergency conditions first
    const emergencyCheck = this.checkForEmergencySymptoms(symptoms);
    if (emergencyCheck.isEmergency) {
      return this.createEmergencyResult(symptoms, emergencyCheck.reason);
    }

    // Analyze with AI
    const aiAnalysis = await this.analyzeWithAI(symptoms);

    // Check for risk factors
    const riskFactors = await this.identifyRiskFactors(symptoms, userId);

    // Generate recommendations
    const recommendations = this.generateRecommendations(symptoms, aiAnalysis, emergencyCheck);

    // Create result
    const result: SymptomAnalysisResult = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      symptoms,
      possibleConditions: aiAnalysis.possibleConditions,
      urgencyLevel: aiAnalysis.urgencyLevel,
      redFlags: emergencyCheck.redFlags,
      recommendations,
      followUpQuestions: aiAnalysis.followUpQuestions,
      riskFactors,
      preventionTips: this.generatePreventionTips(aiAnalysis.possibleConditions),
      disclaimer: 'This symptom checker is not a substitute for professional medical advice. If you are experiencing severe symptoms or a medical emergency, please call emergency services immediately.',
      createdAt: new Date()
    };

    // Save analysis if user provided
    if (userId) {
      await this.saveAnalysis(result);
    }

    return result;
  }

  private checkForEmergencySymptoms(symptoms: SymptomInput): {
    isEmergency: boolean;
    reason: string;
    redFlags: string[];
  } {
    const allSymptoms = [
      ...symptoms.primarySymptoms,
      ...(symptoms.associatedSymptoms || [])
    ].map(s => s.toLowerCase());

    const redFlags: string[] = [];
    let isEmergency = false;
    let reason = '';

    // Check for severe symptoms
    if (symptoms.severity === 'severe') {
      isEmergency = true;
      reason = 'Symptoms are described as severe';
      redFlags.push('Severe symptoms require immediate medical attention');
    }

    // Check for emergency keywords
    const foundKeywords = this.emergencyKeywords.filter(keyword =>
      allSymptoms.some(symptom => symptom.includes(keyword))
    );

    if (foundKeywords.length > 0) {
      isEmergency = true;
      reason = `Emergency symptoms detected: ${foundKeywords.join(', ')}`;
      redFlags.push(...foundKeywords);
    }

    // Check vital signs
    if (symptoms.vitals) {
      if (symptoms.vitals.temperature && symptoms.vitals.temperature > 103) {
        isEmergency = true;
        redFlags.push('High fever (>103°F/39.4°C)');
      }

      if (symptoms.vitals.bloodPressure) {
        const { systolic, diastolic } = symptoms.vitals.bloodPressure;
        if (systolic > 180 || diastolic > 120) {
          isEmergency = true;
          redFlags.push('Very high blood pressure (Hypertensive crisis)');
        }
      }

      if (symptoms.vitals.heartRate && symptoms.vitals.heartRate > 120) {
        isEmergency = true;
        redFlags.push('Very high heart rate (>120 bpm)');
      }

      if (symptoms.vitals.oxygenSaturation && symptoms.vitals.oxygenSaturation < 90) {
        isEmergency = true;
        redFlags.push('Low oxygen saturation (<90%)');
      }
    }

    // Check specific combinations
    if (allSymptoms.includes('chest pain') || allSymptoms.includes('chest discomfort')) {
      if (allSymptoms.includes('shortness of breath') ||
          allSymptoms.includes('difficulty breathing') ||
          allSymptoms.includes('pain in jaw') ||
          allSymptoms.includes('pain in arm')) {
        isEmergency = true;
        reason = 'Possible heart attack symptoms';
        redFlags.push('Chest pain with breathing difficulty');
      }
    }

    if (allSymptoms.includes('headache') && allSymptoms.includes('stiff neck')) {
      if (allSymptoms.includes('fever') || allSymptoms.includes('confusion')) {
        isEmergency = true;
        reason = 'Possible meningitis symptoms';
        redFlags.push('Headache with stiff neck and fever');
      }
    }

    return { isEmergency, reason, redFlags };
  }

  private createEmergencyResult(symptoms: SymptomInput, reason: string): SymptomAnalysisResult {
    return {
      id: `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symptoms,
      possibleConditions: [{
        name: 'Medical Emergency',
        likelihood: 'high',
        description: 'Immediate medical attention required',
        commonSymptoms: symptoms.primarySymptoms,
        urgencyLevel: 'emergency',
        recommendedActions: [
          'Call emergency services immediately (911)',
          'Go to the nearest emergency room',
          'Do not drive yourself if possible'
        ]
      }],
      urgencyLevel: 'emergency',
      redFlags: ['Immediate medical attention required'],
      recommendations: {
        immediate: [
          'Call emergency services (911) immediately',
          'Go to the nearest emergency room',
          'Do not wait for symptoms to improve'
        ],
        homeCare: [],
        whenToSeekCare: ['Immediately - this is an emergency'],
        selfMonitoring: []
      },
      followUpQuestions: [],
      riskFactors: [],
      preventionTips: [],
      disclaimer: 'This is a medical emergency. Please call emergency services immediately or go to the nearest emergency room.',
      createdAt: new Date()
    };
  }

  private async analyzeWithAI(symptoms: SymptomInput): Promise<{
    possibleConditions: Array<{
      name: string;
      likelihood: 'low' | 'moderate' | 'high';
      description: string;
      commonSymptoms: string[];
      urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
      recommendedActions: string[];
    }>;
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
    followUpQuestions: string[];
  }> {
    const prompt = this.buildSymptomAnalysisPrompt(symptoms);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an AI medical assistant specializing in symptom analysis. Your role is to provide general health information but always emphasize that you are not a substitute for professional medical care.

            Analyze the symptoms and provide:
            1. Possible conditions with likelihood assessment
            2. Urgency level assessment
            3. Follow-up questions for better understanding
            4. Recommended actions

            Always include a clear disclaimer that this is not medical advice.

            Format your response as JSON with this structure:
            {
              "possibleConditions": [
                {
                  "name": "Condition Name",
                  "likelihood": "low|moderate|high",
                  "description": "Brief description",
                  "commonSymptoms": ["symptom1", "symptom2"],
                  "urgencyLevel": "low|medium|high|emergency",
                  "recommendedActions": ["action1", "action2"]
                }
              ],
              "urgencyLevel": "low|medium|high|emergency",
              "followUpQuestions": ["question1", "question2"]
            }`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      try {
        const analysis = JSON.parse(response);
        return analysis;
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return this.parseAnalysisFromText(response);
      }
    } catch (error: any) {
      console.error('Error analyzing symptoms with AI:', error);
      throw new Error('Failed to analyze symptoms. Please try again.');
    }
  }

  private buildSymptomAnalysisPrompt(symptoms: SymptomInput): string {
    return `Please analyze these symptoms:

Primary Symptoms: ${symptoms.primarySymptoms.join(', ')}
Severity: ${symptoms.severity}
Duration: ${symptoms.duration}
Onset: ${symptoms.onset}
Location: ${symptoms.location || 'Not specified'}

Associated Symptoms: ${symptoms.associatedSymptoms?.join(', ') || 'None'}
Triggers: ${symptoms.triggers?.join(', ') || 'None'}
Aggravating Factors: ${symptoms.aggravatingFactors?.join(', ') || 'None'}
Relieving Factors: ${symptoms.relievingFactors?.join(', ') || 'None'}

Medical History: ${symptoms.medicalHistory?.join(', ') || 'Not provided'}
Current Medications: ${symptoms.currentMedications?.join(', ') || 'None'}
Allergies: ${symptoms.allergies?.join(', ') || 'None'}

Lifestyle:
- Diet: ${symptoms.lifestyleFactors?.diet || 'Not specified'}
- Exercise: ${symptoms.lifestyleFactors?.exercise || 'Not specified'}
- Sleep: ${symptoms.lifestyleFactors?.sleep || 'Not specified'}
- Stress: ${symptoms.lifestyleFactors?.stress || 'Not specified'}
- Smoking: ${symptoms.lifestyleFactors?.smoking ? 'Yes' : 'No'}
- Alcohol: ${symptoms.lifestyleFactors?.alcohol ? 'Yes' : 'No'}

Vital Signs:
${symptoms.vitals ? `
- Temperature: ${symptoms.vitals.temperature || 'Not measured'}°F
- Blood Pressure: ${symptoms.vitals.bloodPressure ? `${symptoms.vitals.bloodPressure.systolic}/${symptoms.vitals.bloodPressure.diastolic}` : 'Not measured'} mmHg
- Heart Rate: ${symptoms.vitals.heartRate || 'Not measured'} bpm
- Respiratory Rate: ${symptoms.vitals.respiratoryRate || 'Not measured'} breaths/min
- Oxygen Saturation: ${symptoms.vitals.oxygenSaturation || 'Not measured'}%
` : 'Not measured'}

Demographics:
${symptoms.demographics ? `
- Age: ${symptoms.demographics.age || 'Not specified'}
- Gender: ${symptoms.demographics.gender || 'Not specified'}
- Weight: ${symptoms.demographics.weight || 'Not specified'} lbs
- Height: ${symptoms.demographics.height || 'Not specified'} inches
` : 'Not provided'}

Please provide a thorough analysis with multiple possible conditions, their likelihood, and urgency level.`;
  }

  private parseAnalysisFromText(text: string): any {
    // Fallback parsing if JSON fails
    return {
      possibleConditions: [{
        name: 'General Condition',
        likelihood: 'moderate',
        description: 'General health condition that may require medical attention',
        commonSymptoms: [],
        urgencyLevel: 'medium',
        recommendedActions: ['Consult a healthcare provider']
      }],
      urgencyLevel: 'medium',
      followUpQuestions: [
        'When did these symptoms start?',
        'Have you experienced these symptoms before?',
        'Are there any specific triggers?'
      ]
    };
  }

  private async identifyRiskFactors(symptoms: SymptomInput, userId?: number): Promise<string[]> {
    const riskFactors: string[] = [];

    // Lifestyle risk factors
    if (symptoms.lifestyleFactors) {
      if (symptoms.lifestyleFactors.smoking) {
        riskFactors.push('Smoking increases risk for many conditions');
      }
      if (symptoms.lifestyleFactors.alcohol) {
        riskFactors.push('Alcohol consumption may affect symptoms');
      }
      if (symptoms.lifestyleFactors.stress === 'high') {
        riskFactors.push('High stress levels can worsen many conditions');
      }
    }

    // Age-related risk factors
    if (symptoms.demographics?.age) {
      const age = symptoms.demographics.age;
      if (age > 65) {
        riskFactors.push('Age over 65 increases risk for many conditions');
      }
      if (age < 5) {
        riskFactors.push('Young children require prompt medical attention');
      }
    }

    // Check vital sign risk factors
    if (symptoms.vitals) {
      if (symptoms.vitals.temperature && symptoms.vitals.temperature > 101) {
        riskFactors.push('Fever indicates infection or inflammation');
      }
      if (symptoms.vitals.bloodPressure) {
        const { systolic, diastolic } = symptoms.vitals.bloodPressure;
        if (systolic > 140 || diastolic > 90) {
          riskFactors.push('Elevated blood pressure requires attention');
        }
      }
    }

    // Get user's medical history if userId provided
    if (userId) {
      const user = await User.findByPk(userId);
      if (user) {
        const age = this.calculateAge(user.dateOfBirth);
        if (age > 65) {
          riskFactors.push('Advanced age requires careful monitoring');
        }
      }
    }

    return riskFactors;
  }

  private generateRecommendations(
    symptoms: SymptomInput,
    aiAnalysis: any,
    emergencyCheck: any
  ): {
    immediate: string[];
    homeCare: string[];
    whenToSeekCare: string[];
    selfMonitoring: string[];
  } {
    const recommendations = {
      immediate: [] as string[],
      homeCare: [] as string[],
      whenToSeekCare: [] as string[],
      selfMonitoring: [] as string[]
    };

    // Immediate recommendations
    if (symptoms.severity === 'severe') {
      recommendations.immediate.push('Seek immediate medical attention');
    }

    if (symptoms.duration === 'sudden') {
      recommendations.immediate.push('Sudden onset requires prompt evaluation');
    }

    // Home care recommendations
    if (symptoms.severity === 'mild') {
      recommendations.homeCare.push('Rest and monitor symptoms at home');
      recommendations.homeCare.push('Stay hydrated');
    }

    // When to seek care
    if (symptoms.severity === 'moderate') {
      recommendations.whenToSeekCare.push('Consult a healthcare provider within 24-48 hours');
    }

    if (symptoms.duration.includes('week') || symptoms.duration.includes('weeks')) {
      recommendations.whenToSeekCare.push('Symptoms persisting for more than a week need evaluation');
    }

    // Self monitoring
    if (symptoms.vitals) {
      recommendations.selfMonitoring.push('Monitor vital signs regularly');
      recommendations.selfMonitoring.push('Keep a symptom diary');
    }

    // Add AI recommendations
    if (aiAnalysis.possibleConditions && aiAnalysis.possibleConditions.length > 0) {
      const primaryCondition = aiAnalysis.possibleConditions[0];
      if (primaryCondition.recommendedActions) {
        recommendations.homeCare.push(...primaryCondition.recommendedActions);
      }
    }

    return recommendations;
  }

  private generatePreventionTips(conditions: any[]): string[] {
    const tips: string[] = [];

    // General prevention tips
    tips.push('Maintain a healthy lifestyle with balanced diet and regular exercise');
    tips.push('Get adequate sleep and manage stress levels');
    tips.push('Practice good hygiene including frequent hand washing');
    tips.push('Stay up to date with vaccinations and preventive care');
    tips.push('Avoid smoking and limit alcohol consumption');
    tips.push('Stay hydrated and eat a balanced diet');

    // Condition-specific tips would be added based on the possible conditions
    conditions.forEach(condition => {
      switch (condition.name.toLowerCase()) {
        case 'flu':
        case 'common cold':
          tips.push('Get annual flu vaccination');
          tips.push('Wash hands frequently, especially during cold and flu season');
          tips.push('Avoid close contact with sick individuals');
          break;
        case 'migraine':
          tips.push('Identify and avoid personal migraine triggers');
          tips.push('Maintain regular sleep patterns');
          tips.push('Manage stress through relaxation techniques');
          break;
        case 'acid reflux':
          tips.push('Avoid trigger foods (spicy, fatty, acidic)');
          tips.push('Eat smaller, more frequent meals');
          tips.push('Avoid eating 2-3 hours before bedtime');
          break;
      }
    });

    return tips.slice(0, 10); // Limit to 10 tips
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  async getEmergencyResources(location?: { latitude: number; longitude: number }): Promise<MedicalResource[]> {
    const resources: MedicalResource[] = [
      {
        id: 'emergency_911',
        title: 'Emergency Services (911)',
        type: 'emergency_service',
        description: 'Call for immediate medical emergencies',
        symptoms: ['chest pain', 'difficulty breathing', 'severe bleeding', 'loss of consciousness'],
        contact: {
          emergencyNumber: true,
          phone: '911'
        },
        availability: {
          emergency: true
        }
      },
      {
        id: 'poison_control',
        title: 'Poison Control Center',
        type: 'emergency_service',
        description: '24/7 poison control and emergency information',
        symptoms: ['poisoning', 'overdose', 'chemical exposure'],
        contact: {
          phone: '1-800-222-1222',
          website: 'https://www.aapcc.org'
        },
        availability: {
          hours: '24/7',
          emergency: true
        }
      },
      {
        id: 'suicide_prevention',
        title: 'Suicide Prevention Lifeline',
        type: 'emergency_service',
        description: '24/7 crisis support and suicide prevention',
        symptoms: ['suicidal thoughts', 'depression', 'mental health crisis'],
        contact: {
          phone: '988',
          website: 'https://988lifeline.org'
        },
        availability: {
          hours: '24/7',
          emergency: true
        }
      }
    ];

    if (location) {
      // In production, this would query a database of nearby hospitals and clinics
      // For now, add mock local resources
      resources.push({
        id: 'local_hospital',
        title: 'General Hospital',
        type: 'hospital',
        description: 'Full-service emergency room and medical care',
        symptoms: [],
        contact: {
          phone: '(555) 123-4567',
          address: '123 Main St, City, State',
          website: 'https://www.hospital.com'
        },
        availability: {
          hours: '24/7 emergency',
          emergency: true
        },
        distance: this.calculateDistance(location.latitude, location.longitude, 40.7128, -74.0060),
        rating: 4.2
      });
    }

    return resources;
  }

  async getEmergencyGuidelines(): Promise<EmergencyGuideline[]> {
    return [
      {
        condition: 'Chest Pain',
        symptoms: ['chest pain', 'chest discomfort', 'pressure in chest', 'pain in jaw or arm'],
        urgencyLevel: 'emergency',
        actions: ['Call 911 immediately', 'Chew one aspirin if available', 'Sit down and rest', 'Loosen tight clothing'],
        timeframe: 'Immediately',
        whatToExpect: 'Emergency medical services will arrive and transport to hospital. Emergency department will perform EKG, blood tests, and cardiac monitoring.'
      },
      {
        condition: 'Difficulty Breathing',
        symptoms: ['shortness of breath', 'cannot breathe', 'wheezing', 'chest tightness'],
        urgencyLevel: 'emergency',
        actions: ['Call 911 immediately', 'Sit upright', 'Loosen tight clothing', 'Use prescribed inhaler if available'],
        timeframe: 'Immediately',
        whatToExpect: 'Emergency responders will provide oxygen and transport to hospital for evaluation and treatment.'
      },
      {
        condition: 'High Fever',
        symptoms: ['fever over 103°F', 'severe headache', 'stiff neck', 'confusion'],
        urgencyLevel: 'emergency',
        actions: ['Seek immediate medical care', 'Take fever-reducing medication', 'Stay hydrated', 'Monitor symptoms'],
        timeframe: 'Within hours',
        whatToExpect: 'Medical evaluation to determine cause of fever and appropriate treatment.'
      },
      {
        condition: 'Severe Bleeding',
        symptoms: ['heavy bleeding', 'cannot stop bleeding', 'blood loss', 'deep wound'],
        urgencyLevel: 'emergency',
        actions: ['Apply direct pressure', 'Call 911', 'Elevate bleeding area', 'Keep warm'],
        timeframe: 'Immediately',
        whatToExpect: 'Emergency care to stop bleeding and prevent shock.'
      }
    ];
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private async saveAnalysis(result: SymptomAnalysisResult): Promise<void> {
    // In production, this would save to database
    console.log(`Symptom analysis saved for user ${result.userId}:`, result.id);
  }

  async getUserAnalysisHistory(userId: number, limit: number = 10): Promise<SymptomAnalysisResult[]> {
    // In production, this would query the database
    console.log(`Fetching symptom analysis history for user ${userId}, limit ${limit}`);
    return [];
  }
}

export default new SymptomCheckerService();