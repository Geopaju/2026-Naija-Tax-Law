
import React, { useState } from 'react';
import { TaxConfig, TaxBand } from '../types';
import { Save, Plus, Trash2, RotateCcw, ShieldCheck, AlertCircle, Calendar } from 'lucide-react';
import { INITIAL_TAX_CONFIG } from '../constants';

interface Props {
  config: TaxConfig;
  setConfig: (config: TaxConfig) => void;
}

const AdminPanel: React.FC<Props> = ({ config, setConfig }) => {
  const [localConfig, setLocalConfig] = useState<TaxConfig>(config);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    const sorted = {
      ...localConfig,
      bands: [...localConfig.bands].sort((a, b) => a.lowerBound - b.lowerBound)
    };
    setConfig(sorted);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const updateBand = (id: string, field: keyof TaxBand, value: any) => {
    setLocalConfig({
      ...localConfig,
      bands: localConfig.bands.map(b => b.id === id ? { ...b, [field]: value } : b)
    });
  };

  const addBand = () => {
    const newId = Date.now().toString();
    setLocalConfig({
      ...localConfig,
      bands: [...localConfig.bands, { id: newId, lowerBound: 0, upperBound: 0, rate: 0 }]
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Legal Framework Config</h2>
          <p className="text-slate-700 font-medium">Define the logic rules for Nigeria's 2026 PAYE architecture.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setLocalConfig(INITIAL_TAX_CONFIG)} 
            className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-xl font-black transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </button>
          <button 
            onClick={handleSave} 
            className="flex items-center px-8 py-2 bg-emerald-600 text-white rounded-xl shadow-lg font-black hover:bg-emerald-700 transition-all"
          >
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </button>
        </div>
      </div>

      {showSaved && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-6 py-4 rounded-2xl flex items-center shadow-sm">
          <ShieldCheck className="w-6 h-6 mr-3 text-emerald-700" />
          <span className="font-black">Framework version "{localConfig.versionName}" published successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-black text-slate-900">Progressive Tax Bands</h3>
              <button 
                onClick={addBand} 
                className="text-xs bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center font-black shadow-sm text-slate-900"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Band
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[11px] text-slate-700 uppercase tracking-[0.15em] bg-slate-100 font-black">
                  <tr>
                    <th className="px-6 py-4">Lower Bound (₦)</th>
                    <th className="px-6 py-4">Upper Bound (₦)</th>
                    <th className="px-6 py-4">Tax Rate (%)</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {localConfig.bands.map((band) => (
                    <tr key={band.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          value={band.lowerBound} 
                          onChange={(e) => updateBand(band.id, 'lowerBound', parseFloat(e.target.value))} 
                          className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 outline-none font-bold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          value={band.upperBound || ''} 
                          placeholder="Infinity (Max)" 
                          onChange={(e) => updateBand(band.id, 'upperBound', e.target.value === '' ? null : parseFloat(e.target.value))} 
                          className="w-full bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 outline-none font-bold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="number" 
                            value={band.rate * 100} 
                            onChange={(e) => updateBand(band.id, 'rate', parseFloat(e.target.value) / 100)} 
                            className="w-16 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 outline-none font-bold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-center" 
                          />
                          <span className="font-black text-slate-700">%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setLocalConfig({...localConfig, bands: localConfig.bands.filter(b => b.id !== band.id)})} 
                          className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-all"
                          title="Delete Band"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h3 className="font-black text-slate-900 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-emerald-600" /> 
              Version Control
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2">Version Label</label>
                <input 
                  type="text" 
                  value={localConfig.versionName} 
                  onChange={(e) => setLocalConfig({...localConfig, versionName: e.target.value})} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-black text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2">Effective From</label>
                <input 
                  type="date" 
                  value={localConfig.effectiveDate} 
                  onChange={(e) => setLocalConfig({...localConfig, effectiveDate: e.target.value})} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-black text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                />
              </div>
            </div>
          </div>

          <div className="bg-rose-50 rounded-3xl p-6 border border-rose-200 flex items-start shadow-sm">
             <AlertCircle className="w-6 h-6 text-rose-600 mr-4 shrink-0 mt-1" />
             <div>
                <h4 className="font-black text-rose-900 mb-1 tracking-tight">System Compliance Warning</h4>
                <p className="text-sm text-rose-800 leading-relaxed font-medium">
                  Changes made here affect global calculation logic. Improper band configuration may result in non-compliance with NTA 2026 regulations. Always verify with the official gazette.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
