import { useState } from 'react';
import { useAppContext } from '../lib/context';
import { tokenize } from '../lib/tokenizers';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const VisualizationPanel = () => {
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState('distribution');
  
  // 分析文本并生成可视化数据
  const analyzeText = () => {
    if (!state.text || !state.result) return null;
    
    // 按段落分析
    const paragraphs = state.text.split(/\n\s*\n/);
    const paragraphTokens = paragraphs.map(p => {
      if (!p.trim()) return { text: '', tokens: 0 };
      const result = tokenize(p, state.model);
      return {
        text: p.substring(0, 50) + (p.length > 50 ? '...' : ''),
        tokens: result.count.tokens
      };
    }).filter(p => p.tokens > 0);
    
    // 计算总token
    const totalTokens = state.text ? state.result.count.tokens : 0;
    
    // 词频分析
    const words = state.text.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      if (word.length > 2) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    // 转换为图表数据
    const paragraphData = paragraphs.map((_, i) => ({
      name: `段落 ${i + 1}`,
      tokens: paragraphTokens[i]?.tokens || 0
    }));
    
    // 词频数据
    const wordFreqData = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({
        name: word,
        count
      }));
    
    // Token分布数据
    const tokenDistribution = [
      { name: '文本', value: state.result.count.tokens },
      { name: '预估输出', value: Math.round(state.result.count.tokens * state.outputRatio / 100) }
    ];
    
    return {
      paragraphData,
      wordFreqData,
      tokenDistribution,
      totalTokens
    };
  };
  
  const visualizationData = analyzeText();
  
  // 图表颜色
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>可视化分析</CardTitle>
            <CardDescription>Token分布和模型对比的可视化图表</CardDescription>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="distribution">Token分布</TabsTrigger>
              <TabsTrigger value="comparison">模型对比</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {!state.text ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">请先在Token计算器中输入文本</p>
          </div>
        ) : (
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="distribution" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Token分布</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={visualizationData?.tokenDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {visualizationData?.tokenDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">段落Token分布</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={visualizationData?.paragraphData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="tokens" fill="#8884d8" name="Token数" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">不同模型Token计数对比</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { name: 'GPT-4o', tokens: tokenize(state.text, 'GPT-4o').count.tokens },
                        { name: 'o3', tokens: tokenize(state.text, 'o3').count.tokens },
                        { name: 'Claude 4 Opus', tokens: tokenize(state.text, 'Claude 4 Opus').count.tokens },
                        { name: 'Claude 3.7 Sonnet', tokens: tokenize(state.text, 'Claude 3.7 Sonnet').count.tokens },
                        { name: 'DeepSeek Reasoner', tokens: tokenize(state.text, 'DeepSeek Reasoner').count.tokens }
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 100,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="tokens" fill="#82ca9d" name="Token数" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">不同模型成本对比 (USD)</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { name: 'GPT-4o', cost: tokenize(state.text, 'GPT-4o').cost.totalCost },
                        { name: 'o3', cost: tokenize(state.text, 'o3').cost.totalCost },
                        { name: 'Claude 4 Opus', cost: tokenize(state.text, 'Claude 4 Opus').cost.totalCost },
                        { name: 'Claude 3.7 Sonnet', cost: tokenize(state.text, 'Claude 3.7 Sonnet').cost.totalCost },
                        { name: 'DeepSeek Reasoner', cost: tokenize(state.text, 'DeepSeek Reasoner').cost.totalCost }
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 100,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip formatter={(value) => {
                        if (typeof value === 'number') {
                          return `$${value.toFixed(6)}`;
                        }
                        return value;
                      }} />
                      <Legend />
                      <Bar dataKey="cost" fill="#8884d8" name="成本 (USD)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default VisualizationPanel;
