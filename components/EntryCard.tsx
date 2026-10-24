
import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { formatNumber } from '../utils';
import { Trash2, PenLine, Check, X, Tag } from 'lucide-react';

interface EntryCardProps {
  entry: JournalEntry;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
  
  // Selection props
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  selectionIndex?: number;

  // Note props
  onUpdateNote?: (id: string, note: string) => void;

  // Style variant
  variant?: 'default' | 'compact';
  
  // Export mode flag
  isExport?: boolean;
}

export const EntryCard: React.FC<EntryCardProps> = ({ 
  entry, 
  onDelete, 
  showDelete = false,
  selectable = false,
  selected = false,
  onToggleSelect,
  selectionIndex,
  onUpdateNote,
  variant = 'default',
  isExport = false
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(entry.note || '');

  const dateStr = new Date(entry.timestamp).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleClick = () => {
    if (selectable && onToggleSelect) {
      onToggleSelect(entry.id);
    }
  };

  const handleSaveNote = (e?: React.FormEvent) => {
    e?.stopPropagation();
    if (onUpdateNote) {
      onUpdateNote(entry.id, noteDraft);
    }
    setIsEditingNote(false);
  };

  const handleCancelNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNoteDraft(entry.note || '');
    setIsEditingNote(false);
  };

  // --- Export Render (Flat Grid Cells) ---
  if (isExport) {
    // Determine margin-top for visual grouping (first row of entry, unless it's the absolute first entry of the export)
    const isFirstRowOfList = selectionIndex === 0; // Check passed index (0-based)
    const rowMarginClass = !isFirstRowOfList ? 'mt-6' : '';
    
    // Spacing Logic:
    // Subject: 
    //   Compact: pl-1 (Close to line)
    //   Default: pl-3 (Normal)
    //   Always: pr-8 (Gap to Numbers)
    const subjectPadding = variant === 'compact' ? 'pl-1' : 'pl-3';
    
    // Numbers: 
    //   Add px-4 for "a little bit of whitespace" width
    const numberCellClass = "px-4 whitespace-nowrap text-right text-gray-800 text-lg font-mono";

    // Indicator Line Color (matches app primary)
    const lineClass = "bg-indigo-400"; 

    return (
      <React.Fragment>
        {/* Debits */}
        {entry.debits.map((line, index) => {
          // Add margin-top only to the very first row of this entry
          const mt = index === 0 ? rowMarginClass : '';
          // Only show rounded top for line on first row
          const lineRounded = index === 0 ? 'rounded-t-sm' : '';
          
          return (
            <React.Fragment key={line.id}>
              {/* Col 1: Indicator */}
              <div className={`w-full ${lineClass} ${mt} ${lineRounded}`} />
              
              {/* Col 2: Subject */}
              <div className={`text-gray-900 font-bold font-sans truncate text-lg ${subjectPadding} pr-8 ${mt}`}>
                {line.subject}
              </div>

              {/* Col 3: Debit */}
              <div className={`${numberCellClass} ${mt}`}>
                {formatNumber(line.amount)}
              </div>

              {/* Col 4: Credit (Empty) */}
              <div className={`${mt}`} />
            </React.Fragment>
          );
        })}

        {/* Credits */}
        {entry.credits.map((line, index) => {
           // If there were no debits (unlikely), handle margin. Usually credits come after.
           // Credits just follow. No mt needed typically unless separate blocks desired, 
           // but traditionally credits attach to debits.
           const isLastRow = index === entry.credits.length - 1;
           const lineRounded = isLastRow ? 'rounded-b-sm' : '';

           return (
            <React.Fragment key={line.id}>
              {/* Col 1: Indicator */}
              <div className={`w-full ${lineClass} ${lineRounded}`} />
              
              {/* Col 2: Subject (Indented) */}
              <div className={`text-gray-900 font-bold font-sans truncate text-lg ${subjectPadding} pl-8 md:pl-12 pr-8`}>
                {line.subject}
              </div>

              {/* Col 3: Debit (Empty) */}
              <div />

              {/* Col 4: Credit */}
              <div className={numberCellClass}>
                {formatNumber(line.amount)}
              </div>
            </React.Fragment>
           );
        })}
      </React.Fragment>
    );
  }

  // --- Normal UI Render (Card) ---

  // Dynamic Styles based on isExport (Though this block is only for !isExport now)
  const gridClass = 'grid-cols-[1fr_auto_auto] gap-x-4';
  const subjectClass = 'break-words';

  if (variant === 'compact') {
    return (
      <div className="relative w-full pl-4 border-l-2 border-gray-600 font-mono text-base">
        {/* Compact Grid Layout */}
        <div className={`grid ${gridClass} gap-y-1 items-center`}>
          {/* Debits */}
          {entry.debits.map((line) => (
            <React.Fragment key={line.id}>
              <div className={`text-gray-900 font-medium tracking-wide leading-tight font-sans ${subjectClass}`}>
                {line.subject}
              </div>
              <div className="text-gray-800 text-right leading-tight whitespace-nowrap">
                {formatNumber(line.amount)}
              </div>
              <div className="text-right"></div>
            </React.Fragment>
          ))}

          {/* Credits */}
          {entry.credits.map((line) => (
            <React.Fragment key={line.id}>
              <div className={`text-gray-900 font-medium tracking-wide pl-6 leading-tight font-sans ${subjectClass}`}>
                {line.subject}
              </div>
              <div className="text-right"></div>
              <div className="text-gray-800 text-right leading-tight whitespace-nowrap">
                {formatNumber(line.amount)}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // --- Default Card Style ---

  return (
    <div 
      onClick={handleClick}
      className={`relative w-full bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 overflow-hidden transition-all duration-200
        ${selectable ? 'cursor-pointer hover:shadow-md' : 'hover:shadow-md'}
        ${selected ? 'ring-2 ring-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : 'border border-gray-100 dark:border-slate-700'}
      `}
    >
       {/* Paper lines decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-indigo-400 opacity-70"></div>
      
      {/* Selection Overlay / Badge */}
      {selectable && (
        <div className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          selected 
            ? 'bg-primary-500 text-white shadow-md scale-100' 
            : 'bg-gray-200 dark:bg-slate-700 text-transparent scale-90 opacity-70 hover:scale-100'
        }`}>
          {selected ? (
            <span className="font-bold font-mono text-sm">{selectionIndex}</span>
          ) : (
            <div className="w-3 h-3 rounded-full bg-white opacity-50" />
          )}
        </div>
      )}

      {/* Header: Date & Delete */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
          {dateStr}
        </span>
        {showDelete && onDelete && !selectable && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry.id);
            }}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="刪除紀錄"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Body: Grid Layout */}
      <div className={`grid ${gridClass} gap-y-2 font-mono text-base md:text-lg items-center`}>
        {/* Debits */}
        {entry.debits.map((line) => (
          <React.Fragment key={line.id}>
            <div className={`text-gray-800 dark:text-gray-100 font-medium tracking-wide font-sans ${subjectClass}`}>
              {line.subject}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-right whitespace-nowrap">
              {formatNumber(line.amount)}
            </div>
            <div className="text-gray-400 text-right"></div>
          </React.Fragment>
        ))}

        {/* Credits */}
        {entry.credits.map((line) => (
          <React.Fragment key={line.id}>
            <div className={`text-gray-800 dark:text-gray-100 font-medium tracking-wide pl-6 md:pl-10 font-sans ${subjectClass}`}>
              {line.subject}
            </div>
            <div className="text-gray-400 text-right"></div>
            <div className="text-gray-600 dark:text-gray-300 text-right whitespace-nowrap">
              {formatNumber(line.amount)}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Footer: Note & Totals */}
      <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
        
        {/* Left: Annotation/Note */}
        <div className="w-full sm:w-auto flex-1 mr-4">
          {isEditingNote ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                autoFocus
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="輸入註記..."
                className="w-full sm:w-48 px-2 py-1 text-sm rounded-md border border-primary-300 focus:ring-1 focus:ring-primary-500 outline-none bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNote();
                  if (e.key === 'Escape') handleCancelNote(e as any);
                }}
              />
              <button onClick={handleSaveNote} className="text-green-500 hover:text-green-600 p-1"><Check size={16} /></button>
              <button onClick={handleCancelNote} className="text-red-400 hover:text-red-500 p-1"><X size={16} /></button>
            </div>
          ) : (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                if (!selectable) setIsEditingNote(true);
              }}
              className={`group flex items-center gap-2 text-sm transition-colors ${
                selectable ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              {entry.note ? (
                <>
                  <Tag size={14} className="text-primary-400" />
                  <span className="font-bold text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    {entry.note}
                  </span>
                  {!selectable && <PenLine size={12} className="opacity-0 group-hover:opacity-50 text-gray-400" />}
                </>
              ) : (
                // Only show "Add Note" button if NOT exporting
                !selectable && !isExport && (
                  <span className="flex items-center gap-1 text-gray-400 hover:text-primary-500 transition-colors text-xs font-bold px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">
                    <PenLine size={12} />
                    新增註記
                  </span>
                )
              )}
            </div>
          )}
        </div>

        {/* Right: Totals */}
        <div className="flex justify-end text-xs text-gray-400 gap-6 font-mono whitespace-nowrap">
          <span>借方: {formatNumber(entry.totalDebit)}</span>
          <span>貸方: {formatNumber(entry.totalCredit)}</span>
        </div>
      </div>
    </div>
  );
};
