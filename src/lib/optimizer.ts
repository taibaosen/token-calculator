import { OptimizationSuggestion, RepeatedPhrase, OptimizationResult } from './types';

// 分析文本并提供优化建议
export function analyzeText(text: string): OptimizationResult {
  if (!text.trim()) {
    return {
      redundantPhrases: [],
      repeatedPhrases: [],
      totalTokenSavings: 0
    };
  }

  // 冗余词汇和短语列表
  const redundantPhrases: { phrase: string; replacement: string | null; tokenSavings: number }[] = [
    { phrase: '我认为', replacement: '', tokenSavings: 2 },
    { phrase: '我相信', replacement: '', tokenSavings: 2 },
    { phrase: '我觉得', replacement: '', tokenSavings: 2 },
    { phrase: '我想', replacement: '', tokenSavings: 1 },
    { phrase: '请注意', replacement: '', tokenSavings: 2 },
    { phrase: '值得注意的是', replacement: '', tokenSavings: 4 },
    { phrase: '需要指出的是', replacement: '', tokenSavings: 4 },
    { phrase: '毫无疑问', replacement: '', tokenSavings: 3 },
    { phrase: '显而易见', replacement: '', tokenSavings: 3 },
    { phrase: '众所周知', replacement: '', tokenSavings: 3 },
    { phrase: '实际上', replacement: '', tokenSavings: 2 },
    { phrase: '事实上', replacement: '', tokenSavings: 2 },
    { phrase: '总的来说', replacement: '', tokenSavings: 3 },
    { phrase: '总而言之', replacement: '', tokenSavings: 3 },
    { phrase: '简而言之', replacement: '', tokenSavings: 3 },
    { phrase: '换句话说', replacement: '', tokenSavings: 3 },
    { phrase: '换言之', replacement: '', tokenSavings: 2 },
    { phrase: '也就是说', replacement: '', tokenSavings: 3 },
    { phrase: '首先', replacement: '', tokenSavings: 1 },
    { phrase: '其次', replacement: '', tokenSavings: 1 },
    { phrase: '最后', replacement: '', tokenSavings: 1 },
    { phrase: '此外', replacement: '', tokenSavings: 1 },
    { phrase: '另外', replacement: '', tokenSavings: 1 },
    { phrase: '因此', replacement: '', tokenSavings: 1 },
    { phrase: '所以', replacement: '', tokenSavings: 1 },
    { phrase: '然而', replacement: '', tokenSavings: 1 },
    { phrase: '但是', replacement: '', tokenSavings: 1 },
    { phrase: '不过', replacement: '', tokenSavings: 1 },
    { phrase: '可以', replacement: '', tokenSavings: 1 },
    { phrase: '能够', replacement: '', tokenSavings: 1 },
    { phrase: '非常', replacement: '很', tokenSavings: 1 },
    { phrase: '十分', replacement: '很', tokenSavings: 1 },
    { phrase: '特别', replacement: '很', tokenSavings: 1 },
    { phrase: '极其', replacement: '很', tokenSavings: 1 },
    { phrase: '极为', replacement: '很', tokenSavings: 1 },
    { phrase: '极度', replacement: '很', tokenSavings: 1 },
    { phrase: '尤其', replacement: '', tokenSavings: 1 },
    { phrase: '格外', replacement: '', tokenSavings: 1 },
    { phrase: '相当', replacement: '', tokenSavings: 1 },
    { phrase: '比较', replacement: '', tokenSavings: 1 },
    { phrase: '稍微', replacement: '', tokenSavings: 1 },
    { phrase: '略微', replacement: '', tokenSavings: 1 },
    { phrase: '有点', replacement: '', tokenSavings: 1 },
    { phrase: '有些', replacement: '', tokenSavings: 1 },
    { phrase: '一些', replacement: '', tokenSavings: 1 },
    { phrase: '一点', replacement: '', tokenSavings: 1 },
    { phrase: '一下', replacement: '', tokenSavings: 1 },
    { phrase: '进行', replacement: '', tokenSavings: 1 },
    { phrase: '实施', replacement: '', tokenSavings: 1 },
    { phrase: '执行', replacement: '', tokenSavings: 1 },
    { phrase: '开展', replacement: '', tokenSavings: 1 },
    { phrase: '采取', replacement: '', tokenSavings: 1 },
    { phrase: '使用', replacement: '用', tokenSavings: 1 },
    { phrase: '利用', replacement: '用', tokenSavings: 1 },
    { phrase: '应用', replacement: '用', tokenSavings: 1 },
    { phrase: '考虑', replacement: '', tokenSavings: 1 },
    { phrase: '思考', replacement: '', tokenSavings: 1 },
    { phrase: '认为', replacement: '', tokenSavings: 1 },
    { phrase: '觉得', replacement: '', tokenSavings: 1 },
    { phrase: '感觉', replacement: '', tokenSavings: 1 },
    { phrase: '希望', replacement: '', tokenSavings: 1 },
    { phrase: '期望', replacement: '', tokenSavings: 1 },
    { phrase: '期待', replacement: '', tokenSavings: 1 },
    { phrase: '盼望', replacement: '', tokenSavings: 1 },
    { phrase: '渴望', replacement: '', tokenSavings: 1 },
  ];

  // 检测冗余词汇
  const redundantResults: OptimizationSuggestion[] = [];
  let totalTokenSavings = 0;

  redundantPhrases.forEach(({ phrase, replacement, tokenSavings }) => {
    const regex = new RegExp(phrase, 'g');
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    
    if (count > 0) {
      redundantResults.push({
        original: phrase,
        replacement: replacement,
        count,
        tokenSavings: tokenSavings * count
      });
      totalTokenSavings += tokenSavings * count;
    }
  });

  // 检测重复短语（4个词以上）
  const words = text.split(/\s+/);
  const phrases: Record<string, number> = {};
  const repeatedResults: RepeatedPhrase[] = [];

  // 检测重复短语
  for (let i = 0; i < words.length - 3; i++) {
    const phrase = words.slice(i, i + 4).join(' ');
    phrases[phrase] = (phrases[phrase] || 0) + 1;
  }

  // 筛选出重复的短语
  Object.entries(phrases)
    .filter(([_, count]) => count > 1)
    .sort(([_, countA], [__, countB]) => countB - countA)
    .slice(0, 5)  // 只取前5个最常见的重复短语
    .forEach(([phrase, count]) => {
      repeatedResults.push({
        phrase,
        count
      });
      // 估算重复短语可能节省的token数
      totalTokenSavings += Math.floor((count - 1) * phrase.length / 4);
    });

  // 检测过长句子
  const sentences = text.split(/[.!?。！？]/);
  const longSentences = sentences.filter(s => s.trim().length > 100);
  
  if (longSentences.length > 0) {
    redundantResults.push({
      original: '过长句子',
      replacement: '将长句拆分为多个短句',
      count: longSentences.length,
      tokenSavings: Math.floor(longSentences.length * 2)  // 估算每个长句拆分后可节省的token数
    });
    totalTokenSavings += Math.floor(longSentences.length * 2);
  }

  return {
    redundantPhrases: redundantResults,
    repeatedPhrases: repeatedResults,
    totalTokenSavings
  };
}
