import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";
import { format } from 'date-fns';

// Extend the jsPDF type definition to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Common function to initialize PDF with header
export const createPdfDocument = (title: string): jsPDF => {
  const doc = new jsPDF();
  
  // Add title and header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(23, 107, 135);
  doc.text("Medico Health Records", 105, 15, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 105, 25, { align: "center" });
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 105, 30, { align: "center" });
  
  doc.line(20, 35, 190, 35);
  
  return doc;
};

// Function to generate medications PDF
export const generateMedicationsPdf = (medications: any[]): void => {
  try {
    const doc = createPdfDocument("Medication History");
    
    // If no medications
    if (medications.length === 0) {
      doc.setFontSize(12);
      doc.text("No medication records available.", 20, 50);
      doc.save("medication-history.pdf");
      toast.success("Medication history PDF downloaded");
      return;
    }
    
    // Prepare data for table
    const tableData = medications.map(med => [
      med.medicationName,
      med.dosage || "Not specified",
      med.time || "Not specified",
      new Date(med.date).toLocaleDateString(),
      med.notes || ""
    ]);
    
    doc.autoTable({
      startY: 45,
      head: [["Medication", "Dosage", "Schedule", "Date Added", "Notes"]],
      body: tableData,
      headStyles: { 
        fillColor: [23, 107, 135],
        textColor: [255, 255, 255],
        fontStyle: "bold" 
      },
      alternateRowStyles: { fillColor: [240, 248, 255] }
    });
    
    doc.save("medication-history.pdf");
    toast.success("Medication history PDF downloaded");
  } catch (error) {
    console.error("Error generating medication PDF:", error);
    toast.error("Failed to download PDF");
  }
};

// Function to generate health stats PDF
export const generateHealthStatsPdf = (stats: any[]): void => {
  try {
    const doc = createPdfDocument("Health Statistics");
    
    // If no stats
    if (stats.length === 0) {
      doc.setFontSize(12);
      doc.text("No health statistics available.", 20, 50);
      doc.save("health-statistics.pdf");
      toast.success("Health statistics PDF downloaded");
      return;
    }
    
    // Prepare data for table
    const tableData = stats.map(stat => {
      // Get display name for the stat type
      let typeName = stat.type;
      switch(stat.type) {
        case 'blood-pressure': typeName = 'Blood Pressure'; break;
        case 'heart-rate': typeName = 'Heart Rate'; break;
        case 'weight': typeName = 'Weight'; break;
        case 'sleep': typeName = 'Sleep'; break;
        case 'steps': typeName = 'Steps'; break;
        case 'temperature': typeName = 'Temperature'; break;
        case 'glucose': typeName = 'Glucose'; break;
        case 'oxygen': typeName = 'Oxygen'; break;
      }
      
      return [
        typeName,
        stat.value,
        new Date(stat.date).toLocaleDateString(),
        new Date(stat.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stat.notes || ""
      ];
    });
    
    doc.autoTable({
      startY: 45,
      head: [["Measurement", "Value", "Date", "Time", "Notes"]],
      body: tableData,
      headStyles: { 
        fillColor: [35, 139, 123],
        textColor: [255, 255, 255],
        fontStyle: "bold" 
      },
      alternateRowStyles: { fillColor: [240, 255, 250] }
    });
    
    doc.save("health-statistics.pdf");
    toast.success("Health statistics PDF downloaded");
  } catch (error) {
    console.error("Error generating health stats PDF:", error);
    toast.error("Failed to download PDF");
  }
};

// Function to generate medical history PDF
export const generateMedicalHistoryPdf = (records: MedicalRecord[] | any[]): void => {
  try {
    const doc = createPdfDocument("Medical History");
    const pageWidth = doc.internal.pageSize.width;
    
    // Add title
    doc.setFontSize(20);
    doc.text('Medical History Report', pageWidth / 2, 20, { align: 'center' });

    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, pageWidth / 2, 30, { align: 'center' });
    
    // If no records
    if (records.length === 0) {
      doc.setFontSize(12);
      doc.text("No medical history records available.", 20, 50);
      doc.save("medical-history.pdf");
      toast.success("Medical history PDF downloaded");
      return;
    }
    
    // Prepare data for table
    const tableData = records.map(record => {
      // Get display name for the record type
      let typeName = record.type;
      switch(record.type) {
        case 'doctor-visit': typeName = 'Doctor Visit'; break;
        case 'procedure': typeName = 'Medical Procedure'; break;
        case 'vaccination': typeName = 'Vaccination'; break;
        case 'condition': typeName = 'Medical Condition'; break;
        case 'allergy': typeName = 'Allergy'; break;
        case 'medication': typeName = 'Medication History'; break;
        case 'test': typeName = 'Medical Test'; break;
        case 'other': typeName = 'Other'; break;
      }
      
      return [
        typeName,
        record.provider || record.title || '',
        record.location || record.description || "Not specified",
        format(new Date(record.date), 'PPp'),
        record.notes || ""
      ];
    });
    
    doc.autoTable({
      startY: 40,
      head: [["Type", "Provider/Title", "Location/Description", "Date & Time", "Notes"]],
      body: tableData,
      headStyles: { 
        fillColor: [63, 81, 181],
        textColor: [255, 255, 255],
        fontStyle: "bold" 
      },
      alternateRowStyles: { fillColor: [240, 240, 255] },
      styles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 40 },
        4: { cellWidth: 'auto' }
      }
    });

    // Add footer with page numbers
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      doc.text('Generated by Remindly Health', pageWidth / 2, doc.internal.pageSize.height - 5, { align: 'center' });
    }
    
    doc.save("medical-history.pdf");
    toast.success("Medical history PDF downloaded");
  } catch (error) {
    console.error("Error generating medical history PDF:", error);
    toast.error("Failed to download PDF");
  }
};

// Function to generate combined PDF with all health records
export const generateCombinedHealthRecordsPdf = (
  medications: any[], 
  stats: any[], 
  medicalHistory: any[]
): void => {
  try {
    const doc = createPdfDocument("Complete Health Records");
    let yPosition = 45;
    
    // 1. Medications Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(23, 107, 135);
    doc.text("Medication History", 20, yPosition);
    yPosition += 10;
    
    if (medications.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("No medication records available.", 20, yPosition);
      yPosition += 15;
    } else {
      const medTableData = medications.map(med => [
        med.medicationName,
        med.dosage || "Not specified",
        med.time || "Not specified",
        new Date(med.date).toLocaleDateString(),
        med.notes || ""
      ]);
      
      doc.autoTable({
        startY: yPosition,
        head: [["Medication", "Dosage", "Schedule", "Date Added", "Notes"]],
        body: medTableData,
        headStyles: { 
          fillColor: [23, 107, 135],
          textColor: [255, 255, 255]
        },
        alternateRowStyles: { fillColor: [240, 248, 255] }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }
    
    // 2. Health Stats Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(35, 139, 123);
    doc.text("Health Statistics", 20, yPosition);
    yPosition += 10;
    
    if (stats.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("No health statistics available.", 20, yPosition);
      yPosition += 15;
    } else {
      const statsTableData = stats.map(stat => {
        let typeName = stat.type;
        switch(stat.type) {
          case 'blood-pressure': typeName = 'Blood Pressure'; break;
          case 'heart-rate': typeName = 'Heart Rate'; break;
          case 'weight': typeName = 'Weight'; break;
          case 'sleep': typeName = 'Sleep'; break;
          case 'steps': typeName = 'Steps'; break;
          case 'temperature': typeName = 'Temperature'; break;
          case 'glucose': typeName = 'Glucose'; break;
          case 'oxygen': typeName = 'Oxygen'; break;
        }
        
        return [
          typeName,
          stat.value,
          new Date(stat.date).toLocaleDateString(),
          stat.notes || ""
        ];
      });
      
      doc.autoTable({
        startY: yPosition,
        head: [["Measurement", "Value", "Date", "Notes"]],
        body: statsTableData,
        headStyles: { 
          fillColor: [35, 139, 123],
          textColor: [255, 255, 255]
        },
        alternateRowStyles: { fillColor: [240, 255, 250] }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }
    
    // Check if we need a new page for medical history
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }
    
    // 3. Medical History Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(63, 81, 181);
    doc.text("Medical History", 20, yPosition);
    yPosition += 10;
    
    if (medicalHistory.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("No medical history records available.", 20, yPosition);
    } else {
      const historyTableData = medicalHistory.map(record => {
        let typeName = record.type;
        switch(record.type) {
          case 'doctor-visit': typeName = 'Doctor Visit'; break;
          case 'procedure': typeName = 'Medical Procedure'; break;
          case 'vaccination': typeName = 'Vaccination'; break;
          case 'other': typeName = 'Other'; break;
        }
        
        return [
          typeName,
          record.provider,
          record.location || "Not specified",
          new Date(record.date).toLocaleDateString(),
          record.notes || ""
        ];
      });
      
      doc.autoTable({
        startY: yPosition,
        head: [["Type", "Provider", "Location", "Date", "Notes"]],
        body: historyTableData,
        headStyles: { 
          fillColor: [63, 81, 181],
          textColor: [255, 255, 255]
        },
        alternateRowStyles: { fillColor: [240, 240, 255] }
      });
    }
    
    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
      doc.text('Generated by Medico', 105, doc.internal.pageSize.height - 5, { align: 'center' });
    }
    
    doc.save("complete-health-records.pdf");
    toast.success("Complete health records PDF downloaded");
  } catch (error) {
    console.error("Error generating combined PDF:", error);
    toast.error("Failed to download PDF");
  }
};

interface HealthStat {
  id: string;
  date: Date;
  type: string;
  value: string;
  notes: string;
}

interface MedicalRecord {
  id: string;
  date: Date;
  type: string;
  title: string;
  description: string;
  provider?: string;
}

const STAT_TYPES = {
  'blood-pressure': 'Blood Pressure',
  'heart-rate': 'Heart Rate',
  'weight': 'Weight',
  'sleep': 'Sleep',
  'temperature': 'Temperature',
  'glucose': 'Glucose',
  'oxygen': 'Oxygen'
};

const RECORD_TYPES = {
  'condition': 'Medical Condition',
  'procedure': 'Medical Procedure',
  'vaccination': 'Vaccination',
  'allergy': 'Allergy',
  'medication': 'Medication History',
  'test': 'Medical Test'
};

export const generateHealthReportPdf = (stats: HealthStat[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Add title
  doc.setFontSize(20);
  doc.text('Health Statistics Report', pageWidth / 2, 20, { align: 'center' });

  // Add date
  doc.setFontSize(12);
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, pageWidth / 2, 30, { align: 'center' });

  // Add stats table
  const tableData = stats.map(stat => [
    STAT_TYPES[stat.type as keyof typeof STAT_TYPES] || stat.type,
    stat.value,
    format(new Date(stat.date), 'PPp'),
    stat.notes || '-'
  ]);

  (doc as any).autoTable({
    head: [['Type', 'Value', 'Date & Time', 'Notes']],
    body: tableData,
    startY: 40,
    headStyles: {
      fillColor: [63, 169, 127],
      textColor: [255, 255, 255]
    },
    styles: {
      fontSize: 10
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 'auto' }
    }
  });

  // Save the PDF
  doc.save('health-statistics-report.pdf');
};

export const generateCombinedHealthReportPdf = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Add title
  doc.setFontSize(20);
  doc.text('Complete Health Report', pageWidth / 2, 20, { align: 'center' });

  // Add date
  doc.setFontSize(12);
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, pageWidth / 2, 30, { align: 'center' });

  // Get data from localStorage
  const savedStats = localStorage.getItem('healthStats');
  const savedRecords = localStorage.getItem('medicalRecords');
  const savedMedications = localStorage.getItem('medications');

  let stats: HealthStat[] = [];
  let records: MedicalRecord[] = [];
  let medications: any[] = [];

  try {
    if (savedStats) {
      stats = JSON.parse(savedStats);
    }
    if (savedRecords) {
      records = JSON.parse(savedRecords);
    }
    if (savedMedications) {
      medications = JSON.parse(savedMedications);
    }
  } catch (error) {
    console.error("Error parsing health data:", error);
  }

  let currentY = 40;

  // Add health stats section
  if (stats.length > 0) {
    doc.setFontSize(16);
    doc.text('Health Statistics', 14, currentY);
    currentY += 10;

    const statsData = stats.map(stat => [
      STAT_TYPES[stat.type as keyof typeof STAT_TYPES] || stat.type,
      stat.value,
      format(new Date(stat.date), 'PPp'),
      stat.notes || '-'
    ]);

    (doc as any).autoTable({
      head: [['Type', 'Value', 'Date & Time', 'Notes']],
      body: statsData,
      startY: currentY,
      headStyles: {
        fillColor: [63, 169, 127],
        textColor: [255, 255, 255]
      },
      styles: {
        fontSize: 10
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;
  }

  // Add medical records section
  if (records.length > 0) {
    // Add new page if needed
    if (currentY > doc.internal.pageSize.height - 60) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.text('Medical History', 14, currentY);
    currentY += 10;

    const recordsData = records.map(record => [
      RECORD_TYPES[record.type as keyof typeof RECORD_TYPES] || record.type,
      record.title,
      format(new Date(record.date), 'PPp'),
      record.description,
      record.provider || '-'
    ]);

    (doc as any).autoTable({
      head: [['Type', 'Title', 'Date & Time', 'Description', 'Provider']],
      body: recordsData,
      startY: currentY,
      headStyles: {
        fillColor: [63, 169, 127],
        textColor: [255, 255, 255]
      },
      styles: {
        fontSize: 10
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;
  }

  // Add medications section
  if (medications.length > 0) {
    // Add new page if needed
    if (currentY > doc.internal.pageSize.height - 60) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.text('Current Medications', 14, currentY);
    currentY += 10;

    const medicationsData = medications.map((med: any) => [
      med.name,
      med.dosage || '-',
      med.schedule || '-',
      med.notes || '-'
    ]);

    (doc as any).autoTable({
      head: [['Medication', 'Dosage', 'Schedule', 'Notes']],
      body: medicationsData,
      startY: currentY,
      headStyles: {
        fillColor: [63, 169, 127],
        textColor: [255, 255, 255]
      },
      styles: {
        fontSize: 10
      }
    });
  }

  // Save the PDF
  doc.save('complete-health-report.pdf');
};
