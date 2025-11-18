import axios from 'axios';
import { Op, Sequelize } from 'sequelize';
import MedicationRecord from '../models/MedicationRecord.js';

export interface Pharmacy {
  id: string;
  name: string;
  type: 'retail' | 'hospital' | 'mail_order' | 'compounding' | 'specialty';
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
    fax?: string;
    website?: string;
    email?: string;
  };
  hours: {
    monday: { open: string; close: string; isClosed: boolean };
    tuesday: { open: string; close: string; isClosed: boolean };
    wednesday: { open: string; close: string; isClosed: boolean };
    thursday: { open: string; close: string; isClosed: boolean };
    friday: { open: string; close: string; isClosed: boolean };
    saturday: { open: string; close: string; isClosed: boolean };
    sunday: { open: string; close: string; isClosed: boolean };
  };
  services: string[];
  specialty: string[];
  languages: string[];
  paymentMethods: string[];
  insuranceAccepted: string[];
  delivery: {
    available: boolean;
    cost?: number;
    timeEstimate?: string;
    areas?: string[];
    requirements?: string[];
  };
  accessibility: {
    wheelchairAccess: boolean;
    driveThrough?: boolean;
    deliveryInsurance?: boolean;
    parking: boolean;
    assistanceAvailable: boolean;
  };
  ratings: {
    average: number;
    total: number;
    categories: {
      service: number;
      price: number;
      speed: number;
    };
  };
  distance?: number;
  isOpen: boolean;
  nextOpen?: Date;
  waitTime?: number;
  inventory?: Array<{
    medicationName: string;
    ndc?: string;
    inStock: boolean;
    quantity: number;
    price: number;
    brand: string;
  }>;
  staff: Array<{
    name: string;
    role: string;
    languages: string[];
  }>;
  affiliations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationAvailability {
  pharmacyId: string;
  pharmacyName: string;
  medicationName: string;
  ndc?: string;
  brand: string;
  generic: boolean;
  strength: string;
  form: string;
  quantity: number;
  inStock: boolean;
  price: number;
  discountPrice?: number;
  insuranceCoverage?: boolean;
  copay?: number;
  alternativeMedications: Array<{
    name: string;
    brand: string;
    price: number;
    inStock: boolean;
  }>;
  deliveryAvailable: boolean;
  deliveryCost?: number;
  deliveryTime: string;
  reservationAvailable: boolean;
  lastUpdated: Date;
}

export interface PharmacyReview {
  id: string;
  pharmacyId: string;
  userId?: number;
  rating: number;
  service: number;
  price: number;
  speed: number;
  comment?: string;
  anonymous: boolean;
  helpfulVotes: number;
  verified: boolean;
  response?: {
    comment: string;
    respondedAt: Date;
    respondedBy: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescriptionTransfer {
  id: string;
  patientId: number;
  fromPharmacy: string;
  toPharmacy: string;
  medications: Array<{
    name: string;
    dosage: string;
    quantity: number;
    refills: number;
    prescriber: string;
    datePrescribed: Date;
    lastFilled?: Date;
  }>;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled' | 'rejected';
  requestedAt: Date;
  completedAt?: Date;
  patientConfirmation: boolean;
  notes?: string;
  transferFee?: number;
  insuranceInfo?: {
    coverageAccepted: boolean;
    priorAuthorization: boolean;
    patientResponsibility: number;
  };
}

class PharmacyService {
  private sequelize: Sequelize;
  private pharmacyAPIs = {
    goodrx: 'https://api.goodrx.com',
    cvs: 'https://www.cvs.com',
    walgreens: 'https://www.walgreens.com',
    riteAid: 'https://www.riteaid.com'
  };

  constructor() {
    this.sequelize = new Sequelize(process.env.DATABASE_URL || '');
  }

  async findNearbyPharmacies(
    latitude: number,
    longitude: number,
    radius: number = 5,
    filters?: {
      services?: string[];
      openNow?: boolean;
      delivery?: boolean;
      hours24?: boolean;
      wheelchairAccessible?: boolean;
      insuranceProviders?: string[];
      rating?: { min?: number };
    }
  ): Promise<Pharmacy[]> {
    const pharmacies: Pharmacy[] = [];

    // Mock pharmacy data - in production would use real pharmacy APIs
    const mockPharmacies = [
      {
        id: 'pharmacy_1',
        name: 'CVS Pharmacy',
        type: 'retail',
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          coordinates: { latitude: 40.7580, longitude: -73.9855 }
        },
        contact: {
          phone: '(212) 555-0123',
          fax: '(212) 555-0124',
          website: 'https://www.cvs.com',
          email: 'store123@cvs.com'
        },
        hours: {
          monday: { open: '08:00', close: '22:00', isClosed: false },
          tuesday: { open: '08:00', close: '22:00', isClosed: false },
          wednesday: { open: '08:00', close: '22:00', isClosed: false },
          thursday: { open: '08:00', close: '22:00', isClosed: false },
          friday: { open: '08:00', close: '22:00', isClosed: false },
          saturday: { open: '09:00', close: '18:00', isClosed: false },
          sunday: { open: '10:00', close: '18:00', isClosed: false }
        },
        services: ['Prescriptions', 'Immunizations', 'Health Screenings', 'Photo Services'],
        specialty: ['Retail Pharmacy'],
        languages: ['English', 'Spanish'],
        paymentMethods: ['Cash', 'Credit Card', 'Debit Card', 'HSA/FSA'],
        insuranceAccepted: ['Medicare', 'Medicaid', 'Blue Cross', 'Aetna', 'UnitedHealth'],
        delivery: {
          available: true,
          cost: 4.99,
          timeEstimate: '1-2 business days',
          areas: ['5 miles radius'],
          requirements: ['Minimum order $5', 'Valid prescription']
        },
        accessibility: {
          wheelchairAccess: true,
          driveThrough: true,
          deliveryInsurance: true,
          parking: true,
          assistanceAvailable: true
        },
        ratings: {
          average: 4.2,
          total: 1250,
          categories: { service: 4.1, price: 4.0, speed: 4.3 }
        },
        isOpen: true,
        waitTime: 15,
        staff: [
          { name: 'John Smith', role: 'Pharmacist', languages: ['English', 'Spanish'] },
          { name: 'Jane Doe', role: 'Pharmacy Technician', languages: ['English'] }
        ],
        affiliations: ['CVS Health'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pharmacy_2',
        name: 'Walgreens',
        type: 'retail',
        address: {
          street: '456 Oak Avenue',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          country: 'USA',
          coordinates: { latitude: 40.7614, longitude: -73.9776 }
        },
        contact: {
          phone: '(212) 555-0456',
          fax: '(212) 555-0457',
          website: 'https://www.walgreens.com',
          email: 'store456@walgreens.com'
        },
        hours: {
          monday: { open: '00:00', close: '23:59', isClosed: false },
          tuesday: { open: '00:00', close: '23:59', isClosed: false },
          wednesday: { open: '00:00', close: '23:59', isClosed: false },
          thursday: { open: '00:00', close: '23:59', isClosed: false },
          friday: { open: '00:00', close: '23:59', isClosed: false },
          saturday: { open: '00:00', close: '23:59', isClosed: false },
          sunday: { open: '00:00', close: '23:59', isClosed: false }
        },
        services: ['Prescriptions', 'Immunizations', 'Clinic Services', 'Photo Center'],
        specialty: ['Retail Pharmacy'],
        languages: ['English', 'Spanish', 'Chinese'],
        paymentMethods: ['Cash', 'Credit Card', 'Debit Card', 'HSA/FSA', 'Apple Pay', 'Google Pay'],
        insuranceAccepted: ['Medicare', 'Medicaid', 'Blue Cross', 'Aetna', 'UnitedHealth', 'Cigna'],
        delivery: {
          available: true,
          cost: 5.99,
          timeEstimate: '1-2 business days',
          areas: ['10 miles radius'],
          requirements: ['Minimum order $10', 'Valid prescription']
        },
        accessibility: {
          wheelchairAccess: true,
          driveThrough: true,
          deliveryInsurance: true,
          parking: true,
          assistanceAvailable: true
        },
        ratings: {
          average: 4.1,
          total: 980,
          categories: { service: 4.0, price: 3.9, speed: 4.2 }
        },
        isOpen: true,
        waitTime: 10,
        staff: [
          { name: 'Michael Johnson', role: 'Pharmacist', languages: ['English', 'Spanish', 'Chinese'] },
          { name: 'Sarah Wilson', role: 'Pharmacy Technician', languages: ['English'] }
        ],
        affiliations: ['Walgreens Boots Alliance'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pharmacy_3',
        name: 'Rite Aid',
        type: 'retail',
        address: {
          street: '789 Pine Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10003',
          country: 'USA',
          coordinates: { latitude: 40.7489, longitude: -73.9680 }
        },
        contact: {
          phone: '(212) 555-0789',
          fax: '(212) 555-0790',
          website: 'https://www.riteaid.com',
          email: 'store789@riteaid.com'
        },
        hours: {
          monday: { open: '08:00', close: '22:00', isClosed: false },
          tuesday: { open: '08:00', close: '22:00', isClosed: false },
          wednesday: { open: '08:00', close: '22:00', isClosed: false },
          thursday: { open: '08:00', close: '22:00', isClosed: false },
          friday: { open: '08:00', close: '22:00', isClosed: false },
          saturday: { open: '09:00', '18:00', isClosed: false },
          sunday: { open: '10:00', '18:00', isClosed: false }
        },
        services: ['Prescriptions', 'Immunizations', 'Blood Pressure Monitoring'],
        specialty: ['Retail Pharmacy'],
        languages: ['English'],
        paymentMethods: ['Cash', 'Credit Card', 'Debit Card', 'HSA/FSA'],
        insuranceAccepted: ['Medicare', 'Medicaid', 'Blue Cross', 'Aetna', 'UnitedHealth'],
        delivery: {
          available: true,
          cost: 3.99,
          timeEstimate: '1-2 business days',
          areas: ['5 miles radius'],
          requirements: ['Minimum order $5', 'Valid prescription']
        },
        accessibility: {
          wheelchairAccess: true,
          driveThrough: false,
          deliveryInsurance: true,
          parking: true,
          assistanceAvailable: true
        },
        ratings: {
          average: 4.0,
          total: 750,
          categories: { service: 3.9, price: 4.1, speed: 3.8 }
        },
        isOpen: true,
        waitTime: 20,
        staff: [
          { name: 'Robert Brown', role: 'Pharmacist', languages: ['English'] },
          { name: 'Lisa Davis', role: 'Pharmacy Technician', languages: ['English'] }
        ],
        affiliations: ['Rite Aid Corporation'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Calculate distances and filter
    mockPharmacies.forEach(pharmacy => {
      const distance = this.calculateDistance(
        latitude, longitude,
        pharmacy.address.coordinates.latitude,
        pharmacy.address.coordinates.longitude
      );

      if (distance <= radius) {
        pharmacy.distance = distance;
        pharmacies.push(pharmacy);
      }
    });

    // Apply filters
    let filteredPharmacies = pharmacies;

    if (filters?.services && filters.services.length > 0) {
      filteredPharmacies = filteredPharmacies.filter(pharmacy =>
        filters.services.some(service => pharmacy.services.includes(service))
      );
    }

    if (filters?.openNow) {
      const now = new Date();
      filteredPharmacies = filteredPharmacies.filter(pharmacy => this.isOpen(pharmacy, now));
    }

    if (filters?.delivery) {
      filteredPharmacies = filteredPharmacies.filter(pharmacy => pharmacy.delivery.available);
    }

    if (filters?.wheelchairAccessible) {
      filteredPharmacies = filteredPharmacies.filter(pharmacy => pharmacy.accessibility.wheelchairAccess);
    }

    if (filters?.rating?.min) {
      filteredPharmacies = filteredPharmacies.filter(pharmacy =>
        pharmacy.ratings.average >= filters.rating.min!
      );
    }

    // Sort by distance
    return filteredPharmacies.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  async getMedicationAvailability(
    medicationName: string,
    location?: { latitude: number; longitude: number; radius?: number },
    ndc?: string,
    zipCode?: string
  ): Promise<MedicationAvailability[]> {
    const availability: MedicationAvailability[] = [];

    // This would integrate with pharmacy APIs (GoodRx, CVS, Walgreens, etc.)
    // For now, return mock data

    const mockAvailability = [
      {
        pharmacyId: 'pharmacy_1',
        pharmacyName: 'CVS Pharmacy',
        medicationName: 'Amoxicillin',
        ndc: '009322438',
        brand: 'Amoxil',
        generic: true,
        strength: '500mg',
        form: 'capsules',
        quantity: 20,
        inStock: true,
        price: 12.99,
        discountPrice: 9.99,
        insuranceCoverage: true,
        copay: 5.00,
        alternativeMedications: [
          { name: 'Amoxicillin', brand: 'Amoxil', price: 14.99, inStock: true },
          { name: 'Penicillin', brand: 'Pen-Vee K', price: 8.99, inStock: false }
        ],
        deliveryAvailable: true,
        deliveryCost: 4.99,
        deliveryTime: '1-2 business days',
        reservationAvailable: true,
        lastUpdated: new Date()
      },
      {
        pharmacyId: 'pharmacy_2',
        pharmacyName: 'Walgreens',
        medicationName: 'Amoxicillin',
        ndc: '009322438',
        brand: 'Amoxil',
        generic: true,
        strength: '500mg',
        form: 'capsules',
        quantity: 20,
        inStock: true,
        price: 13.49,
        insuranceCoverage: true,
        copay: 6.00,
        alternativeMedications: [
          { name: 'Amoxicillin', brand: 'Amoxil', price: 15.99, inStock: true },
          { name: 'Augmentin', brand: 'Augmentin', price: 18.99, inStock: true }
        ],
        deliveryAvailable: true,
        deliveryCost: 5.99,
        deliveryTime: '1-2 business days',
        reservationAvailable: true,
        lastUpdated: new Date()
      },
      {
        pharmacyId: 'pharmacy_3',
        pharmacyName: 'Rite Aid',
        medicationName: 'Amoxicillin',
        ndc: '009322438',
        brand: 'Amoxil',
        generic: true,
        strength: '500mg',
        form: 'capsules',
        quantity: 20,
        inStock: false,
        price: 11.99,
        alternativeMedications: [
          { name: 'Amoxicillin', brand: 'Amoxil', price: 13.99, inStock: true },
          { name: 'Amoxicillin', brand: 'Amoxil', price: 13.99, inStock: true }
        ],
        deliveryAvailable: true,
        deliveryCost: 3.99,
        deliveryTime: '2-3 business days',
        reservationAvailable: true,
        lastUpdated: new Date()
      }
    ];

    // Filter by location if provided
    if (location) {
      return mockAvailability.filter(item => {
        const pharmacy = mockPharmacies.find(p => p.id === item.pharmacyId);
        if (pharmacy) {
          const distance = this.calculateDistance(
            location.latitude, location.longitude,
            pharmacy.address.coordinates.latitude,
            pharmacy.address.coordinates.longitude
          );
          return (location.radius || 5) >= distance;
        }
        return false;
      });
    }

    return availability;
  }

  async transferPrescription(
    patientId: number,
    fromPharmacyId: string,
    toPharmacyId: string,
    medications: Array<{
      name: string;
      dosage: string;
      quantity: number;
      refills: number;
      prescriber: string;
    }>,
    notes?: string
  ): Promise<PrescriptionTransfer> {
    const transfer: PrescriptionTransfer = {
      id: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      fromPharmacy: fromPharmacyId,
      toPharmacy: toPharmacyId,
      medications: medications.map(med => ({
        ...med,
        datePrescribed: new Date()
      })),
      status: 'pending',
      requestedAt: new Date(),
      patientConfirmation: false,
      notes
    };

    // In production, this would:
    // 1. Contact from pharmacy
    // 2. Verify prescriptions
    // 3. Send to to pharmacy
    // 4. Notify patient

    await this.saveTransfer(transfer);

    return transfer;
  }

  async getPharmacyReviews(pharmacyId: string, limit: number = 10): Promise<PharmacyReview[]> {
    // In production, this would query the database
    return [];
  }

  async submitPharmacyReview(
    pharmacyId: string,
    userId: number,
    review: Omit<PharmacyReview, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PharmacyReview> {
    const pharmacyReview: PharmacyReview = {
      ...review,
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pharmacyId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.saveReview(pharmacyReview);

    return pharmacyReview;
  }

  async getPharmacyHours(pharmacyId: string): Promise<Pharmacy['hours']> {
    // In production, this would query the database or pharmacy APIs
    const mockPharmacy = {
      monday: { open: '08:00', close: '22:00', isClosed: false },
      tuesday: { open: '08:00', close: '22:00', isClosed: false },
      wednesday: { open: '08:00', close: '22:00', isClosed: false },
      thursday: { open: '08:00', close: '22:00', isClosed: false },
      friday: { open: '08:00', close: '22:00', isClosed: false },
      saturday: { open: '09:00', close: '18:00', isClosed: false },
      sunday: { open: '10:00', close: '18:00', isClosed: false }
    };

    return mockPharmacy;
  }

  private isOpen(pharmacy: Pharmacy, now: Date): boolean {
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayHours = pharmacy.hours[dayOfWeek as keyof typeof pharmacy.hours];

    if (dayHours.isClosed) return false;

    const nowTime = now.toTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const openTime = dayHours.open;
    const closeTime = dayHours.close;

    return nowTime >= openTime && nowTime <= closeTime;
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

  private async saveTransfer(transfer: PrescriptionTransfer): Promise<void> {
    // In production, this would save to database
    console.log('Prescription transfer saved:', transfer.id);
  }

  private async saveReview(review: PharmacyReview): Promise<void> {
    // In production, this would save to database
    console.log('Pharmacy review saved:', review.id);
  }

  async getMedicationPricing(
    medicationName: string,
    ndc?: string,
    zipCode?: string
  ): Promise<{
    pharmacies: Array<{
      pharmacyId: string;
      pharmacyName: string;
      price: number;
      genericPrice: number;
      brandPrice?: number;
      inStock: boolean;
      quantity: number;
    }>;
    }> {
    // This would integrate with pricing APIs
    return {
      pharmacies: [
        {
          pharmacyId: 'pharmacy_1',
          pharmacyName: 'CVS Pharmacy',
          price: 9.99,
          genericPrice: 9.99,
          brandPrice: 15.99,
          inStock: true,
          quantity: 20
        },
        {
          pharmacyId: 'pharmacy_2',
          pharmacyName: 'Walgreens',
          price: 10.49,
          genericPrice: 10.49,
          brandPrice: 16.99,
          inStock: true,
          quantity: 20
        }
      ]
    };
  }
}

export default new PharmacyService();