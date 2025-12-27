import React from 'react';
import { ADRAnalysis, Patient, NetworkData } from '../types';
import { NetworkGraph } from './NetworkGraph';
import { AlertTriangle, Activity, Pill, CheckCircle, HelpCircle } from 'lucide-react';

interface Props {
  analysis: ADRAnalysis | undefined;
  patient: Patient;
  graphData: NetworkData;
  isLoading: boolean;
}

export const AnalysisPanel: React.FC<Props> = ({ analysis, patient, graphData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-cyan-400">
        <Activity className="w-12 h-12 animate-spin mb-4" />
        <p className="font-mono text-sm animate-pulse">NEURAL ENGINE PROCESSING...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <HelpCircle className="w-12 h-12 mb-4 opacity-50" />
        <p>Select a patient and run analysis to view insights.</p>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'text-red-500 border-red-500 bg-red-500/10';
      case 'HIGH': return 'text-orange-500 border-orange-500 bg-orange-500/10';
      case 'MODERATE': return 'text-yellow-500 border-yellow-500 bg-yellow-500/10';
      default: return 'text-green-500 border-green-500 bg-green-500/10';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border ${getRiskColor(analysis.riskLevel)} flex items-center justify-between`}>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold opacity-70">Risk Level</p>
            <h2 className="text-3xl font-bold font-mono">{analysis.riskLevel}</h2>
          </div>
          <AlertTriangle className="w-10 h-10 opacity-80" />
        </div>
        
        <div className="p-4 rounded-lg border border-cyan-900 bg-cyan-950/30 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-cyan-400 opacity-70">Causality Probability</p>
            <h2 className="text-3xl font-bold font-mono text-cyan-300">{analysis.probabilityScore}%</h2>
          </div>
          <Activity className="w-10 h-10 text-cyan-400 opacity-80" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Details */}
        <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                    <Pill className="w-4 h-4 text-pink-400" /> Suspect Drugs
                </h3>
                <div className="flex flex-wrap gap-2">
                    {analysis.suspectDrugs.map(d => (
                        <span key={d} className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded border border-pink-500/30">
                            {d}
                        </span>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-amber-400" /> Detected Symptoms
                </h3>
                <div className="flex flex-wrap gap-2">
                    {analysis.detectedSymptoms.map(s => (
                        <span key={s} className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded border border-amber-500/30">
                            {s}
                        </span>
                    ))}
                </div>
            </div>

             <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-400" /> Recommended Actions
                </h3>
                <ul className="space-y-2">
                    {analysis.recommendedActions.map((action, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                            <span className="mt-1 w-1 h-1 rounded-full bg-green-500 shrink-0" />
                            {action}
                        </li>
                    ))}
                </ul>
            </div>

        </div>

        {/* Right Col: Reasoning & Graph */}
        <div className="lg:col-span-2 space-y-6">
            {/* The Graph Viz */}
            <div className="w-full h-[400px]">
                <NetworkGraph data={graphData} width={800} height={400} />
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <h3 className="text-sm font-semibold text-cyan-400 mb-2 font-mono">:: NEURAL REASONING ::</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                    {analysis.reasoning}
                </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <h3 className="text-sm font-semibold text-purple-400 mb-2 font-mono">:: FOLLOW-UP PROTOCOL ::</h3>
                 <ul className="space-y-2">
                    {analysis.followUpQuestions.map((q, i) => (
                        <li key={i} className="text-sm text-slate-300 border-l-2 border-purple-500/50 pl-3">
                            "{q}"
                        </li>
                    ))}
                </ul>
            </div>
        </div>

      </div>
    </div>
  );
};
