import React, { useState, useEffect, useRef } from 'react';
import './Panel.css';
import PromptLibrary from '../../components/PromptLibrary/PromptLibrary';
import PromptEnhancement from '../../components/PromptEnhancement/PromptEnhancement';
import PromptSave from '../../components/PromptSave/PromptSave';
import PromptImage from '../../components/PromptImage/PromptImage';

// 导航项类型
type NavItem = {
  id: string;
  name: string;
  icon: string;
};

const Panel: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('library');
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // 导航项
  const navItems: NavItem[] = [
    { id: 'library', name: '提示词库', icon: '📚' },
    { id: 'enhancement', name: '提示词优化', icon: '✨' },
    { id: 'save', name: '提示词保存', icon: '💾' },
    { id: 'image', name: '提示词图像', icon: '🖼️' },
  ];

  // 计算初始宽度为屏幕宽度的1/5
  useEffect(() => {
    const calculateWidth = () => {
      const screenWidth = window.innerWidth;
      const initialWidth = screenWidth / 5;
      setWidth(initialWidth);
      
      // 保存用户上次设置的宽度
      chrome.storage.local.get(['panelWidth'], (result) => {
        if (result.panelWidth) {
          setWidth(result.panelWidth);
        } else {
          setWidth(initialWidth);
        }
      });
      
      // 保存用户上次的折叠状态
      chrome.storage.local.get(['panelCollapsed'], (result) => {
        setIsCollapsed(!!result.panelCollapsed);
      });

      // 保存用户上次的活动标签
      chrome.storage.local.get(['activeTab'], (result) => {
        if (result.activeTab) {
          setActiveTab(result.activeTab);
        }
      });
    };

    calculateWidth();
    window.addEventListener('resize', calculateWidth);
    return () => window.removeEventListener('resize', calculateWidth);
  }, []);

  // 保存宽度到存储
  useEffect(() => {
    if (width > 0 && !isCollapsed) {
      chrome.storage.local.set({ panelWidth: width });
    }
  }, [width, isCollapsed]);

  // 保存折叠状态到存储
  useEffect(() => {
    chrome.storage.local.set({ panelCollapsed: isCollapsed });
  }, [isCollapsed]);

  // 保存活动标签到存储
  useEffect(() => {
    chrome.storage.local.set({ activeTab });
  }, [activeTab]);

  // 处理拖拽调整宽度
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      startWidthRef.current = width;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      const deltaX = startXRef.current - e.clientX;
      const newWidth = Math.max(200, Math.min(window.innerWidth / 3, startWidthRef.current + deltaX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const resizeElement = resizeRef.current;
    if (resizeElement) {
      resizeElement.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (resizeElement) {
        resizeElement.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [width]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // 渲染活动组件
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'library':
        return <PromptLibrary />;
      case 'enhancement':
        return <PromptEnhancement />;
      case 'save':
        return <PromptSave />;
      case 'image':
        return <PromptImage />;
      default:
        return <PromptLibrary />;
    }
  };

  return (
    <div 
      ref={panelRef}
      className={`panel ${isCollapsed ? 'collapsed' : ''}`}
      style={{ width: isCollapsed ? '20px' : `${width}px` }}
    >
      <div 
        ref={resizeRef}
        className="resize-handle"
      />
      
      <div className="toggle-button" onClick={toggleCollapse}>
        {isCollapsed ? '▶' : '◀'}
      </div>
      
      {!isCollapsed && (
        <div className="panel-content">
          <header className="panel-header">
            <h1>AetherFlow</h1>
          </header>
          
          <nav className="panel-nav">
            {navItems.map((item) => (
              <div 
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </div>
            ))}
          </nav>
          
          <main className="panel-main">
            {renderActiveComponent()}
          </main>
        </div>
      )}
    </div>
  );
};

export default Panel; 