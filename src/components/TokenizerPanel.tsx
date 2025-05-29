import { useState, useEffect } from 'react';
import { useAppContext } from '../lib/context';
import { tokenize } from '../lib/tokenizers';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  Share2, 
  History, 
  Sparkles,
  Trash2
} from 'lucide-react';

const TokenizerPanel = () => {
  const { state, dispatch } = useAppContext();
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  
  // 支持的模型列表 - 2025年指定主流AI模型
  const models = [
    'GPT-4o',
    'o3',
    'o4-mini',
    'o4-mini-high',
    'Claude 4 Opus',
    'Claude 4 Sonnet',
    'Claude 3.7 Sonnet',
    'Gemini 2.5 Pro Preview',
    'DeepSeek Reasoner',
    'DeepSeek Chat'
  ];
  
  // 支持的货币列表
  const currencies = [
    'USD ($)',
    'CNY (¥)',
    'EUR (€)',
    'GBP (£)',
    'JPY (¥)'
  ];
  
  // 计算token数量 - 改为useEffect以实时响应文本、模型和货币变化
  useEffect(() => {
    if (state.text.trim()) {
      const result = tokenize(state.text, state.model, state.currency);
      dispatch({ type: 'SET_RESULT', payload: result });
      
      // 移除自动保存历史记录的逻辑，改为仅在分析按钮点击后保存
    }
  }, [state.text, state.model, state.currency, dispatch]);

  // 生成分享链接
  const generateShareLink = () => {
    setIsGeneratingShareLink(true);
    try {
      const params = new URLSearchParams();
      params.set('text', state.text);
      params.set('model', state.model);
      params.set('ratio', state.outputRatio.toString());
      
      const url = `${window.location.origin}?${params.toString()}`;
      
      // 复制到剪贴板
      navigator.clipboard.writeText(url)
        .then(() => {
          alert('链接已复制到剪贴板');
        })
        .catch(err => {
          console.error('无法复制链接:', err);
        });
    } catch (error) {
      console.error('Error generating share link:', error);
    } finally {
      setIsGeneratingShareLink(false);
    }
  };

  // 清空文本
  const clearText = () => {
    dispatch({ type: 'SET_TEXT', payload: '' });
  };

  // 跳转到历史记录标签页
  const goToHistory = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'history' });
  };

  // 跳转到优化建议标签页
  const goToOptimizer = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'optimizer' });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Token 计算器</CardTitle>
            <CardDescription>计算文本的Token数量和估算API调用成本</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select
              value={state.model}
              onValueChange={(value) => dispatch({ type: 'SET_MODEL', payload: value })}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={state.currency}
              onValueChange={(value) => dispatch({ type: 'SET_CURRENCY', payload: value })}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="选择货币" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <Textarea 
            placeholder="在此输入或粘贴文本..."
            className="min-h-[200px] font-mono resize-y"
            value={state.text}
            onChange={(e) => dispatch({ type: 'SET_TEXT', payload: e.target.value })}
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute top-2 right-2"
            onClick={clearText}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-medium mb-2 flex items-center">
              <span>Token 数量</span>
            </div>
            <Progress value={state.result?.count.tokens || 0} max={8192} className="h-2 mb-1" />
            <div className="flex justify-between text-sm">
              <span>{state.result?.count.tokens || 0}</span>
              <span className="text-muted-foreground">模型上限: 8,192 tokens</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">字符数</div>
            <div className="text-2xl font-bold">{state.result?.count.characters || 0}</div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">词数</div>
            <div className="text-2xl font-bold">{state.result?.count.words || 0}</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2 flex justify-between">
            <span>输出/输入 Token 比例: {state.outputRatio}%</span>
          </div>
          <Slider 
            value={[state.outputRatio]} 
            min={0} 
            max={100} 
            step={1}
            onValueChange={(value) => dispatch({ type: 'SET_OUTPUT_RATIO', payload: value[0] })}
            className="mb-6"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-medium mb-2">输入成本</div>
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold">
                {state.result?.cost.inputCost.toFixed(6) || 0} {state.result?.cost.currency || state.currency}
              </div>
              <Badge variant="outline">{state.result?.count.tokens || 0} tokens</Badge>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">输出成本</div>
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold">
                {state.result?.cost.outputCost.toFixed(6) || 0} {state.result?.cost.currency || state.currency}
              </div>
              <Badge variant="outline">{Math.round((state.result?.count.tokens || 0) * state.outputRatio / 100)} tokens</Badge>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">总成本</div>
            <div className="text-xl font-bold">
              {state.result?.cost.totalCost.toFixed(6) || 0} {state.result?.cost.currency || state.currency}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={generateShareLink}
          disabled={isGeneratingShareLink || !state.text.trim()}
        >
          <Share2 className="h-4 w-4 mr-2" />
          生成分享链接
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={goToHistory}
          >
            <History className="h-4 w-4 mr-2" />
            历史记录
          </Button>
          <Button 
            variant="outline" 
            onClick={goToOptimizer}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            优化建议
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TokenizerPanel;
