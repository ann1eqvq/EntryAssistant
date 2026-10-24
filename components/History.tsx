
import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { EntryCard } from './EntryCard';
import { JournalEntry, LOCAL_STORAGE_KEY_HISTORY } from '../types';
import { Archive, Trash2, CheckSquare, XSquare, Layers, AlertTriangle, Image, FileText, LayoutList, AlignJustify, Download } from 'lucide-react';

type ExportStyle = 'default' | 'compact';
type ExportFormat = 'jpg' | 'png';

export const History: React.FC = () => {
  const [history, setHistory] = useState<JournalEntry[]>([]);
  
  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: 'single' | 'batch' | 'all';
    targetId?: string;
    title: string;
    message: string;
  }>({ type: 'single', title: '', message: '' });

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStyle, setExportStyle] = useState<ExportStyle>('default');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('jpg');
  
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing history", e);
      }
    }
  }, []);

  // --- Data Handlers ---

  const saveHistory = (newHistory: JournalEntry[]) => {
    setHistory(newHistory);
    localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(newHistory));
  };

  const handleUpdateNote = (id: string, note: string) => {
    const newHistory = history.map(entry => 
      entry.id === id ? { ...entry, note } : entry
    );
    saveHistory(newHistory);
  };

  // --- Modal Action Handlers ---

  const openDeleteModal = (id: string) => {
    setModalConfig({
      type: 'single',
      targetId: id,
      title: '刪除分錄',
      message: '確定要刪除這筆分錄嗎？此動作無法復原。'
    });
    setShowModal(true);
  };

  const openBatchDeleteModal = () => {
    if (selectedIds.length === 0) return;
    setModalConfig({
      type: 'batch',
      title: '批次刪除',
      message: `確定要刪除選取的 ${selectedIds.length} 筆分錄嗎？此動作無法復原。`
    });
    setShowModal(true);
  };

  const openClearAllModal = () => {
    if (history.length === 0) return;
    setModalConfig({
      type: 'all',
      title: '清空紀錄',
      message: '確定要清空所有歷史紀錄嗎？所有分錄將會消失且無法復原。'
    });
    setShowModal(true);
  };

  const executeConfirmAction = () => {
    if (modalConfig.type === 'single' && modalConfig.targetId) {
      const newHistory = history.filter(h => h.id !== modalConfig.targetId);
      saveHistory(newHistory);
      if (selectedIds.includes(modalConfig.targetId)) {
        setSelectedIds(selectedIds.filter(id => id !== modalConfig.targetId));
      }
    } else if (modalConfig.type === 'batch') {
      const newHistory = history.filter(h => !selectedIds.includes(h.id));
      saveHistory(newHistory);
      setSelectedIds([]);
      setIsSelectionMode(false);
    } else if (modalConfig.type === 'all') {
      setHistory([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY_HISTORY);
      setSelectedIds([]);
      setIsSelectionMode(false);
    }
    setShowModal(false);
  };

  // --- Export Handlers ---

  const handleMergeClick = () => {
    if (selectedIds.length === 0) return;
    // Reset defaults
    setExportStyle('default');
    setExportFormat('jpg');
    setShowExportModal(true);
  };

  const executeExport = async () => {
    if (selectedIds.length === 0 || !exportRef.current) return;
    
    setShowExportModal(false);
    setIsProcessing(true);

    try {
      // Allow DOM to update with selected style
      await new Promise(resolve => setTimeout(resolve, 300));

      const isTransparent = exportFormat === 'png';
      
      const options = {
        scale: 2,
        backgroundColor: isTransparent ? null : '#fdfbf7',
        logging: false,
        useCORS: true
      };

      const canvas = await html2canvas(exportRef.current, options);

      const mimeType = isTransparent ? "image/png" : "image/jpeg";
      const extension = isTransparent ? "png" : "jpg";
      const quality = isTransparent ? undefined : 0.9;

      const image = canvas.toDataURL(mimeType, quality);
      
      const link = document.createElement('a');
      link.download = `journal-export-${exportStyle}-${Date.now()}.${extension}`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Merge failed:", error);
      alert("圖片產生失敗，請稍後再試。");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Render ---

  if (history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
        <Archive size={64} className="mb-6 opacity-30" />
        <h2 className="text-2xl font-bold mb-2">暫無紀錄</h2>
        <p>前往「產生器」建立你的第一筆分錄吧！</p>
      </div>
    );
  }

  const selectedEntries = selectedIds
    .map(id => history.find(h => h.id === id))
    .filter((h): h is JournalEntry => !!h);

  return (
    <div className="max-w-4xl mx-auto pb-32 relative">
      <div className="flex justify-between items-center mb-8 px-2">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Archive size={24} />
          歷史紀錄 ({history.length})
        </h2>
        
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedIds([]);
            }}
            className={`px-4 py-2 rounded-xl transition-all font-bold flex items-center gap-1.5 shadow-sm
              ${isSelectionMode 
                ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-700'}
            `}
          >
            {isSelectionMode ? <XSquare size={18} /> : <CheckSquare size={18} />}
            {isSelectionMode ? '結束多選' : '多選模式'}
          </button>
          
          {!isSelectionMode && (
            <button 
              onClick={openClearAllModal}
              className="text-sm text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-xl transition-all font-bold flex items-center gap-1"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">清空全部</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {history.map((entry) => {
          const isSelected = selectedIds.includes(entry.id);
          const selectIndex = selectedIds.indexOf(entry.id) + 1;
          
          return (
            <EntryCard 
              key={entry.id} 
              entry={entry} 
              showDelete={!isSelectionMode} 
              onDelete={openDeleteModal}
              selectable={isSelectionMode}
              selected={isSelected}
              onToggleSelect={(id) => {
                if (selectedIds.includes(id)) {
                  setSelectedIds(selectedIds.filter(itemId => itemId !== id));
                } else {
                  setSelectedIds([...selectedIds, id]);
                }
              }}
              selectionIndex={selectIndex}
              onUpdateNote={handleUpdateNote}
            />
          );
        })}
      </div>

      {/* Floating Action Bar */}
      {isSelectionMode && selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-2xl rounded-2xl p-2 px-4 flex items-center gap-4 z-50 animate-bounce-in">
          <div className="text-sm font-bold text-gray-500 dark:text-gray-400 px-2 border-r border-gray-200 dark:border-slate-700 pr-4">
            已選 {selectedIds.length} 筆
          </div>
          
          <button
            onClick={handleMergeClick}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? <span className="animate-spin text-xl">◌</span> : <Layers size={18} />}
            合併下載
          </button>
          
          <button
            onClick={openBatchDeleteModal}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 font-bold transition-colors disabled:opacity-50"
          >
            <Trash2 size={18} />
            刪除
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-gray-100 dark:border-slate-700 animate-bounce-in">
             <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center mb-4 mx-auto">
               <AlertTriangle size={24} />
             </div>
             <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-2">{modalConfig.title}</h3>
             <p className="text-gray-500 dark:text-gray-400 text-center mb-6">{modalConfig.message}</p>
             <div className="flex gap-3">
               <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600">取消</button>
               <button onClick={executeConfirmAction} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30">確認刪除</button>
             </div>
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowExportModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full border border-gray-100 dark:border-slate-700 animate-bounce-in overflow-hidden">
            <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-6 flex items-center justify-center gap-2">
              <Download size={24} className="text-primary-500" />
              匯出設定
            </h3>

            <div className="space-y-6">
              {/* Style Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-3 ml-1 uppercase tracking-wider">樣式 Style</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportStyle('default')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                      exportStyle === 'default' 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                        : 'border-gray-100 dark:border-slate-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <LayoutList size={28} />
                    <span className="font-bold text-sm">正常模式</span>
                  </button>
                  <button
                    onClick={() => setExportStyle('compact')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                      exportStyle === 'compact' 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                        : 'border-gray-100 dark:border-slate-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <AlignJustify size={28} />
                    <span className="font-bold text-sm">緊密模式</span>
                  </button>
                </div>
                <p className="text-xs text-center text-gray-400 mt-2 h-4">
                  {exportStyle === 'default' ? '保留完整卡片設計、時間戳記與註記' : '省略時間、註記與裝飾，間距更緊湊'}
                </p>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-3 ml-1 uppercase tracking-wider">格式 Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportFormat('jpg')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                      exportFormat === 'jpg' 
                        ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                        : 'border-gray-100 dark:border-slate-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Image size={28} />
                    <span className="font-bold text-sm">JPG (一般)</span>
                  </button>
                  <button
                    onClick={() => setExportFormat('png')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                      exportFormat === 'png' 
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'border-gray-100 dark:border-slate-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <FileText size={28} />
                    <span className="font-bold text-sm">PNG (透明)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
               <button 
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-300 font-bold transition-colors"
              >
                取消
              </button>
              <button 
                onClick={executeExport}
                className="flex-[2] py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-lg shadow-primary-500/30 transition-all active:scale-95"
              >
                開始匯出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Container for Image Generation */}
      {/* 
        Grid Definition:
        Col 1: Indicator (4px)
        Col 2: Subject (1fr)
        Col 3: Debit (Auto)
        Col 4: Credit (Auto)
        gap-x-0: We use padding in cells to control spacing (needed for compact mode)
      */}
      <div className="fixed top-0 left-[-9999px] w-fit min-w-[800px]" aria-hidden="true">
        <div 
          ref={exportRef} 
          style={{ fontFamily: '"Zen Maru Gothic", sans-serif' }}
          className={`
            p-8 grid grid-cols-[4px_minmax(0,1fr)_auto_auto] gap-x-0 gap-y-0
            ${exportFormat === 'jpg' ? 'bg-[#fdfbf7]' : 'bg-transparent'}
          `}
        >
          {selectedEntries.map((entry, index) => (
             <EntryCard 
               key={`export-${entry.id}`} 
               entry={entry} 
               variant={exportStyle}
               isExport={true}
               selectionIndex={index} // Used to detect if it's the very first entry of the list
             />
          ))}
          <div className="col-span-4 text-center text-sm font-bold pt-8 text-gray-400 mt-4 border-t border-gray-200">
            Created by 分錄小幫手
          </div>
        </div>
      </div>
    </div>
  );
};
