import { useState } from 'react';
import { useAppContext } from '../lib/context';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { Badge } from "./ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { 
  Star, 
  Trash2, 
  Search, 
  Download, 
  FileJson, 
  FileSpreadsheet,
  Loader2
} from 'lucide-react';

const HistoryManager = () => {
  const { state, dispatch } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processingDelete, setProcessingDelete] = useState<string | null>(null);
  
  // 加载历史记录
  const loadHistory = async () => {
    try {
      const history = await import('../lib/storage').then(module => {
        const storageService = module.storageService;
        return storageService.getHistory();
      });
      dispatch({ type: 'SET_HISTORY', payload: history });
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };
  
  // 组件挂载时加载历史记录
  useState(() => {
    loadHistory();
  });
  
  // 过滤历史记录
  const filteredHistory = state.history.filter(item => 
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // 标记/取消标记收藏
  const toggleStar = async (id: string, starred: boolean) => {
    try {
      await import('../lib/storage').then(module => {
        const storageService = module.storageService;
        storageService.updateHistoryItem(id, { starred });
      });
      dispatch({ 
        type: 'UPDATE_HISTORY_ITEM', 
        payload: { id, updates: { starred } } 
      });
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };
  
  // 删除单条历史记录
  const deleteHistoryItem = async (id: string) => {
    if (processingDelete) return; // 防止并发删除操作
    
    setProcessingDelete(id);
    try {
      await import('../lib/storage').then(module => {
        const storageService = module.storageService;
        storageService.removeHistoryItem(id);
      });
      dispatch({ type: 'REMOVE_HISTORY_ITEM', payload: id });
      
      // 重新加载历史记录以确保同步
      loadHistory();
    } catch (error) {
      console.error('Error deleting history item:', error);
    } finally {
      setProcessingDelete(null);
    }
  };
  
  // 清空所有历史记录
  const clearAllHistory = async () => {
    try {
      await import('../lib/storage').then(module => {
        const storageService = module.storageService;
        storageService.clearHistory();
      });
      dispatch({ type: 'CLEAR_HISTORY' });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };
  
  // 导出为CSV
  const exportToCSV = () => {
    const headers = ['日期', '模型', 'Token数', '文本预览', '成本'];
    const rows = filteredHistory.map(item => [
      new Date(item.timestamp).toLocaleString(),
      item.modelId,
      item.result.count.tokens,
      item.text.substring(0, 50) + (item.text.length > 50 ? '...' : ''),
      item.result.cost.totalCost.toFixed(6) + ' ' + item.result.cost.currency
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `token_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };
  
  // 导出为JSON
  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredHistory, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `token_history_${new Date().toISOString().split('T')[0]}.json`);
    link.click();
  };
  
  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}
${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>历史记录</CardTitle>
            <CardDescription>查看和管理过去的Token计算记录</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索历史记录..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={exportToCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              导出CSV
            </Button>
            <Button variant="outline" onClick={exportToJSON}>
              <FileJson className="h-4 w-4 mr-2" />
              导出JSON
            </Button>
            <Button variant="destructive" onClick={() => setIsDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              清空
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日期</TableHead>
              <TableHead>模型</TableHead>
              <TableHead>Token数</TableHead>
              <TableHead className="w-[40%]">文本预览</TableHead>
              <TableHead>成本</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">暂无历史记录</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">
                    {formatDate(item.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.modelId}</Badge>
                  </TableCell>
                  <TableCell>{item.result.count.tokens}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {item.text.substring(0, 50)}{item.text.length > 50 ? '...' : ''}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {item.result.cost.totalCost.toFixed(6)} {item.result.cost.currency}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStar(item.id, !item.starred)}
                      >
                        <Star className={`h-4 w-4 ${item.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          dispatch({ type: 'SET_TEXT', payload: item.text });
                          dispatch({ type: 'SET_MODEL', payload: item.modelId });
                          dispatch({ type: 'SET_ACTIVE_TAB', payload: 'calculator' });
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteHistoryItem(item.id)}
                        disabled={processingDelete !== null}
                      >
                        {processingDelete === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        <div className="mt-4 text-sm text-muted-foreground">
          显示 {filteredHistory.length} 条记录，共 {state.history.length} 条
        </div>
      </CardContent>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空历史记录</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除所有历史记录，且无法恢复。确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllHistory}>确认清空</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default HistoryManager;
