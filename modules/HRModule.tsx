
import React, { useState } from 'react';
import { TaxConfig } from '../types';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Trash2, Play, FileSpreadsheet } from 'lucide-react';
import { calculatePAYE } from '../services/taxEngine';

interface BulkRecord {
  id: string;
  name: string;
  basic: number;
  housing: number;
  transport: number;
  rent: number;
  processed: boolean;
  result?: any;
  error?: string;
}

const HRModule: React.FC<{ config: TaxConfig }> = ({ config }) => {
  const [records, setRecords] = useState<BulkRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadCSVTemplate = () => {
    const headers = ["Employee Name", "Monthly Basic", "Monthly Housing", "Monthly Transport", "Annual Rent"];
    const sampleData = [
      ["John Doe", "250000", "50000", "30000", "1200000"],
      ["Jane Smith", "450000", "100000", "50000", "2000000"],
      ["Alkali Musa", "180000", "30000", "20000", "0"]
    ];
    
    const csvContent = [
      headers.join(","),
      ...sampleData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "NaijaTax_Bulk_Template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newRecords: BulkRecord[] = [];

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [name, basic, housing, transport, rent] = line.split(',').map(s => s.trim());
        
        newRecords.push({
          id: `${Date.now()}-${i}`,
          name: name || `Employee ${i}`,
          basic: parseFloat(basic) || 0,
          housing: parseFloat(housing) || 0,
          transport: parseFloat(transport) || 0,
          rent: parseFloat(rent) || 0,
          processed: false
        });
      }
      setRecords(newRecords);
    };
    reader.readAsText(file);
    // Reset input value so same file can be uploaded again
    e.target.value = '';
  };

  const processBulk = () => {
    setIsProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      const processed = records.map(r => {
        if (r.basic < 0) return { ...r, processed: true, error: 'Invalid salary amount' };
        
        try {
          // Fix: Added missing employeeName property to comply with UserInput type
          const calcResult = calculatePAYE({
            employeeName: r.name,
            isAnnualMode: false,
            basicSalary: r.basic,
            housingAllowance: r.housing,
            transportAllowance: r.transport,
            otherAllowances: 0,
            bonuses: 0,
            pensionRate: 0.08,
            nhfRate: 0.025,
            otherDeductions: 0,
            annualRent: r.rent,
            claimsRentRelief: r.rent > 0,
            stateOfResidence: 'Lagos'
          }, config);

          return { ...r, processed: true, result: calcResult };
        } catch (err) {
          return { ...r, processed: true, error: 'Calculation Error' };
        }
      });
      setRecords(processed);
      setIsProcessing(false);
    }, 1000);
  };

  const clearRecords = () => setRecords([]);

  const exportResults = () => {
    const headers = ["Name", "Monthly Basic", "Annual Rent", "Monthly PAYE", "Monthly Net Pay"];
    const csvContent = [
      headers.join(","),
      ...records.map(r => [
        r.name,
        r.basic,
        r.rent,
        r.result ? Math.round(r.result.monthlyPAYE) : "N/A",
        r.result ? Math.round(r.result.monthlyNetPay) : "N/A"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Payroll_Results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-100 p-3 rounded-[1.25rem]">
              <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Organisation Payroll Engine</h2>
              <p className="text-sm text-slate-500 font-medium">Bulk compute PAYE for your workforce using 2026 rules.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {records.length > 0 && (
              <button 
                onClick={clearRecords}
                className="px-6 py-3 border border-slate-200 text-slate-500 rounded-2xl font-black hover:bg-slate-50 transition-all flex items-center shadow-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </button>
            )}
            <label className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Upload Records
              <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50 group hover:bg-slate-50 transition-colors">
            <div className="bg-white p-6 rounded-full shadow-sm mb-6 group-hover:scale-110 transition-transform duration-500">
              <FileText className="w-16 h-16 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-700">No records uploaded</h3>
            <p className="text-slate-400 max-w-sm px-6 mt-2 leading-relaxed font-medium">Upload your CSV file with employee earnings and rent data to calculate taxes instantly.</p>
            <button 
              onClick={downloadCSVTemplate}
              className="mt-8 px-8 py-3 bg-white border border-slate-200 rounded-2xl text-emerald-600 font-black hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Employee Name</th>
                  <th className="px-8 py-5 text-right">Basic (Mo)</th>
                  <th className="px-8 py-5 text-right">Rent (Yr)</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">PAYE (2026)</th>
                  <th className="px-8 py-5 text-right">Net Take-Home</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-800">{r.name}</td>
                    <td className="px-8 py-5 text-right font-mono text-sm text-slate-600">₦{r.basic.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right font-mono text-sm text-slate-600">₦{r.rent.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        {r.error ? (
                          <span className="inline-flex items-center px-3 py-1 bg-rose-50 text-rose-600 text-[10px] rounded-full font-black uppercase tracking-tighter">
                            <AlertCircle className="w-3 h-3 mr-1.5" /> {r.error}
                          </span>
                        ) : r.processed ? (
                          <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] rounded-full font-black uppercase tracking-tighter">
                            <CheckCircle className="w-3 h-3 mr-1.5" /> Computed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-500 text-[10px] rounded-full font-black uppercase tracking-tighter">Pending</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-900">
                      {r.result ? `₦${Math.round(r.result.monthlyPAYE).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-8 py-5 text-right font-black text-emerald-600">
                      {r.result ? `₦${Math.round(r.result.monthlyNetPay).toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {records.length > 0 && (
          <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-100">
            <div className="flex items-center space-x-4">
               <div className="bg-slate-100 px-4 py-2 rounded-xl">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Progress</p>
                 <p className="text-sm font-black text-slate-700">
                    {records.filter(r => r.processed).length} / {records.length} Employees
                 </p>
               </div>
            </div>
            
            <div className="flex space-x-4 w-full md:w-auto">
              {!records.every(r => r.processed) && (
                <button 
                  onClick={processBulk}
                  disabled={isProcessing}
                  className="flex-1 md:flex-none px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:bg-slate-200 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Compute Payroll
                    </>
                  )}
                </button>
              )}
              {records.some(r => r.processed) && (
                <button 
                  onClick={exportResults}
                  className="flex-1 md:flex-none px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          label="Est. Organisation Tax" 
          value={`₦${Math.round(records.reduce((acc, r) => acc + (r.result?.monthlyPAYE || 0), 0)).toLocaleString()}`} 
          color="text-emerald-600" 
          subtitle="Monthly total liability"
        />
        <StatsCard 
          label="Total Rent Incentives" 
          value={`₦${Math.round(records.reduce((acc, r) => acc + (r.result?.rentRelief || 0), 0) / 12).toLocaleString()}`} 
          color="text-emerald-600" 
          subtitle="Tax-free savings /mo"
        />
        <StatsCard 
          label="Data Integrity" 
          value={records.length > 0 ? `${Math.round((records.filter(r => !r.error).length / records.length) * 100)}%` : "N/A"} 
          color={records.some(r => r.error) ? "text-rose-500" : "text-emerald-500"} 
          subtitle="Successful imports"
        />
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, color, subtitle }: any) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
    <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>
  </div>
);

export default HRModule;
