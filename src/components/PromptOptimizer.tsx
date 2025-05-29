import { useState } from 'react';
import { useAppContext } from '../lib/context';
import { analyzeText } from '../lib/optimizer';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { 
  Sparkles, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';

const PromptOptimizer = () => {
  const { state, dispatch } = useAppContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 分析文本并生成优化建议
  const analyze = async () => {
    if (!state.text.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = analyzeText(state.text);
      // 将分析结果保存到全局状态
      dispatch({ type: 'SET_OPTIMIZATION_RESULT', payload: result });
      
      // 在分析完成后保存到历史记录
      await saveToHistory();
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // 保存到历史记录的函数 - 从TokenizerPanel移植过来
  const saveToHistory = async () => {
    if (!state.text.trim() || !state.result) return;
    
    const historyItem = {
      id: crypto.randomUUID(),
      text: state.text,
      modelId: state.model,
      timestamp: Date.now(),
      result: state.result,
      starred: false
    };
    
    try {
      await import('../lib/storage').then(module => {
        const storageService = module.storageService;
        storageService.saveHistoryItem(historyItem);
        dispatch({ type: 'ADD_HISTORY_ITEM', payload: historyItem });
      });
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  // 应用优化建议
  const applySuggestion = (original: string, replacement: string) => {
    const newText = state.text.replace(new RegExp(original, 'g'), replacement);
    dispatch({ type: 'SET_TEXT', payload: newText });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Prompt 优化建议</CardTitle>
            <CardDescription>分析文本并提供优化建议，减少token使用</CardDescription>
          </div>
          <Button 
            onClick={analyze} 
            disabled={isAnalyzing || !state.text.trim()}
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                分析文本
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!state.text.trim() ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="h-12 w-12 mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">请先在Token计算器中输入文本</p>
          </div>
        ) : !state.optimizationResult ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">优化建议基于常见冗余词和重复词分析</p>
          </div>
        ) : (
          <div className="space-y-6">
            {state.optimizationResult.redundantPhrases.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">冗余词汇</h3>
                <div className="space-y-3">
                  {state.optimizationResult.redundantPhrases.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex-1">
                        <p className="font-medium">"{item.original}"</p>
                        <p className="text-sm text-muted-foreground">出现 {item.count} 次，可节省约 {item.tokenSavings} tokens</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">{item.replacement || '移除'}</Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => applySuggestion(item.original, item.replacement || '')}
                        >
                          应用
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {state.optimizationResult.repeatedPhrases.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">重复表达</h3>
                <div className="space-y-3">
                  {state.optimizationResult.repeatedPhrases.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex-1">
                        <p className="font-medium">"{item.phrase}"</p>
                        <p className="text-sm text-muted-foreground">重复 {item.count} 次，可考虑合并或简化</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // 高亮显示重复内容
                          const newText = state.text.replace(
                            new RegExp(`(${item.phrase})`, 'g'), 
                            '【$1】'
                          );
                          dispatch({ type: 'SET_TEXT', payload: newText });
                        }}
                      >
                        高亮显示
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-3">优化总结</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-md">
                  <p className="text-sm font-medium mb-1">当前Token数</p>
                  <p className="text-2xl font-bold">{state.result?.count.tokens || 0}</p>
                </div>
                <div className="p-3 border rounded-md">
                  <p className="text-sm font-medium mb-1">预计可节省</p>
                  <p className="text-2xl font-bold text-green-600">
                    {state.optimizationResult.totalTokenSavings} tokens
                    <span className="text-sm ml-1">
                      ({Math.round((state.optimizationResult.totalTokenSavings / (state.result?.count.tokens || 1)) * 100)}%)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          优化建议基于常见冗余表达和重复词分析
        </p>
      </CardFooter>
    </Card>
  );
};

export default PromptOptimizer;
