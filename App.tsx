import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Generator } from './components/Generator';
import { History } from './components/History';
import { Theme, LOCAL_STORAGE_KEY_THEME } from './types';
import { Moon, Sun, PenTool, History as HistoryIcon } from 'lucide-react';

// Navigation Component
const NavBar: React.FC<{ theme: Theme, toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const isGenerator = location.pathname === '/';

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 dark:border-slate-800 mb-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-tr from-primary-400 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
               <span className="font-bold text-xl">會</span>
             </div>
             <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300">
               會計分錄小幫手
             </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-200 font-bold ${
                isGenerator 
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                  : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              <PenTool size={18} />
              <span className="hidden md:inline">產生器</span>
            </Link>
            
            <Link 
              to="/history" 
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-200 font-bold ${
                !isGenerator 
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                  : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              <HistoryIcon size={18} />
              <span className="hidden md:inline">歷史紀錄</span>
            </Link>

            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1"></div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME) as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(LOCAL_STORAGE_KEY_THEME, newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans transition-colors duration-300">
        <NavBar theme={theme} toggleTheme={toggleTheme} />
        
        <main className="px-4 sm:px-6 lg:px-8 pb-20">
          <Routes>
            <Route path="/" element={<Generator />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;