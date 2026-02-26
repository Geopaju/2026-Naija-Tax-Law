
import React from 'react';
import { CalculationResult } from '../types';
import { ArrowDown, ArrowUp, Info, PieChart, TrendingDown, Layers, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  results: CalculationResult;
}

const ResultsDisplay: React.FC<Props> = ({ results }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* High-Impact Summary Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <TrendingDown className="w-40 h-40" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-2">Final Net Pay (Monthly)</p>
              <h3 className="text-5xl font-black text-emerald-400 leading-none">
                {formatCurrency(results.monthlyNetPay)}
              </h3>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-2xl flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">2026 Compliant</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
            <div>
              <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-2">Monthly PAYE Tax</p>
              <p className="text-2xl font-black text-rose-400">{formatCurrency(results.monthlyPAYE)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-2">Monthly Gross</p>
              <p className="text-2xl font-black">{formatCurrency(results.grossMonthly)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progressive Band Visualization */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8">
        <div className="flex items-center space-x-3 mb-8">
          <Layers className="w-6 h-6 text-emerald-600" />
          <h4 className="text-lg font-black text-slate-800">Tax Band Distribution</h4>
        </div>
        
        <div className="space-y-6">
          {results.bandBreakdown.filter(b => b.taxableInBand > 0).map((item, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Band {idx + 1} ({item.band.rate * 100}%)
                  </span>
                  <p className="text-sm font-bold text-slate-700">
                    {formatCurrency(item.taxableInBand)} taxed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-rose-500">+{formatCurrency(item.taxPaid)} / yr</p>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, (item.taxableInBand / (item.band.upperBound || results.chargeableIncome)) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          {results.chargeableIncome === 0 && (
            <div className="flex flex-col items-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
              <p className="text-sm font-bold text-slate-500 text-center">Your income is within the ₦800,000 tax-free threshold.</p>
            </div>
          )}
        </div>
      </div>

      {/* Short Textual Explanation */}
      <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 relative">
        <div className="absolute -top-3 left-8 bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">
          AI Analysis
        </div>
        <p className="text-sm text-emerald-900 leading-relaxed font-medium italic">
          "{results.explanation}"
        </p>
      </div>
    </div>
  );
};

export default ResultsDisplay;
