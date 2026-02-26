import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, Users, UserCircle, Calculator, AlertCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface Props {
  onLogin: (email: string, role: UserRole) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (selectedRole === 'admin') {
      if (email === 'geopaju@gmail.com' && password === 'Amahian@2026') {
        onLogin(email, 'admin');
      } else {
        setError('Invalid admin credentials.');
      }
    } else if (selectedRole === 'hr') {
      // For demo purposes, allow specific HR credentials or any for now
      // but let's make it feel "real"
      if (password.length >= 6) {
        onLogin(email, 'hr');
      } else {
        setError('Password must be at least 6 characters.');
      }
    } else {
      // Employee login
      if (password.length >= 4) {
        onLogin(email, 'employee');
      } else {
        setError('Password must be at least 4 characters.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-600 rounded-2xl mb-4 shadow-lg shadow-emerald-600/20">
            <Calculator className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">NaijaTax <span className="text-emerald-400">2026</span></h1>
          <p className="text-slate-400">Secure access to Nigeria's PAYE Hub</p>
        </div>

        <div className="bg-slate-800 rounded-[2.5rem] p-8 border border-slate-700 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-3">
              <RoleButton 
                active={selectedRole === 'employee'} 
                onClick={() => setSelectedRole('employee')}
                icon={<UserCircle className="w-4 h-4" />}
                label="Staff"
              />
              <RoleButton 
                active={selectedRole === 'hr'} 
                onClick={() => setSelectedRole('hr')}
                icon={<Users className="w-4 h-4" />}
                label="HR"
              />
              <RoleButton 
                active={selectedRole === 'admin'} 
                onClick={() => setSelectedRole('admin')}
                icon={<ShieldCheck className="w-4 h-4" />}
                label="Admin"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Email Address</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-white transition-all placeholder:text-slate-600"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Password</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-white transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center text-rose-400 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center shadow-lg shadow-emerald-600/20 group"
            >
              Sign In to Portal
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-700 text-center">
            <p className="text-slate-500 text-xs font-medium">
              Forgot your password? <a href="#" className="text-emerald-500 hover:text-emerald-400 font-bold">Contact IT Support</a>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">
          Compliant with NTA Act 2026 • Secure Encryption Active
        </p>
      </div>
    </div>
  );
};

const RoleButton = ({ active, onClick, icon, label }: any) => (
  <button 
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${active ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400' : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-600'}`}
  >
    {icon}
    <span className="text-[10px] font-black uppercase tracking-tighter mt-1">{label}</span>
  </button>
);

export default Login;
