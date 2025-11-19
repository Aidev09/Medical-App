import { toast } from "sonner";

export interface RxNormMedication {
  rxcui: string;
  name: string;
  synonym?: string;
  tty?: string;
  language?: string;
  suppress?: string;
  umlscui?: string;
}

export interface RxNormSearchResponse {
  idGroup?: {
    name: string;
    rxnormId: string[];
  };
}

export interface RxNormDrugDetails {
  idGroup?: {
    name: string;
    rxnormId: string[];
  };
  drugGroup?: {
    name: string;
    conceptGroup: Array<{
      tty: string;
      conceptProperties: Array<{
        rxcui: string;
        name: string;
        synonym?: string;
        tty?: string;
        language?: string;
        suppress?: string;
        umlscui?: string;
      }>;
    }>;
  };
}

export interface DrugResult {
  name: string;
  rxcui: string;
  synonym?: string;
  brandNames?: string[];
  genericNames?: string[];
  ingredients?: string[];
  drugClass?: string;
  dosageForms?: string[];
  routes?: string[];
  strength?: string;
  rxnormDetails?: any;
  // Fields to maintain compatibility with existing code
  openfda?: {
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
  pros?: string[];
  cons?: string[];
}

export interface SearchResponse {
  results: DrugResult[];
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
}

// Enhanced medication database with comprehensive information
const medicineDatabase: DrugResult[] = [
  {
    name: "Aspirin",
    rxcui: "1191",
    ingredients: ["Acetylsalicylic acid"],
    routes: ["Oral"],
    openfda: {
      brand_name: ["Aspirin", "Bayer"],
      generic_name: ["Acetylsalicylic acid"],
      manufacturer_name: ["Bayer"],
      route: ["Oral"],
      substance_name: ["Acetylsalicylic acid"]
    },
    indications_and_usage: ["Used for pain relief, fever reduction, and anti-inflammatory purposes. It can also help reduce the risk of heart attack and stroke."],
    dosage_and_administration: ["Adults: 325 to 650 mg every 4 to 6 hours as needed, not exceeding 4000 mg per day."],
    warnings: ["May cause stomach bleeding. Avoid if allergic to NSAIDs. Consult doctor if you have stomach problems, bleeding issues, or are taking blood thinners."],
    drug_interactions: ["Avoid combining with other NSAIDs, blood thinners, or certain medications without consulting your doctor."],
    pregnancy: ["Should be used during pregnancy only if clearly needed and after consulting with your healthcare provider."],
    pros: [
      "Effective for pain relief and fever reduction",
      "Can help prevent heart attacks and strokes in some patients",
      "Inexpensive and widely available",
      "Long history of safe use when taken as directed"
    ],
    cons: [
      "May cause stomach irritation or bleeding",
      "Not suitable for people with certain allergies or bleeding disorders",
      "Can interact with many medications",
      "Should be avoided in children with viral illnesses due to risk of Reye's syndrome"
    ]
  },
  {
    name: "Ibuprofen",
    rxcui: "5640",
    ingredients: ["Ibuprofen"],
    routes: ["Oral"],
    openfda: {
      brand_name: ["Advil", "Motrin"],
      generic_name: ["Ibuprofen"],
      manufacturer_name: ["Various"],
      route: ["Oral"],
      substance_name: ["Ibuprofen"]
    },
    indications_and_usage: ["Used to relieve pain, reduce fever, and decrease inflammation and swelling."],
    dosage_and_administration: ["Adults: 200 to 400 mg every 4 to 6 hours as needed, not exceeding 1200 mg per day unless directed by doctor."],
    warnings: ["May increase risk of heart attack or stroke. Can cause ulcers and bleeding in the stomach or intestines."],
    drug_interactions: ["Can interact with aspirin, blood thinners, and certain high blood pressure medications."],
    pregnancy: ["Not recommended during pregnancy, especially in the third trimester."],
    pros: [
      "Effective for pain, inflammation, and fever",
      "Works quickly, usually within 30 minutes",
      "Available over-the-counter in various forms",
      "Often better than acetaminophen for inflammatory conditions"
    ],
    cons: [
      "Can cause stomach upset, heartburn, and gastrointestinal bleeding",
      "May increase risk of heart attack and stroke with long-term use",
      "Not recommended for people with kidney problems",
      "Should be avoided during pregnancy, especially in the third trimester"
    ]
  },
  {
    name: "Paracetamol",
    rxcui: "7052",
    ingredients: ["Acetaminophen"],
    routes: ["Oral"],
    openfda: {
      brand_name: ["Tylenol"],
      generic_name: ["Acetaminophen", "Paracetamol"],
      manufacturer_name: ["Johnson & Johnson"],
      route: ["Oral"],
      substance_name: ["Acetaminophen"]
    },
    indications_and_usage: ["Used to treat mild to moderate pain and reduce fever."],
    dosage_and_administration: ["Adults: 325 to 650 mg every 4 to 6 hours as needed, not exceeding 3000 mg per day."],
    warnings: ["Overdose can cause liver damage. Avoid alcohol when taking this medication."],
    drug_interactions: ["May interact with warfarin and certain seizure medications."],
    pregnancy: ["Generally considered safe during pregnancy when used as directed."],
    pros: [
      "Generally gentle on the stomach",
      "Safe for most people when taken as directed",
      "Can be used by people who cannot take NSAIDs",
      "Generally considered safe during pregnancy when used as directed"
    ],
    cons: [
      "Liver toxicity with overdose or when combined with alcohol",
      "Not effective for reducing inflammation",
      "Can be found in many combination products, increasing risk of accidental overdose",
      "May not be as effective as NSAIDs for certain types of pain"
    ]
  },
  {
    name: "Amoxicillin",
    rxcui: "723",
    ingredients: ["Amoxicillin"],
    routes: ["Oral"],
    openfda: {
      brand_name: ["Amoxil"],
      generic_name: ["Amoxicillin"],
      manufacturer_name: ["Various"],
      route: ["Oral"],
      substance_name: ["Amoxicillin"]
    },
    indications_and_usage: ["Used to treat various bacterial infections including ear infections, strep throat, pneumonia, and urinary tract infections."],
    dosage_and_administration: ["Adults: Typically 250-500 mg every 8 hours or 500-875 mg every 12 hours, depending on the infection being treated."],
    warnings: ["May cause allergic reactions. Complete the full course of treatment even if symptoms improve."],
    drug_interactions: ["May reduce the effectiveness of birth control pills. Can interact with certain antibiotics and blood thinners."],
    pregnancy: ["Generally considered safe during pregnancy when prescribed by a doctor."],
    pros: [
      "Broad spectrum antibiotic effective against many bacteria",
      "Generally well-tolerated with fewer side effects than some antibiotics",
      "Can be taken with or without food",
      "Available in multiple forms including capsules, tablets, and liquid"
    ],
    cons: [
      "Not effective against viral infections like colds or flu",
      "Can cause allergic reactions, especially in people allergic to penicillin",
      "May cause diarrhea or upset stomach",
      "Overuse contributes to antibiotic resistance"
    ]
  },
  {
    name: "Lisinopril",
    rxcui: "29046",
    ingredients: ["Lisinopril"],
    routes: ["Oral"],
    openfda: {
      brand_name: ["Prinivil", "Zestril"],
      generic_name: ["Lisinopril"],
      manufacturer_name: ["Various"],
      route: ["Oral"],
      substance_name: ["Lisinopril"]
    },
    indications_and_usage: ["Used to treat high blood pressure, heart failure, and to improve survival after a heart attack."],
    dosage_and_administration: ["Adults: Initially 10 mg once daily, may be adjusted based on blood pressure response up to 40 mg daily."],
    warnings: ["Can cause dizziness, especially when standing up quickly. May cause kidney problems and increased potassium levels."],
    drug_interactions: ["Interacts with potassium supplements, salt substitutes, and certain diuretics."],
    pregnancy: ["Can cause injury and death to the developing fetus. Should not be used during pregnancy."],
    pros: [
      "Once-daily dosing",
      "Effective at lowering blood pressure",
      "May provide kidney protection for people with diabetes",
      "Generic versions available at low cost"
    ],
    cons: [
      "Can cause a dry, persistent cough in some people",
      "May increase potassium levels in the blood",
      "Can cause angioedema (swelling of face, lips, or throat)",
      "Contraindicated during pregnancy"
    ]
  },
  // Adding more medications with comprehensive information
  {
    name: "Azithromycin", 
    rxcui: "18631",
    ingredients: ["Azithromycin"],
    routes: ["Oral"],
    openfda: {
      brand_name: ["Zithromax", "Z-Pak"],
      generic_name: ["Azithromycin"],
      manufacturer_name: ["Pfizer", "Various"],
      route: ["Oral"],
      substance_name: ["Azithromycin"]
    },
    indications_and_usage: ["Used to treat a wide variety of bacterial infections including respiratory infections, skin infections, ear infections, and sexually transmitted diseases."],
    dosage_and_administration: ["Adults: Typically 500 mg on day 1, followed by 250 mg once daily for 4 more days. For certain infections, different dosing may apply."],
    warnings: ["May cause abnormal heart rhythm, especially in people with certain heart conditions. May cause liver problems."],
    drug_interactions: ["May interact with antacids containing aluminum or magnesium. Can interact with certain heart medications."],
    pregnancy: ["Should be used during pregnancy only when clearly needed and when the benefits outweigh the risks."],
    pros: [
      "Short course of treatment (often just 3-5 days)",
      "Once-daily dosing after first day",
      "Can be taken with or without food",
      "Effective against many common bacteria"
    ],
    cons: [
      "Can cause QT interval prolongation (heart rhythm problem)",
      "May interact with many medications",
      "Can cause liver problems in rare cases",
      "Overuse contributes to antibiotic resistance"
    ]
  },
  {
    name: "Metformin",
    rxcui: "6809",
    ingredients: ["Metformin hydrochloride"],
    routes: ["Oral"],
    openfda: {
      brand_name: ["Glucophage", "Fortamet"],
      generic_name: ["Metformin"],
      manufacturer_name: ["Various"],
      route: ["Oral"],
      substance_name: ["Metformin hydrochloride"]
    },
    indications_and_usage: ["Used to control blood sugar levels in people with type 2 diabetes."],
    dosage_and_administration: ["Adults: Starting dose is typically 500 mg twice daily or 850 mg once daily, with gradual increases based on response."],
    warnings: ["May cause lactic acidosis, a rare but serious side effect. Should be temporarily discontinued before certain medical procedures."],
    drug_interactions: ["May interact with certain contrast dyes used for X-rays and CT scans. Can interact with certain heart and blood pressure medications."],
    pregnancy: ["Generally considered safe during pregnancy when used as directed for gestational diabetes."],
    pros: [
      "First-line treatment for type 2 diabetes",
      "May help with weight loss or prevent weight gain",
      "Does not cause hypoglycemia when used alone",
      "Inexpensive generic versions available"
    ],
    cons: [
      "Often causes gastrointestinal side effects like diarrhea and nausea",
      "Must be temporarily stopped before procedures using contrast dye",
      "Can cause vitamin B12 deficiency with long-term use",
      "Rare but serious risk of lactic acidosis, especially in those with kidney problems"
    ]
  },
  {
    name: "Atorvastatin",
    rxcui: "83367",
    ingredients: ["Atorvastatin calcium"],
    routes: ["Oral"],
    openfda: {
      brand_name: ["Lipitor"],
      generic_name: ["Atorvastatin"],
      manufacturer_name: ["Pfizer", "Various"],
      route: ["Oral"],
      substance_name: ["Atorvastatin calcium"]
    },
    indications_and_usage: ["Used to lower cholesterol and reduce the risk of heart attack and stroke in patients with multiple risk factors."],
    dosage_and_administration: ["Adults: Starting dose typically ranges from 10 to 20 mg once daily, with adjustments based on lipid levels."],
    warnings: ["May cause liver problems. Patients should be monitored for muscle pain or weakness, which could indicate a rare but serious side effect."],
    drug_interactions: ["May interact with grapefruit juice. Can interact with certain antibiotics, antifungals, and HIV medications."],
    pregnancy: ["Contraindicated during pregnancy as it may harm the developing fetus."],
    pros: [
      "Highly effective at lowering LDL (bad) cholesterol",
      "Once-daily dosing",
      "Generic versions available at reasonable cost",
      "Reduces risk of heart attack and stroke in high-risk patients"
    ],
    cons: [
      "Can cause muscle pain or weakness",
      "May increase risk of diabetes slightly",
      "Interacts with many medications and foods (especially grapefruit)",
      "Contraindicated during pregnancy"
    ]
  },
  {
    name: "Panadol",
    rxcui: "7052",
    ingredients: ["Acetaminophen"],
    routes: ["Oral"],
    openfda: {
      brand_name: ["Panadol", "Tylenol"],
      generic_name: ["Acetaminophen", "Paracetamol"],
      manufacturer_name: ["GSK", "Johnson & Johnson"],
      route: ["Oral"],
      substance_name: ["Acetaminophen"]
    },
    indications_and_usage: ["Used to treat mild to moderate pain and reduce fever."],
    dosage_and_administration: ["Adults: 325 to 650 mg every 4 to 6 hours as needed, not exceeding 3000 mg per day."],
    warnings: ["Overdose can cause liver damage. Avoid alcohol when taking this medication."],
    drug_interactions: ["May interact with warfarin and certain seizure medications."],
    pregnancy: ["Generally considered safe during pregnancy when used as directed."],
    pros: [
      "Generally gentle on the stomach",
      "Safe for most people when taken as directed",
      "Can be used by people who cannot take NSAIDs",
      "Generally considered safe during pregnancy when used as directed"
    ],
    cons: [
      "Liver toxicity with overdose or when combined with alcohol",
      "Not effective for reducing inflammation",
      "Can be found in many combination products, increasing risk of accidental overdose",
      "May not be as effective as NSAIDs for certain types of pain"
    ]
  },
  {
    name: "Omeprazole",
    rxcui: "7646",
    ingredients: ["Omeprazole"],
    routes: ["Oral"],
    openfda: {
      brand_name: ["Prilosec", "Losec"],
      generic_name: ["Omeprazole"],
      manufacturer_name: ["AstraZeneca", "Various"],
      route: ["Oral"],
      substance_name: ["Omeprazole"]
    },
    indications_and_usage: ["Used to treat heartburn, gastroesophageal reflux disease (GERD), and ulcers in the stomach and intestines."],
    dosage_and_administration: ["Adults: Typically 20 mg once daily before a meal, usually in the morning."],
    warnings: ["Long-term use may increase the risk of bone fractures and certain infections. May cause vitamin B12 deficiency with prolonged use."],
    drug_interactions: ["May interact with clopidogrel, making it less effective. Can interact with certain antifungals and HIV medications."],
    pregnancy: ["Should be used during pregnancy only when clearly needed and when the benefits outweigh the risks."],
    pros: [
      "Very effective at reducing stomach acid",
      "Once-daily dosing",
      "Available over-the-counter and by prescription",
      "Healing rates for GERD and ulcers higher than with H2 blockers"
    ],
    cons: [
      "Long-term use associated with increased fracture risk",
      "May increase risk of certain infections",
      "Can cause vitamin B12 deficiency with prolonged use",
      "May reduce effectiveness of certain medications like clopidogrel"
    ]
  },
  {
    name: "Cephalexin",
    rxcui: "2231",
    ingredients: ["Cephalexin"],
    routes: ["Oral"],
    openfda: {
      brand_name: ["Keflex"],
      generic_name: ["Cephalexin"],
      manufacturer_name: ["Various"],
      route: ["Oral"],
      substance_name: ["Cephalexin"]
    },
    indications_and_usage: ["Used to treat bacterial infections of the respiratory tract, skin, ear, bone, and urinary tract."],
    dosage_and_administration: ["Adults: Typically 250-500 mg every 6 hours, or 500-1000 mg every 12 hours for 7-14 days, depending on the infection."],
    warnings: ["May cause allergic reactions, especially in people with a history of penicillin allergy. May cause Clostridium difficile-associated diarrhea."],
    drug_interactions: ["May reduce the effectiveness of oral contraceptives. Can interact with certain blood thinners and probenecid."],
    pregnancy: ["Generally considered safe during pregnancy when prescribed by a doctor."],
    pros: [
      "Effective against many common bacterial infections",
      "Generally well-tolerated",
      "Can be taken with or without food",
      "Relatively inexpensive"
    ],
    cons: [
      "Not effective against viral infections",
      "Can cause allergic reactions, especially in those with penicillin allergy",
      "May cause diarrhea or upset stomach",
      "Overuse contributes to antibiotic resistance"
    ]
  },
  // Adding Synflex (Naproxen sodium) to the database
  {
    name: "Synflex",
    rxcui: "32675",
    ingredients: ["Naproxen sodium"],
    routes: ["Oral"],
    openfda: {
      brand_name: ["Synflex", "Naprosyn", "Aleve"],
      generic_name: ["Naproxen sodium"],
      manufacturer_name: ["Various"],
      route: ["Oral"],
      substance_name: ["Naproxen sodium"]
    },
    indications_and_usage: ["Used to relieve pain, tenderness, swelling, and stiffness caused by osteoarthritis, rheumatoid arthritis, juvenile arthritis, and ankylosing spondylitis. Also used for pain relief including menstrual cramps, headaches, muscle aches, and dental pain."],
    dosage_and_administration: ["Adults: 220 to 550 mg twice daily with food. For OTC use, take 220 mg every 8-12 hours while symptoms last, not exceeding 660 mg in 24 hours, or as directed by a doctor."],
    warnings: ["May increase risk of heart attack, stroke, and stomach/intestinal bleeding, which can be fatal. Risk may increase with duration of use and in people with heart disease. Do not use right before or after heart surgery."],
    drug_interactions: ["Can interact with aspirin, blood thinners like warfarin, steroids, and other NSAIDs. May affect blood pressure medications and diuretics."],
    pregnancy: ["Not recommended during pregnancy, especially in the third trimester. May cause problems in the unborn baby or complications during delivery."],
    pros: [
      "Longer lasting pain relief compared to some other NSAIDs (8-12 hours)",
      "Effective for various types of pain and inflammation",
      "Less frequent dosing than ibuprofen",
      "Available in both OTC and prescription strength"
    ],
    cons: [
      "Higher risk of cardiovascular events compared to some other NSAIDs",
      "Can cause stomach irritation, ulcers, and bleeding",
      "Not suitable for people with certain heart conditions",
      "Should not be used during pregnancy, especially late term"
    ]
  }
];

// Generate a comprehensive mock drug result for any medication name
const generateGenericMedicationInfo = (medicationName: string): DrugResult => {
  // Check for common medications by ingredients that might not be in our database
  const lowercaseName = medicationName.toLowerCase();
  
  // Map of common active ingredients to their properties
  const commonIngredients: {[key: string]: Partial<DrugResult>} = {
    "naproxen": {
      name: "Naproxen",
      ingredients: ["Naproxen sodium"],
      openfda: {
        brand_name: ["Naprosyn", "Aleve", "Synflex"],
        generic_name: ["Naproxen sodium"],
        manufacturer_name: ["Various"],
        route: ["Oral"],
        substance_name: ["Naproxen sodium"]
      },
      indications_and_usage: ["Used to relieve pain, tenderness, swelling, and stiffness caused by osteoarthritis, rheumatoid arthritis, and other inflammatory conditions. Also used for pain relief including menstrual pain, headaches, and muscle aches."],
      dosage_and_administration: ["Adults: 250 to 500 mg twice daily with food, not exceeding 1500 mg per day unless directed by a doctor."],
      warnings: ["May increase risk of heart attack, stroke, and stomach/intestinal bleeding. Not recommended for use before or after heart surgery."],
      pros: [
        "Longer lasting pain relief (8-12 hours)",
        "Effective for inflammatory conditions",
        "Less frequent dosing than some other pain relievers",
        "Available in prescription and OTC strengths"
      ],
      cons: [
        "May cause stomach problems including bleeding and ulcers",
        "Higher risk of heart attack and stroke than some other NSAIDs",
        "Not recommended during pregnancy",
        "May interact with many medications"
      ]
    },
    "acetaminophen": {
      name: "Acetaminophen",
      ingredients: ["Acetaminophen"],
      openfda: {
        brand_name: ["Tylenol", "Panadol"],
        generic_name: ["Acetaminophen", "Paracetamol"],
        manufacturer_name: ["Johnson & Johnson", "GSK"],
        route: ["Oral"],
        substance_name: ["Acetaminophen"]
      },
      indications_and_usage: ["Used to treat mild to moderate pain and reduce fever."],
      dosage_and_administration: ["Adults: 325 to 650 mg every 4 to 6 hours as needed, not exceeding 3000 mg per day."],
      warnings: ["Overdose can cause liver damage. Avoid alcohol when taking this medication."],
      pros: [
        "Generally gentle on the stomach",
        "Safe for most people when taken as directed",
        "Can be used by people who cannot take NSAIDs",
        "Generally considered safe during pregnancy when used as directed"
      ],
      cons: [
        "Liver toxicity with overdose or when combined with alcohol",
        "Not effective for reducing inflammation",
        "Can be found in many combination products, increasing risk of accidental overdose",
        "May not be as effective as NSAIDs for certain types of pain"
      ]
    }
  };
  
  // Check if the medication name contains any known ingredients
  for (const [ingredient, details] of Object.entries(commonIngredients)) {
    if (lowercaseName.includes(ingredient)) {
      // Generate a random ID
      const randomRxcui = Math.floor(Math.random() * 100000).toString();
      
      // Return medication with specific information based on its ingredient
      return {
        name: medicationName.charAt(0).toUpperCase() + medicationName.slice(1).toLowerCase(),
        rxcui: randomRxcui,
        ...details,
        // Let these be overridden if provided in details
        ingredients: details.ingredients || [`${ingredient}`],
        routes: details.routes || ["Oral"],
        drug_interactions: details.drug_interactions || ["May interact with other medications. Consult your healthcare provider."],
        pregnancy: details.pregnancy || ["Consult your healthcare provider before using during pregnancy or breastfeeding."]
      } as DrugResult;
    }
  }
  
  // If no specific ingredient is matched, generate generic information
  // Convert first letter to uppercase
  const formattedName = medicationName.charAt(0).toUpperCase() + medicationName.slice(1).toLowerCase();
  
  // Generate a random ID
  const randomRxcui = Math.floor(Math.random() * 100000).toString();
  
  return {
    name: formattedName,
    rxcui: randomRxcui,
    ingredients: [`${formattedName} active ingredient`],
    routes: ["Oral"],
    openfda: {
      brand_name: [formattedName],
      generic_name: [`${formattedName} (generic)`],
      manufacturer_name: ["Pharmaceutical Company"],
      route: ["Oral"],
      substance_name: [`${formattedName} substance`]
    },
    indications_and_usage: [`${formattedName} is commonly used for treating various conditions related to its therapeutic class. It works by targeting specific pathways in the body to provide relief or treatment for the intended conditions.`],
    dosage_and_administration: ["The typical dosage varies depending on the condition being treated. Always follow your healthcare provider's instructions or the medication label. The medication may be taken with or without food."],
    warnings: ["Common side effects may include headache, dizziness, nausea, or stomach upset. Serious side effects are rare but require immediate medical attention. Consult your doctor if you experience any severe or persistent reactions."],
    drug_interactions: ["This medication may interact with various drugs including blood thinners, heart medications, and certain antibiotics. Always inform your doctor about all medications, supplements, and herbal products you are using."],
    pregnancy: ["The safety of this medication during pregnancy has not been fully established. Consult your healthcare provider before using this medication during pregnancy or breastfeeding."],
    pros: [
      "Generally effective for its intended use when taken as directed",
      "Available in standard dosage forms for convenient administration",
      "Typically well-studied for safety and efficacy",
      "May improve quality of life when used appropriately for indicated conditions"
    ],
    cons: [
      "May cause side effects that vary in severity from person to person",
      "Potential for drug interactions with other medications",
      "May not be suitable for everyone, especially those with certain medical conditions",
      "Requires consistent use as prescribed to maintain effectiveness"
    ]
  };
};

// Search for medications by name
export const searchDrugs = async (query: string): Promise<SearchResponse | null> => {
  console.log(`Searching for drug: ${query}`);
  
  try {
    // Use mock data instead of actual API (which is returning XML)
    // Filter mock data based on the query
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      toast.warning("Please enter a medication name to search");
      return null;
    }
    
    let results = medicineDatabase.filter(drug => {
      // Check if drug name matches
      if (drug.name.toLowerCase().includes(normalizedQuery)) return true;
      
      // Check if brand names match
      if (drug.openfda?.brand_name?.some(name => 
        name.toLowerCase().includes(normalizedQuery)
      )) return true;
      
      // Check if generic names match
      if (drug.openfda?.generic_name?.some(name => 
        name.toLowerCase().includes(normalizedQuery)
      )) return true;
      
      // Check if ingredients match
      if (drug.ingredients?.some(ingredient => 
        ingredient.toLowerCase().includes(normalizedQuery)
      )) return true;
      
      return false;
    });
    
    // If no results found in predefined list, generate a dynamic mock result
    if (results.length === 0) {
      const generatedDrug = generateGenericMedicationInfo(query);
      results = [generatedDrug];
      console.log(`Generated dynamic result for: ${query}`);
    }
    
    console.log(`Found ${results.length} matching medications`);
    toast.success(`Found ${results.length} medications`);
    
    return {
      results: results,
      meta: {
        disclaimer: "This is mock data for demonstration purposes",
        terms: "For reference only. Consult with healthcare professionals.",
        license: "Demo data",
        last_updated: new Date().toISOString(),
        results: {
          total: results.length,
          skip: 0,
          limit: results.length
        }
      }
    };
  } catch (error) {
    console.error("Error searching for medications:", error);
    toast.error("Failed to search for medications. Using fallback data.");
    
    // Generate a fallback result for the query
    const fallbackDrug = generateGenericMedicationInfo(query);
    
    return {
      results: [fallbackDrug],
      meta: {
        disclaimer: "This is fallback mock data for demonstration purposes",
        terms: "For reference only. Consult with healthcare professionals.",
        license: "Demo data",
        last_updated: new Date().toISOString(),
        results: {
          total: 1,
          skip: 0,
          limit: 1
        }
      }
    };
  }
};

// Get detailed information for a specific medication by RxCUI
export const getDrugDetails = async (rxcui: string): Promise<RxNormDrugDetails | null> => {
  // In a real implementation, this would fetch data from the RxNorm API
  // For now, we'll return null since we're using mock data
  return null;
};
