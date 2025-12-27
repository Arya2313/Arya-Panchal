import { GoogleGenAI, Type } from "@google/genai";
import { Patient, ADRAnalysis, NetworkData } from "../types";

// Fix: Use process.env.API_KEY directly for initialization as per SDK guidelines
export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzePatientADR = async (
  patient: Patient, 
  newSymptoms: string
): Promise<ADRAnalysis> => {
  const ai = getGeminiClient();
  // Fix: Select 'gemini-3-pro-preview' for complex reasoning tasks like pharmacovigilance analysis
  const model = "gemini-3-pro-preview";

  const prompt = `
    Perform a high-level pharmacovigilance analysis for:
    Patient: ${patient.name}, Age ${patient.age}, ${patient.gender}.
    Conditions: ${patient.diagnosis.join(', ')}.
    Medications: ${patient.medications.map(m => `${m.name} (${m.dosage})`).join(', ')}.
    New Presentation: "${newSymptoms}"

    Task:
    1. Identify potential Adverse Drug Reactions (ADR).
    2. Determine which drugs are likely causative.
    3. Provide a reasoning based on clinical pharmacology.
    4. Rank risk as LOW, MODERATE, HIGH, or CRITICAL.
    5. Calculate a 0-100 causality score.
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

  // Fix: Extract generated text directly from response.text property
  return JSON.parse(response.text) as ADRAnalysis;
};

export const generateNeuralMap = async (analysis: ADRAnalysis): Promise<NetworkData> => {
  const ai = getGeminiClient();
  const model = "gemini-3-flash-preview";

  const prompt = `
    Create a JSON network graph mapping the causality for these symptoms: ${analysis.detectedSymptoms.join(', ')}
    Associated with these drugs: ${analysis.suspectDrugs.join(', ')}
    
    Nodes should represent:
    - Drugs (Group 1)
    - Biological Mechanisms/Pathways (Group 3)
    - Symptoms (Group 2)
    
    Return a JSON with "nodes" [{id, group}] and "links" [{source, target, value}].
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

  // Fix: Extract generated text directly from response.text property
  return JSON.parse(response.text) as NetworkData;
};