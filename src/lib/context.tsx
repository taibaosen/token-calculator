import { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction } from './types';

// 初始状态
const initialState: AppState = {
  text: '',
  model: 'GPT-4o',
  currency: 'USD ($)',
  outputRatio: 50,
  result: null,
  optimizationResult: null,
  history: [],
  activeTab: 'calculator',
  settings: {
    theme: 'system',
    currency: 'USD ($)',
    outputRatio: 50
  }
};

// Reducer函数
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_TEXT':
      // 当文本变化时，清空优化结果
      return { ...state, text: action.payload, optimizationResult: null };
    case 'SET_MODEL':
      return { ...state, model: action.payload };
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'SET_OUTPUT_RATIO':
      return { ...state, outputRatio: action.payload };
    case 'SET_RESULT':
      return { ...state, result: action.payload };
    case 'SET_OPTIMIZATION_RESULT':
      return { ...state, optimizationResult: action.payload };
    case 'ADD_HISTORY_ITEM':
      return { 
        ...state, 
        history: [action.payload, ...state.history] 
      };
    case 'UPDATE_HISTORY_ITEM':
      return {
        ...state,
        history: state.history.map(item => 
          item.id === action.payload.id 
            ? { ...item, ...action.payload.updates } 
            : item
        )
      };
    case 'REMOVE_HISTORY_ITEM':
      return {
        ...state,
        history: state.history.filter(item => item.id !== action.payload)
      };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload } 
      };
    case 'SET_HISTORY':
      return { ...state, history: action.payload };
    default:
      return state;
  }
};

// 创建Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// Provider组件
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// 自定义Hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
