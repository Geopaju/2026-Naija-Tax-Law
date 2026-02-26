import React, { useState, useEffect } from 'react';
import { UserInput, CalculationResult, TaxConfig } from '../types';
import { 
  DollarSign, 
  Home, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Download, 
  Mail, 
  Briefcase,
  AlertCircle,
  FileText,
  ArrowRight,
  Info,
  Scale,
  User,
  History
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { NIGERIAN_STATES } from '../constants';
import ResultsDisplay from '../components/ResultsDisplay';

interface Props {
  input: UserInput;
  setInput: (input: UserInput) => void;
  config: TaxConfig;
  result: CalculationResult;
  onSaveToHistory: () => void;
}

const EmployeeModule: React.FC<Props> = ({ input, setInput, config, result, onSaveToHistory }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Using Unicode escape for Naira sign to ensure compatibility
  const formatNaira = (amt: number) => `\u20A6${Math.round(amt).toLocaleString()}`;

  const validate = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!input.employeeName.trim()) newErrors.employeeName = "Please enter your name.";
      if (input.basicSalary <= 0) newErrors.basicSalary = "Basic salary must be greater than zero.";
    }
    if (step === 2 && input.claimsRentRelief) {
      if (input.annualRent > result.grossAnnual) newErrors.annualRent = "Rent cannot exceed your total gross income.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = (e.target as HTMLInputElement).checked;

    setInput({
      ...input,
      [name]: isCheckbox ? checked : (type === 'number' ? (parseFloat(value) || 0) : value)
    });
  };

  const handleExportReport = () => {
    const doc = new jsPDF();
    const primaryColor = [5, 150, 105]; // emerald-600
    const textColor = [30, 41, 59]; // slate-800
    const lightText = [100, 116, 139]; // slate-500

    // Header Design
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('NAIJATAX 2026', 20, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Personal Income Tax Report - Official Compliance Summary', 20, 32);

    // Profile Section
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Individual Profile', 20, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${input.employeeName}`, 20, 65);
    doc.text(`State of Residence: ${input.stateOfResidence}`, 20, 72);
    doc.text(`Date Generated: ${new Date().toLocaleDateString('en-NG')}`, 20, 79);
    doc.text(`Tax Framework: ${config.versionName}`, 20, 86);

    // Visual Separator
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 95, 190, 95);

    // Section 1: Income Analysis
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Income Summary (Annualized)', 20, 110);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const incomeData = [
      ['Gross Annual Income', formatNaira(result.grossAnnual)],
      ['Basic Salary', formatNaira(input.basicSalary * 12)],
      ['Housing Allowance', formatNaira(input.housingAllowance * 12)],
      ['Transport Allowance', formatNaira(input.transportAllowance * 12)],
      ['Other Allowances/Bonuses', formatNaira((input.otherAllowances + input.bonuses) * 12)]
    ];
    let y = 120;
    incomeData.forEach(([label, value]) => {
      doc.text(label, 20, y);
      doc.text(value, 190, y, { align: 'right' });
      y += 8;
    });

    // Section 2: Deductions & Reliefs
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Statutory Reliefs & Incentives', 20, 165);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const deductionData = [
      ['Statutory Pension (8% Basic)', formatNaira(result.annualPension)],
      ['NHF (National Housing Fund)', formatNaira(result.annualNHF)],
      ['2026 Rent Relief (20% Rent Paid)', formatNaira(result.rentRelief)],
      ['Total Allowable Deductions', formatNaira(result.totalAllowableDeductions)]
    ];
    y = 175;
    deductionData.forEach(([label, value]) => {
      doc.text(label, 20, y);
      doc.text(value, 190, y, { align: 'right' });
      y += 8;
    });

    // Section 3: Final PAYE Determination
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Final Tax Determination', 20, 215);
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 222, 170, 45, 3, 3, 'F');
    
    doc.setFontSize(11);
    doc.text('Total Chargeable Income:', 30, 235);
    doc.text(formatNaira(result.chargeableIncome), 180, 235, { align: 'right' });
    
    doc.text('Total Annual PAYE Liability:', 30, 245);
    doc.text(formatNaira(result.annualPAYE), 180, 245, { align: 'right' });
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(16);
    doc.text('Monthly Net Take-Home:', 30, 258);
    doc.text(formatNaira(result.monthlyNetPay), 180, 258, { align: 'right' });

    // Footer
    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    doc.setFontSize(8);
    doc.text('Generated by NaijaTax 2026. This is a computer-generated summary based on provided inputs.', 105, 285, { align: 'center' });
    doc.text('Verify all calculations with an official tax professional or FIRS representative.', 105, 290, { align: 'center' });

    doc.save(`NaijaTax_Report_2026_${input.employeeName.replace(/\s+/g, '_')}.pdf`);
  };

  const StepHeader = ({ num, title, subtitle, isCompleted }: any) => (
    <div className={`flex items-center space-x-4 mb-6 ${isCompleted ? 'opacity-50' : ''}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'}`}>
        {isCompleted ? <CheckCircle className="w-6 h-6" /> : num}
      </div>
      <div>
        <h3 className="font-black text-slate-800 leading-tight">{title}</h3>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="space-y-6">
        
        {/* Step 1: Profile & Income */}
        <Card isActive={activeStep === 1} isCompleted={activeStep > 1}>
          <StepHeader 
            num={1} 
            title="Assumptions & Inputs" 
            subtitle="Define your profile and salary structure"
            isCompleted={activeStep > 1}
          />
          {activeStep === 1 ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Full Name</label>
                  <div className={`relative group transition-all ${errors.employeeName ? 'ring-2 ring-rose-500/20' : ''}`}>
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black group-focus-within:text-emerald-600">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text"
                      name="employeeName"
                      value={input.employeeName}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-5 py-4 bg-slate-50 border ${errors.employeeName ? 'border-rose-300' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300`}
                      placeholder="e.g. Adewale Johnson"
                    />
                  </div>
                  {errors.employeeName && <p className="mt-1.5 text-[11px] font-bold text-rose-500 px-1">{errors.employeeName}</p>}
                </div>
                
                <InputGroup 
                  label="Monthly Basic Salary" 
                  name="basicSalary" 
                  value={input.basicSalary} 
                  onChange={handleChange}
                  error={errors.basicSalary}
                  formatNaira={formatNaira}
                />
                <InputGroup label="Monthly Housing" name="housingAllowance" value={input.housingAllowance} onChange={handleChange} formatNaira={formatNaira} />
                <InputGroup label="Monthly Transport" name="transportAllowance" value={input.transportAllowance} onChange={handleChange} formatNaira={formatNaira} />
                <InputGroup label="Monthly Other" name="otherAllowances" value={input.otherAllowances} onChange={handleChange} formatNaira={formatNaira} />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500">Derived Annual Gross</span>
                <span className="text-xl font-black text-slate-800">{formatNaira(result.grossAnnual)}</span>
              </div>
              <button onClick={handleNext} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center shadow-lg shadow-emerald-600/20">
                Step 1: Apply Rent Relief <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          ) : (
            <SummaryLine label="Individual" value={input.employeeName || 'Unnamed Individual'} onEdit={() => setActiveStep(1)} />
          )}
        </Card>

        {/* Step 2: Rent Relief */}
        <Card isActive={activeStep === 2} isCompleted={activeStep > 2}>
          <StepHeader 
            num={2} 
            title="Step 1: Apply Rent Relief" 
            subtitle="Calculate your 20% annual rent tax incentive"
            isCompleted={activeStep > 2}
          />
          {activeStep === 2 ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                <label className="flex items-center space-x-4 cursor-pointer mb-6">
                  <input 
                    type="checkbox" 
                    name="claimsRentRelief" 
                    checked={input.claimsRentRelief} 
                    onChange={handleChange}
                    className="w-6 h-6 rounded-lg text-emerald-600 focus:ring-emerald-500/20"
                  />
                  <span className="font-bold text-slate-800 text-sm">I pay rent and wish to apply the 2026 relief</span>
                </label>
                
                {input.claimsRentRelief && (
                  <div className="space-y-4 pt-4 border-t border-emerald-100">
                    <InputGroup 
                      label="Annual Rent Paid (₦)" 
                      name="annualRent" 
                      value={input.annualRent} 
                      onChange={handleChange}
                      error={errors.annualRent}
                      formatNaira={formatNaira}
                    />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-white rounded-2xl border border-emerald-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">20% of Rent</p>
                        <p className="font-bold text-slate-800">{formatNaira(input.annualRent * 0.2)}</p>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-emerald-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cap Applied</p>
                        <p className="font-bold text-slate-800">{formatNaira(config.rentReliefCap)}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-600 text-white rounded-2xl flex justify-between items-center shadow-lg shadow-emerald-600/20">
                      <span className="font-bold">Total Rent Relief</span>
                      <span className="text-xl font-black">{formatNaira(result.rentRelief)}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <button onClick={() => setActiveStep(1)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all flex items-center justify-center">
                   Back
                </button>
                <button onClick={handleNext} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center">
                   Step 2: Taxable Income <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            activeStep > 2 && <SummaryLine label="Rent Relief" value={formatNaira(result.rentRelief)} onEdit={() => setActiveStep(2)} />
          )}
        </Card>

        {/* Step 3: Taxable Income */}
        <Card isActive={activeStep === 3} isCompleted={activeStep > 3}>
          <StepHeader 
            num={3} 
            title="Step 2: Compute Taxable Income" 
            subtitle="Gross income minus allowable statutory reliefs"
            isCompleted={activeStep > 3}
          />
          {activeStep === 3 ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <WaterfallItem label="Annual Gross Income" value={result.grossAnnual} formatNaira={formatNaira} />
                <WaterfallItem label="Pension Deduction" value={result.annualPension} isDeduction formatNaira={formatNaira} />
                <WaterfallItem label="NHF Deduction" value={result.annualNHF} isDeduction formatNaira={formatNaira} />
                <WaterfallItem label="Rent Relief" value={result.rentRelief} isDeduction formatNaira={formatNaira} />
                <div className="pt-4 border-t-2 border-dashed border-slate-200 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-slate-800">Chargeable Income</span>
                    <span className="text-2xl font-black text-emerald-600">{formatNaira(result.chargeableIncome)}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => setActiveStep(2)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all flex items-center justify-center">
                   Back
                </button>
                <button onClick={handleNext} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center">
                   Step 3: Apply PAYE Bands <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            activeStep > 3 && <SummaryLine label="Chargeable Income" value={formatNaira(result.chargeableIncome)} onEdit={() => setActiveStep(3)} />
          )}
        </Card>

        {/* Step 4: Final Tax Results */}
        <Card isActive={activeStep === 4} isCompleted={false}>
          <StepHeader 
            num={4} 
            title="Step 3: Apply PAYE Bands" 
            subtitle="Final tax breakdown and take-home pay"
            isCompleted={false}
          />
          {activeStep === 4 && (
            <div className="animate-in slide-in-from-bottom-6 duration-500">
              <ResultsDisplay results={result} />
              <div className="mt-8 flex flex-col md:flex-row gap-3">
                <button onClick={() => setActiveStep(3)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all">
                  Back
                </button>
                <button 
                  onClick={onSaveToHistory}
                  className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center shadow-xl shadow-emerald-600/20"
                >
                  <History className="w-5 h-5 mr-2" /> Save to History
                </button>
                <button 
                  onClick={handleExportReport}
                  className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center shadow-xl shadow-slate-900/20"
                >
                  <Download className="w-5 h-5 mr-2" /> Export PDF Report
                </button>
              </div>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};

const Card = ({ children, isActive, isCompleted }: any) => (
  <div className={`bg-white rounded-[2.5rem] border border-slate-100 transition-all duration-500 ${isActive ? 'p-8 md:p-10 shadow-2xl shadow-slate-200/50 scale-100' : 'p-6 shadow-sm scale-[0.98]'} ${isCompleted ? 'bg-slate-50/50' : ''}`}>
    {children}
  </div>
);

const SummaryLine = ({ label, value, onEdit }: any) => (
  <div className="flex justify-between items-center animate-in fade-in duration-300">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-black text-slate-800">{value}</p>
    </div>
    <button onClick={onEdit} className="text-xs font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl transition-all">
      Edit
    </button>
  </div>
);

const InputGroup = ({ label, name, value, onChange, error, formatNaira }: any) => (
  <div>
    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">{label}</label>
    <div className={`relative group transition-all ${error ? 'ring-2 ring-rose-500/20' : ''}`}>
      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black group-focus-within:text-emerald-600">&#x20A6;</span>
      <input 
        type="number"
        name={name}
        value={value === 0 ? '' : value}
        onChange={onChange}
        className={`w-full pl-10 pr-5 py-4 bg-slate-50 border ${error ? 'border-rose-300' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-black text-slate-700 transition-all placeholder:text-slate-300`}
        placeholder="0.00"
      />
    </div>
    {error && <p className="mt-1.5 text-[11px] font-bold text-rose-500 px-1">{error}</p>}
  </div>
);

const WaterfallItem = ({ label, value, isDeduction, formatNaira }: any) => (
  <div className="flex justify-between items-center">
    <span className={`text-sm font-bold ${isDeduction ? 'text-slate-500' : 'text-slate-800'}`}>
      {isDeduction && '- '}{label}
    </span>
    <span className={`text-sm font-black ${isDeduction ? 'text-rose-500' : 'text-slate-800'}`}>
      {isDeduction && '- '}{formatNaira(value)}
    </span>
  </div>
);

export default EmployeeModule;