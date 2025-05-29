import { HistoryItem, AppSettings } from './types';

// 本地存储服务
export class StorageService {
  private readonly HISTORY_KEY = 'token_calculator_history';
  private readonly SETTINGS_KEY = 'token_calculator_settings';
  
  // 保存历史记录
  public async saveHistoryItem(item: HistoryItem): Promise<void> {
    try {
      const history = await this.getHistory();
      const updatedHistory = [item, ...history];
      
      // 限制历史记录数量为50条
      const limitedHistory = updatedHistory.slice(0, 50);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving history item:', error);
    }
  }
  
  // 获取所有历史记录
  public async getHistory(): Promise<HistoryItem[]> {
    try {
      const historyJson = localStorage.getItem(this.HISTORY_KEY);
      if (!historyJson) return [];
      
      return JSON.parse(historyJson) as HistoryItem[];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }
  
  // 更新历史记录
  public async updateHistoryItem(id: string, updates: Partial<HistoryItem>): Promise<void> {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error updating history item:', error);
    }
  }
  
  // 删除历史记录
  public async removeHistoryItem(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error removing history item:', error);
    }
  }
  
  // 清空历史记录
  public async clearHistory(): Promise<void> {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }
  
  // 保存设置
  public async saveSettings(settings: AppSettings): Promise<void> {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }
  
  // 获取设置
  public async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = localStorage.getItem(this.SETTINGS_KEY);
      if (!settingsJson) {
        // 默认设置
        return {
          theme: 'system',
          currency: 'USD ($)',
          outputRatio: 50
        };
      }
      
      return JSON.parse(settingsJson) as AppSettings;
    } catch (error) {
      console.error('Error getting settings:', error);
      // 默认设置
      return {
        theme: 'system',
        currency: 'USD ($)',
        outputRatio: 50
      };
    }
  }
}

// 导出单例
export const storageService = new StorageService();
