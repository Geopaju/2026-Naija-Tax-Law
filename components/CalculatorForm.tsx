
import React from 'react';
import { UserInput } from '../types';
import { Info, Home, ShieldCheck, Percent } from 'lucide-react';

interface Props {
  input: UserInput;
  setInput: (input: UserInput) => void;
}

const CalculatorForm: React.FC<Props> = ({ input, setInput }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setInput({
      ...input,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || 0
    });
  };

  const InputField = ({ label, name, value, prefix = "₦" }: any) => (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative group">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium group-focus-within:text-emerald-500 transition-colors">{prefix}</span>
        <input
          type="number"
          name={name}
          value={value === 0 ? '' : value}
          onChange={handleChange}
          className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium text-slate-700"
          placeholder="0.00"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        <InputField label="Basic Salary (Monthly)" name="basicSalary" value={input.basicSalary} />
        <InputField label="Housing (Monthly)" name="housingAllowance" value={input.housingAllowance} />
        <InputField label="Transport (Monthly)" name="transportAllowance" value={input.transportAllowance} />
        <InputField label="Other Allowances (Monthly)" name="otherAllowances" value={input.otherAllowances} />
      </div>

      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
          <Home className="w-4 h-4 mr-2 text-emerald-600" />
          Rent Relief (2026 Policy)
        </h3>
        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer group">
            <div className="relative flex items-center mt-0.5">
              <input
                type="checkbox"
                name="claimsRentRelief"
                checked={input.claimsRentRelief}
                onChange={handleChange}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:bg-emerald-600 checked:border-emerald-600 transition-all focus:outline-none"
              />
              <ShieldCheck className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 top-0.5 pointer-events-none transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">I pay rent & want to claim relief</span>
              <p className="text-xs text-slate-500 leading-tight mt-0.5">Proof of rent payment may be required by HR/FIRS.</p>
            </div>
          </label>
          
          {input.claimsRentRelief && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <InputField label="Annual Rent Amount Paid" name="annualRent" value={input.annualRent} />
              <div className="flex items-start bg-white/60 p-3 rounded-lg mt-2">
                <Info className="w-4 h-4 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-800 leading-normal italic">
                  Rule: 20% of your total annual rent (up to a max relief of ₦500,000) is deducted from your taxable income.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
          <Percent className="w-4 h-4 mr-2 text-emerald-600" />
          Mandatory & Vol. Deductions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Pension Contribution</label>
            <div className="relative group">
              <input
                type="number"
                name="pensionRate"
                step="0.01"
                value={input.pensionRate * 100}
                onChange={(e) => setInput({ ...input, pensionRate: (parseFloat(e.target.value) || 0) / 100 })}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-700"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium group-focus-within:text-emerald-500 transition-colors">%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Standard: 8% (Employee contribution)</p>
          </div>
          <InputField label="Other Monthly Deductions" name="otherDeductions" value={input.otherDeductions} />
        </div>
      </div>
    </div>
  );
};

export default CalculatorForm;
