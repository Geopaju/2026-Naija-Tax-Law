import React from 'react';
import { TaxHistoryEntry } from '../types';
import { 
  History, 
  Trash2, 
  Calendar, 
  User, 
  ArrowUpRight, 
  ChevronRight,
  Download,
  FileText
} from 'lucide-react';

interface Props {
  history: TaxHistoryEntry[];
  onDelete: (id: string) => void;
  onView: (entry: TaxHistoryEntry) => void;
}

const TaxHistory: React.FC<Props> = ({ history, onDelete, onView }) => {
  const formatNaira = (amt: number) => `\u20A6${Math.round(amt).toLocaleString()}`;
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <History className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Tax History Yet</h3>
        <p className="text-slate-500 max-w-xs mx-auto">
          Your saved calculations will appear here for easy reference and comparison.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Tax History</h2>
          <p className="text-slate-500 font-medium">Review and manage your past PAYE computations</p>
        </div>
        <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl font-black text-sm flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          {history.length} Records
        </div>
      </div>

      <div className="grid gap-4">
        {[...history].sort((a, b) => b.timestamp - a.timestamp).map((entry) => (
          <div 
            key={entry.id}
            className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {formatDate(entry.timestamp)}
                    </span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center">
                      <User className="w-3 h-3 mr-1" /> {entry.employeeName}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-slate-800 flex items-center">
                    {formatNaira(entry.grossAnnual)} 
                    <span className="text-xs font-bold text-slate-400 ml-2">Gross Annual</span>
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax Payable</p>
                  <p className="font-black text-rose-500">{formatNaira(entry.annualPAYE)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Monthly</p>
                  <p className="font-black text-emerald-600">{formatNaira(entry.monthlyNetPay)}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deductions</p>
                  <p className="font-black text-slate-700">{formatNaira(entry.totalDeductions)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => onView(entry)}
                  className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                  title="View Details"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onDelete(entry.id)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                  title="Delete Record"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaxHistory;
