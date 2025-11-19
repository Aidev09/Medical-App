
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Info, Loader2, Pill, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { searchDrugs, DrugResult } from '@/services/rxnormApi';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import MedicineSearchResult from '@/components/medication/MedicineSearchResult';

const MedicineSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DrugResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.warning("Please enter a medication name to search");
      return;
    }
    
    setIsLoading(true);
    setHasSearched(true);
    setErrorMessage(null);
    
    const results = await searchDrugs(searchQuery);
    
    setIsLoading(false);
    
    if (results && results.results && results.results.length > 0) {
      setSearchResults(results.results);
      toast.success(`Found ${results.results.length} medications`);
    } else {
      setSearchResults([]);
      setErrorMessage(`No medication found for "${searchQuery}". Please check the spelling or try a different medication name.`);
      toast.error(`No medication found for "${searchQuery}"`);
    }
  };

  const handleRetry = () => {
    if (searchQuery.trim()) {
      handleSearch(new Event('submit') as any);
    }
  };

  const handleAddMedication = (medication: DrugResult) => {
    // Get the brand name or generic name
    const brandName = medication.name || 'Unnamed Medication';
    
    // Navigate to add medication page with pre-filled data
    navigate('/add-medication', { 
      state: { 
        medication: {
          name: brandName,
          usage: medication.indications_and_usage?.[0] || '',
          dosage: medication.dosage_and_administration?.[0] || '',
          warnings: medication.warnings?.[0] || '',
          details: medication
        }
      }
    });
  };

  return (
    <PageTransition className="app-container">
      <div className="mb-6">
        <h1 className="page-title">Medication Lookup</h1>
        <p className="text-muted-foreground">Search for medications using the RxNorm database</p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search medication (e.g., Paracetamol, Aspirin, Tylenol)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>
      </form>

      {/* Error message alert */}
      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Medication Not Found</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Animation for empty state */}
      {!hasSearched && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            <Pill className="h-16 w-16 text-primary/60 mb-4" />
          </motion.div>
          <h3 className="text-lg font-medium mb-2">Search for Medications</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Enter a medication name to find details from the FDA database. You can search
            by brand names, generic names, or active ingredients.
          </p>
        </motion.div>
      )}

      {/* Search results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Searching FDA database...</p>
          </div>
        ) : hasSearched && searchResults.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-2" />
            <h3 className="font-medium text-lg mb-1">No medications found</h3>
            <p className="text-muted-foreground">Try a different search term or check the spelling</p>
            
            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleRetry} 
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
            
            <div className="mt-4 p-4 border rounded-lg bg-secondary/30">
              <p className="text-sm text-muted-foreground">
                <strong>Search Tips:</strong>
              </p>
              <ul className="text-sm text-muted-foreground text-left list-disc pl-5 mt-2">
                <li>Try using different spellings (example: "acetaminophen" instead of "paracetamol")</li>
                <li>Search by active ingredient (example: "ibuprofen" instead of a brand name)</li>
                <li>Try searching by common brand names (example: "Tylenol" instead of "paracetamol")</li>
                <li>Use both generic and brand names for best results</li>
              </ul>
            </div>
          </motion.div>
        ) : (
          searchResults.map((result, index) => (
            <MedicineSearchResult 
              key={index} 
              drug={result} 
              onAddClick={() => handleAddMedication(result)}
            />
          ))
        )}
      </div>

      {/* Disclaimer */}
      {searchResults.length > 0 && (
        <div className="mt-6 p-4 border rounded-lg bg-secondary/50 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              Data provided by the U.S. National Library of Medicine RxNorm database. This information is for reference only and should not replace 
              professional medical advice. Always consult with a healthcare provider before making decisions 
              about your medication.
            </p>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default MedicineSearch;
