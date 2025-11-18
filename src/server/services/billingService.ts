import Stripe from 'stripe';
import { Op, Sequelize } from 'sequelize';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export interface BillingItem {
  id: string;
  description: string;
  amount: number; // in cents
  quantity: number;
  category: 'consultation' | 'procedure' | 'medication' | 'lab_test' | 'imaging' | 'other';
  taxable: boolean;
  discountApplied?: number;
}

export interface Invoice {
  id: string;
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  items: BillingItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'void';
  dueDate: Date;
  issuedDate: Date;
  paidDate?: Date;
  paymentMethod?: 'card' | 'bank_transfer' | 'cash' | 'insurance';
  insuranceDetails?: {
    provider: string;
    policyNumber: string;
    claimNumber: string;
    coverageAmount: number;
    patientResponsibility: number;
    deductible: number;
    copay: number;
    coinsurance: number;
  };
  notes?: string;
  paymentIntents: Array<{
    id: string;
    amount: number;
    status: string;
    created: Date;
    paymentMethod: string;
  }>;
  refundHistory: Array<{
    id: string;
    amount: number;
    reason: string;
    processedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsuranceVerification {
  id: string;
  patientId: number;
  insuranceProvider: string;
  policyNumber: string;
  memberId: string;
  groupNumber?: string;
  subscriberName: string;
  subscriberRelationship: 'self' | 'spouse' | 'child' | 'other';
  coverageType: 'PPO' | 'HMO' | 'EPO' | 'POS';
  status: 'active' | 'inactive' | 'pending' | 'terminated';
  effectiveDate: Date;
  expirationDate?: Date;
  coverageDetails: {
    deductible: {
      individual: number;
      family: number;
      remaining: {
        individual: number;
        family: number;
      };
    };
    copay: {
      primaryCare: number;
      specialist: number;
      emergencyRoom: number;
      urgentCare: number;
      prescription: number;
    };
    coinsurance: {
      inNetwork: number;
      outOfNetwork: number;
    };
    outOfPocketMax: {
      individual: number;
      family: number;
      remaining: {
        individual: number;
        family: number;
      };
    };
  };
  benefits: {
    preventiveCare: boolean;
    mentalHealth: boolean;
    prescriptionDrugs: boolean;
    vision: boolean;
    dental: boolean;
    telemedicine: boolean;
  };
  network: {
    inNetworkProviders: number[];
    outOfNetworkCoverage: boolean;
    referralRequired: boolean;
    preauthorizationRequired: string[];
  };
  verifiedAt: Date;
  nextVerificationDate: Date;
  createdAt: Date;
}

export interface InsuranceClaim {
  id: string;
  patientId: number;
  insuranceProvider: string;
  policyNumber: string;
  claimNumber: string;
  claimType: 'medical' | 'prescription' | 'dental' | 'vision' | 'mental_health';
  patientName: string;
  dateOfService: Date;
  placeOfService: 'office' | 'hospital' | 'urgent_care' | 'telehealth' | 'home';
  renderingProvider: {
    npiNumber: string;
    name: string;
    taxonomyCode: string;
    specialty: string;
  };
  billingProvider: {
    npiNumber: string;
    name: string;
    taxonomyCode: string;
    address: any;
    phone: string;
  };
  diagnosis: Array<{
    code: string; // ICD-10 code
    description: string;
  }>;
  procedures: Array<{
    code: string; // CPT/HCPCS code
    description: string;
    units: number;
    charge: number;
  }>;
  billedAmount: number;
  allowedAmount: number;
  paidAmount: number;
  patientResponsibility: number;
  insuranceResponsibility: number;
  deductible: number;
  coinsurance: number;
  copay: number;
  status: 'submitted' | 'received' | 'processing' | 'approved' | 'denied' | 'partially_approved' | 'paid' | 'appealed';
  denialReasons?: string[];
  explanationOfBenefits?: string;
  paymentDate?: Date;
  checkNumber?: string;
  appealDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentPlan {
  id: string;
  patientId: number;
  invoiceIds: string[];
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  numberOfPayments: number;
  nextPaymentDate: Date;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
  status: 'active' | 'completed' | 'paused' | 'cancelled' | 'default';
  paymentMethod: {
    type: 'card' | 'bank_account';
    last4: string;
    brand?: string;
    expMonth?: number;
    expYear?: number;
  };
  installments: Array<{
    dueDate: Date;
    amount: number;
    status: 'pending' | 'paid' | 'failed' | 'overdue';
    paidAt?: Date;
    paymentIntentId?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

class BillingService {
  private sequelize: Sequelize;
  private taxRates: Map<string, number> = new Map();

  constructor() {
    this.sequelize = new Sequelize(process.env.DATABASE_URL || '');
    this.initializeTaxRates();
  }

  private initializeTaxRates(): void {
    // Tax rates by location (in percentage)
    this.taxRates.set('NY', 8.875); // New York
    this.taxRates.set('CA', 8.5);   // California
    this.taxRates.set('TX', 6.25);  // Texas
    this.taxRates.set('FL', 6.0);   // Florida
    this.taxRates.set('default', 7.0); // Default tax rate
  }

  async createInvoice(
    patientId: number,
    doctorId: number,
    items: BillingItem[],
    appointmentId?: number,
    insuranceDetails?: any
  ): Promise<Invoice> {
    const patient = await User.findByPk(patientId);
    const doctor = await Doctor.findByPk(doctorId);

    if (!patient || !doctor) {
      throw new Error('Patient or doctor not found');
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
    const tax = this.calculateTax(subtotal, patient.state || 'default');
    const discount = this.calculateDiscount(items, insuranceDetails);
    const total = subtotal + tax - discount;

    const invoice: Invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      doctorId,
      appointmentId,
      items,
      subtotal,
      tax,
      discount,
      total,
      currency: 'usd',
      status: 'draft',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      issuedDate: new Date(),
      insuranceDetails,
      paymentIntents: [],
      refundHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // If insurance details provided, calculate patient responsibility
    if (insuranceDetails) {
      const insuranceCoverage = await this.calculateInsuranceCoverage(
        items,
        insuranceDetails
      );

      invoice.insuranceDetails = {
        ...insuranceDetails,
        coverageAmount: insuranceCoverage.coverageAmount,
        patientResponsibility: insuranceCoverage.patientResponsibility,
        deductible: insuranceCoverage.deductible,
        copay: insuranceCoverage.copay,
        coinsurance: insuranceCoverage.coinsurance
      };
    }

    // Store invoice (in production, this would save to database)
    await this.saveInvoice(invoice);

    return invoice;
  }

  async processPayment(
    invoiceId: string,
    paymentMethodId: string,
    amount?: number
  ): Promise<{ paymentIntent: Stripe.PaymentIntent; updatedInvoice: Invoice }> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const paymentAmount = amount || invoice.total;

    if (paymentAmount > invoice.total) {
      throw new Error('Payment amount exceeds invoice total');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentAmount,
        currency: invoice.currency,
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        metadata: {
          invoiceId,
          patientId: invoice.patientId.toString(),
          doctorId: invoice.doctorId.toString()
        }
      });

      // Update invoice
      invoice.paymentIntents.push({
        id: paymentIntent.id,
        amount: paymentAmount,
        status: paymentIntent.status,
        created: new Date(),
        paymentMethod: 'card'
      });

      if (paymentIntent.status === 'succeeded') {
        const totalPaid = invoice.paymentIntents.reduce((sum, pi) =>
          pi.status === 'succeeded' ? sum + pi.amount : sum, 0
        );

        if (totalPaid >= invoice.total) {
          invoice.status = 'paid';
          invoice.paidDate = new Date();
        } else {
          invoice.status = 'partially_paid';
        }
      }

      invoice.updatedAt = new Date();
      await this.saveInvoice(invoice);

      // Send receipt
      await this.sendPaymentReceipt(invoice, paymentIntent);

      return { paymentIntent, updatedInvoice: invoice };
    } catch (error: any) {
      console.error('Payment processing error:', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  async processRefund(
    invoiceId: string,
    paymentIntentId: string,
    amount?: number,
    reason: string = 'Requested by customer'
  ): Promise<{ refund: Stripe.Refund; updatedInvoice: Invoice }> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const paymentIntent = invoice.paymentIntents.find(pi => pi.id === paymentIntentId);
    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not found or not successful');
    }

    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount || paymentIntent.amount,
        reason: 'requested_by_customer',
        metadata: {
          invoiceId,
          reason
        }
      });

      // Update invoice
      invoice.refundHistory.push({
        id: refund.id,
        amount: refund.amount,
        reason,
        processedAt: new Date()
      });

      // Update payment intent status
      const piIndex = invoice.paymentIntents.findIndex(pi => pi.id === paymentIntentId);
      if (piIndex >= 0) {
        invoice.paymentIntents[piIndex].status = 'refunded';
      }

      // Recalculate paid amount
      const totalPaid = invoice.paymentIntents.reduce((sum, pi) =>
        pi.status === 'succeeded' ? sum + pi.amount : sum, 0
      );
      const totalRefunded = invoice.refundHistory.reduce((sum, r) => sum + r.amount, 0);
      const netPaid = totalPaid - totalRefunded;

      if (netPaid <= 0) {
        invoice.status = 'draft'; // Reset to draft if fully refunded
      } else if (netPaid < invoice.total) {
        invoice.status = 'partially_paid';
      }

      invoice.updatedAt = new Date();
      await this.saveInvoice(invoice);

      return { refund, updatedInvoice: invoice };
    } catch (error: any) {
      console.error('Refund processing error:', error);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  async setupPaymentPlan(
    patientId: number,
    invoiceIds: string[],
    numberOfPayments: number,
    paymentMethodId: string,
    frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' = 'monthly'
  ): Promise<PaymentPlan> {
    // Get total amount from invoices
    let totalAmount = 0;
    const invoices = [];

    for (const invoiceId of invoiceIds) {
      const invoice = await this.getInvoice(invoiceId);
      if (invoice && invoice.status !== 'paid') {
        totalAmount += invoice.total - this.getAlreadyPaidAmount(invoice);
        invoices.push(invoice);
      }
    }

    if (totalAmount <= 0) {
      throw new Error('No remaining balance to set up payment plan');
    }

    const monthlyPayment = Math.ceil(totalAmount / numberOfPayments);
    const nextPaymentDate = this.getNextPaymentDate(frequency);

    // Get payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    const paymentPlan: PaymentPlan = {
      id: `pp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      invoiceIds,
      totalAmount,
      remainingAmount: totalAmount,
      monthlyPayment,
      numberOfPayments,
      nextPaymentDate,
      frequency,
      status: 'active',
      paymentMethod: {
        type: paymentMethod.type as 'card' | 'bank_account',
        last4: paymentMethod.card?.last4 || paymentMethod.us_bank_account?.last4 || '',
        brand: paymentMethod.card?.brand,
        expMonth: paymentMethod.card?.exp_month,
        expYear: paymentMethod.card?.exp_year
      },
      installments: this.generateInstallments(totalAmount, numberOfPayments, nextPaymentDate, frequency),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save payment plan
    await this.savePaymentPlan(paymentPlan);

    // Schedule automatic payments
    await this.scheduleAutomaticPayments(paymentPlan);

    return paymentPlan;
  }

  async verifyInsurance(
    patientId: number,
    insuranceProvider: string,
    policyNumber: string,
    memberId: string,
    subscriberInfo: any
  ): Promise<InsuranceVerification> {
    // This would integrate with external insurance verification APIs
    // For now, return a mock verification

    const verification: InsuranceVerification = {
      id: `iv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      insuranceProvider,
      policyNumber,
      memberId,
      groupNumber: subscriberInfo.groupNumber,
      subscriberName: subscriberInfo.name,
      subscriberRelationship: subscriberInfo.relationship || 'self',
      coverageType: 'PPO', // Would be determined by actual verification
      status: 'active',
      effectiveDate: new Date(),
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      coverageDetails: {
        deductible: {
          individual: 1000,
          family: 2000,
          remaining: {
            individual: 500,
            family: 1200
          }
        },
        copay: {
          primaryCare: 20,
          specialist: 40,
          emergencyRoom: 150,
          urgentCare: 75,
          prescription: 15
        },
        coinsurance: {
          inNetwork: 0.2, // 20%
          outOfNetwork: 0.4  // 40%
        },
        outOfPocketMax: {
          individual: 3000,
          family: 6000,
          remaining: {
            individual: 2500,
            family: 5500
          }
        }
      },
      benefits: {
        preventiveCare: true,
        mentalHealth: true,
        prescriptionDrugs: true,
        vision: false,
        dental: false,
        telemedicine: true
      },
      network: {
        inNetworkProviders: [],
        outOfNetworkCoverage: true,
        referralRequired: false,
        preauthorizationRequired: []
      },
      verifiedAt: new Date(),
      nextVerificationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    };

    // Save verification
    await this.saveInsuranceVerification(verification);

    return verification;
  }

  async submitInsuranceClaim(
    patientId: number,
    appointmentId: number,
    services: Array<{
      code: string;
      description: string;
      charge: number;
    }>,
    diagnosisCodes: string[]
  ): Promise<InsuranceClaim> {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Doctor, as: 'doctor' },
        { model: User, as: 'patient' }
      ]
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const billedAmount = services.reduce((sum, service) => sum + service.charge, 0);

    const claim: InsuranceClaim = {
      id: `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      insuranceProvider: 'Unknown', // Would be from patient's insurance info
      policyNumber: 'Unknown',
      claimNumber: `CLM${Date.now()}`,
      claimType: 'medical',
      patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      dateOfService: appointment.scheduledDateTime,
      placeOfService: this.getPlaceOfService(appointment.appointmentType),
      renderingProvider: {
        npiNumber: appointment.doctor.credentials.npiNumber || '',
        name: appointment.doctor.getFullName(),
        taxonomyCode: '207Q00000X', // Family Medicine
        specialty: appointment.doctor.specialization
      },
      billingProvider: {
        npiNumber: appointment.doctor.credentials.npiNumber || '',
        name: appointment.doctor.getFullName(),
        taxonomyCode: '207Q00000X',
        address: appointment.doctor.practiceInfo.address,
        phone: appointment.doctor.practiceInfo.phone
      },
      diagnosis: diagnosisCodes.map(code => ({
        code,
        description: `Diagnosis ${code}` // Would map codes to descriptions
      })),
      procedures: services.map(service => ({
        code: service.code,
        description: service.description,
        units: 1,
        charge: service.charge
      })),
      billedAmount,
      allowedAmount: billedAmount * 0.8, // Typically 80% of billed amount
      paidAmount: 0, // Will be updated when processed
      patientResponsibility: billedAmount * 0.2,
      insuranceResponsibility: billedAmount * 0.8,
      deductible: 0,
      coinsurance: 0,
      copay: 0,
      status: 'submitted',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save claim
    await this.saveInsuranceClaim(claim);

    // Submit to insurance clearinghouse
    await this.submitClaimToClearinghouse(claim);

    return claim;
  }

  async getPatientBillingHistory(
    patientId: number,
    dateRange?: { start: Date; end: Date }
  ): Promise<{
    invoices: Invoice[];
    totalPaid: number;
    totalOutstanding: number;
    paymentPlans: PaymentPlan[];
  }> {
    const invoices = await this.getInvoicesByPatient(patientId, dateRange);
    const paymentPlans = await this.getPaymentPlansByPatient(patientId);

    const totalPaid = invoices.reduce((sum, invoice) => {
      return sum + invoice.paymentIntents
        .filter(pi => pi.status === 'succeeded')
        .reduce((paidSum, pi) => paidSum + pi.amount, 0);
    }, 0);

    const totalOutstanding = invoices
      .filter(invoice => ['draft', 'sent', 'partially_paid', 'overdue'].includes(invoice.status))
      .reduce((sum, invoice) => {
        const paid = invoice.paymentIntents
          .filter(pi => pi.status === 'succeeded')
          .reduce((paidSum, pi) => paidSum + pi.amount, 0);
        return sum + (invoice.total - paid);
      }, 0);

    return {
      invoices,
      totalPaid,
      totalOutstanding,
      paymentPlans
    };
  }

  private calculateTax(subtotal: number, state: string): number {
    const taxRate = this.taxRates.get(state) || this.taxRates.get('default') || 7.0;
    return Math.round(subtotal * (taxRate / 100));
  }

  private calculateDiscount(items: BillingItem[], insuranceDetails?: any): number {
    if (!insuranceDetails) return 0;

    // Calculate insurance discount based on coverage
    const total = items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
    const coveragePercentage = 0.8; // Typical 80% coverage

    return Math.round(total * coveragePercentage);
  }

  private async calculateInsuranceCoverage(
    items: BillingItem[],
    insuranceDetails: any
  ): Promise<{
    coverageAmount: number;
    patientResponsibility: number;
    deductible: number;
    copay: number;
    coinsurance: number;
  }> {
    // This would integrate with insurance APIs to calculate actual coverage
    const total = items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
    const coverageAmount = Math.round(total * 0.8);
    const patientResponsibility = total - coverageAmount;

    return {
      coverageAmount,
      patientResponsibility,
      deductible: 20,
      copay: 15,
      coinsurance: total * 0.2
    };
  }

  private getPlaceOfService(appointmentType: string): 'office' | 'hospital' | 'urgent_care' | 'telehealth' | 'home' {
    const mapping = {
      'in-person': 'office',
      'video': 'telehealth',
      'phone': 'telehealth',
      'chat': 'telehealth'
    };

    return mapping[appointmentType as keyof typeof mapping] || 'office';
  }

  private getNextPaymentDate(frequency: string): Date {
    const now = new Date();

    switch (frequency) {
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'bi-weekly':
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  private generateInstallments(
    totalAmount: number,
    numberOfPayments: number,
    startDate: Date,
    frequency: string
  ): PaymentPlan['installments'] {
    const installments: PaymentPlan['installments'] = [];
    const baseAmount = Math.round(totalAmount / numberOfPayments);
    let remainingAmount = totalAmount;
    let currentDate = new Date(startDate);

    for (let i = 0; i < numberOfPayments; i++) {
      const amount = i === numberOfPayments - 1 ? remainingAmount : baseAmount;

      installments.push({
        dueDate: new Date(currentDate),
        amount,
        status: 'pending'
      });

      remainingAmount -= amount;

      // Calculate next due date
      switch (frequency) {
        case 'weekly':
          currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'bi-weekly':
          currentDate = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
          break;
        case 'quarterly':
          currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, currentDate.getDate());
          break;
      }
    }

    return installments;
  }

  private getAlreadyPaidAmount(invoice: Invoice): number {
    return invoice.paymentIntents
      .filter(pi => pi.status === 'succeeded')
      .reduce((sum, pi) => sum + pi.amount, 0);
  }

  private async sendPaymentReceipt(invoice: Invoice, paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Send email receipt to patient
    console.log(`Payment receipt sent to patient ${invoice.patientId} for invoice ${invoice.id}`);
  }

  private async scheduleAutomaticPayments(paymentPlan: PaymentPlan): Promise<void> {
    // Schedule automatic payment processing
    console.log(`Automatic payments scheduled for payment plan ${paymentPlan.id}`);
  }

  private async submitClaimToClearinghouse(claim: InsuranceClaim): Promise<void> {
    // Submit claim to insurance clearinghouse (e.g., Availity, ZirMed)
    console.log(`Insurance claim ${claim.id} submitted to clearinghouse`);
  }

  // Database operations (mock implementations - would use actual database in production)
  private async saveInvoice(invoice: Invoice): Promise<void> {
    console.log('Invoice saved:', invoice.id);
  }

  private async getInvoice(invoiceId: string): Promise<Invoice | null> {
    console.log('Fetching invoice:', invoiceId);
    return null; // Mock implementation
  }

  private async getInvoicesByPatient(patientId: number, dateRange?: { start: Date; end: Date }): Promise<Invoice[]> {
    console.log('Fetching invoices for patient:', patientId);
    return []; // Mock implementation
  }

  private async savePaymentPlan(paymentPlan: PaymentPlan): Promise<void> {
    console.log('Payment plan saved:', paymentPlan.id);
  }

  private async getPaymentPlansByPatient(patientId: number): Promise<PaymentPlan[]> {
    console.log('Fetching payment plans for patient:', patientId);
    return []; // Mock implementation
  }

  private async saveInsuranceVerification(verification: InsuranceVerification): Promise<void> {
    console.log('Insurance verification saved:', verification.id);
  }

  private async saveInsuranceClaim(claim: InsuranceClaim): Promise<void> {
    console.log('Insurance claim saved:', claim.id);
  }

  // Stripe webhook handling
  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const invoiceId = paymentIntent.metadata.invoiceId;
    if (invoiceId) {
      const invoice = await this.getInvoice(invoiceId);
      if (invoice) {
        // Update invoice status
        console.log(`Payment succeeded for invoice ${invoiceId}`);
      }
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const invoiceId = paymentIntent.metadata.invoiceId;
    if (invoiceId) {
      console.log(`Payment failed for invoice ${invoiceId}`);
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    console.log(`Recurring invoice payment succeeded: ${invoice.id}`);
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log(`Recurring invoice payment failed: ${invoice.id}`);
  }
}

export default new BillingService();