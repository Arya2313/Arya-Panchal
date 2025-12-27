
import React, { useState, useEffect } from 'react';
import { BrainCircuit, Users, Activity, Settings, Search, Pill, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { Patient, ViewState, ADRAnalysis, NetworkData } from './types';
import { analyzePatientADR, generateNeuralMap } from './services/geminiService';
import { NetworkGraph } from './components/NetworkGraph';

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Dr. Evelyn Miller',
    age: 72,
    gender: 'Female',
    diagnosis: ['Hypertension', 'Arthritis'],
    medications: [
      { name: 'Lisinopril', dosage: '20mg', startDate: '2023-01-01' },
      { name: 'Celecoxib', dosage: '200mg', startDate: '2024-02-15' }
    ],
    lastNotes: 'Patient reporting sudden swelling in ankles and persistent headache.'
  },
  {
    id: 'p2',
    name: 'Marcus Thorne',
    age: 45,
    gender: 'Male',
    diagnosis: ['Type 2 Diabetes', 'Hyperlipidemia'],
    medications: [
      { name: 'Metformin', dosage: '1000mg', startDate: '2022-11-10' },
      { name: 'Atorvastatin', dosage: '40mg', startDate: '2023-08-05' }
    ],
    lastNotes: 'Experiencing muscle pain and dark-colored urine.'
  }
];

export default function App() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [activePatientId, setActivePatientId] = useState(INITIAL_PATIENTS[0].id);
  const [view, setView] = useState<ViewState>(ViewState.ANALYSIS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentMap, setCurrentMap] = useState<NetworkData | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const activePatient = patients.find(p => p.id === activePatientId)!;

  useEffect(() => {
    setNoteInput(activePatient.lastNotes);
  }, [activePatientId]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzePatientADR(activePatient, noteInput);
      const map = await generateNeuralMap(result);
      
      setPatients(prev => prev.map(p => 
        p.id === activePatientId ? { ...p, latestAnalysis: result } : p
      ));
      setCurrentMap(map);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center">
            <BrainCircuit className="text-slate-950 w-5 h-5" />
          </div>
          <span className="font-bold tracking-tighter text-xl">NEURO<span className="text-cyan-400">PHARM</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: ViewState.ANALYSIS, icon: Activity, label: 'Neural Follow-up' },
            { id: ViewState.PATIENTS, icon: Users, label: 'Patient Registry' },
            { id: ViewState.SETTINGS, icon: Settings, label: 'System Config' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                view === item.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Engine Status</div>
          <div className="flex items-center gap-2 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Gemini-3-Pro Online
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between bg-slate-950/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">ADR Surveillance Workspace</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search patient records..." 
                className="bg-slate-900 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-cyan-500 w-64 transition-all"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Patient Selector */}
          <div className="w-80 border-r border-slate-800 bg-slate-900/20 p-4 overflow-y-auto">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Active Surveillance</h2>
            <div className="space-y-3">
              {patients.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setActivePatientId(p.id)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    activePatientId === p.id 
                    ? 'bg-slate-800 border-cyan-500/50 shadow-lg shadow-cyan-500/5' 
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">{p.name}</span>
                    {p.latestAnalysis && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.latestAnalysis.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {p.latestAnalysis.riskLevel}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{p.diagnosis.join(' • ')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis View */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-950">
            {/* Input Context */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <Activity size={16} /> PATIENT PRESENTATION
                </h3>
                <button 
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/10 disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <BrainCircuit size={14} />}
                  EXECUTE NEURAL REASONING
                </button>
              </div>
              <textarea 
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full h-32 bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-500/50 font-mono"
              />
            </section>

            {/* Results Grid */}
            {activePatient.latestAnalysis && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Summary */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Causality Score</div>
                      <div className="text-4xl font-black text-cyan-400">{activePatient.latestAnalysis.probabilityScore}%</div>
                    </div>
                    <div className={`p-6 rounded-2xl border ${
                      activePatient.latestAnalysis.riskLevel === 'CRITICAL' ? 'bg-red-950/20 border-red-500/50' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Risk Stratification</div>
                      <div className={`text-2xl font-black ${
                        activePatient.latestAnalysis.riskLevel === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'
                      }`}>{activePatient.latestAnalysis.riskLevel}</div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Pill size={14} className="text-pink-400" /> Suspect Pharmacotherapy
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activePatient.latestAnalysis.suspectDrugs.map(drug => (
                        <span key={drug} className="px-3 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full text-[10px] font-bold">
                          {drug}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle size={14} className="text-amber-400" /> Clinical Reasoning
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                      {activePatient.latestAnalysis.reasoning}
                    </p>
                  </div>
                </div>

                {/* Right: Visualization & Protocol */}
                <div className="space-y-6 flex flex-col">
                  <div className="flex-1 min-h-[400px]">
                    {currentMap && <NetworkGraph data={currentMap} />}
                  </div>

                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Immediate Follow-up Protocol</h4>
                    <ul className="space-y-3">
                      {activePatient.latestAnalysis.followUpQuestions.map((q, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs text-slate-300">
                          <ChevronRight size={14} className="text-cyan-500 mt-0.5 shrink-0" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
