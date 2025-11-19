
import { toast } from "sonner";

export interface DrugResult {
  openfda: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    product_type?: string[];
    route?: string[];
    substance_name?: string[];
  };
  purpose?: string[];
  indications_and_usage?: string[];
  dosage_and_administration?: string[];
  warnings?: string[];
  active_ingredient?: string[];
  inactive_ingredient?: string[];
  warnings_and_cautions?: string[];
  drug_interactions?: string[];
  pregnancy?: string[];
}

export interface SearchResponse {
  meta: {
    disclaimer: string;
    terms: string;
    license: string;
    last_updated: string;
    results: {
      total: number;
      skip: number;
      limit: number;
    }
  };
  results: DrugResult[];
}

const API_BASE_URL = 'https://api.fda.gov/drug/label.json';

export const searchDrugs = async (query: string): Promise<SearchResponse | null> => {
  try {
    // Using a broader search approach to capture more medications
    // This searches across all text fields in the FDA database
    const searchUrl = `${API_BASE_URL}?search=(${encodeURIComponent(query)})&limit=25`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Try a backup search approach if the first one fails
        return await backupSearchMethod(query);
      }
      throw new Error(`FDA API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // If no results from primary search, try backup method
    if (data.results.length === 0) {
      return await backupSearchMethod(query);
    }
    
    return data;
  } catch (error) {
    console.error("Error searching FDA API:", error);
    // Try the backup search as a last resort
    const backupResults = await backupSearchMethod(query);
    if (backupResults) {
      return backupResults;
    }
    
    toast.error("Failed to search for medications. Please try again later.");
    return null;
  }
};

// Backup search method using a different search approach
const backupSearchMethod = async (query: string): Promise<SearchResponse | null> => {
  try {
    // Try searching by active ingredient instead
    const backupUrl = `${API_BASE_URL}?search=(_exists_:openfda.substance_name+AND+openfda.substance_name:"${encodeURIComponent(query)}")&limit=25`;
    
    const response = await fetch(backupUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        toast.error("No medications found. Try another search term.");
        return null;
      }
      throw new Error(`FDA API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Try one last approach if still no results
    if (data.results.length === 0) {
      return await lastResortSearch(query);
    }
    
    return data;
  } catch (error) {
    console.error("Error in backup search:", error);
    return await lastResortSearch(query);
  }
};

// Last resort search - very broad search
const lastResortSearch = async (query: string): Promise<SearchResponse | null> => {
  try {
    // Most permissive search possible
    const finalUrl = `${API_BASE_URL}?search=${encodeURIComponent(query)}&limit=25`;
    
    const response = await fetch(finalUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        toast.error("No medications found. Try another search term.");
        return null;
      }
      throw new Error(`FDA API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in last resort search:", error);
    toast.error("No medications found. Try using different terms.");
    return null;
  }
};

export const getDrugDetails = async (brandName: string): Promise<DrugResult | null> => {
  try {
    // More flexible search for detailed info
    const searchUrl = `${API_BASE_URL}?search=(openfda.brand_name:"${encodeURIComponent(brandName)}" OR openfda.generic_name:"${encodeURIComponent(brandName)}")&limit=1`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`FDA API error: ${response.status}`);
    }
    
    const data: SearchResponse = await response.json();
    return data.results[0] || null;
  } catch (error) {
    console.error("Error fetching drug details:", error);
    toast.error("Failed to get medication details. Please try again later.");
    return null;
  }
};
