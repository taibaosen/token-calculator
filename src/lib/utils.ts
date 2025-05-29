import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { debounce } from 'lodash';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { debounce };

export function formatNumber(num: number, precision: number = 2): string {
  return num.toFixed(precision);
}

export function formatCurrency(amount: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    CNY: '¥',
    EUR: '€',
    GBP: '£',
    JPY: '¥'
  };
  
  const symbol = currencySymbols[currency] || '';
  
  // 根据货币类型调整精度
  let precision = 2;
  if (currency === 'JPY') precision = 0;
  
  return `${symbol}${amount.toFixed(precision)}`;
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function calculateReadingTime(wordCount: number): string {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} 分钟`;
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function getContrastColor(hexColor: string): string {
  // 将十六进制颜色转换为RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // 如果亮度高于阈值，返回深色文本，否则返回浅色文本
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

export function downloadTextAsFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false);
}

export function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n');
  return lines.map(line => {
    // 简单的CSV解析，不处理引号内的逗号
    return line.split(',');
  });
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return function(...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      func(...args);
    }
  };
}
