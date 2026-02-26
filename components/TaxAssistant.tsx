
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { CalculationResult } from '../types';
import { Send, Bot, User, Sparkles, Loader2, MessageSquare } from 'lucide-react';

interface Props {
  results: CalculationResult;
}

const TaxAssistant: React.FC<Props> = ({ results }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Fix: Always use direct process.env.API_KEY and named parameter for initialization
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = `
        User Current Tax Situation (2026 Nigeria PAYE Rules):
        - Gross Annual: ₦${results.grossAnnual.toLocaleString()}
        - Monthly PAYE: ₦${results.monthlyPAYE.toLocaleString()}
        - Chargeable Income: ₦${results.chargeableIncome.toLocaleString()}
        - Rent Relief Applied: ₦${results.rentRelief.toLocaleString()}
        - Pension: ₦${results.annualPension.toLocaleString()}
        - Monthly Take Home: ₦${results.monthlyNetPay.toLocaleString()}
        
        System Rules Context:
        - ₦800,000 Zero-tax band applies.
        - 20% Rent relief up to ₦500,000 cap is active.
        - Pension is tax-exempt.
      `;

      // Fix: Use recommended generateContent call structure and directly access .text property
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${context}\n\nUser Question: ${userMsg}`,
        config: {
          systemInstruction: "You are a specialized Nigerian Tax Expert for the 2026 PAYE law. Be concise, helpful, and professional. Explain calculations clearly. Always advise the user that this is guidance and they should consult a professional filer.",
        }
      });

      const reply = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to the tax advisor service. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const SuggestionChip = ({ text }: { text: string }) => (
    <button 
      onClick={() => { setInput(text); }}
      className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors font-medium whitespace-nowrap"
    >
      {text}
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto h-[70vh] flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in duration-300">
      <div className="bg-emerald-700 p-6 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 p-2 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold">NaijaTax AI Advisor</h2>
            <p className="text-xs text-emerald-200 opacity-80">Online • 2026 Compliance Mode</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-8">
            <div className="bg-slate-50 p-6 rounded-full">
              <MessageSquare className="w-12 h-12 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Ask anything about your taxes</h3>
              <p className="text-sm text-slate-500">I have your current calculation data and can explain how the new 2026 rules affect you.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-sm pt-4">
              <SuggestionChip text="Explain my rent relief" />
              <SuggestionChip text="Why is my tax ₦0?" />
              <SuggestionChip text="How can I reduce my PAYE?" />
              <SuggestionChip text="Compare with 2024 rules" />
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start max-w-[85%] space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-emerald-100'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100">
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Analyzing your tax profile...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="relative group">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your 2026 PAYE..."
            className="w-full pl-6 pr-14 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaxAssistant;
