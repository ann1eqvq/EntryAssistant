
export interface EntryLine {
  id: string;
  subject: string;
  amount: number;
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  debits: EntryLine[];
  credits: EntryLine[];
  totalDebit: number;
  totalCredit: number;
  note?: string; // New field for annotations
}

export type Theme = 'light' | 'dark';

export const LOCAL_STORAGE_KEY_HISTORY = 'journal_history_v1';
export const LOCAL_STORAGE_KEY_THEME = 'journal_theme_v1';
