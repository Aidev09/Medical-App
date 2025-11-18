import axios from 'axios';

export interface FDADrugInfo {
  id: string;
  name: string;
  description?: string;
  dosage?: string;
  manufacturer?: string;
  warnings?: string[];
  sideEffects?: string[];
  interactions?: string[];
  approvedDate?: string;
}

class FDAService {
  private baseUrl = 'https://api.fda.gov/drug/label.json';
  private cache: Map<string, FDADrugInfo> = new Map();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

  async getDrugInfo(drugName: string): Promise<FDADrugInfo | null> {
    const cacheKey = drugName.toLowerCase().trim();

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.approvedDate! < this.cacheExpiry) {
      return cached;
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          search: `openfda.product_name:"${drugName}"`,
          limit: 1
        },
        timeout: 10000 // 10 seconds
      });

      if (response.data.results && response.data.results.length > 0) {
        const drugData = response.data.results[0];
        const drugInfo: FDADrugInfo = {
          id: drugData.id,
          name: drugData.openfda?.product_name?.[0] || drugName,
          description: drugData.description?.[0] || '',
          dosage: this.extractDosage(drugData),
          manufacturer: drugData.openfda?.manufacturer_name?.[0] || '',
          warnings: this.extractWarnings(drugData),
          sideEffects: this.extractSideEffects(drugData),
          interactions: this.extractInteractions(drugData),
          approvedDate: new Date().toISOString()
        };

        // Cache the result
        this.cache.set(cacheKey, drugInfo);
        return drugInfo;
      }

      return null;
    } catch (error: any) {
      console.error('FDA API error:', error.message);
      // Return null instead of throwing to allow fallback
      return null;
    }
  }

  async searchDrugs(query: string, limit: number = 10): Promise<FDADrugInfo[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          search: `openfda.product_name:"${query}"`,
          limit: limit
        },
        timeout: 15000 // 15 seconds
      });

      if (response.data.results) {
        return response.data.results.map((drugData: any) => ({
          id: drugData.id,
          name: drugData.openfda?.product_name?.[0] || 'Unknown',
          description: drugData.description?.[0] || '',
          dosage: this.extractDosage(drugData),
          manufacturer: drugData.openfda?.manufacturer_name?.[0] || '',
          approvedDate: new Date().toISOString()
        }));
      }

      return [];
    } catch (error: any) {
      console.error('FDA API search error:', error.message);
      return [];
    }
  }

  async getDrugInteractions(drugName: string): Promise<string[]> {
    // This would typically require a more specialized API
    // For now, return common interactions
    const commonInteractions: { [key: string]: string[] } = {
      'warfarin': ['aspirin', 'ibuprofen', 'alcohol', 'antibiotics'],
      'lisinopril': ['potassium supplements', 'nsaids', 'lithium'],
      'metformin': ['iodinated contrast', 'alcohol'],
      'statins': ['grapefruit juice', 'some antibiotics']
    };

    return commonInteractions[drugName.toLowerCase()] || [];
  }

  private extractDosage(drugData: any): string {
    // Try to extract dosage information from various fields
    if (drugData.dosage_and_administration) {
      return drugData.dosage_and_administration[0]?.substring(0, 200) || '';
    }
    return '';
  }

  private extractWarnings(drugData: any): string[] {
    const warnings: string[] = [];

    if (drugData.boxed_warning) {
      drugData.boxed_warning.forEach((warning: any) => {
        if (typeof warning === 'string') {
          warnings.push(warning.substring(0, 200));
        }
      });
    }

    if (drugData.warnings_and_cautions) {
      drugData.warnings_and_cautions.forEach((warning: any) => {
        if (typeof warning === 'string') {
          warnings.push(warning.substring(0, 200));
        }
      });
    }

    return warnings.slice(0, 5); // Limit to 5 warnings
  }

  private extractSideEffects(drugData: any): string[] {
    const sideEffects: string[] = [];

    if (drugData.adverse_reactions) {
      drugData.adverse_reactions.forEach((reaction: any) => {
        if (typeof reaction === 'string') {
          sideEffects.push(reaction.substring(0, 100));
        }
      });
    }

    return sideEffects.slice(0, 5); // Limit to 5 side effects
  }

  private extractInteractions(drugData: any): string[] {
    // This would require more complex parsing of the drug data
    // For now, return empty array
    return [];
  }

  // Clear cache method
  clearCache(): void {
    this.cache.clear();
  }
}

export default new FDAService();