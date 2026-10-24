import React, { useState, useEffect } from 'react';
import { Switch } from './Switch';
import { EntryCard } from './EntryCard';
import { parseInputText } from '../utils';
import { JournalEntry, LOCAL_STORAGE_KEY_HISTORY } from '../types';
import { Sparkles, RotateCcw } from 'lucide-react';

// Keys for persistence
const DRAFT_DEBIT_KEY = 'journal_draft_debit';
const DRAFT_CREDIT_KEY = 'journal_draft_credit';

export const Generator: React.FC = () => {
  // Initialize state from localStorage
  const [debitText, setDebitText] = useState(() => localStorage.getItem(DRAFT_DEBIT_KEY) || '');
  const [creditText, setCreditText] = useState(() => localStorage.getItem(DRAFT_CREDIT_KEY) || '');
  const [simpleThousands, setSimpleThousands] = useState(false);
  const [generatedEntry, setGeneratedEntry] = useState<JournalEntry | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Persist inputs whenever they change
  useEffect(() => {
    localStorage.setItem(DRAFT_DEBIT_KEY, debitText);
  }, [debitText]);

  useEffect(() => {
    localStorage.setItem(DRAFT_CREDIT_KEY, creditText);
  }, [creditText]);

  const showNotification = (msg: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleGenerate = () => {
    const debits = parseInputText(debitText, simpleThousands);
    const credits = parseInputText(creditText, simpleThousands);

    if (debits.length === 0 && credits.length === 0) {
      showNotification('請輸入至少一項科目', 'error');
      return;
    }

    const totalDebit = debits.reduce((acc, curr) => acc + curr.amount, 0);
    const totalCredit = credits.reduce((acc, curr) => acc + curr.amount, 0);

    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
      debits,
      credits,
      totalDebit,
      totalCredit
    };

    setGeneratedEntry(newEntry);

    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    // Logic: Only save if balanced
    if (!isBalanced) {
      showNotification('⚠️ 借貸不平衡！未儲存至歷史紀錄', 'warning');
      return;
    }

    // Auto-save logic
    try {
      const existingHistoryJson = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
      const history: JournalEntry[] = existingHistoryJson ? JSON.parse(existingHistoryJson) : [];
      // Add new entry to the top of the list
      const newHistory = [newEntry, ...history];
      localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(newHistory));
      
      showNotification('✨ 分錄已產生並自動儲存', 'success');
    } catch (e) {
      console.error("Failed to save history", e);
      showNotification('儲存失敗', 'error');
    }
  };

  const handleClear = () => {
    setDebitText('');
    setCreditText('');
    setGeneratedEntry(null);
    // State updates will trigger effects to clear localStorage keys automatically
  };

  const isBalanced = generatedEntry 
    ? Math.abs(generatedEntry.totalDebit - generatedEntry.totalCredit) < 0.01 
    : true;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Controls Header */}
      <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <Switch 
          checked={simpleThousands} 
          onChange={setSimpleThousands} 
          label="簡易千分位模式 (輸入 50 = 50,000)" 
        />
        
        <div className="flex gap-2">
           <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
          >
            <RotateCcw size={16} />
            清空
          </button>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-2 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30 transition-all transform active:scale-95 font-bold"
          >
            <Sparkles size={18} />
            產生
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Area */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
            <label className="block text-xl font-bold text-gray-500 dark:text-gray-400 mb-3 ml-1">
              借方輸入欄 (科目和金額)
            </label>
            <textarea
              value={debitText}
              onChange={(e) => setDebitText(e.target.value)}
              placeholder={`例：\n股本300000\n保留盈餘150000`}
              className="w-full h-40 p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-0 transition-all resize-none text-lg font-medium outline-none"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
            <label className="block text-xl font-bold text-gray-500 dark:text-gray-400 mb-3 ml-1">
              貸方輸入欄 (科目和金額)
            </label>
            <textarea
              value={creditText}
              onChange={(e) => setCreditText(e.target.value)}
              placeholder={`例：\n現金450000`}
              className="w-full h-40 p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-0 transition-all resize-none text-lg font-medium outline-none"
            />
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex flex-col">
          <div className="mb-4 flex items-center justify-between ml-2">
            <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300">
              分錄預覽
            </h3>
            {generatedEntry && !isBalanced && (
              <span className="text-xs font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full animate-pulse">
                ⚠️ 借貸不平衡
              </span>
            )}
          </div>
          
          <div className="flex-grow">
            {generatedEntry ? (
              <div className="space-y-4 animate-fade-in">
                <EntryCard entry={generatedEntry} />
                <p className="text-center text-sm text-gray-400 dark:text-gray-500">
                  {isBalanced ? '已自動儲存至歷史紀錄' : '僅供預覽，未儲存'}
                </p>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-300 dark:text-slate-600 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-3xl">
                <Sparkles size={48} className="mb-4 opacity-50" />
                <p className="font-medium">輸入資料後按下「產生」</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification with dynamic colors */}
      <div 
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-xl transition-all duration-300 z-50 font-bold flex items-center gap-2
          ${notification ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}
          ${notification?.type === 'warning' ? 'bg-amber-500 text-white shadow-amber-500/30' : 
            notification?.type === 'error' ? 'bg-red-500 text-white shadow-red-500/30' : 
            'bg-gray-800 text-white shadow-gray-900/30'}
        `}
      >
        {notification?.msg}
      </div>
    </div>
  );
};