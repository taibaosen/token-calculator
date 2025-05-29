import { ThemeProvider } from './components/ui/theme-provider';
import { AppProvider, useAppContext } from './lib/context';
import TokenizerPanel from './components/TokenizerPanel';
import PromptOptimizer from './components/PromptOptimizer';
import HistoryManager from './components/HistoryManager';
import VisualizationPanel from './components/VisualizationPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { ModeToggle } from './components/ui/mode-toggle';
import { 
  Calculator, 
  History, 
  BarChart2, 
  Sparkles,
  Github
} from 'lucide-react';

// 创建一个包装组件来使用Context
const AppContent = () => {
  const { state, dispatch } = useAppContext();

  // 处理标签页切换
  const handleTabChange = (value: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: value });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            <h1 className="text-xl font-bold">Token 计算器</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <ModeToggle />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs value={state.activeTab} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span>计算器</span>
            </TabsTrigger>
            <TabsTrigger value="optimizer" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>优化建议</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>历史记录</span>
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>可视化</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="space-y-8">
            <TokenizerPanel />
          </TabsContent>
          
          <TabsContent value="optimizer" className="space-y-8">
            <PromptOptimizer />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-8">
            <HistoryManager />
          </TabsContent>
          
          <TabsContent value="visualization" className="space-y-8">
            <VisualizationPanel />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Token 计算器 - 隐私安全的本地 AI Token 计算与成本估算工具
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Token 计算器
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="token-calculator-theme">
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
