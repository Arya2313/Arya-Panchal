import React from 'react';
import { Patient } from '../types';
import { User, Calendar, FileText } from 'lucide-react';

interface Props {
  patient: Patient;
  isActive: boolean;
  onClick: () => void;
}

export const PatientCard: React.FC<Props> = ({ patient, isActive, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        p-4 rounded-xl border cursor-pointer transition-all duration-200
        ${isActive 
          ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
          : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'
        }
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
            <User size={20} />
          </div>
          <div>
            <h3 className={`font-semibold ${isActive ? 'text-white' : 'text-slate-200'}`}>
              {patient.name}
            </h3>
            <span className="text-xs text-slate-500">{patient.age} yrs • {patient.gender}</span>
          </div>
        </div>
        {patient.latestAnalysis && (
            <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded border
                ${patient.latestAnalysis.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 
                  patient.latestAnalysis.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
                  'bg-green-500/20 text-green-400 border-green-500/50'}
            `}>
                {patient.latestAnalysis.riskLevel}
            </span>
        )}
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileText size={12} />
            <span className="truncate max-w-[200px]">{patient.diagnosis.join(', ')}</span>
        </div>
        <div className="text-xs text-slate-500 truncate mt-1 pl-5 italic">
            Last: "{patient.lastNotes.substring(0, 40)}..."
        </div>
      </div>
    </div>
  );
};
