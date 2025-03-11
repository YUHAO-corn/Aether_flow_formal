import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { 
  BarChart2, 
  PieChart, 
  TrendingUp, 
  Clock, 
  Users, 
  Zap, 
  Award, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  Loader,
  MessageSquare,
  Save
} from 'lucide-react';

// 使用React.lazy懒加载重量级组件
const WordCloud = lazy(() => import('./WordCloud'));
const RadarChart = lazy(() => import('./RadarChart'));
const GrowthTree = lazy(() => import('./GrowthTree'));

// Sample data for analytics
const analyticsData = {
  totalPrompts: 128,
  activeUsers: 42,
  totalOptimizations: 87,
  averageRating: 4.7,
  promptsPerDay: [
    { date: '2023-05-01', count: 5 },
    { date: '2023-05-02', count: 8 },
    { date: '2023-05-03', count: 12 },
    { date: '2023-05-04', count: 7 },
    { date: '2023-05-05', count: 15 },
    { date: '2023-05-06', count: 10 },
    { date: '2023-05-07', count: 9 }
  ],
  topTags: [
    { name: 'Creative', count: 45 },
    { name: 'Technical', count: 38 },
    { name: 'Business', count: 32 },
    { name: 'Academic', count: 28 },
    { name: 'Personal', count: 25 },
    { name: 'Marketing', count: 22 },
    { name: 'Writing', count: 20 },
    { name: 'Coding', count: 18 },
    { name: 'Design', count: 15 },
    { name: 'Research', count: 12 }
  ],
  qualityMetrics: {
    labels: ['相关性', '清晰度', '多样性', '创新性', '可操作性'],
    datasets: [
      {
        label: '提示词质量评分',
        data: [0.85, 0.92, 0.78, 0.88, 0.81],
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        borderColor: 'rgba(139, 92, 246, 0.8)',
        borderWidth: 2
      }
    ]
  },
  responseQualityRatings: [
    { rating: 5, count: 42 },
    { rating: 4, count: 35 },
    { rating: 3, count: 15 },
    { rating: 2, count: 5 },
    { rating: 1, count: 3 }
  ],
  usageByPlatform: [
    { platform: 'ChatGPT', count: 65 },
    { platform: 'Claude', count: 32 },
    { platform: 'Bard', count: 18 },
    { platform: 'Bing', count: 13 }
  ],
  usageByTime: {
    morning: 35,
    afternoon: 48,
    evening: 32,
    night: 13
  },
  activityHeatmap: [
    { date: '2023-05-01', count: 5 },
    { date: '2023-05-02', count: 8 },
    { date: '2023-05-03', count: 12 },
    { date: '2023-05-04', count: 7 },
    { date: '2023-05-05', count: 15 },
    { date: '2023-05-06', count: 10 },
    { date: '2023-05-07', count: 9 },
    { date: '2023-05-08', count: 11 },
    { date: '2023-05-09', count: 6 },
    { date: '2023-05-10', count: 8 },
    { date: '2023-05-11', count: 14 },
    { date: '2023-05-12', count: 9 },
    { date: '2023-05-13', count: 7 },
    { date: '2023-05-14', count: 5 }
  ]
};

// 创建简单的热力图组件替代react-calendar-heatmap
const SimpleHeatmap = ({ data, startDate, endDate }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 100;
    const cellSize = Math.min(width / 30, 15);
    const cellGap = 2;
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    container.appendChild(svg);
    
    // 找到最大值用于颜色比例
    const maxCount = Math.max(...data.map(d => d.count));
    
    // 绘制热力图单元格
    data.forEach((item, index) => {
      const x = (index % 30) * (cellSize + cellGap);
      const y = Math.floor(index / 30) * (cellSize + cellGap);
      
      const intensity = item.count / maxCount;
      const color = `rgba(139, 92, 246, ${intensity * 0.8})`;
      
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', cellSize);
      rect.setAttribute('height', cellSize);
      rect.setAttribute('fill', color);
      rect.setAttribute('rx', '2');
      rect.setAttribute('ry', '2');
      
      // 添加提示信息
      rect.setAttribute('data-date', item.date);
      rect.setAttribute('data-count', item.count);
      
      // 添加悬停效果
      rect.addEventListener('mouseover', () => {
        rect.setAttribute('stroke', '#fff');
        rect.setAttribute('stroke-width', '1');
        
        // 显示提示信息
        const tooltip = document.createElement('div');
        tooltip.className = 'heatmap-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '4px 8px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '1000';
        tooltip.style.pointerEvents = 'none';
        tooltip.innerHTML = `${item.date}: ${item.count} 活动`;
        
        const rect = svg.getBoundingClientRect();
        tooltip.style.left = `${rect.left + x + cellSize / 2}px`;
        tooltip.style.top = `${rect.top + y - 25}px`;
        
        document.body.appendChild(tooltip);
        
        rect.addEventListener('mouseout', () => {
          rect.setAttribute('stroke', 'none');
          document.body.removeChild(tooltip);
        });
      });
      
      svg.appendChild(rect);
    });
  }, [data, startDate, endDate]);
  
  return <div ref={containerRef} className="w-full h-24"></div>;
};

// 创建简单的导出功能替代react-csv和jspdf
const exportToCSV = (data, filename) => {
  // 将数据转换为CSV格式
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(item => Object.values(item).join(',')).join('\n');
  const csvContent = `${headers}\n${rows}`;
  
  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // 创建下载链接
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 创建简单的PDF导出功能
const exportToPDF = (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  // 创建一个新窗口用于打印
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('请允许弹出窗口以导出PDF');
    return;
  }
  
  // 添加打印样式
  printWindow.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          h1 { color: #6366f1; }
          .card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .stat { font-size: 24px; font-weight: bold; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>AetherFlow 分析报告</h1>
        ${element.innerHTML}
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};

const AnalyticsDashboard: React.FC = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('week');
  const [isExporting, setIsExporting] = useState(false);
  
  // 切换卡片展开状态
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };
  
  // 导出CSV
  const handleExportCSV = () => {
    setIsExporting(true);
    
    try {
      // 导出提示词数据
      exportToCSV(
        analyticsData.promptsPerDay.map(item => ({
          日期: item.date,
          数量: item.count
        })),
        'aetherflow-prompts-data'
      );
      
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      console.error('导出CSV失败:', error);
      setIsExporting(false);
    }
  };
  
  // 导出PDF
  const handleExportPDF = () => {
    setIsExporting(true);
    
    try {
      exportToPDF('analytics-dashboard', 'aetherflow-analytics-report');
      
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      console.error('导出PDF失败:', error);
      setIsExporting(false);
    }
  };
  
  return (
    <div id="analytics-dashboard" className="p-6 bg-gray-900 text-white">
      {/* 标题和导出按钮 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">分析仪表盘</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FileSpreadsheet size={18} />
            <span>{isExporting ? '导出中...' : '导出CSV'}</span>
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FileText size={18} />
            <span>{isExporting ? '导出中...' : '导出PDF'}</span>
          </button>
        </div>
      </div>
      
      {/* 时间范围选择器 */}
      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setTimeRange('week')}
          className={`px-3 py-1 rounded-lg ${
            timeRange === 'week' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
          } transition-colors`}
        >
          本周
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`px-3 py-1 rounded-lg ${
            timeRange === 'month' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
          } transition-colors`}
        >
          本月
        </button>
        <button
          onClick={() => setTimeRange('year')}
          className={`px-3 py-1 rounded-lg ${
            timeRange === 'year' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
          } transition-colors`}
        >
          本年
        </button>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-900/30 rounded-lg">
              <MessageSquare size={24} className="text-purple-400" />
            </div>
            <span className="text-xs text-gray-400">提示词</span>
          </div>
          <h3 className="text-2xl font-bold">{analyticsData.totalPrompts}</h3>
          <p className="text-sm text-gray-400">总提示词数量</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-900/30 rounded-lg">
              <Users size={24} className="text-blue-400" />
            </div>
            <span className="text-xs text-gray-400">用户</span>
          </div>
          <h3 className="text-2xl font-bold">{analyticsData.activeUsers}</h3>
          <p className="text-sm text-gray-400">活跃用户数</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-yellow-900/30 rounded-lg">
              <Zap size={24} className="text-yellow-400" />
            </div>
            <span className="text-xs text-gray-400">优化</span>
          </div>
          <h3 className="text-2xl font-bold">{analyticsData.totalOptimizations}</h3>
          <p className="text-sm text-gray-400">提示词优化次数</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-900/30 rounded-lg">
              <Award size={24} className="text-green-400" />
            </div>
            <span className="text-xs text-gray-400">评分</span>
          </div>
          <h3 className="text-2xl font-bold">{analyticsData.averageRating}</h3>
          <p className="text-sm text-gray-400">平均评分</p>
        </div>
      </div>
      
      {/* 图表卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 标签云 */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="font-medium">热门标签</h2>
            <button
              onClick={() => toggleCardExpansion('tagCloud')}
              className="p-1 hover:bg-gray-700 rounded-full transition-colors"
            >
              {expandedCard === 'tagCloud' ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          </div>
          
          <div className={`p-6 ${expandedCard === 'tagCloud' ? 'h-96' : 'h-64'} transition-all duration-300`}>
            <Suspense fallback={<div className="flex items-center justify-center h-full">
              <Loader className="animate-spin" />
              <span className="ml-2">加载中...</span>
            </div>}>
              <WordCloud 
                tags={analyticsData.topTags} 
                expanded={expandedCard === 'tagCloud'} 
              />
            </Suspense>
          </div>
        </div>
        
        {/* 质量雷达图 */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="font-medium">提示词质量评分</h2>
            <button
              onClick={() => toggleCardExpansion('qualityRadar')}
              className="p-1 hover:bg-gray-700 rounded-full transition-colors"
            >
              {expandedCard === 'qualityRadar' ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          </div>
          
          <div className={`p-6 ${expandedCard === 'qualityRadar' ? 'h-96' : 'h-64'} transition-all duration-300`}>
            <Suspense fallback={<div className="flex items-center justify-center h-full">
              <Loader className="animate-spin" />
              <span className="ml-2">加载中...</span>
            </div>}>
              <RadarChart 
                data={analyticsData.qualityMetrics} 
              />
            </Suspense>
          </div>
        </div>
      </div>
      
      {/* 活动热力图 */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="font-medium">活动热力图</h2>
          <div className="flex items-center space-x-2">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm text-gray-400">过去14天</span>
          </div>
        </div>
        
        <div className="p-6">
          <SimpleHeatmap 
            data={analyticsData.activityHeatmap}
            startDate="2023-05-01"
            endDate="2023-05-14"
          />
        </div>
      </div>
      
      {/* 平台使用情况 */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="font-medium">平台使用情况</h2>
          <button
            onClick={() => toggleCardExpansion('platformUsage')}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            {expandedCard === 'platformUsage' ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4">
            {analyticsData.usageByPlatform.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(item.count / Math.max(...analyticsData.usageByPlatform.map(i => i.count))) * 100}%` 
                    }}
                  ></div>
                </div>
                <p className="text-sm font-medium">{item.platform}</p>
                <p className="text-xs text-gray-400">{item.count} 次使用</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 使用时间分布 */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="font-medium">使用时间分布</h2>
          <Clock size={18} className="text-gray-400" />
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(analyticsData.usageByTime).map(([time, count], index) => (
              <div key={index} className="text-center">
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(count / Math.max(...Object.values(analyticsData.usageByTime))) * 100}%` 
                    }}
                  ></div>
                </div>
                <p className="text-sm font-medium">
                  {time === 'morning' && '上午'}
                  {time === 'afternoon' && '下午'}
                  {time === 'evening' && '晚上'}
                  {time === 'night' && '深夜'}
                </p>
                <p className="text-xs text-gray-400">{count} 次使用</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;