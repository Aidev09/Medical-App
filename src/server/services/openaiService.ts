import OpenAI from 'openai';
import { Op } from 'sequelize';
import User from '../models/User.js';
import HealthMetric from '../models/HealthMetric.js';
import MedicationRecord from '../models/MedicationRecord.js';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatSession {
  id: string;
  userId: number;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface MedicalConsultation {
  symptoms?: string[];
  duration?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  medications?: string[];
  medicalHistory?: string;
  allergies?: string[];
  lifestyle?: string;
}

export interface AIResponse {
  message: string;
  suggestions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  followUpQuestions: string[];
  shouldConsultDoctor: boolean;
  possibleConditions: string[];
  disclaimer: string;
}

class OpenAIService {
  private openai: OpenAI;
  private chatSessions: Map<string, ChatSession> = new Map();
  private rateLimitMap: Map<number, { count: number; resetTime: number }> = new Map();

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private getSystemPrompt(userContext?: any): string {
    const currentDate = new Date().toISOString().split('T')[0];

    return `You are a helpful AI medical assistant for the Medical App. Your role is to provide general health information and guidance, but always emphasize that you are not a substitute for professional medical advice.

Current Date: ${currentDate}

${userContext ? `
User Context:
- Name: ${userContext.firstName} ${userContext.lastName}
- Age: ${this.calculateAge(userContext.dateOfBirth)}
- Known medications: ${userContext.medications?.map((m: any) => m.name).join(', ') || 'None'}
- Recent health metrics available: ${userContext.healthMetrics ? 'Yes' : 'No'}
` : ''}

IMPORTANT GUIDELINES:
1. Always include the disclaimer: "I am an AI assistant and not a medical professional. Please consult with a qualified healthcare provider for medical advice, diagnosis, or treatment."
2. For any serious symptoms, emergency situations, or life-threatening conditions, advise immediate medical attention.
3. Provide general health information and possible explanations, but never give definitive diagnoses.
4. Suggest when to seek professional medical care.
5. Consider the user's age and provided medical history when relevant.
6. If the user mentions symptoms that could be serious (chest pain, difficulty breathing, severe headache, etc.), emphasize seeking immediate care.
7. Be empathetic, clear, and helpful.
8. Structure your responses with clear sections and actionable advice when appropriate.

Response Format:
- Start with a brief, empathetic acknowledgment
- Provide helpful information in clear sections
- Include any red flags or symptoms that require immediate attention
- Suggest appropriate self-care measures when applicable
- Always end with the disclaimer about not being a medical professional`;
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

  private checkRateLimit(userId: number): boolean {
    const now = Date.now();
    const userLimit = this.rateLimitMap.get(userId);
    const maxRequestsPerHour = 20; // Rate limit
    const hourMs = 60 * 60 * 1000;

    if (!userLimit) {
      this.rateLimitMap.set(userId, { count: 1, resetTime: now + hourMs });
      return true;
    }

    if (now > userLimit.resetTime) {
      this.rateLimitMap.set(userId, { count: 1, resetTime: now + hourMs });
      return true;
    }

    if (userLimit.count >= maxRequestsPerHour) {
      return false;
    }

    userLimit.count++;
    return true;
  }

  private async getUserContext(userId: number): Promise<any> {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['firstName', 'lastName', 'dateOfBirth'],
        include: [
          {
            model: MedicationRecord,
            where: { active: true },
            required: false,
            attributes: ['name', 'dosage', 'frequency']
          }
        ]
      });

      if (!user) return null;

      const recentHealthMetrics = await HealthMetric.findAll({
        where: { userId },
        order: [['timestamp', 'DESC']],
        limit: 10,
        attributes: ['type', 'value', 'unit', 'timestamp']
      });

      return {
        ...user.toJSON(),
        healthMetrics: recentHealthMetrics
      };
    } catch (error) {
      console.error('Error fetching user context:', error);
      return null;
    }
  }

  async startChatSession(userId: number): Promise<ChatSession> {
    const sessionId = this.generateSessionId();
    const session: ChatSession = {
      id: sessionId,
      userId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    // Add system message
    const userContext = await this.getUserContext(userId);
    session.messages.push({
      role: 'system',
      content: this.getSystemPrompt(userContext),
      timestamp: new Date()
    });

    this.chatSessions.set(sessionId, session);
    return session;
  }

  async sendMessage(
    sessionId: string,
    message: string,
    userId: number
  ): Promise<AIResponse> {
    // Check rate limiting
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const session = this.chatSessions.get(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error('Invalid session');
    }

    if (!session.isActive) {
      throw new Error('Session is inactive');
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    try {
      // Get recent messages for context (last 10 messages)
      const recentMessages = session.messages.slice(-10);

      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: recentMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: 1000,
        temperature: 0.7,
        user: userId.toString()
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Add AI response to session
      session.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });
      session.updatedAt = new Date();

      // Parse and structure the response
      const structuredResponse = await this.parseAIResponse(aiResponse, message);

      return structuredResponse;
    } catch (error: any) {
      console.error('OpenAI API error:', error);

      if (error.code === 'insufficient_quota') {
        throw new Error('AI service temporarily unavailable. Please try again later.');
      }

      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  private async parseAIResponse(aiResponse: string, userMessage: string): Promise<AIResponse> {
    // Analyze the response to extract structured information
    const urgencyLevel = this.determineUrgencyLevel(userMessage, aiResponse);
    const shouldConsultDoctor = this.shouldConsultDoctor(userMessage, aiResponse);
    const followUpQuestions = this.extractFollowUpQuestions(aiResponse);
    const suggestions = this.extractSuggestions(aiResponse);
    const possibleConditions = this.extractPossibleConditions(aiResponse);

    return {
      message: aiResponse,
      suggestions,
      urgencyLevel,
      followUpQuestions,
      shouldConsultDoctor,
      possibleConditions,
      disclaimer: 'I am an AI assistant and not a medical professional. Please consult with a qualified healthcare provider for medical advice, diagnosis, or treatment.'
    };
  }

  private determineUrgencyLevel(userMessage: string, aiResponse: string): 'low' | 'medium' | 'high' | 'emergency' {
    const emergencyKeywords = [
      'chest pain', 'difficulty breathing', 'shortness of breath', 'severe headache',
      'loss of consciousness', 'fainting', 'suicidal', 'self harm', 'emergency',
      'call 911', 'call emergency', 'go to emergency room', 'go to er'
    ];

    const highUrgencyKeywords = [
      'fever over 103', 'severe pain', 'bleeding heavily', 'broken bone',
      'possible fracture', 'head injury', 'concussion', 'allergic reaction',
      'difficulty swallowing', 'vision changes', 'confusion'
    ];

    const message = userMessage.toLowerCase() + ' ' + aiResponse.toLowerCase();

    if (emergencyKeywords.some(keyword => message.includes(keyword))) {
      return 'emergency';
    }

    if (highUrgencyKeywords.some(keyword => message.includes(keyword))) {
      return 'high';
    }

    if (message.includes('doctor') || message.includes('medical attention')) {
      return 'medium';
    }

    return 'low';
  }

  private shouldConsultDoctor(userMessage: string, aiResponse: string): boolean {
    const consultKeywords = [
      'consult doctor', 'see doctor', 'medical professional', 'healthcare provider',
      'seek medical care', 'medical attention', 'diagnosis', 'prescription'
    ];

    const message = userMessage.toLowerCase() + ' ' + aiResponse.toLowerCase();
    return consultKeywords.some(keyword => message.includes(keyword)) ||
           this.determineUrgencyLevel(userMessage, aiResponse) !== 'low';
  }

  private extractFollowUpQuestions(text: string): string[] {
    const questions: string[] = [];
    const sentences = text.split(/[.!?]+/);

    sentences.forEach(sentence => {
      sentence = sentence.trim();
      if (sentence.includes('?') &&
          (sentence.toLowerCase().includes('have you') ||
           sentence.toLowerCase().includes('do you') ||
           sentence.toLowerCase().includes('are you') ||
           sentence.toLowerCase().includes('how long') ||
           sentence.toLowerCase().includes('when did'))) {
        questions.push(sentence);
      }
    });

    return questions.slice(0, 3); // Limit to 3 questions
  }

  private extractSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    const sentences = text.split(/[.!?]+/);

    sentences.forEach(sentence => {
      sentence = sentence.trim();
      if (sentence.toLowerCase().includes('try') ||
          sentence.toLowerCase().includes('consider') ||
          sentence.toLowerCase().includes('you can') ||
          sentence.toLowerCase().includes('recommend') ||
          sentence.toLowerCase().includes('suggestion')) {
        suggestions.push(sentence);
      }
    });

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  private extractPossibleConditions(text: string): string[] {
    // This is a simplified extraction - in production, you might use more sophisticated NLP
    const conditions: string[] = [];
    const commonConditions = [
      'cold', 'flu', 'migraine', 'allergy', 'asthma', 'diabetes',
      'hypertension', 'anxiety', 'depression', 'arthritis', 'sinus infection'
    ];

    commonConditions.forEach(condition => {
      const regex = new RegExp(`\\b${condition}\\b`, 'gi');
      if (regex.test(text)) {
        conditions.push(condition);
      }
    });

    return conditions;
  }

  async analyzeSymptoms(consultation: MedicalConsultation, userId: number): Promise<AIResponse> {
    const symptomDescription = this.formatSymptomDescription(consultation);

    // Create a new session for symptom analysis
    const session = await this.startChatSession(userId);

    const analysisMessage = `Please analyze these symptoms and provide guidance:

Symptoms: ${consultation.symptoms?.join(', ') || 'Not specified'}
Duration: ${consultation.duration || 'Not specified'}
Severity: ${consultation.severity || 'Not specified'}
Current medications: ${consultation.medications?.join(', ') || 'None'}
Medical history: ${consultation.medicalHistory || 'None provided'}
Known allergies: ${consultation.allergies?.join(', ') || 'None'}
Lifestyle factors: ${consultation.lifestyle || 'None provided'}

Please provide a thorough analysis with possible explanations, red flags, and recommendations.`;

    return this.sendMessage(session.id, analysisMessage, userId);
  }

  private formatSymptomDescription(consultation: MedicalConsultation): string {
    return `
    Symptoms: ${consultation.symptoms?.join(', ') || 'None specified'}
    Duration: ${consultation.duration || 'Unknown'}
    Severity: ${consultation.severity || 'Not specified'}
    Current Medications: ${consultation.medications?.join(', ') || 'None'}
    Allergies: ${consultation.allergies?.join(', ') || 'None'}
    `.trim();
  }

  async getChatHistory(userId: number, limit: number = 10): Promise<ChatSession[]> {
    const userSessions = Array.from(this.chatSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);

    return userSessions;
  }

  async endChatSession(sessionId: string, userId: number): Promise<void> {
    const session = this.chatSessions.get(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error('Invalid session');
    }

    session.isActive = false;
    session.updatedAt = new Date();
  }

  async clearChatHistory(userId: number): Promise<void> {
    const sessions = Array.from(this.chatSessions.entries())
      .filter(([_, session]) => session.userId === userId);

    sessions.forEach(([sessionId]) => {
      this.chatSessions.delete(sessionId);
    });
  }

  private generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Health tips and education
  async generateHealthTips(userId: number, category?: string): Promise<string[]> {
    const userContext = await this.getUserContext(userId);

    const prompt = `Generate 5 practical, evidence-based health tips for a ${this.calculateAge(userContext.dateOfBirth)}-year-old${category ? ` focusing on ${category}` : ''}.

    ${userContext.medications && userContext.medications.length > 0 ?
      `Considering they take: ${userContext.medications.map((m: any) => m.name).join(', ')}` : ''}

    Tips should be:
    - Practical and actionable
    - Evidence-based
    - Safe for general health advice
    - Consider their age group
    - Include explanations when relevant`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a health education expert providing practical health tips.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      return response.split(/\n\d+\.\s*/).filter(tip => tip.trim()).slice(0, 5);
    } catch (error) {
      console.error('Error generating health tips:', error);
      return [];
    }
  }

  // Medication information
  async getMedicationInfo(medicationName: string): Promise<{
    description: string;
    commonUses: string[];
    sideEffects: string[];
    precautions: string[];
  }> {
    const prompt = `Provide comprehensive information about the medication "${medicationName}".

    Include:
    - General description
    - Common uses
    - Common side effects
    - Important precautions

    Format the response clearly and include a disclaimer about consulting healthcare professionals.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a pharmacist providing medication information. Always include disclaimers about consulting healthcare providers.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      // Parse the response into structured format
      return this.parseMedicationInfo(response);
    } catch (error) {
      console.error('Error getting medication info:', error);
      throw new Error('Failed to get medication information');
    }
  }

  private parseMedicationInfo(response: string): {
    description: string;
    commonUses: string[];
    sideEffects: string[];
    precautions: string[];
  } {
    const lines = response.split('\n').map(line => line.trim());

    return {
      description: this.extractSection(lines, ['description', 'general']) || response.substring(0, 200),
      commonUses: this.extractListItems(lines, ['uses', 'indications']),
      sideEffects: this.extractListItems(lines, ['side effects', 'adverse effects']),
      precautions: this.extractListItems(lines, ['precautions', 'warnings'])
    };
  }

  private extractSection(lines: string[], keywords: string[]): string | null {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (keywords.some(keyword => line.includes(keyword))) {
        return lines[i + 1] || null;
      }
    }
    return null;
  }

  private extractListItems(lines: string[], keywords: string[]): string[] {
    const items: string[] = [];
    let inSection = false;

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      if (keywords.some(keyword => lowerLine.includes(keyword))) {
        inSection = true;
        continue;
      }

      if (inSection && (line.startsWith('-') || line.startsWith('•') || line.startsWith('*') || /^\d+\./.test(line))) {
        items.push(line.replace(/^[-•*\d.\s]+/, ''));
      } else if (inSection && line.trim() === '') {
        inSection = false;
      }
    }

    return items;
  }

  getActiveSessionsCount(): number {
    return Array.from(this.chatSessions.values())
      .filter(session => session.isActive).length;
  }

  getSessionStats(): { totalSessions: number; activeSessions: number; totalMessages: number } {
    const sessions = Array.from(this.chatSessions.values());
    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.isActive).length,
      totalMessages: sessions.reduce((total, session) => total + session.messages.length, 0)
    };
  }
}

export default new OpenAIService();