import React, { useState, useEffect, useRef } from 'react';
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
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { CSVLink } from 'react-csv';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import WordCloud from './WordCloud';
import RadarChart from './RadarChart';
import EffectivenessTrend from './EffectivenessTrend';

// Sample data for analytics
const analyticsData = {
  totalPrompts: 128,
  totalResponses: 256,
  totalSavedPrompts: 86,
  totalPromptUsage: 512,
  totalConversations: 324,
  averageResponseTime: '1.2s',
  promptsLastWeek: 42,
  topTags: [
    { name: 'Creative', count: 45 },
    { name: 'Technical', count: 38 },
    { name: 'Business', count: 32 },
    { name: 'Educational', count: 28 },
    { name: 'Character', count: 22 },
    { name: 'Description', count: 18 },
    { name: 'Email', count: 15 },
    { name: 'Fantasy', count: 12 },
    { name: 'Guide', count: 10 },
    { name: 'Coding', count: 8 },
    { name: 'Fiction', count: 20 },
    { name: 'Non-fiction', count: 18 },
    { name: 'Academic', count: 15 },
    { name: 'Professional', count: 25 },
    { name: 'Casual', count: 22 },
    { name: 'Formal', count: 19 },
    { name: 'Narrative', count: 17 },
    { name: 'Instructional', count: 28 },
    { name: 'Persuasive', count: 14 },
    { name: 'Analytical', count: 21 },
    { name: 'Descriptive', count: 16 },
    { name: 'Expository', count: 12 }
  ],
  promptLengthDistribution: [
    { range: '0-50', count: 15 },
    { range: '51-100', count: 32 },
    { range: '101-200', count: 45 },
    { range: '201-500', count: 28 },
    { range: '500+', count: 8 }
  ],
  responseQualityRatings: [
    { rating: 5, count: 120 },
    { rating: 4, count: 85 },
    { rating: 3, count: 35 },
    { rating: 2, count: 12 },
    { rating: 1, count: 4 }
  ],
  weeklyActivity: [
    { day: 'Mon', count: 18 },
    { day: 'Tue', count: 22 },
    { day: 'Wed', count: 30 },
    { day: 'Thu', count: 25 },
    { day: 'Fri', count: 28 },
    { day: 'Sat', count: 15 },
    { day: 'Sun', count: 12 }
  ],
  qualityMetrics: {
    relevance: 0.85,
    clarity: 0.92,
    diversity: 0.78,
    innovation: 0.88,
    actionability: 0.72
  },
  usageTimeDistribution: Array.from({ length: 24 * 7 }, (_, i) => {
    const hour = i % 24;
    const day = Math.floor(i / 24);
    let count = Math.floor(Math.random() * 10);
    if (day < 5 && hour >= 9 && hour <= 17) {
      count += Math.floor(Math.random() * 15);
    }
    return {
      hour,
      day,
      count
    };
  }),
  dailyUsage: Array.from({ length: 365 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 365 + i);
    return {
      date,
      count: Math.floor(Math.random() * 10)
    };
  }),
  promptEffectiveness: [
    { date: '2023-01-01', score: 0.65 },
    { date: '2023-01-08', score: 0.68 },
    { date: '2023-01-15', score: 0.72 },
    { date: '2023-01-22', score: 0.71 },
    { date: '2023-01-29', score: 0.75 },
    { date: '2023-02-05', score: 0.79 },
    { date: '2023-02-12', score: 0.82 },
    { date: '2023-02-19', score: 0.80 },
    { date: '2023-02-26', score: 0.85 },
    { date: '2023-03-05', score: 0.88 },
    { date: '2023-03-12', score: 0.91 }
  ],
};

const AnalyticsDashboard: React.FC = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [animatedCounts, setAnimatedCounts] = useState({
    totalPrompts: 0,
    totalResponses: 0,
    totalSavedPrompts: 0,
    totalPromptUsage: 0,
    totalConversations: 0,
    promptsLastWeek: 0,
  });
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  });
  const csvLink = useRef<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Animate counters on component mount
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedCounts({
        totalPrompts: Math.floor(analyticsData.totalPrompts * progress),
        totalResponses: Math.floor(analyticsData.totalResponses * progress),
        totalSavedPrompts: Math.floor(analyticsData.totalSavedPrompts * progress),
        totalPromptUsage: Math.floor(analyticsData.totalPromptUsage * progress),
        totalConversations: Math.floor(analyticsData.totalConversations * progress),
        promptsLastWeek: Math.floor(analyticsData.promptsLastWeek * progress),
      });
      
      if (step >= steps) {
        clearInterval(timer);
        setAnimatedCounts({
          totalPrompts: analyticsData.totalPrompts,
          totalResponses: analyticsData.totalResponses,
          totalSavedPrompts: analyticsData.totalSavedPrompts,
          totalPromptUsage: analyticsData.totalPromptUsage,
          totalConversations: analyticsData.totalConversations,
          promptsLastWeek: analyticsData.promptsLastWeek,
        });
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  const toggleCardExpansion = (cardId: string) => {
    if (expandedCard === cardId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(cardId);
    }
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      if (csvLink.current) {
        csvLink.current.link.click();
      }
      setIsExporting(false);
    }, 1000);
  };

  const handleExportPDF = () => {
    setIsGeneratingPDF(true);
    setTimeout(() => {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('PromptMagic Analytics Report', 20, 20);
      
      // Add date range
      doc.setFontSize(12);
      doc.text(`Date Range: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`, 20, 30);
      
      // Add key metrics
      doc.setFontSize(16);
      doc.text('Key Metrics', 20, 45);
      
      const metricsData = [
        ['Total Prompts', analyticsData.totalPrompts.toString()],
        ['Total Responses', analyticsData.totalResponses.toString()],
        ['Total Saved Prompts', analyticsData.totalSavedPrompts.toString()],
        ['Total Prompt Usage', analyticsData.totalPromptUsage.toString()],
        ['Total Conversations', analyticsData.totalConversations.toString()],
        ['Average Response Time', analyticsData.averageResponseTime]
      ];
      
      (doc as any).autoTable({
        startY: 50,
        head: [['Metric', 'Value']],
        body: metricsData,
        theme: 'grid',
        headStyles: { fillColor: [102, 51, 153] }
      });
      
      // Add top tags
      doc.setFontSize(16);
      doc.text('Top Tags', 20, (doc as any).lastAutoTable.finalY + 20);
      
      const tagsData = analyticsData.topTags
        .slice(0, 10)
        .map(tag => [tag.name, tag.count.toString()]);
      
      (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 25,
        head: [['Tag', 'Count']],
        body: tagsData,
        theme: 'grid',
        headStyles: { fillColor: [102, 51, 153] }
      });
      
      // Add quality metrics
      doc.setFontSize(16);
      doc.text('Quality Metrics', 20, (doc as any).lastAutoTable.finalY + 20);
      
      const qualityData = [
        ['Relevance', (analyticsData.qualityMetrics.relevance * 100).toFixed(1) + '%'],
        ['Clarity', (analyticsData.qualityMetrics.clarity * 100).toFixed(1) + '%'],
        ['Diversity', (analyticsData.qualityMetrics.diversity * 100).toFixed(1) + '%'],
        ['Innovation', (analyticsData.qualityMetrics.innovation * 100).toFixed(1) + '%'],
        ['Actionability', (analyticsData.qualityMetrics.actionability * 100).toFixed(1) + '%']
      ];
      
      (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 25,
        head: [['Dimension', 'Score']],
        body: qualityData,
        theme: 'grid',
        headStyles: { fillColor: [102, 51, 153] }
      });
      
      // Save the PDF
      doc.save('promptmagic-analytics.pdf');
      setIsGeneratingPDF(false);
    }, 1500);
  };

  // Prepare CSV data
  const csvData = [
    ['Metric', 'Value'],
    ['Total Prompts', analyticsData.totalPrompts],
    ['Total Responses', analyticsData.totalResponses],
    ['Total Saved Prompts', analyticsData.totalSavedPrompts],
    ['Total Prompt Usage', analyticsData.totalPromptUsage],
    ['Total Conversations', analyticsData.totalConversations],
    ['Average Response Time', analyticsData.averageResponseTime],
    ['Prompts Last Week', analyticsData.promptsLastWeek],
    ['', ''],
    ['Quality Metrics', ''],
    ['Relevance', analyticsData.qualityMetrics.relevance],
    ['Clarity', analyticsData.qualityMetrics.clarity],
    ['Diversity', analyticsData.qualityMetrics.diversity],
    ['Innovation', analyticsData.qualityMetrics.innovation],
    ['Actionability', analyticsData.qualityMetrics.actionability],
    ['', ''],
    ['Top Tags', ''],
    ...analyticsData.topTags.map(tag => [tag.name, tag.count])
  ];

  // Card hover animation
  const cardHoverProps = useSpring({
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(1.02)' },
    config: { tension: 300, friction: 10 },
    reset: true
  });

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-2">
            <button 
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1 rounded-md transition-all duration-300 ${
                viewMode === 'weekly' 
                  ? 'bg-purple-900/50 text-purple-300' 
                  : 'hover:bg-gray-700'
              }`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 rounded-md transition-all duration-300 ${
                viewMode === 'monthly' 
                  ? 'bg-purple-900/50 text-purple-300' 
                  : 'hover:bg-gray-700'
              }`}
            >
              Monthly
            </button>
          </div>
          
          <div className="relative group">
            <button 
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-2 transition-all duration-300"
            >
              <Download size={18} />
              <span>Export</span>
              <ChevronDown size={16} />
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 hidden group-hover:block">
              <CSVLink 
                data={csvData} 
                filename="promptmagic-analytics.csv"
                className="hidden"
                ref={csvLink}
              />
              <button 
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 rounded-t-lg flex items-center space-x-2"
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Exporting CSV...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={16} />
                    <span>Export as CSV</span>
                  </>
                )}
              </button>
              <button 
                onClick={handleExportPDF}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 rounded-b-lg flex items-center space-x-2"
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    <span>Export as PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          className="bg-gray-800 border border-blue-900/30 rounded-xl p-5 hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Total Prompts</p>
              <p className="text-3xl font-bold mt-1">{animatedCounts.totalPrompts}</p>
            </div>
            <div className="p-2 bg-blue-900/30 rounded-lg text-blue-400">
              <BarChart2 size={20} />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-400 flex items-center">
            <TrendingUp size={16} className="mr-1" />
            <span>+12% from last month</span>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          className="bg-gray-800 border border-purple-900/30 rounded-xl p-5 hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Total Saved Prompts</p>
              <p className="text-3xl font-bold mt-1">{animatedCounts.totalSavedPrompts}</p>
            </div>
            <div className="p-2 bg-purple-900/30 rounded-lg text-purple-400">
              <Save size={20} />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-400 flex items-center">
            <TrendingUp size={16} className="mr-1" />
            <span>+18% from last month</span>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          className="bg-gray-800 border border-green-900/30 rounded-xl p-5 hover:shadow-lg hover:shadow-green-900/20 transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Total Prompt Usage</p>
              <p className="text-3xl font-bold mt-1">{animatedCounts.totalPromptUsage}</p>
            </div>
            <div className="p-2 bg-green-900/30 rounded-lg text-green-400">
              <Zap size={20} />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-400 flex items-center">
            <TrendingUp size={16} className="mr-1" />
            <span>30% higher than before</span>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          className="bg-gray-800 border border-yellow-900/30 rounded-xl p-5 hover:shadow-lg hover:shadow-yellow-900/20 transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Total Conversations</p>
              <p className="text-3xl font-bold mt-1">{animatedCounts.totalConversations}</p>
            </div>
            <div className="p-2 bg-yellow-900/30 rounded-lg text-yellow-400">
              <MessageSquare size={20} />
            </div>
          </div>
          <div className="mt-4 text-sm text-yellow-400 flex items-center">
            <TrendingUp size={16} className="mr-1" />
            <span>+8% from previous week</span>
          </div>
        </motion.div>
      </div>
      
      {/* Visualization Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Word Cloud (Tag Distribution) */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div 
            className="p-4 border-b border-gray-700 flex justify-between items-center cursor-pointer"
            onClick={() => toggleCardExpansion('tagCloud')}
          >
            <h2 className="font-medium">Tag Distribution</h2>
            <button className="text-gray-400 hover:text-white transition-colors duration-300">
              {expandedCard === 'tagCloud' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          
          <div className={`p-6 ${expandedCard === 'tagCloud' ? 'h-96' : 'h-64'} transition-all duration-300`}>
            <WordCloud 
              tags={analyticsData.topTags} 
              expanded={expandedCard === 'tagCloud'} 
            />
          </div>
        </div>
        
        {/* Prompt Quality Radar Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div 
            className="p-4 border-b border-gray-700 flex justify-between items-center cursor-pointer"
            onClick={() => toggleCardExpansion('qualityRadar')}
          >
            <h2 className="font-medium">Prompt Quality Metrics</h2>
            <button className="text-gray-400 hover:text-white transition-colors duration-300">
              {expandedCard === 'qualityRadar' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          
          <div className={`p-6 ${expandedCard === 'qualityRadar' ? 'h-96' : 'h-64'} transition-all duration-300`}>
            <RadarChart 
              data={analyticsData.qualityMetrics} 
              expanded={expandedCard === 'qualityRadar'} 
            />
          </div>
        </div>
      </div>
      
      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Usage Time Distribution Heat Map */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div 
            className="p-4 border-b border-gray-700 flex justify-between items-center cursor-pointer"
            onClick={() => toggleCardExpansion('usageHeatmap')}
          >
            <h2 className="font-medium">Usage Time Distribution</h2>
            <button className="text-gray-400 hover:text-white transition-colors duration-300">
              {expandedCard === 'usageHeatmap' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          
          <div className={`p-6 ${expandedCard === 'usageHeatmap' ? 'h-96' : 'h-64'} transition-all duration-300`}>
            <div className="w-full h-full">
              {viewMode === 'weekly' ? (
                <div className="w-full h-full flex flex-col">
                  <div className="flex justify-between mb-2">
                    <div className="text-sm text-gray-400">Day of Week</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-gray-400">Low</div>
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-blue-900/30 rounded-sm"></div>
                        <div className="w-3 h-3 bg-blue-700/50 rounded-sm"></div>
                        <div className="w-3 h-3 bg-blue-500/70 rounded-sm"></div>
                        <div className="w-3 h-3 bg-blue-300 rounded-sm"></div>
                      </div>
                      <div className="text-xs text-gray-400">High</div>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-24 grid-rows-7 gap-1">
                    {analyticsData.usageTimeDistribution.map((cell, index) => {
                      // Calculate color based on count
                      let bgColor = 'bg-blue-900/30';
                      if (cell.count > 15) bgColor = 'bg-blue-300';
                      else if (cell.count > 10) bgColor = 'bg-blue-500/70';
                      else if (cell.count > 5) bgColor = 'bg-blue-700/50';
                      
                      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      
                      return (
                        <div 
                          key={index}
                          className={`${bgColor} rounded-sm relative group`}
                        >
                          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-nowrap">
                            {dayNames[cell.day]} {cell.hour}:00 - {cell.count} prompts
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-2 flex justify-between">
                    <div className="text-xs text-gray-400">12am</div>
                    <div className="text-xs text-gray-400">6am</div>
                    <div className="text-xs text-gray-400">12pm</div>
                    <div className="text-xs text-gray-400">6pm</div>
                    <div className="text-xs text-gray-400">12am</div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full">
                  <div className="flex justify-between mb-2">
                    <div className="text-sm text-gray-400">Activity Calendar</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-gray-400">Less</div>
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-green-900/30 rounded-sm"></div>
                        <div className="w-3 h-3 bg-green-700/50 rounded-sm"></div>
                        <div className="w-3 h-3 bg-green-500/70 rounded-sm"></div>
                        <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
                      </div>
                      <div className="text-xs text-gray-400">More</div>
                    </div>
                  </div>
                  
                  <CalendarHeatmap
                    startDate={new Date(new Date().setDate(new Date().getDate() - 365))}
                    endDate={new Date()}
                    values={analyticsData.dailyUsage.map(day => ({
                      date: day.date,
                      count: day.count
                    }))}
                    classForValue={(value) => {
                      if (!value || value.count === 0) return 'color-empty';
                      if (value.count < 3) return 'color-scale-1';
                      if (value.count < 6) return 'color-scale-2';
                      if (value.count < 9) return 'color-scale-3';
                      return 'color-scale-4';
                    }}
                    tooltipDataAttrs={(value: any) => {
                      if (!value || !value.date) return null;
                      return {
                        'data-tip': `${value.date.toDateString()}: ${value.count} prompts`,
                      };
                    }}
                  />
                  
                  <style jsx>{`
                    :global(.react-calendar-heatmap) {
                      width: 100%;
                      height: 100%;
                    }
                    :global(.react-calendar-heatmap .color-empty) {
                      fill: rgba(31, 41, 55, 0.5);
                    }
                    :global(.react-calendar-heatmap .color-scale-1) {
                      fill: rgba(16, 185, 129, 0.3);
                    }
                    :global(.react-calendar-heatmap .color-scale-2) {
                      fill: rgba(16, 185, 129, 0.5);
                    }
                    :global(.react-calendar-heatmap .color-scale-3) {
                      fill: rgba(16, 185, 129, 0.7);
                    }
                    :global(.react-calendar-heatmap .color-scale-4) {
                      fill: rgba(16, 185, 129, 0.9);
                    }
                  `}</style>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Prompt Effectiveness Trend Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div 
            className="p-4 border-b border-gray-700 flex justify-between items-center cursor-pointer"
            onClick={() => toggleCardExpansion('promptEffectiveness')}
          >
            <h2 className="font-medium">Prompt Effectiveness Trend</h2>
            <button className="text-gray-400 hover:text-white transition-colors duration-300">
              {expandedCard === 'promptEffectiveness' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          
          <div className={`p-6 ${expandedCard === 'promptEffectiveness' ? 'h-96' : 'h-64'} transition-all duration-300`}>
            <EffectivenessTrend 
              data={analyticsData.promptEffectiveness} 
              expanded={expandedCard === 'promptEffectiveness'} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;