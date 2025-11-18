import axios, { AxiosInstance } from 'axios';

export interface RxNormDrug {
  rxcui: string;
  name: string;
  synonym?: string;
  tty: string;
  language?: string;
  suppress?: string;
  umlscui?: string;
}

export interface RxNormConcept {
  rxcui: string;
  name: string;
  tty: string;
  language: string;
  suppress: string;
  umlscui: string;
}

export interface RxNormInteraction {
  rxcui1: string;
  rxcui2: string;
  interaction: string;
  severity: string;
  description: string;
}

export interface RxNormProperties {
  rxcui: string;
  name: string;
  synonym: string[];
  tty: string;
  language: string;
  suppress: string;
  umlscui: string;
  ndc: string[];
  psn: string[];
  rxnormMDR: string[];
}

export interface DosageForm {
  rxcui: string;
  name: string;
  dose_form_group: string;
  dose_form_route: string[];
}

export interface MedicationInteraction {
  medication1: string;
  medication2: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  description: string;
  clinical_implications: string[];
  management: string;
}

export interface MedicationInfo {
  rxcui: string;
  name: string;
  synonyms: string[];
  ndc_codes: string[];
  dosage_forms: string[];
  routes: string[];
  strength?: string;
  drug_class: string[];
  contraindications: string[];
  warnings: string[];
  precautions: string[];
  adverse_reactions: string[];
  interactions: MedicationInteraction[];
}

class RxNormService {
  private baseURL: string = 'https://rxnav.nlm.nih.gov/REST';
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'User-Agent': 'Medical-App/1.0'
      }
    });
  }

  private getCacheKey(method: string, ...args: any[]): string {
    return `${method}:${args.join(':')}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async searchDrugs(query: string, limit: number = 10): Promise<RxNormDrug[]> {
    const cacheKey = this.getCacheKey('search', query, limit);
    const cached = this.getFromCache<RxNormDrug[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get('/approximateTerm', {
        params: {
          term: query,
          maxEntries: limit
        }
      });

      const drugs: RxNormDrug[] = response.data.approximateGroup?.candidate || [];

      this.setCache(cacheKey, drugs);
      return drugs;
    } catch (error: any) {
      console.error('RxNorm search error:', error.message);
      return [];
    }
  }

  async getRxcuiByName(drugName: string): Promise<string | null> {
    const cacheKey = this.getCacheKey('rxcui', drugName);
    const cached = this.getFromCache<string>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get('/rxnorm', {
        params: {
          idtype: 'String',
          id: drugName
        }
      });

      const rxcui = response.data.idGroup?.rxnormId?.[0] || null;

      this.setCache(cacheKey, rxcui);
      return rxcui;
    } catch (error: any) {
      console.error('RxNorm getRxcui error:', error.message);
      return null;
    }
  }

  async getDrugProperties(rxcui: string): Promise<RxNormProperties | null> {
    const cacheKey = this.getCacheKey('properties', rxcui);
    const cached = this.getFromCache<RxNormProperties>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get('/rxcui/' + rxcui + '/allProperties.json');

      const properties: RxNormProperties = {
        rxcui,
        name: '',
        synonym: [],
        tty: '',
        language: '',
        suppress: '',
        umlscui: '',
        ndc: [],
        psn: [],
        rxnormMDR: []
      };

      if (response.data.propConceptGroup?.propConcept) {
        const concepts = Array.isArray(response.data.propConceptGroup.propConcept)
          ? response.data.propConceptGroup.propConcept
          : [response.data.propConceptGroup.propConcept];

        concepts.forEach((concept: any) => {
          switch (concept.propName) {
            case 'name':
              properties.name = concept.propValue;
              break;
            case 'synonym':
              properties.synonym.push(concept.propValue);
              break;
            case 'tty':
              properties.tty = concept.propValue;
              break;
            case 'language':
              properties.language = concept.propValue;
              break;
            case 'ndc':
              properties.ndc.push(concept.propValue);
              break;
            case 'psn':
              properties.psn.push(concept.propValue);
              break;
            case 'rxnormMDR':
              properties.rxnormMDR.push(concept.propValue);
              break;
          }
        });
      }

      this.setCache(cacheKey, properties);
      return properties;
    } catch (error: any) {
      console.error('RxNorm getProperties error:', error.message);
      return null;
    }
  }

  async getDrugInteractions(rxcui: string): Promise<RxNormInteraction[]> {
    const cacheKey = this.getCacheKey('interactions', rxcui);
    const cached = this.getFromCache<RxNormInteraction[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get('/interaction', {
        params: {
          rxcui: rxcui,
          sources: 'DrugBank'
        }
      });

      const interactions: RxNormInteraction[] = [];

      if (response.data.interactionTypeGroup) {
        const interactionTypes = Array.isArray(response.data.interactionTypeGroup)
          ? response.data.interactionTypeGroup
          : [response.data.interactionTypeGroup];

        interactionTypes.forEach((typeGroup: any) => {
          if (typeGroup.interactionConceptPair) {
            const pairs = Array.isArray(typeGroup.interactionConceptPair)
              ? typeGroup.interactionConceptPair
              : [typeGroup.interactionConceptPair];

            pairs.forEach((pair: any) => {
              if (pair.interactionConcept && pair.interactionConcept.length >= 2) {
                const concept1 = pair.interactionConcept[0];
                const concept2 = pair.interactionConcept[1];

                interactions.push({
                  rxcui1: concept1.minConceptItem?.rxcui || rxcui,
                  rxcui2: concept2.minConceptItem?.rxcui || '',
                  interaction: pair.interactionConceptSource?.[0]?.interactionMechanism || 'Unknown',
                  severity: 'MODERATE', // RxNorm doesn't provide severity, default to moderate
                  description: pair.interactionConceptSource?.[0]?.comment || 'No description available'
                });
              }
            });
          }
        });
      }

      this.setCache(cacheKey, interactions);
      return interactions;
    } catch (error: any) {
      console.error('RxNorm getInteractions error:', error.message);
      return [];
    }
  }

  async getMedicationInfo(drugName: string): Promise<MedicationInfo | null> {
    const rxcui = await this.getRxcuiByName(drugName);
    if (!rxcui) return null;

    const properties = await this.getDrugProperties(rxcui);
    if (!properties) return null;

    const interactions = await this.getDrugInteractions(rxcui);
    const dosageForms = await this.getDosageForms(rxcui);

    // Transform RxNorm data to MedicationInfo format
    const medicationInfo: MedicationInfo = {
      rxcui,
      name: properties.name,
      synonyms: properties.synonym,
      ndc_codes: properties.ndc,
      dosage_forms: dosageForms.map(df => df.name),
      routes: dosageForms.flatMap(df => df.dose_form_route),
      strength: this.extractStrength(properties),
      drug_class: this.inferDrugClass(properties),
      contraindications: [], // RxNorm doesn't provide this directly
      warnings: [], // RxNorm doesn't provide this directly
      precautions: [], // RxNorm doesn't provide this directly
      adverse_reactions: [], // RxNorm doesn't provide this directly
      interactions: interactions.map(interaction => ({
        medication1: properties.name,
        medication2: interaction.rxcui2, // Would need lookup for actual name
        severity: interaction.severity as any,
        description: interaction.description,
        clinical_implications: [],
        management: 'Consult healthcare provider'
      }))
    };

    return medicationInfo;
  }

  async getDosageForms(rxcui: string): Promise<DosageForm[]> {
    const cacheKey = this.getCacheKey('dosageForms', rxcui);
    const cached = this.getFromCache<DosageForm[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get('/rxcui/' + rxcui + '/allrelated.json');

      const dosageForms: DosageForm[] = [];

      if (response.data.allRelatedGroup?.conceptGroup) {
        const groups = Array.isArray(response.data.allRelatedGroup.conceptGroup)
          ? response.data.allRelatedGroup.conceptGroup
          : [response.data.allRelatedGroup.conceptGroup];

        groups.forEach((group: any) => {
          if (group.tty === 'DF' && group.conceptProperties) {
            const concepts = Array.isArray(group.conceptProperties)
              ? group.conceptProperties
              : [group.conceptProperties];

            concepts.forEach((concept: any) => {
              dosageForms.push({
                rxcui: concept.rxcui,
                name: concept.name || '',
                dose_form_group: concept.doseFormGroup || '',
                dose_form_route: concept.doseFormRoute ? concept.doseFormRoute.split(',') : []
              });
            });
          }
        });
      }

      this.setCache(cacheKey, dosageForms);
      return dosageForms;
    } catch (error: any) {
      console.error('RxNorm getDosageForms error:', error.message);
      return [];
    }
  }

  async getRelatedDrugs(rxcui: string, relationshipTypes: string[] = ['tradename', 'generic']): Promise<RxNormDrug[]> {
    const cacheKey = this.getCacheKey('related', rxcui, relationshipTypes.join(','));
    const cached = this.getFromCache<RxNormDrug[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get('/rxcui/' + rxcui + '/related.json');

      const relatedDrugs: RxNormDrug[] = [];

      if (response.data.relatedGroup?.conceptGroup) {
        const groups = Array.isArray(response.data.relatedGroup.conceptGroup)
          ? response.data.relatedGroup.conceptGroup
          : [response.data.relatedGroup.conceptGroup];

        groups.forEach((group: any) => {
          if (relationshipTypes.includes(group.tty) && group.conceptProperties) {
            const concepts = Array.isArray(group.conceptProperties)
              ? group.conceptProperties
              : [group.conceptProperties];

            concepts.forEach((concept: any) => {
              relatedDrugs.push({
                rxcui: concept.rxcui,
                name: concept.name || '',
                tty: group.tty,
                language: concept.language || '',
                suppress: concept.suppress || '',
                umlscui: concept.umlscui || ''
              });
            });
          }
        });
      }

      this.setCache(cacheKey, relatedDrugs);
      return relatedDrugs;
    } catch (error: any) {
      console.error('RxNorm getRelatedDrugs error:', error.message);
      return [];
    }
  }

  async checkDrugInteraction(drug1: string, drug2: string): Promise<boolean> {
    const rxcui1 = await this.getRxcuiByName(drug1);
    const rxcui2 = await this.getRxcuiByName(drug2);

    if (!rxcui1 || !rxcui2) return false;

    const interactions = await this.getDrugInteractions(rxcui1);
    return interactions.some(interaction => interaction.rxcui2 === rxcui2);
  }

  async getCommonAlternatives(drugName: string): Promise<RxNormDrug[]> {
    const rxcui = await this.getRxcuiByName(drugName);
    if (!rxcui) return [];

    // Get generic equivalents and therapeutic equivalents
    const [generics, therapeutics] = await Promise.all([
      this.getRelatedDrugs(rxcui, ['generic', 'bn']),
      this.getRelatedDrugs(rxcui, ['te'])
    ]);

    return [...generics, ...therapeutics];
  }

  private extractStrength(properties: RxNormProperties): string | undefined {
    // Try to extract strength from name or PSN
    const strengthPattern = /(\d+(?:\.\d+)?)\s*(mg|ml|g|mcg|%)/i;

    // Check in name first
    const nameMatch = properties.name.match(strengthPattern);
    if (nameMatch) return nameMatch[0];

    // Check in PSN (Prescribable Name)
    for (const psn of properties.psn) {
      const psnMatch = psn.match(strengthPattern);
      if (psnMatch) return psnMatch[0];
    }

    return undefined;
  }

  private inferDrugClass(properties: RxNormProperties): string[] {
    // Basic drug class inference based on name patterns
    const classes: string[] = [];
    const name = properties.name.toLowerCase();

    if (name.includes('statin') || name.includes('vastatin')) {
      classes.push('Statin', 'Lipid-lowering agent');
    } else if (name.includes('lisinopril') || name.includes('pril')) {
      classes.push('ACE Inhibitor', 'Antihypertensive');
    } else if (name.includes('metformin')) {
      classes.push('Biguanide', 'Antidiabetic');
    } else if (name.includes('metoprolol') || name.includes('olol')) {
      classes.push('Beta Blocker', 'Antihypertensive');
    } else if (name.includes('atorvastatin')) {
      classes.push('Statin', 'Lipid-lowering agent');
    }

    return classes.length > 0 ? classes : ['Unknown'];
  }

  // Get comprehensive medication information with fallback
  async getMedicationInfoFallback(drugName: string): Promise<Partial<MedicationInfo>> {
    try {
      // Try to get comprehensive info from RxNorm
      const rxNormInfo = await this.getMedicationInfo(drugName);
      if (rxNormInfo) {
        return rxNormInfo;
      }
    } catch (error) {
      console.warn('RxNorm lookup failed, using fallback:', error);
    }

    // Fallback to basic search results
    const searchResults = await this.searchDrugs(drugName, 1);
    if (searchResults.length > 0) {
      const drug = searchResults[0];
      return {
        rxcui: drug.rxcui,
        name: drug.name,
        synonyms: [drug.synonym || drug.name],
        ndc_codes: [],
        dosage_forms: ['Tablet', 'Capsule', 'Liquid'],
        routes: ['Oral'],
        drug_class: ['Unknown'],
        interactions: []
      };
    }

    // Final fallback
    return {
      name: drugName,
      synonyms: [drugName],
      dosage_forms: ['Tablet'],
      routes: ['Oral'],
      drug_class: ['Unknown'],
      interactions: []
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default new RxNormService();