
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator as CalcIcon, 
  Settings, 
  PieChart, 
  HelpCircle, 
  Briefcase,
  Users,
  ShieldCheck,
  UserCircle,
  LogOut,
  History as HistoryIcon
} from 'lucide-react';
import { INITIAL_TAX_CONFIG, INITIAL_USER_INPUT } from './constants';
import { TaxConfig, UserInput, UserRole, TaxHistoryEntry } from './types';
import EmployeeModule from './modules/EmployeeModule';
import HRModule from './modules/HRModule';
import AdminPanel from './components/AdminPanel';
import TaxAssistant from './components/TaxAssistant';
import TaxHistory from './components/TaxHistory';
import Login from './components/Login';
import { calculatePAYE } from './services/taxEngine';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ email: string; role: UserRole } | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState<string>('calculator');
  const [taxConfig, setTaxConfig] = useState<TaxConfig>(INITIAL_TAX_CONFIG);
  const [userInput, setUserInput] = useState<UserInput>(INITIAL_USER_INPUT);
  const [taxHistory, setTaxHistory] = useState<TaxHistoryEntry[]>(() => {
    const saved = localStorage.getItem('naijatax_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('naijatax_history', JSON.stringify(taxHistory));
  }, [taxHistory]);

  const currentResult = useMemo(() => {
    return calculatePAYE(userInput, taxConfig);
  }, [userInput, taxConfig]);

  const saveToHistory = () => {
    if (!currentUser) return;
    const newEntry: TaxHistoryEntry = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
      userEmail: currentUser.email,
      employeeName: userInput.employeeName || 'Unnamed Individual',
      grossAnnual: currentResult.grossAnnual,
      totalDeductions: currentResult.totalAllowableDeductions,
      annualPAYE: currentResult.annualPAYE,
      monthlyNetPay: currentResult.monthlyNetPay,
      input: { ...userInput },
      result: { ...currentResult }
    };
    setTaxHistory(prev => [newEntry, ...prev]);
    setActiveTab('history');
  };

  const deleteHistoryEntry = (id: string) => {
    setTaxHistory(prev => prev.filter(e => e.id !== id));
  };

  const viewHistoryEntry = (entry: TaxHistoryEntry) => {
    setUserInput(entry.input);
    setActiveTab('calculator');
  };

  const handleLogin = (email: string, role: UserRole) => {
    setCurrentUser({ email, role });
    setRole(role);
    if (role === 'admin') setActiveTab('admin');
    else if (role === 'organisation') setActiveTab('bulk');
    else setActiveTab('calculator');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setRole(null);
  };

  const userHistory = useMemo(() => {
    if (!currentUser) return [];
    return taxHistory.filter(entry => entry.userEmail === currentUser.email);
  }, [taxHistory, currentUser]);

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('calculator')}>
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <CalcIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">NaijaTax <span className="text-emerald-600">2026</span></h1>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            <div className="flex items-center space-x-2 mr-4 px-3 py-1 bg-slate-100 rounded-full">
              <UserCircle className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{currentUser.email}</span>
            </div>
            {role === 'individual' && (
              <>
                <NavButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} icon={<PieChart className="w-4 h-4" />} label="Calculator" />
                <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<HistoryIcon className="w-4 h-4" />} label="Tax History" />
                <NavButton active={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} icon={<HelpCircle className="w-4 h-4" />} label="AI Advisor" />
              </>
            )}
            {role === 'organisation' && (
              <>
                <NavButton active={activeTab === 'bulk'} onClick={() => setActiveTab('bulk')} icon={<Users className="w-4 h-4" />} label="Bulk Payroll" />
                <NavButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} icon={<PieChart className="w-4 h-4" />} label="Individual Test" />
              </>
            )}
            {role === 'admin' && (
              <>
                <NavButton active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} icon={<Settings className="w-4 h-4" />} label="Tax Config" />
                <NavButton active={activeTab === 'calculator'} onClick={() => setActiveTab('calculator')} icon={<PieChart className="w-4 h-4" />} label="Preview Mode" />
              </>
            )}
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <button onClick={handleLogout} className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all font-medium">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {activeTab === 'calculator' && (
          <EmployeeModule 
            input={userInput} 
            setInput={setUserInput} 
            config={taxConfig} 
            result={currentResult} 
            onSaveToHistory={saveToHistory}
          />
        )}
        {activeTab === 'bulk' && <HRModule config={taxConfig} />}
        {activeTab === 'admin' && <AdminPanel config={taxConfig} setConfig={setTaxConfig} />}
        {activeTab === 'assistant' && <TaxAssistant results={currentResult} />}
        {activeTab === 'history' && (
          <TaxHistory 
            history={userHistory} 
            onDelete={deleteHistoryEntry} 
            onView={viewHistoryEntry} 
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>© 2026 NaijaTax • Compliant with National Tax Authority Act</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-emerald-600">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-600">Terms of Use</a>
            <a href="#" className="hover:text-emerald-600">Professional Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all font-semibold ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default App;
