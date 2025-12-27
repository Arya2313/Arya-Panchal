import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface Drug {
  name: string;
  dosage: string;
  startDate: string;
}

export interface ADRAnalysis {
  probabilityScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  detectedSymptoms: string[];
  suspectDrugs: string[];
  reasoning: string;
  recommendedActions: string[];
  followUpQuestions: string[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  diagnosis: string[];
  medications: Drug[];
  lastNotes: string;
  latestAnalysis?: ADRAnalysis;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  ANALYSIS = 'ANALYSIS',
  PATIENTS = 'PATIENTS',
  SETTINGS = 'SETTINGS'
}

// Fix: Inherit from SimulationNodeDatum directly by importing it from 'd3'
export interface NetworkNode extends SimulationNodeDatum {
  id: string;
  group: number; // 1: Drug, 2: Symptom, 3: Mechanism
}

// Fix: Inherit from SimulationLinkDatum directly by importing it from 'd3'
export interface NetworkLink extends SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode;
  target: string | NetworkNode;
  value: number;
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}