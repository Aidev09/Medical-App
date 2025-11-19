import React, { useState } from 'react';
import PageTransition from '@/components/ui/PageTransition';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addHealthRecord, updateHealthRecord, deleteHealthRecord } from '@/store/slices/healthSlice';
import { toast } from 'sonner';
import HealthRecordsComponent from '@/components/health/HealthRecordsComponent';
import HealthStatsSection from '@/components/health/HealthStatsSection';
import MedicalHistorySection from '@/components/health/MedicalHistorySection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pill, BarChart3, Stethoscope, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateMedicationsPdf, generateHealthStatsPdf, generateMedicalHistoryPdf, generateCombinedHealthRecordsPdf } from '@/utils/pdfUtils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const HealthRecords: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    records
  } = useAppSelector(state => state.health);
  const [activeTab, setActiveTab] = useState<string>("medications");

  // Get health stats from localStorage
  const getHealthStats = () => {
    const savedStats = localStorage.getItem('healthStats');
    return savedStats ? JSON.parse(savedStats) : [];
  };

  // Get medical history from localStorage
  const getMedicalHistory = () => {
    const savedHistory = localStorage.getItem('medicalHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  };
  const handleAddRecord = (record: {
    medicationName: string;
    notes: string;
    dosage?: string;
    time?: string;
  }) => {
    const newRecord = {
      id: Date.now().toString(),
      date: new Date(),
      medicationName: record.medicationName,
      notes: record.notes,
      dosage: record.dosage,
      time: record.time
    };
    dispatch(addHealthRecord(newRecord));
    toast.success(`Added ${record.medicationName} to your health records`);
  };
  const handleUpdateRecord = (record: any) => {
    dispatch(updateHealthRecord(record));
    toast.success(`Updated ${record.medicationName} in your health records`);
  };
  const handleDeleteRecord = (id: string, name: string) => {
    dispatch(deleteHealthRecord(id));
    toast.success(`Removed ${name} from your health records`);
  };
  const downloadCurrentTab = () => {
    switch (activeTab) {
      case "medications":
        generateMedicationsPdf(records);
        break;
      case "healthStats":
        generateHealthStatsPdf(getHealthStats());
        break;
      case "medicalHistory":
        generateMedicalHistoryPdf(getMedicalHistory());
        break;
    }
  };
  const downloadAllRecords = () => {
    generateCombinedHealthRecordsPdf(records, getHealthStats(), getMedicalHistory());
  };
  const getActiveTabName = () => {
    switch (activeTab) {
      case "medications":
        return "Medication Records";
      case "healthStats":
        return "Health Statistics";
      case "medicalHistory":
        return "Medical History";
      default:
        return "Current Tab";
    }
  };
  return <PageTransition className="app-container pb-32 dark">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="page-title text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">
            Health Records
          </h1>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border border-gray-800 bg-gray-900 hover:bg-gray-800 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Download Records
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800 text-white">
                    <DropdownMenuLabel className="text-gray-400">Available Downloads</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 flex items-center" onClick={() => generateMedicationsPdf(records)}>
                      <Pill className="h-4 w-4 mr-2 text-green-500" />
                      Download Medication Records
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 flex items-center" onClick={() => generateHealthStatsPdf(getHealthStats())}>
                      <BarChart3 className="h-4 w-4 mr-2 text-teal-500" />
                      Download Health Statistics
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 flex items-center" onClick={() => generateMedicalHistoryPdf(getMedicalHistory())}>
                      <Stethoscope className="h-4 w-4 mr-2 text-blue-500" />
                      Download Medical History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 flex items-center" onClick={downloadAllRecords}>
                      <FileText className="h-4 w-4 mr-2 text-yellow-500" />
                      Download Complete Records
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white">
                Download health records as PDF
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <p className="text-muted-foreground text-lg">
          Your complete medical history in one secure place
        </p>
      </div>
      
      <div className="bg-gray-900 text-white rounded-lg shadow-xl overflow-hidden border border-gray-800 w-full">
        <Tabs defaultValue="medications" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full h-14 bg-gray-900 border-b border-gray-800">
            <TabsTrigger value="medications" className="flex-1 h-full data-[state=active]:bg-gray-800 data-[state=active]:border-b-2 data-[state=active]:border-green-500">
              <Pill className="h-5 w-5 mr-2 text-green-500" />
              Medications
            </TabsTrigger>
            <TabsTrigger value="healthStats" className="flex-1 h-full data-[state=active]:bg-gray-800 data-[state=active]:border-b-2 data-[state=active]:border-teal-500">
              <BarChart3 className="h-5 w-5 mr-2 text-teal-500" />
              Health Stats
            </TabsTrigger>
            <TabsTrigger value="medicalHistory" className="flex-1 h-full data-[state=active]:bg-gray-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
              <Stethoscope className="h-5 w-5 mr-2 text-blue-500" />
              Medical History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="medications" className="m-0 p-0">
            <HealthRecordsComponent onAddRecord={handleAddRecord} onUpdateRecord={handleUpdateRecord} onDeleteRecord={handleDeleteRecord} />
          </TabsContent>
          
          <TabsContent value="healthStats" className="m-0 p-0">
            <HealthStatsSection />
          </TabsContent>
          
          <TabsContent value="medicalHistory" className="m-0 p-0">
            <MedicalHistorySection />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>;
};
export default HealthRecords;