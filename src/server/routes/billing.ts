import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import BillingService from '../services/billingService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Create medical invoice
router.post('/invoices', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const invoiceData = req.body;

  const invoice = await BillingService.createMedicalInvoice(userId, invoiceData);

  res.status(201).json({
    success: true,
    data: invoice
  });
}));

// Process payment
router.post('/payments', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { invoiceId, paymentMethodId, amount } = req.body;

  const payment = await BillingService.processPayment(userId, {
    invoiceId,
    paymentMethodId,
    amount: parseFloat(amount)
  });

  res.status(201).json({
    success: true,
    data: payment
  });
}));

// Get user invoices
router.get('/invoices', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { status, limit = 10, offset = 0 } = req.query;

  const invoices = await BillingService.getUserInvoices(userId, {
    status: status as string,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });

  res.json({
    success: true,
    data: invoices
  });
}));

// Get invoice by ID
router.get('/invoices/:invoiceId', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { invoiceId } = req.params;

  const invoice = await BillingService.getInvoiceById(invoiceId, userId);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found'
    });
  }

  res.json({
    success: true,
    data: invoice
  });
}));

// Submit insurance claim
router.post('/insurance/claims', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const claimData = req.body;

  const claim = await BillingService.submitInsuranceClaim(userId, claimData);

  res.status(201).json({
    success: true,
    data: claim
  });
}));

// Get insurance claims
router.get('/insurance/claims', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { status, limit = 10, offset = 0 } = req.query;

  const claims = await BillingService.getInsuranceClaims(userId, {
    status: status as string,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });

  res.json({
    success: true,
    data: claims
  });
}));

// Create payment plan
router.post('/payment-plans', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const planData = req.body;

  const paymentPlan = await BillingService.createPaymentPlan(userId, planData);

  res.status(201).json({
    success: true,
    data: paymentPlan
  });
}));

// Get payment plans
router.get('/payment-plans', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const paymentPlans = await BillingService.getPaymentPlans(userId);

  res.json({
    success: true,
    data: paymentPlans
  });
}));

// Add payment method
router.post('/payment-methods', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const paymentMethodData = req.body;

  const paymentMethod = await BillingService.addPaymentMethod(userId, paymentMethodData);

  res.status(201).json({
    success: true,
    data: paymentMethod
  });
}));

// Get payment methods
router.get('/payment-methods', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const paymentMethods = await BillingService.getPaymentMethods(userId);

  res.json({
    success: true,
    data: paymentMethods
  });
}));

// Delete payment method
router.delete('/payment-methods/:paymentMethodId', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { paymentMethodId } = req.params;

  await BillingService.removePaymentMethod(userId, paymentMethodId);

  res.json({
    success: true,
    message: 'Payment method removed successfully'
  });
}));

// Get billing overview
router.get('/overview', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const overview = await BillingService.getBillingOverview(userId);

  res.json({
    success: true,
    data: overview
  });
}));

// Estimate procedure cost
router.post('/cost-estimate', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { procedureCode, insuranceProvider, location } = req.body;

  const estimate = await BillingService.estimateProcedureCost(userId, {
    procedureCode,
    insuranceProvider,
    location
  });

  res.json({
    success: true,
    data: estimate
  });
}));

// Verify insurance coverage
router.post('/insurance/coverage', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { insuranceProvider, memberId, procedureCode } = req.body;

  const coverage = await BillingService.verifyInsuranceCoverage(userId, {
    insuranceProvider,
    memberId,
    procedureCode
  });

  res.json({
    success: true,
    data: coverage
  });
}));

export default router;