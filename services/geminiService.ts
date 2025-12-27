
import { GoogleGenAI, Type } from "@google/genai";
import { Patient, ADRAnalysis, NetworkData } from "../types";

// Always use process.env.API_KEY for secure integration
export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
};

export const analyzePatientADR = async (
  patient: Patient, 
  newSymptoms: string
): Promise<ADRAnalysis> => {
  const ai = getGeminiClient();
  // Using gemini-3-pro-preview for high-complexity medical reasoning
  const model = "gemini-3-pro-preview";

  const prompt = `
    Role: Senior Clinical Pharmacologist & AI Specialist.
    Task: Perform a deep-learning based pharmacovigilance analysis.
    
    Patient Profile: ${patient.name}, ${patient.age}yo ${patient.gender}.
    Existing Conditions: ${patient.diagnosis.join(', ')}.
    Active Pharmacotherapy: ${patient.medications.map(m => `${m.name} (${m.dosage})`).join(', ')}.
    New Clinical Presentation: "${newSymptoms}"

    Instructions:
    1. Assess causality using Naranjo and WHO-UMC criteria principles.
    2. Identify specific suspect drugs.
    3. Explain the biological mechanism (e.g., CYP450 inhibition, receptor antagonism).
    4. Categorize risk: LOW, MODERATE, HIGH, CRITICAL.
    5. Provide immediate clinical follow-up questions.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          probabilityScore: { type: Type.INTEGER },
          riskLevel: { type: Type.STRING, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] },
          detectedSymptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
          suspectDrugs: { type: Type.ARRAY, items: { type: Type.STRING } },
          reasoning: { type: Type.STRING },
          recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['probabilityScore', 'riskLevel', 'detectedSymptoms', 'suspectDrugs', 'reasoning', 'recommendedActions', 'followUpQuestions']
      }
    }
  });

  return JSON.parse(response.text || "{}") as ADRAnalysis;
};

export const generateNeuralMap = async (analysis: ADRAnalysis): Promise<NetworkData> => {
  const ai = getGeminiClient();
  const model = "gemini-3-flash-preview";

  const prompt = `
    Generate a neural network mapping of drug-mechanism-symptom links.
    Drugs: ${analysis.suspectDrugs.join(', ')}
    Symptoms: ${analysis.detectedSymptoms.join(', ')}
    
    Structure:
    - Nodes: {id: string, group: number} (1: Drug, 2: Symptom, 3: Pathway)
    - Links: {source: string, target: string, value: number}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                group: { type: Type.INTEGER }
              },
              required: ['id', 'group']
            }
          },
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING },
                target: { type: Type.STRING },
                value: { type: Type.NUMBER }
              },
              required: ['source', 'target', 'value']
            }
          }
        },
        required: ['nodes', 'links']
      }
    }
  });

  return JSON.parse(response.text || "{}") as NetworkData;
};
