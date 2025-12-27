
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BrainCircuit, 
  Users, 
  Activity, 
  Settings, 
  Search, 
  Pill, 
  AlertCircle, 
  ChevronRight, 
  Loader2, 
  Terminal,
  ShieldAlert,
  Thermometer,
  Microscope
} from 'lucide-react';
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
    lastNotes: 'Patient reporting sudden swelling in ankles and persistent headache. Potential drug-drug interaction?'
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
    lastNotes: 'Experiencing muscle pain, fatigue, and dark-colored urine. Query statin-induced rhabdomyolysis.'
  }
];

export default function App() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [activePatientId, setActivePatientId] = useState(INITIAL_PATIENTS[0].id);
  const [view, setView] = useState<ViewState>(ViewState.ANALYSIS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentMap, setCurrentMap] = useState<NetworkData | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Neural Engine Standby..."]);

  const activePatient = useMemo(() => 
    patients.find(p => p.id === activePatientId)!, 
    [patients, activePatientId]
  );

  useEffect(() => {
    setNoteInput(activePatient.lastNotes);
  }, [activePatientId, activePatient.lastNotes]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    addLog("Initializing Neural Analysis...");
    addLog(`Accessing records for ${activePatient.name}`);
    
    try {
      const result = await analyzePatientADR(activePatient, noteInput);
      addLog("Analysis Complete. Risk Level: " + result.riskLevel);
      
      const map = await generateNeuralMap(result);
      addLog("Neural Map Generated.");
      
      setPatients(prev => prev.map(p => 
        p.id === activePatientId ? { ...p, latestAnalysis: result } : p
      ));
      setCurrentMap(map);
    } catch (e) {
      addLog("CRITICAL ERROR: Analysis Failed.");
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-slate-900/40 backdrop-blur-2xl flex flex-col z-10">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <BrainCircuit className="text-slate-950 w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black tracking-tighter text-xl leading-none">NEURO<span className="text-cyan-400">PHARM</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Advanced ADR Engine</p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: ViewState.ANALYSIS, icon: Activity, label: 'Neural Analysis' },
            { id: ViewState.PATIENTS, icon: Users, label: 'Patient Registry' },
            { id: ViewState.SETTINGS, icon: Settings, label: 'System Settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 group ${
                view === item.id 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <item.icon size={18} className={view === item.id ? 'animate-pulse' : ''} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-slate-950/40">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Engine Status</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-500 font-bold">READY</span>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Terminal size={12} className="text-cyan-400" />
              <span className="text-[10px] font-mono text-slate-400">LOGS</span>
            </div>
            <div className="space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="text-[9px] font-mono text-slate-500 truncate">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-20 border-b border-white/5 px-10 flex items-center justify-between bg-slate-950/20 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Live Monitoring Workspace</h2>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3 overflow-hidden">
               {patients.map(p => (
                 <div key={p.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase">
                    {p.name.split(' ').map(n => n[0]).join('')}
                 </div>
               ))}
            </div>
            <div className="h-8 w-px bg-white/10" />
            <button className="text-slate-400 hover:text-white transition-colors">
              <Search size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Patient Navigator */}
          <div className="w-80 border-r border-white/5 bg-slate-900/10 p-6 overflow-y-auto custom-scrollbar">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Patient Queue</h3>
            <div className="space-y-4">
              {patients.map(p => (
                <button 
                  key={p.id}
                  onClick={() => setActivePatientId(p.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-500 group relative overflow-hidden ${
                    activePatientId === p.id 
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-500/50 shadow-2xl shadow-cyan-500/10 scale-[1.02]' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  {activePatientId === p.id && (
                    <div className="absolute top-0 right-0 p-2">
                       <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-sm tracking-tight">{p.name}</span>
                    {p.latestAnalysis && (
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-tighter uppercase ${
                        p.latestAnalysis.riskLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {p.latestAnalysis.riskLevel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1"><Users size={12} /> {p.age}y</div>
                    <div className="flex items-center gap-1"><Thermometer size={12} /> {p.diagnosis[0]}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Workspace */}
          <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-slate-950/20">
            {/* Presentation Section */}
            <section className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 shadow-2xl relative group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">New Clinical Presentation</h3>
                    <p className="text-xs text-slate-500 font-medium">Capture patient symptoms and notes for neural processing</p>
                  </div>
                </div>
                <button 
                  onClick={runAnalysis}
                  disabled={isAnalyzing || !noteInput}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all transform active:scale-95 disabled:opacity-30 shadow-xl shadow-cyan-500/20"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Neural Mapping...
                    </>
                  ) : (
                    <>
                      <BrainCircuit size={16} />
                      Run Analysis
                    </>
                  )}
                </button>
              </div>
              <textarea 
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Type clinical observations here..."
                className="w-full h-40 bg-slate-950/50 border border-white/5 rounded-2xl p-6 text-sm focus:outline-none focus:border-cyan-500/30 transition-all font-mono placeholder:text-slate-700 resize-none leading-relaxed"
              />
            </section>

            {/* Results Output */}
            {activePatient.latestAnalysis ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Metrics & Reasoning */}
                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/5 group hover:border-cyan-500/30 transition-all">
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Causality Index</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600">
                          {activePatient.latestAnalysis.probabilityScore}
                        </span>
                        <span className="text-xl font-bold text-slate-600">%</span>
                      </div>
                      <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000"
                          style={{ width: `${activePatient.latestAnalysis.probabilityScore}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className={`p-8 rounded-3xl border transition-all ${
                      activePatient.latestAnalysis.riskLevel === 'CRITICAL' 
                      ? 'bg-rose-500/10 border-rose-500/30 shadow-2xl shadow-rose-500/5' 
                      : 'bg-slate-900/60 border-white/5'
                    }`}>
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Risk Severity</div>
                      <div className={`text-4xl font-black italic tracking-tighter ${
                        activePatient.latestAnalysis.riskLevel === 'CRITICAL' ? 'text-rose-400' : 'text-orange-400'
                      }`}>
                        {activePatient.latestAnalysis.riskLevel}
                      </div>
                      <div className="mt-6 flex items-center gap-2">
                        <ShieldAlert size={16} className={activePatient.latestAnalysis.riskLevel === 'CRITICAL' ? 'text-rose-500 animate-bounce' : 'text-orange-500'} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Priority Action Required</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 space-y-6">
                    <div className="flex items-center gap-3">
                      <Microscope className="text-purple-400" size={20} />
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Neural Reasoning Engine</h4>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed font-mono bg-slate-950/40 p-6 rounded-2xl border border-white/5">
                      {activePatient.latestAnalysis.reasoning}
                    </p>
                  </div>

                  <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 space-y-6">
                    <div className="flex items-center gap-3">
                      <Pill className="text-rose-400" size={20} />
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Suspect Pharmacotherapy</h4>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {activePatient.latestAnalysis.suspectDrugs.map(drug => (
                        <div key={drug} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-black">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          {drug}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Map & Protocols */}
                <div className="space-y-10 flex flex-col">
                  <div className="flex-1 min-h-[500px] relative rounded-[2.5rem] overflow-hidden border border-white/5 shadow-inner bg-slate-950/40">
                    <div className="absolute top-6 left-6 z-20">
                      <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-full border border-white/10 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                        Causal Network Graph
                      </div>
                    </div>
                    {currentMap && <NetworkGraph data={currentMap} />}
                  </div>

                  <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                      <ChevronRight className="text-cyan-400 rotate-90" size={20} />
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Immediate Follow-up Protocol</h4>
                    </div>
                    <ul className="space-y-4">
                      {activePatient.latestAnalysis.followUpQuestions.map((q, i) => (
                        <li key={i} className="flex items-start gap-4 p-4 bg-slate-950/30 rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-all">
                          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-[10px] font-bold shrink-0">
                            {i + 1}
                          </div>
                          <span className="text-sm text-slate-300 font-medium">{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-700 py-40">
                 <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                    <BrainCircuit size={40} className="opacity-20" />
                 </div>
                 <h4 className="text-lg font-bold text-slate-600">Awaiting Clinical Data</h4>
                 <p className="text-sm max-w-xs text-center mt-2 font-medium">Input observations and run the neural engine to start the surveillance process.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
