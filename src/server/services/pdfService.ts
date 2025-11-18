import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import { formatDate } from '../utils/dateUtils.js';

export interface PDFReportOptions {
  format?: 'A4' | 'Letter';
  landscape?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  printBackground?: boolean;
  margin?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
}

export interface HealthReportData {
  user: {
    name: string;
    email: string;
    dateOfBirth: Date;
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: {
    bloodPressure?: Array<{
      date: Date;
      systolic: number;
      diastolic: number;
      category: string;
    }>;
    weight?: Array<{
      date: Date;
      value: number;
      unit: string;
    }>;
    heartRate?: Array<{
      date: Date;
      value: number;
      unit: string;
    }>;
    bloodSugar?: Array<{
      date: Date;
      value: number;
      unit: string;
    }>;
    temperature?: Array<{
      date: Date;
      value: number;
      unit: string;
    }>;
  };
  medications: Array<{
    name: string;
    dosage: string;
    adherenceRate: number;
    totalDoses: number;
    takenDoses: number;
  }>;
  dietPlan?: {
    name: string;
    adherenceRate: number;
    averageCalories: number;
    targetCalories: number;
  };
}

export interface MedicationReportData {
  user: {
    name: string;
    email: string;
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate?: Date;
    adherenceStats: {
      totalDoses: number;
      takenDoses: number;
      missedDoses: number;
      adherenceRate: number;
    };
    intakeHistory: Array<{
      date: Date;
      taken: boolean;
      notes?: string;
    }>;
  }>;
  summary: {
    totalMedications: number;
    overallAdherenceRate: number;
    mostMissedMedication?: string;
  };
}

class PDFService {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: process.env.NODE_ENV === 'production' ? 'new' : false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      console.log('✅ Puppeteer browser initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Puppeteer browser:', error);
      throw error;
    }
  }

  private async ensureBrowser(): Promise<Browser> {
    if (!this.browser) {
      await this.initialize();
    }
    return this.browser!;
  }

  async generateHealthReport(
    data: HealthReportData,
    options: PDFReportOptions = {}
  ): Promise<Buffer> {
    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      const html = this.generateHealthReportHTML(data);
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        landscape: options.landscape || false,
        displayHeaderFooter: options.displayHeaderFooter !== false,
        headerTemplate: options.headerTemplate || `
          <div style="font-size: 10px; padding: 10px 20px; border-bottom: 1px solid #ddd; color: #666;">
            Health Report - ${data.user.name}
          </div>
        `,
        footerTemplate: options.footerTemplate || `
          <div style="font-size: 10px; padding: 10px 20px; border-top: 1px solid #ddd; color: #666; text-align: center;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        `,
        printBackground: true,
        margin: options.margin || {
          top: '40px',
          bottom: '40px',
          left: '20px',
          right: '20px'
        }
      });

      return pdfBuffer as Buffer;
    } finally {
      await page.close();
    }
  }

  async generateMedicationReport(
    data: MedicationReportData,
    options: PDFReportOptions = {}
  ): Promise<Buffer> {
    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      const html = this.generateMedicationReportHTML(data);
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        landscape: options.landscape || false,
        displayHeaderFooter: options.displayHeaderFooter !== false,
        headerTemplate: options.headerTemplate || `
          <div style="font-size: 10px; padding: 10px 20px; border-bottom: 1px solid #ddd; color: #666;">
            Medication Report - ${data.user.name}
          </div>
        `,
        footerTemplate: options.footerTemplate || `
          <div style="font-size: 10px; padding: 10px 20px; border-top: 1px solid #ddd; color: #666; text-align: center;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        `,
        printBackground: true,
        margin: options.margin || {
          top: '40px',
          bottom: '40px',
          left: '20px',
          right: '20px'
        }
      });

      return pdfBuffer as Buffer;
    } finally {
      await page.close();
    }
  }

  private generateHealthReportHTML(data: HealthReportData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Health Report - ${data.user.name}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .user-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            color: #007bff;
            border-bottom: 2px solid #007bff;
            padding-bottom: 5px;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .metric-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .metric-table th,
          .metric-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .metric-table th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .metric-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .normal { color: #28a745; }
          .warning { color: #ffc107; }
          .danger { color: #dc3545; }
          .adherence-chart {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .adherence-bar {
            flex: 1;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
          }
          .adherence-fill {
            height: 100%;
            background: ${data.medications.length > 0 ? '#28a745' : '#dc3545'};
            transition: width 0.3s ease;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Health Report</h1>
          <p>Generated on ${formatDate(new Date())}</p>
        </div>

        <div class="user-info">
          <h2>Patient Information</h2>
          <p><strong>Name:</strong> ${data.user.name}</p>
          <p><strong>Email:</strong> ${data.user.email}</p>
          <p><strong>Date of Birth:</strong> ${formatDate(data.user.dateOfBirth)}</p>
          <p><strong>Report Period:</strong> ${formatDate(data.period.startDate)} - ${formatDate(data.period.endDate)}</p>
        </div>

        ${data.metrics.bloodPressure ? `
        <div class="section">
          <h2 class="section-title">Blood Pressure</h2>
          <table class="metric-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Systolic</th>
                <th>Diastolic</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${data.metrics.bloodPressure.map(bp => `
                <tr>
                  <td>${formatDate(bp.date)}</td>
                  <td>${bp.systolic}</td>
                  <td>${bp.diastolic}</td>
                  <td class="${bp.category === 'normal' ? 'normal' : bp.category === 'high' ? 'danger' : 'warning'}">${bp.category}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${data.metrics.weight ? `
        <div class="section">
          <h2 class="section-title">Weight Tracking</h2>
          <table class="metric-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              ${data.metrics.weight.map(weight => `
                <tr>
                  <td>${formatDate(weight.date)}</td>
                  <td>${weight.value} ${weight.unit}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${data.medications.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Medication Adherence</h2>
          ${data.medications.map(med => `
            <div style="margin-bottom: 15px;">
              <h4>${med.name} (${med.dosage})</h4>
              <div class="adherence-chart">
                <span>${med.adherenceRate}%</span>
                <div class="adherence-bar">
                  <div class="adherence-fill" style="width: ${med.adherenceRate}%"></div>
                </div>
                <span>${med.takenDoses}/${med.totalDoses} doses</span>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${data.dietPlan ? `
        <div class="section">
          <h2 class="section-title">Diet Plan Adherence</h2>
          <p><strong>Plan:</strong> ${data.dietPlan.name}</p>
          <p><strong>Target Calories:</strong> ${data.dietPlan.targetCalories}</p>
          <p><strong>Average Calories:</strong> ${data.dietPlan.averageCalories}</p>
          <div class="adherence-chart">
            <span>${data.dietPlan.adherenceRate}%</span>
            <div class="adherence-bar">
              <div class="adherence-fill" style="width: ${data.dietPlan.adherenceRate}%"></div>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="footer" style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
          <p>This report was generated by Medical App. Please consult with your healthcare provider for medical advice.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateMedicationReportHTML(data: MedicationReportData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Medication Report - ${data.user.name}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .user-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            color: #007bff;
            border-bottom: 2px solid #007bff;
            padding-bottom: 5px;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .medication-card {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .medication-header {
            background: #007bff;
            color: white;
            padding: 10px;
            margin: -15px -15px 15px -15px;
            border-radius: 5px 5px 0 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
          }
          .stat-box {
            background: #f8f9fa;
            padding: 10px;
            text-align: center;
            border-radius: 5px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
          }
          .adherence-chart {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .adherence-bar {
            flex: 1;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
          }
          .adherence-fill {
            height: 100%;
            transition: width 0.3s ease;
          }
          .adherence-high { background: #28a745; }
          .adherence-medium { background: #ffc107; }
          .adherence-low { background: #dc3545; }
          .intake-list {
            max-height: 200px;
            overflow-y: auto;
          }
          .intake-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
          }
          .taken { color: #28a745; }
          .missed { color: #dc3545; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Medication Adherence Report</h1>
          <p>Generated on ${formatDate(new Date())}</p>
        </div>

        <div class="user-info">
          <h2>Patient Information</h2>
          <p><strong>Name:</strong> ${data.user.name}</p>
          <p><strong>Email:</strong> ${data.user.email}</p>
          <p><strong>Report Period:</strong> ${formatDate(data.period.startDate)} - ${formatDate(data.period.endDate)}</p>
        </div>

        <div class="section">
          <h2 class="section-title">Summary</h2>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">${data.summary.totalMedications}</div>
              <div class="stat-label">Total Medications</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${data.summary.overallAdherenceRate}%</div>
              <div class="stat-label">Overall Adherence</div>
            </div>
            ${data.summary.mostMissedMedication ? `
            <div class="stat-box">
              <div class="stat-value" style="font-size: 14px;">${data.summary.mostMissedMedication}</div>
              <div class="stat-label">Most Missed</div>
            </div>
            ` : ''}
          </div>
        </div>

        ${data.medications.map(med => `
        <div class="section">
          <div class="medication-card">
            <div class="medication-header">
              <h3>${med.name}</h3>
              <p>${med.dosage} • ${med.frequency}</p>
            </div>

            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-value">${med.adherenceStats.totalDoses}</div>
                <div class="stat-label">Total Doses</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${med.adherenceStats.takenDoses}</div>
                <div class="stat-label">Taken</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${med.adherenceStats.missedDoses}</div>
                <div class="stat-label">Missed</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${med.adherenceStats.adherenceRate}%</div>
                <div class="stat-label">Adherence Rate</div>
              </div>
            </div>

            <div class="adherence-chart">
              <span>Adherence:</span>
              <div class="adherence-bar">
                <div class="adherence-fill ${med.adherenceStats.adherenceRate >= 80 ? 'adherence-high' : med.adherenceStats.adherenceRate >= 60 ? 'adherence-medium' : 'adherence-low'}"
                     style="width: ${med.adherenceStats.adherenceRate}%"></div>
              </div>
              <span>${med.adherenceStats.adherenceRate}%</span>
            </div>

            ${med.intakeHistory.length > 0 ? `
            <h4 style="margin-top: 20px;">Recent Intake History</h4>
            <div class="intake-list">
              ${med.intakeHistory.slice(-10).map(intake => `
                <div class="intake-item">
                  <span>${formatDate(intake.date)}</span>
                  <span class="${intake.taken ? 'taken' : 'missed'}">
                    ${intake.taken ? '✓ Taken' : '✗ Missed'}
                  </span>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
        </div>
        `).join('')}

        <div class="footer" style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
          <p>This report was generated by Medical App. Please consult with your healthcare provider for medical advice.</p>
        </div>
      </body>
      </html>
    `;
  }

  async savePDFToFile(pdfBuffer: Buffer, filename: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'reports');

    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, pdfBuffer);

    return filePath;
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('✅ Puppeteer browser closed');
    }
  }
}

export default new PDFService();