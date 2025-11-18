import axios from 'axios';
import { Op, Sequelize } from 'sequelize';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

export interface ProviderSearchCriteria {
  query?: string;
  specialization?: string;
  location?: {
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
      radius?: number; // miles
    };
  };
  availability?: {
    date?: Date;
    telehealth?: boolean;
    inPerson?: boolean;
  };
  insurance?: string[];
  rating?: {
    min?: number;
    max?: number;
  };
  languages?: string[];
  gender?: 'male' | 'female' | 'any';
  acceptsNewPatients?: boolean;
  consultationFee?: {
    min?: number;
    max?: number;
  };
  experience?: {
    min?: number;
    max?: number;
  };
  isVerified?: boolean;
  pageSize?: number;
  page?: number;
  sortBy?: 'relevance' | 'rating' | 'experience' | 'distance' | 'consultation_fee';
  sortOrder?: 'asc' | 'desc';
}

export interface ProviderDirectoryItem {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  profileImage?: string;
  specialization: string;
  subspecialties: string[];
  credentials: {
    degree: string;
    institution: string;
    year: number;
    licenseNumber: string;
    npiNumber?: string;
  };
  experience: number;
  languages: string[];
  biography: string;
  practiceInfo: {
    clinicName: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    phone: string;
    website?: string;
    email: string;
  };
  consultation: {
    inPerson: boolean;
    telehealth: boolean;
    homeVisit: boolean;
    consultationFee: number;
    consultationDuration: number;
    consultationTypes: Array<{
      type: 'in-person' | 'video' | 'phone' | 'chat';
      duration: number;
      fee: number;
      description: string;
    }>;
  };
  averageRating: number;
  totalReviews: number;
  specialties: string[];
  acceptsInsurance: boolean;
  insuranceProviders: string[];
  isVerified: boolean;
  distance?: number; // calculated distance from user location
  availability?: {
    nextAvailable?: Date;
    availableTimeSlots: Array<{
      date: Date;
      time: string;
      type: string;
    }>;
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface Specialization {
  name: string;
  description: string;
  commonConditions: string[];
  typicalProcedures: string[];
  averageConsultationFee: {
    min: number;
    max: number;
  };
  requiredCredentials: string[];
}

export interface HealthcareFacility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'urgent_care' | 'specialty_center' | 'diagnostic_center';
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
  phone: string;
  website?: string;
  email?: string;
  hoursOfOperation: {
    monday: { open: string; close: string; isClosed: boolean };
    tuesday: { open: string; close: string; isClosed: boolean };
    wednesday: { open: string; close: string; isClosed: boolean };
    thursday: { open: string; close: string; isClosed: boolean };
    friday: { open: string; close: string; isClosed: boolean };
    saturday: { open: string; close: string; isClosed: boolean };
    sunday: { open: string; close: string; isClosed: boolean };
  };
  services: string[];
  specialties: string[];
  emergencyServices: boolean;
  parkingAvailable: boolean;
  wheelchairAccessible: boolean;
  insuranceAccepted: string[];
  averageRating: number;
  totalReviews: number;
  distance?: number;
}

class ProviderDirectoryService {
  private sequelize: Sequelize;
  private externalAPIs: {
    npiRegistry: string;
    medicare: string;
    healthgrades: string;
    webmd: string;
  };

  constructor() {
    this.sequelize = new Sequelize(process.env.DATABASE_URL || '');
    this.externalAPIs = {
      npiRegistry: process.env.NPI_REGISTRY_API_URL || '',
      medicare: process.env.MEDICARE_API_URL || '',
      healthgrades: process.env.HEALTHGRADES_API_URL || '',
      webmd: process.env.WEBMD_API_URL || ''
    };
  }

  async searchProviders(criteria: ProviderSearchCriteria): Promise<{
    providers: ProviderDirectoryItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const pageSize = criteria.pageSize || 20;
    const page = criteria.page || 1;
    const offset = (page - 1) * pageSize;

    // Build where clause
    const whereClause: any = {
      isActive: true
    };

    // Text search
    if (criteria.query) {
      whereClause[Op.or] = [
        {
          firstName: {
            [Op.iLike]: `%${criteria.query}%`
          }
        },
        {
          lastName: {
            [Op.iLike]: `%${criteria.query}%`
          }
        },
        {
          specialization: {
            [Op.iLike]: `%${criteria.query}%`
          }
        },
        {
          specialties: {
            [Op.contains]: [criteria.query]
          }
        }
      ];
    }

    // Specialization
    if (criteria.specialization) {
      whereClause.specialization = {
        [Op.iLike]: `%${criteria.specialization}%`
      };
    }

    // Location
    if (criteria.location?.city) {
      whereClause['practiceInfo.address.city'] = {
        [Op.iLike]: `%${criteria.location.city}%`
      };
    }

    if (criteria.location?.state) {
      whereClause['practiceInfo.address.state'] = {
        [Op.iLike]: `%${criteria.location.state}%`
      };
    }

    // Rating
    if (criteria.rating?.min !== undefined || criteria.rating?.max !== undefined) {
      whereClause.averageRating = {};
      if (criteria.rating.min !== undefined) {
        whereClause.averageRating[Op.gte] = criteria.rating.min;
      }
      if (criteria.rating.max !== undefined) {
        whereClause.averageRating[Op.lte] = criteria.rating.max;
      }
    }

    // Experience
    if (criteria.experience?.min !== undefined || criteria.experience?.max !== undefined) {
      whereClause.experience = {};
      if (criteria.experience.min !== undefined) {
        whereClause.experience[Op.gte] = criteria.experience.min;
      }
      if (criteria.experience.max !== undefined) {
        whereClause.experience[Op.lte] = criteria.experience.max;
      }
    }

    // Languages
    if (criteria.languages && criteria.languages.length > 0) {
      whereClause.languages = {
        [Op.overlap]: criteria.languages
      };
    }

    // Insurance
    if (criteria.insurance && criteria.insurance.length > 0) {
      whereClause.insuranceProviders = {
        [Op.overlap]: criteria.insurance
      };
    }

    // Verification status
    if (criteria.isVerified !== undefined) {
      whereClause.isVerified = criteria.isVerified;
    }

    // Sorting
    const orderClause = this.buildOrderClause(criteria.sortBy, criteria.sortOrder);

    // Execute query
    const { count, rows } = await Doctor.findAndCountAll({
      where: whereClause,
      limit: pageSize,
      offset,
      order: orderClause,
      attributes: [
        'id', 'firstName', 'lastName', 'profileImage', 'specialization',
        'subspecialties', 'credentials', 'experience', 'languages', 'biography',
        'practiceInfo', 'consultation', 'averageRating', 'totalReviews',
        'specialties', 'acceptsInsurance', 'insuranceProviders', 'isVerified',
        'socialMedia', 'consultationTypes'
      ]
    });

    // Calculate distances if coordinates provided
    const providers = rows.map(doctor => {
      const provider = this.formatProviderData(doctor);

      if (criteria.location?.coordinates) {
        provider.distance = this.calculateDistance(
          criteria.location.coordinates.latitude,
          criteria.location.coordinates.longitude,
          doctor.practiceInfo.address.coordinates?.latitude || 0,
          doctor.practiceInfo.address.coordinates?.longitude || 0
        );
      }

      return provider;
    });

    // Filter by distance if radius specified
    let filteredProviders = providers;
    if (criteria.location?.coordinates?.radius) {
      filteredProviders = providers.filter(provider =>
        !provider.distance || provider.distance <= criteria.location!.coordinates!.radius!
      );
    }

    // Get availability information if requested
    if (criteria.availability?.date) {
      filteredProviders = await this.enrichWithAvailability(filteredProviders, criteria.availability.date);
    }

    // Re-sort by distance if location-based search
    if (criteria.location?.coordinates && criteria.sortBy === 'distance') {
      filteredProviders.sort((a, b) => {
        const distanceA = a.distance || Infinity;
        const distanceB = b.distance || Infinity;
        return criteria.sortOrder === 'desc' ? distanceB - distanceA : distanceA - distanceB;
      });
    }

    const total = criteria.location?.coordinates?.radius ? filteredProviders.length : count;
    const totalPages = Math.ceil(total / pageSize);

    return {
      providers: filteredProviders.slice(0, pageSize),
      total,
      page,
      pageSize,
      totalPages
    };
  }

  async getProviderById(providerId: number): Promise<ProviderDirectoryItem | null> {
    const doctor = await Doctor.findByPk(providerId, {
      attributes: [
        'id', 'firstName', 'lastName', 'profileImage', 'specialization',
        'subspecialties', 'credentials', 'experience', 'languages', 'biography',
        'practiceInfo', 'consultation', 'averageRating', 'totalReviews',
        'specialties', 'acceptsInsurance', 'insuranceProviders', 'isVerified',
        'socialMedia', 'consultationTypes', 'education', 'certifications'
      ]
    });

    if (!doctor) {
      return null;
    }

    return this.formatProviderData(doctor);
  }

  async getSpecializations(): Promise<Specialization[]> {
    // Define common medical specializations
    const specializations: Specialization[] = [
      {
        name: 'Cardiology',
        description: 'Diagnosis and treatment of heart and cardiovascular conditions',
        commonConditions: ['Heart Disease', 'High Blood Pressure', 'Arrhythmia', 'Heart Failure'],
        typicalProcedures: ['Echocardiogram', 'Stress Test', 'Cardiac Catheterization', 'Pacemaker Implantation'],
        averageConsultationFee: { min: 150, max: 400 },
        requiredCredentials: ['MD', 'Board Certified in Cardiology']
      },
      {
        name: 'Dermatology',
        description: 'Treatment of skin, hair, and nail conditions',
        commonConditions: ['Acne', 'Eczema', 'Psoriasis', 'Skin Cancer'],
        typicalProcedures: ['Skin Biopsy', 'Mole Removal', 'Laser Treatment', 'Botox Injections'],
        averageConsultationFee: { min: 100, max: 300 },
        requiredCredentials: ['MD', 'Board Certified in Dermatology']
      },
      {
        name: 'Family Medicine',
        description: 'Comprehensive healthcare for patients of all ages',
        commonConditions: ['Common Cold', 'Diabetes', 'Hypertension', 'Asthma'],
        typicalProcedures: ['Annual Physical', 'Vaccinations', 'Minor Surgery', 'Health Screenings'],
        averageConsultationFee: { min: 80, max: 200 },
        requiredCredentials: ['MD', 'Board Certified in Family Medicine']
      },
      {
        name: 'Internal Medicine',
        description: 'Diagnosis and treatment of adult diseases',
        commonConditions: ['Diabetes', 'Hypertension', 'Arthritis', 'Thyroid Disorders'],
        typicalProcedures: ['Comprehensive Physical', 'Preventive Care', 'Chronic Disease Management'],
        averageConsultationFee: { min: 100, max: 250 },
        requiredCredentials: ['MD', 'Board Certified in Internal Medicine']
      },
      {
        name: 'Pediatrics',
        description: 'Medical care for infants, children, and adolescents',
        commonConditions: ['Childhood Illnesses', 'Developmental Disorders', 'Vaccinations', 'Growth Issues'],
        typicalProcedures: ['Well-child Visits', 'Vaccinations', 'Developmental Screenings', 'Sports Physicals'],
        averageConsultationFee: { min: 100, max: 250 },
        requiredCredentials: ['MD', 'Board Certified in Pediatrics']
      },
      {
        name: 'Psychiatry',
        description: 'Diagnosis and treatment of mental health conditions',
        commonConditions: ['Depression', 'Anxiety', 'Bipolar Disorder', 'Schizophrenia'],
        typicalProcedures: ['Psychiatric Evaluation', 'Medication Management', 'Psychotherapy', 'ECT'],
        averageConsultationFee: { min: 150, max: 400 },
        requiredCredentials: ['MD', 'Board Certified in Psychiatry']
      },
      {
        name: 'Orthopedics',
        description: 'Treatment of musculoskeletal conditions and injuries',
        commonConditions: ['Fractures', 'Arthritis', 'Sports Injuries', 'Back Pain'],
        typicalProcedures: ['Joint Replacement', 'Arthroscopy', 'Fracture Repair', 'Spine Surgery'],
        averageConsultationFee: { min: 150, max: 400 },
        requiredCredentials: ['MD', 'Board Certified in Orthopedic Surgery']
      },
      {
        name: 'Obstetrics & Gynecology',
        description: 'Women\'s health, pregnancy, and childbirth care',
        commonConditions: ['Pregnancy', 'Menstrual Disorders', 'Infertility', 'Menopause'],
        typicalProcedures: ['Prenatal Care', 'Delivery', 'C-section', 'Gynecological Surgery'],
        averageConsultationFee: { min: 120, max: 350 },
        requiredCredentials: ['MD', 'Board Certified in OB/GYN']
      }
    ];

    return specializations;
  }

  async searchHealthcareFacilities(criteria: {
    location: {
      latitude: number;
      longitude: number;
      radius?: number;
    };
    type?: string;
    services?: string[];
    emergency?: boolean;
  }): Promise<HealthcareFacility[]> {
    // This would typically integrate with external healthcare facility databases
    // For now, return mock data

    const mockFacilities: HealthcareFacility[] = [
      {
        id: '1',
        name: 'General Hospital',
        type: 'hospital',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          coordinates: { latitude: 40.7128, longitude: -74.0060 }
        },
        phone: '(555) 123-4567',
        website: 'https://www.generalhospital.com',
        email: 'info@generalhospital.com',
        hoursOfOperation: {
          monday: { open: '00:00', close: '23:59', isClosed: false },
          tuesday: { open: '00:00', close: '23:59', isClosed: false },
          wednesday: { open: '00:00', close: '23:59', isClosed: false },
          thursday: { open: '00:00', close: '23:59', isClosed: false },
          friday: { open: '00:00', close: '23:59', isClosed: false },
          saturday: { open: '00:00', close: '23:59', isClosed: false },
          sunday: { open: '00:00', close: '23:59', isClosed: false }
        },
        services: ['Emergency Care', 'Surgery', 'Maternity', 'ICU', 'Radiology'],
        specialties: ['Cardiology', 'Neurology', 'Oncology', 'Pediatrics'],
        emergencyServices: true,
        parkingAvailable: true,
        wheelchairAccessible: true,
        insuranceAccepted: ['Medicare', 'Medicaid', 'Blue Cross', 'Aetna'],
        averageRating: 4.2,
        totalReviews: 1250
      },
      {
        id: '2',
        name: 'City Medical Center',
        type: 'clinic',
        address: {
          street: '456 Oak Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          country: 'USA',
          coordinates: { latitude: 40.7260, longitude: -73.9897 }
        },
        phone: '(555) 987-6543',
        website: 'https://www.citymedical.com',
        hoursOfOperation: {
          monday: { open: '08:00', close: '18:00', isClosed: false },
          tuesday: { open: '08:00', close: '18:00', isClosed: false },
          wednesday: { open: '08:00', close: '18:00', isClosed: false },
          thursday: { open: '08:00', close: '18:00', isClosed: false },
          friday: { open: '08:00', close: '18:00', isClosed: false },
          saturday: { open: '09:00', close: '13:00', isClosed: false },
          sunday: { open: '00:00', close: '00:00', isClosed: true }
        },
        services: ['Primary Care', 'Specialist Consultations', 'Lab Tests', 'X-rays'],
        specialties: ['Family Medicine', 'Internal Medicine', 'Pediatrics'],
        emergencyServices: false,
        parkingAvailable: true,
        wheelchairAccessible: true,
        insuranceAccepted: ['Medicare', 'Blue Cross', 'UnitedHealth'],
        averageRating: 4.5,
        totalReviews: 450
      }
    ];

    // Filter by distance
    const facilities = mockFacilities.map(facility => ({
      ...facility,
      distance: this.calculateDistance(
        criteria.location.latitude,
        criteria.location.longitude,
        facility.address.coordinates.latitude,
        facility.address.coordinates.longitude
      )
    })).filter(facility =>
      !criteria.location.radius || facility.distance <= criteria.location.radius
    );

    return facilities;
  }

  async getNearbyProviders(latitude: number, longitude: number, radius: number = 25): Promise<ProviderDirectoryItem[]> {
    const criteria: ProviderSearchCriteria = {
      location: {
        coordinates: { latitude, longitude, radius }
      },
      pageSize: 50,
      sortBy: 'distance',
      sortOrder: 'asc'
    };

    const result = await this.searchProviders(criteria);
    return result.providers;
  }

  async verifyProvider(providerId: number, verificationData: any): Promise<void> {
    const doctor = await Doctor.findByPk(providerId);
    if (!doctor) {
      throw new Error('Provider not found');
    }

    // Verify credentials through external APIs
    const verification = await this.verifyCredentials(verificationData);

    if (verification.isValid) {
      await doctor.update({
        isVerified: true,
        credentials: {
          ...doctor.credentials,
          ...verification.verifiedCredentials
        }
      });

      // Send notification to provider
      console.log(`Provider ${providerId} has been verified`);
    } else {
      throw new Error('Provider verification failed');
    }
  }

  async updateProviderProfile(providerId: number, userId: number, updates: any): Promise<ProviderDirectoryItem> {
    const doctor = await Doctor.findByPk(providerId);
    if (!doctor) {
      throw new Error('Provider not found');
    }

    // Check if user is authorized to update this profile
    // This would typically check if the user is the provider or admin
    await doctor.update(updates);

    return this.formatProviderData(doctor);
  }

  private buildOrderClause(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): any[] {
    switch (sortBy) {
      case 'rating':
        return [['averageRating', sortOrder.toUpperCase() as 'ASC' | 'DESC']];
      case 'experience':
        return [['experience', sortOrder.toUpperCase() as 'ASC' | 'DESC']];
      case 'consultation_fee':
        return [['consultation.consultationFee', sortOrder.toUpperCase() as 'ASC' | 'DESC']];
      case 'relevance':
      default:
        return [['averageRating', 'DESC'], ['totalReviews', 'DESC']];
    }
  }

  private formatProviderData(doctor: Doctor): ProviderDirectoryItem {
    return {
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      fullName: doctor.getFullName(),
      profileImage: doctor.profileImage,
      specialization: doctor.specialization,
      subspecialties: doctor.subspecialties,
      credentials: doctor.credentials,
      experience: doctor.experience,
      languages: doctor.languages,
      biography: doctor.biography,
      practiceInfo: doctor.practiceInfo,
      consultation: {
        ...doctor.consultation,
        consultationTypes: doctor.consultationTypes
      },
      averageRating: parseFloat(doctor.averageRating.toString()),
      totalReviews: doctor.totalReviews,
      specialties: doctor.specialties,
      acceptsInsurance: doctor.acceptsInsurance,
      insuranceProviders: doctor.insuranceProviders,
      isVerified: doctor.isVerified,
      socialMedia: doctor.socialMedia
    };
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

  private async enrichWithAvailability(providers: ProviderDirectoryItem[], date: Date): Promise<ProviderDirectoryItem[]> {
    // For each provider, check their availability for the given date
    // This would typically integrate with the appointment service
    return Promise.all(providers.map(async provider => ({
      ...provider,
      availability: {
        nextAvailable: date, // This would be calculated based on actual availability
        availableTimeSlots: [] // This would be populated with actual available slots
      }
    })));
  }

  private async verifyCredentials(verificationData: any): Promise<{ isValid: boolean; verifiedCredentials?: any }> {
    // This would integrate with external verification services like:
    // - NPI Registry for US healthcare providers
    // - State medical boards
    // - Hospital credentialing systems

    try {
      if (verificationData.npiNumber) {
        const response = await axios.get(
          `https://npiregistry.cms.hhs.gov/api/?number=${verificationData.npiNumber}`
        );

        if (response.data.results && response.data.results.length > 0) {
          const result = response.data.results[0];
          return {
            isValid: true,
            verifiedCredentials: {
              npiNumber: result.basic.npi,
              enumeration_type: result.basic.enumeration_type,
              last_updated: result.basic.last_updated
            }
          };
        }
      }
    } catch (error) {
      console.error('Error verifying credentials:', error);
    }

    return { isValid: false };
  }

  async getProviderStatistics(specialization?: string): Promise<any> {
    const whereClause: any = {
      isActive: true
    };

    if (specialization) {
      whereClause.specialization = {
        [Op.iLike]: `%${specialization}%`
      };
    }

    const doctors = await Doctor.findAll({
      where: whereClause,
      attributes: [
        'specialization',
        'averageRating',
        'experience',
        'consultation',
        'acceptsInsurance',
        'isVerified'
      ]
    });

    const total = doctors.length;
    const verified = doctors.filter(d => d.isVerified).length;
    const acceptsInsurance = doctors.filter(d => d.acceptsInsurance).length;
    const offersTelehealth = doctors.filter(d => d.consultation.telehealth).length;

    const averageRating = doctors.reduce((sum, d) => sum + parseFloat(d.averageRating.toString()), 0) / total;
    const averageExperience = doctors.reduce((sum, d) => sum + d.experience, 0) / total;
    const averageConsultationFee = doctors.reduce((sum, d) => sum + d.consultation.consultationFee, 0) / total;

    const specializationBreakdown = doctors.reduce((acc, doctor) => {
      const spec = doctor.specialization;
      if (!acc[spec]) {
        acc[spec] = { count: 0, averageRating: 0 };
      }
      acc[spec].count++;
      acc[spec].averageRating += parseFloat(doctor.averageRating.toString());
      return acc;
    }, {} as Record<string, { count: number; averageRating: number }>);

    // Calculate averages for each specialization
    Object.keys(specializationBreakdown).forEach(spec => {
      specializationBreakdown[spec].averageRating /= specializationBreakdown[spec].count;
    });

    return {
      total,
      verified,
      acceptsInsurance,
      offersTelehealth,
      averageRating: Math.round(averageRating * 100) / 100,
      averageExperience: Math.round(averageExperience * 10) / 10,
      averageConsultationFee: Math.round(averageConsultationFee),
      specializationBreakdown
    };
  }
}

export default new ProviderDirectoryService();