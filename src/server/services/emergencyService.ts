import axios from 'axios';
import { Op, Sequelize } from 'sequelize';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

export interface EmergencyService {
  id: string;
  name: string;
  type: 'hospital' | 'urgent_care' | 'emergency_room' | 'fire_department' | 'police' | 'poison_control' | 'mental_health_crisis';
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone: string;
    emergency?: boolean;
    website?: string;
    email?: string;
  };
  availability: {
    hours: string;
    emergency: boolean;
    waitTime?: string;
    currentCapacity?: string;
  };
  services: string[];
  specialties: string[];
  distance?: number;
  rating?: number;
  reviewCount?: number;
  insuranceAccepted: string[];
  languages: string[];
  accessibility: {
    wheelchairAccess: boolean;
    signLanguage: boolean;
    translation: string[];
  };
  estimatedWaitTime?: number; // minutes
  capacity: {
    current: number;
    maximum: number;
    available: number;
  };
}

export interface EmergencyIncident {
  id: string;
  patientId?: number;
  type: 'medical' | 'trauma' | 'cardiac' | 'neurological' | 'respiratory' | 'psychiatric' | 'pediatric' | 'obstetric' | 'other';
  severity: 'low' | 'moderate' | 'high' | 'critical' | 'life_threatening';
  symptoms: string[];
  vitals?: {
    heartRate?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
    bloodSugar?: number;
  };
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    description?: string;
  };
  timestamp: Date;
  reportedBy: 'patient' | 'family' | 'bystander' | 'first_responder';
  contact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string[];
  status: 'reported' | 'responding' | 'transported' | 'treated' | 'resolved' | 'closed';
  responders?: Array<{
    type: 'ambulance' | 'fire' | 'police' | 'emergency_medical';
    arrivalTime?: Date;
    departureTime?: Date;
    actions?: string[];
  }>;
  destination?: {
    facility: string;
    address: string;
    arrivalTime?: Date;
  };
  outcome?: string;
  followUpRequired: boolean;
  followUpInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyGuideline {
  id: string;
  title: string;
  category: 'cardiac' | 'respiratory' | 'neurological' | 'trauma' | 'pediatric' | 'psychiatric' | 'toxicology' | 'general';
  severity: 'low' | 'moderate' | 'high' | 'critical' | 'life_threatening';
  triggerSymptoms: string[];
  immediateActions: string[];
  whatToDo: string[];
  whatNotToDo: string[];
  whenToCall: string[];
  emergencyLevel: 'call_911' | 'seek_immediate_care' | 'see_doctor' | 'monitor_at_home';
  firstAidTips: string[];
  timeline: string;
  resources: Array<{
    type: 'phone' | 'website' | 'location';
    name: string;
    contact: string;
    description: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

class EmergencyService {
  private sequelize: Sequelize;
  private emergencyNumbers = {
    usa: {
      general: '911',
      poison_control: '1-800-222-1222',
      suicide_prevention: '988',
      domestic_violence: '1-800-799-7233',
      human_trafficking: '1-888-373-7888',
      disaster_relief: '1-800-621-3362'
    }
  };

  constructor() {
    this.sequelize = new Sequelize(process.env.DATABASE_URL || '');
  }

  async findNearbyEmergencyServices(
    latitude: number,
    longitude: number,
    radius: number = 10,
    serviceTypes?: string[]
  ): Promise<EmergencyService[]> {
    const services: EmergencyService[] = [];

    // Always include essential emergency services
    services.push({
      id: 'emergency_911',
      name: 'Emergency Services (911)',
      type: 'emergency_room',
      description: 'Call 911 for immediate medical, fire, or police emergencies',
      address: {
        street: 'Emergency Response',
        city: 'Available Nationwide',
        state: 'USA',
        zipCode: '00000',
        country: 'USA',
        coordinates: { latitude, longitude }
      },
      contact: {
        phone: '911',
        emergency: true
      },
      availability: {
        hours: '24/7',
        emergency: true
      },
      services: ['Emergency Medical Care', 'Fire Response', 'Police Services'],
      specialties: ['Emergency Medicine'],
      rating: 5.0,
      reviewCount: 0,
      insuranceAccepted: ['All Major Insurance'],
      languages: ['English', 'Spanish'],
      accessibility: {
        wheelchairAccess: true,
        signLanguage: true,
        translation: ['Spanish', 'Mandarin', 'French']
      }
    });

    // Add poison control
    services.push({
      id: 'poison_control',
      name: 'Poison Control Center',
      type: 'emergency_room',
      description: '24/7 poisoning emergency and information',
      address: {
        street: 'National Poison Control',
        city: 'Available Nationwide',
        state: 'USA',
        zipCode: '00000',
        country: 'USA',
        coordinates: { latitude, longitude }
      },
      contact: {
        phone: '1-800-222-1222',
        website: 'https://www.aapcc.org',
        emergency: true
      },
      availability: {
        hours: '24/7',
        emergency: true
      },
      services: ['Poison Treatment', 'Toxicology Expertise', 'Emergency Advice'],
      specialties: ['Toxicology'],
      rating: 4.8,
      reviewCount: 1250,
      languages: ['English', 'Spanish'],
      accessibility: {
        wheelchairAccess: true,
        signLanguage: true,
        translation: ['Spanish']
      }
    });

    // Add suicide prevention
    services.push({
      id: 'suicide_prevention',
      name: 'Suicide Prevention Lifeline',
      type: 'mental_health_crisis',
      description: '24/7 free, confidential support for people in distress',
      address: {
        street: 'Mental Health Support',
        city: 'Available Nationwide',
        state: 'USA',
        zipCode: '00000',
        country: 'USA',
        coordinates: { latitude, longitude }
      },
      contact: {
        phone: '988',
        website: 'https://988lifeline.org',
        emergency: true
      },
      availability: {
        hours: '24/7',
        emergency: true
      },
      services: ['Crisis Counseling', 'Mental Health Support', 'Suicide Prevention'],
      specialties: ['Mental Health'],
      rating: 4.7,
      reviewCount: 850,
      languages: ['English', 'Spanish'],
      accessibility: {
        wheelchairAccess: true,
        signLanguage: true,
        translation: ['Spanish']
      }
    });

    // Add nearby hospitals (mock data - would use real database in production)
    const mockHospitals = [
      {
        id: 'hospital_1',
        name: 'General Medical Center',
        type: 'hospital' as const,
        description: 'Full-service hospital with emergency room',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          coordinates: { latitude: 40.7128, longitude: -74.0060 }
        },
        contact: {
          phone: '(555) 123-4567',
          website: 'https://www.generalhospital.com'
        },
        availability: {
          hours: '24/7',
          emergency: true,
          waitTime: '15-30 minutes'
        },
        services: ['Emergency Care', 'Surgery', 'ICU', 'Cardiology', 'Pediatrics'],
        specialties: ['Emergency Medicine'],
        rating: 4.2,
        reviewCount: 2100,
        insuranceAccepted: ['Medicare', 'Medicaid', 'Blue Cross', 'Aetna', 'UnitedHealth'],
        languages: ['English', 'Spanish', 'Mandarin'],
        accessibility: {
          wheelchairAccess: true,
          signLanguage: true,
          translation: ['Spanish', 'Mandarin', 'French', 'German']
        },
        capacity: {
          current: 45,
          maximum: 100,
          available: 55
        }
      }
    ];

    mockHospitals.forEach(hospital => {
      const distance = this.calculateDistance(
        latitude, longitude,
        hospital.address.coordinates.latitude,
        hospital.address.coordinates.longitude
      );
      if (distance <= radius) {
        hospital.distance = distance;
        services.push(hospital);
      }
    });

    // Filter by service types if specified
    let filteredServices = services;
    if (serviceTypes && serviceTypes.length > 0) {
      filteredServices = services.filter(service =>
        serviceTypes.some(type => service.type === type)
      );
    }

    // Sort by distance
    return filteredServices.sort((a, b) => {
      const distA = a.distance || 0;
      const distB = b.distance || 0;
      return distA - distB;
    });
  }

  async getEmergencyGuidelines(category?: string): Promise<EmergencyGuideline[]> {
    const guidelines: EmergencyGuideline[] = [
      {
        id: 'cardiac_arrest',
        title: 'Cardiac Arrest',
        category: 'cardiac',
        severity: 'life_threatening',
        triggerSymptoms: ['unconscious', 'no breathing', 'no pulse', 'chest pain', 'heart attack symptoms'],
        immediateActions: [
          'Call 911 immediately',
          'Start CPR if trained',
          'Use AED if available',
          'Keep person lying flat'
        ],
        whatToDo: [
          'Check for breathing and pulse',
          'Start chest compressions (30 compressions, 2 breaths)',
          'Continue until help arrives',
          'Use AED as soon as available'
        ],
        whatNotToDo: [
          'Do not delay calling 911',
          'Do not give food or drink',
          'Do not move person unless in danger'
        ],
        whenToCall: ['Immediately - call 911'],
        emergencyLevel: 'call_911',
        firstAidTips: [
          'Check scene safety before approaching',
          'Tap person and shout "Are you okay?"',
          'Call 911 and get AED if available',
          'Start CPR if no breathing'
        ],
        timeline: 'Brain damage can begin within 4-6 minutes',
        resources: [
          {
            type: 'phone',
            name: 'Emergency Services',
            contact: '911',
            description: 'Call for immediate emergency medical help'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'choking',
        title: 'Choking',
        category: 'respiratory',
        severity: 'life_threatening',
        triggerSymptoms: ['cannot breathe', 'cannot speak or cry', 'blue lips', 'hands clutching throat'],
        immediateActions: [
          'Call 911 if person cannot speak, cough, or breathe',
          'Perform Heimlich maneuver if trained',
          'Encourage person to keep coughing if conscious'
        ],
        whatToDo: [
          'Stand behind person',
          'Make a fist and place above navel',
          'Perform inward and upward thrusts',
          'Repeat until object comes out'
        ],
        whatNotToDo: [
          'Do not give person anything to drink',
          'Do not slap person on back',
          'Do not perform blind finger sweeps'
        ],
        whenToCall: ['Immediately if person cannot speak, cough, or breathe'],
        emergencyLevel: 'call_911',
        firstAidTips: [
          'Ask "Are you choking?"',
          'Encourage forceful coughing',
          'Call 911 if unable to speak/cough/breathe',
          'Perform abdominal thrusts'
        ],
        timeline: 'Brain damage can occur within 4-6 minutes of no oxygen',
        resources: [
          {
            type: 'phone',
            name: 'Emergency Services',
            contact: '911',
            description: 'Call for immediate emergency medical help'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'severe_bleeding',
        title: 'Severe Bleeding',
        category: 'trauma',
        severity: 'high',
        triggerSymptoms: ['heavy bleeding', 'blood soaking through bandages', 'dizziness', 'weakness'],
        immediateActions: [
          'Call 911 if bleeding is severe or won\'t stop',
          'Apply direct pressure with clean cloth',
          'Elevate injured area if possible',
          'Keep person warm and still'
        ],
        whatToDo: [
          'Apply firm, steady pressure to wound',
          'Add more cloths if first one soaks through',
          'Maintain pressure continuously',
          'Apply tourniquet only as last resort'
        ],
        whatNotToDo: [
          'Do not remove embedded objects',
          'Do not apply tourniquet unless life-threatening',
          'Do not give person food or drink'
        ],
        whenToCall: ['Immediately if bleeding is severe or doesn\'t stop within 10 minutes'],
        emergencyLevel: 'call_911',
        firstAidTips: [
          'Wear gloves if available',
          'Apply direct pressure immediately',
          'Elevate injured area above heart',
          'Cover person to prevent shock'
        ],
        timeline: 'Severe blood loss can be life-threatening in minutes',
        resources: [
          {
            type: 'phone',
            name: 'Emergency Services',
            contact: '911',
            description: 'Call for immediate emergency medical help'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'stroke',
        title: 'Stroke',
        category: 'neurological',
        severity: 'life_threatening',
        triggerSymptoms: ['facial drooping', 'arm weakness', 'speech difficulty', 'sudden confusion', 'vision problems'],
        immediateActions: [
          'Call 911 immediately',
          'Note time symptoms started',
          'Do not give person food or drink',
          'Keep person comfortable'
        ],
        whatToDo: [
          'Use FAST test (Face, Arms, Speech, Time)',
          'Document symptoms and time',
          'Stay with person and keep them calm',
          'Prepare to give medications if prescribed'
        ],
        whatNotToDo: [
          'Do not delay calling for help',
          'Do not give aspirin without medical advice',
          'Do not ignore symptoms, even if they improve'
        ],
        whenToCall: ['Immediately - time is critical for stroke treatment'],
        emergencyLevel: 'call_911',
        firstAidTips: [
          'Remember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call 911',
          'Note exact time symptoms began',
          'Keep person in comfortable position',
          'Do not give anything by mouth'
        ],
        timeline: 'Treatment within 3 hours can significantly improve outcomes',
        resources: [
          {
            type: 'phone',
            name: 'Emergency Services',
            contact: '911',
            description: 'Call for immediate emergency medical help'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Filter by category if specified
    if (category) {
      return guidelines.filter(guideline => guideline.category === category);
    }

    return guidelines;
  }

  async reportEmergencyIncident(incident: Omit<EmergencyIncident, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmergencyIncident> {
    const emergencyIncident: EmergencyIncident = {
      ...incident,
      id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'reported',
      responders: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check if this is a life-threatening emergency
    const isEmergency = this.isLifeThreatening(incident);

    if (isEmergency) {
      // Trigger emergency response
      await this.triggerEmergencyResponse(emergencyIncident);
    }

    // Save incident
    await this.saveIncident(emergencyIncident);

    return emergencyIncident;
  }

  private isLifeThreatening(incident: Omit<EmergencyIncident, 'id' | 'createdAt' | 'updatedAt'>): boolean {
    const lifeThreateningSymptoms = [
      'chest pain', 'difficulty breathing', 'unconscious', 'severe bleeding',
      'suicidal thoughts', 'confusion', 'slurred speech', 'numbness',
      'weakness on one side', 'vision changes', 'severe headache'
    ];

    const allSymptoms = [
      ...incident.symptoms,
      ...(incident.associatedSymptoms || [])
    ].map(s => s.toLowerCase());

    return lifeThreateningSymptoms.some(symptom =>
      allSymptoms.some(userSymptom => userSymptom.includes(symptom))
    );
  }

  private async triggerEmergencyResponse(incident: EmergencyIncident): Promise<void> {
    // In a real system, this would:
    // 1. Notify emergency services
    // 2. Contact family members
    // 3. Alert nearby healthcare facilities
    // 4. Send emergency notifications

    console.log('EMERGENCY RESPONSE TRIGGERED:', {
      incidentId: incident.id,
      type: incident.type,
      severity: incident.severity,
      location: incident.location
    });

    // For now, just log the emergency
  }

  private async saveIncident(incident: EmergencyIncident): Promise<void> {
    // In production, this would save to database
    console.log('Emergency incident saved:', incident.id);
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

  getEmergencyNumbers(country: string = 'usa'): Record<string, string> {
    return this.emergencyNumbers[country as keyof typeof this.emergencyNumbers] || {
      general: '112', // International emergency number
    };
  }

  async getEmergencyStatistics(dateRange?: { start: Date; end: Date }): Promise<{
    totalIncidents: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    responseTimes: { average: number; min: number; max: number };
  }> {
    // In production, this would query the database
    return {
      totalIncidents: 0,
      bySeverity: {
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0,
        life_threatening: 0
      },
      byType: {
        medical: 0,
        trauma: 0,
        cardiac: 0,
        neurological: 0,
        respiratory: 0,
        psychiatric: 0,
        pediatric: 0,
        obstetric: 0,
        other: 0
      },
      responseTimes: {
        average: 0,
        min: 0,
        max: 0
      }
    };
  }
}

export default new EmergencyService();