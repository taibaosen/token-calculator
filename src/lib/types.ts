export interface TokenizerMode {
  id: string;
  name: string;
  encoding: string;
  inputPrice: number;
  outputPrice: number;
}

export interface TokenCount {
  tokens: number;
  characters: number;
  words: number;
}

export interface TokenCost {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
}

export interface TokenResult {
  count: TokenCount;
  cost: TokenCost;
}

export interface HistoryItem {
  id: string;
  text: string;
  modelId: string;
  timestamp: number;
  result: TokenResult;
  starred: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  outputRatio: number;
}

export interface OptimizationSuggestion {
  original: string;
  replacement: string | null;
  count: number;
  tokenSavings: number;
}

export interface RepeatedPhrase {
  phrase: string;
  count: number;
}

export interface OptimizationResult {
  redundantPhrases: OptimizationSuggestion[];
  repeatedPhrases: RepeatedPhrase[];
  totalTokenSavings: number;
}

export interface AppState {
  text: string;
  model: string;
  currency: string;
  outputRatio: number;
  result: TokenResult | null;
  optimizationResult: OptimizationResult | null;
  history: HistoryItem[];
  activeTab: string;
  settings: AppSettings;
}

export type AppAction =
  | { type: 'SET_TEXT'; payload: string }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'SET_OUTPUT_RATIO'; payload: number }
  | { type: 'SET_RESULT'; payload: TokenResult }
  | { type: 'SET_OPTIMIZATION_RESULT'; payload: OptimizationResult | null }
  | { type: 'ADD_HISTORY_ITEM'; payload: HistoryItem }
  | { type: 'UPDATE_HISTORY_ITEM'; payload: { id: string; updates: Partial<HistoryItem> } }
  | { type: 'REMOVE_HISTORY_ITEM'; payload: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_HISTORY'; payload: HistoryItem[] };
