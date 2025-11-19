import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';
import MedicalHistorySection from '@/components/health/MedicalHistorySection';
import HealthStatsSection from '@/components/health/HealthStatsSection';
import { generateCombinedHealthReportPdf } from '@/utils/pdfUtils';

const HealthRecordsComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("history");

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col app-container pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="page-title text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 mb-1">
            Health Records
          </h1>
          <p className="page-subtitle text-base text-gray-600 dark:text-gray-400 mb-0">
            Your complete medical history in one secure place
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm" 
            className="border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/50"
            onClick={generateCombinedHealthReportPdf}
          >
            <Download size={16} className="mr-1.5" /> Export All
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1"
      >
        <Tabs
          defaultValue="history"
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="mb-4 bg-white dark:bg-gray-900 border dark:border-gray-800">
            <TabsTrigger value="history" className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              Medical History
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              Health Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="flex-1 mt-0">
            <MedicalHistorySection />
          </TabsContent>

          <TabsContent value="stats" className="flex-1 mt-0">
            <HealthStatsSection />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default HealthRecordsComponent;