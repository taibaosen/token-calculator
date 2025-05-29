# Token 计算器网站

## 项目概述

Token计算器是一个纯前端应用，用于快速、低成本、隐私安全地帮助用户统计AI模型token与估算调用成本。应用完全在浏览器端运行，无需任何后端服务，用户数据仅保存在本地。

### 主要功能

1. **多模型Token计算**：支持多种主流AI模型的token计算和成本估算
2. **实时计算**：边输入边计算token数和成本
3. **多币种支持**：支持USD、CNY、EUR、GBP、JPY等多种货币
4. **可视化分析**：提供Token分布和模型对比的可视化图表
5. **优化建议**：分析文本并提供优化建议
6. **历史记录**：保存历史计算记录

## 项目结构

```
token-calculator/
├── src/                      # 源代码目录
│   ├── components/           # 组件目录
│   │   ├── ui/               # UI组件库
│   │   ├── TokenizerPanel.tsx    # Token计算面板
│   │   ├── PromptOptimizer.tsx   # 优化建议面板
│   │   ├── HistoryManager.tsx    # 历史记录管理
│   │   └── VisualizationPanel.tsx # 可视化分析面板
│   ├── lib/                  # 核心逻辑库
│   │   ├── tokenizers.ts     # Token计算和成本估算逻辑
│   │   ├── types.ts          # 类型定义
│   │   ├── context.tsx       # 应用状态管理
│   │   ├── storage.ts        # 本地存储逻辑
│   │   ├── optimizer.ts      # 文本优化逻辑
│   │   └── utils.ts          # 工具函数
│   ├── hooks/                # 自定义Hooks
│   ├── assets/               # 静态资源
│   ├── App.tsx               # 应用主组件
│   └── main.tsx              # 应用入口
├── public/                   # 公共资源目录
├── index.html                # HTML模板
├── package.json              # 项目依赖配置
├── tsconfig.json             # TypeScript配置
├── vite.config.ts            # Vite配置
├── tailwind.config.js        # Tailwind CSS配置
├── postcss.config.js         # PostCSS配置
└── components.json           # UI组件配置
```

## 核心文件说明

- **src/lib/tokenizers.ts**: 包含token计算和成本估算的核心逻辑，定义了支持的模型列表和价格
- **src/lib/context.tsx**: 应用状态管理，使用React Context API实现
- **src/components/TokenizerPanel.tsx**: 主要的Token计算界面
- **src/components/VisualizationPanel.tsx**: 可视化分析界面
- **src/components/PromptOptimizer.tsx**: 文本优化建议界面
- **src/components/HistoryManager.tsx**: 历史记录管理界面

## 技术栈

- **React**: 前端框架
- **TypeScript**: 类型系统
- **Vite**: 构建工具
- **Tailwind CSS**: 样式框架
- **shadcn/ui**: UI组件库
- **Recharts**: 图表库

## 部署指南

### 开发环境

1. 安装依赖:
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

2. 启动开发服务器:
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 生产环境

1. 构建项目:
```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

2. 部署`dist`目录到任意静态网站托管服务

## 自定义与扩展

### 添加新模型

在`src/lib/tokenizers.ts`文件中的`MODELS`对象中添加新模型:

```typescript
'新模型名称': {
  id: '新模型ID',
  name: '新模型显示名称',
  encoding: 'cl100k_base', // 编码方式
  inputPrice: 0.00, // 每百万token的输入价格
  outputPrice: 0.00 // 每百万token的输出价格
}
```

然后在`src/components/TokenizerPanel.tsx`的`models`数组中添加新模型名称。

### 添加新货币

在`src/lib/tokenizers.ts`文件中的`EXCHANGE_RATES`对象中添加新货币:

```typescript
'新货币代码 (符号)': 汇率值,
```

然后在`src/components/TokenizerPanel.tsx`的`currencies`数组中添加新货币。

## 注意事项

- 应用使用本地存储保存历史记录和设置，清除浏览器缓存会导致这些数据丢失
- Token计算基于简化算法，可能与实际API调用有细微差异
- 价格基于官方公开的API价格，如有变动请及时更新`tokenizers.ts`中的价格信息
