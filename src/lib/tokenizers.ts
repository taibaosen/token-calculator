import { TokenizerMode, TokenResult } from './types';

// 支持的模型列表 - 2025年指定主流AI模型（价格为每百万token）
const MODELS: Record<string, TokenizerMode> = {
  'GPT-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    encoding: 'cl100k_base',
    inputPrice: 10.0,
    outputPrice: 30.0
  },
  'o3': {
    id: 'o3',
    name: 'o3',
    encoding: 'cl100k_base',
    inputPrice: 10.0,
    outputPrice: 40.0
  },
  'o4-mini': {
    id: 'o4-mini',
    name: 'o4-mini',
    encoding: 'cl100k_base',
    inputPrice: 1.1,
    outputPrice: 4.4
  },
  'o4-mini-high': {
    id: 'o4-mini-high',
    name: 'o4-mini-high',
    encoding: 'cl100k_base',
    inputPrice: 1.1,
    outputPrice: 4.4
  },
  'Claude 4 Opus': {
    id: 'claude-4-opus',
    name: 'Claude 4 Opus',
    encoding: 'cl100k_base',
    inputPrice: 15.0,
    outputPrice: 75.0
  },
  'Claude 4 Sonnet': {
    id: 'claude-4-sonnet',
    name: 'Claude 4 Sonnet',
    encoding: 'cl100k_base',
    inputPrice: 3.0,
    outputPrice: 15.0
  },
  'Claude 3.7 Sonnet': {
    id: 'claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet',
    encoding: 'cl100k_base',
    inputPrice: 3.0,
    outputPrice: 15.0
  },
  'Gemini 2.5 Pro Preview': {
    id: 'gemini-2.5-pro-preview-05-06',
    name: 'Gemini 2.5 Pro Preview',
    encoding: 'cl100k_base',
    inputPrice: 1.25,
    outputPrice: 10.0
  },
  'DeepSeek Reasoner': {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    encoding: 'cl100k_base',
    inputPrice: 0.14,
    outputPrice: 2.19
  },
  'DeepSeek Chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    encoding: 'cl100k_base',
    inputPrice: 0.07,
    outputPrice: 1.1
  }
};

// 汇率
const EXCHANGE_RATES: Record<string, number> = {
  'USD ($)': 1,
  'CNY (¥)': 7.2,
  'EUR (€)': 0.92,
  'GBP (£)': 0.79,
  'JPY (¥)': 150.5
};

// 计算Token数量和成本
export function tokenize(text: string, modelId: string, currency: string = 'USD ($)'): TokenResult {
  if (!text) {
    return {
      count: { tokens: 0, characters: 0, words: 0 },
      cost: { inputCost: 0, outputCost: 0, totalCost: 0, currency: currency }
    };
  }

  // 获取模型信息
  const model = MODELS[modelId] || MODELS['GPT-4'];
  const exchangeRate = EXCHANGE_RATES[currency] || 1;

  // 简单估算token数量（实际应使用tiktoken库）
  // 英文约4个字符1个token，中文约1个字符1个token
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  
  // 检测中文字符比例
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
  
  // 根据中英文比例估算token数
  const tokens = Math.ceil(
    chineseChars.length + (characters - chineseChars.length) / 4
  );
  
  // 计算成本 - 价格单位为每百万(1M)token
  // 先计算美元价格，再乘以汇率转换为目标货币
  const inputCost = (tokens * model.inputPrice) / 1000000 * exchangeRate;
  const outputCost = (tokens * 0.5 * model.outputPrice) / 1000000 * exchangeRate;
  const totalCost = inputCost + outputCost;

  return {
    count: {
      tokens,
      characters,
      words
    },
    cost: {
      inputCost,
      outputCost,
      totalCost,
      currency
    }
  };
}
