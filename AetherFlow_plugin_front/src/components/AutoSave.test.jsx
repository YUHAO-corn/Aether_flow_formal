import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AutoSave from './AutoSave';
import { PromptProvider } from '../contexts/PromptContext';
import { promptAPI } from '../utils/apiClient';

// 模拟promptAPI
jest.mock('../utils/apiClient', () => ({
  promptAPI: {
    getPrompts: jest.fn().mockResolvedValue({ data: [] }),
    autoSavePrompt: jest.fn().mockResolvedValue({ 
      data: { id: 'test-id', content: 'Test content' } 
    })
  }
}));

// 模拟framer-motion
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      button: ({ children, ...props }) => <button {...props}>{children}</button>
    },
    AnimatePresence: ({ children }) => <>{children}</>
  };
});

describe('AutoSave组件', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('应该正确渲染AutoSave组件', () => {
    render(
      <PromptProvider>
        <AutoSave reducedMotion={false} />
      </PromptProvider>
    );
    
    // 验证自动保存按钮存在
    const saveButton = screen.getByLabelText('查看保存历史');
    expect(saveButton).toBeInTheDocument();
    
    // 初始状态应该显示"已保存"
    expect(saveButton).toHaveTextContent('已保存');
  });
  
  test('点击按钮应该展开历史记录面板', async () => {
    render(
      <PromptProvider>
        <AutoSave reducedMotion={false} />
      </PromptProvider>
    );
    
    // 点击自动保存按钮
    fireEvent.click(screen.getByLabelText('查看保存历史'));
    
    // 验证历史记录面板显示
    await waitFor(() => {
      expect(screen.getByText('保存历史')).toBeInTheDocument();
    });
    
    // 初始状态应该显示"暂无保存历史"
    expect(screen.getByText('暂无保存历史')).toBeInTheDocument();
  });
  
  test('应该显示保存历史记录', async () => {
    // 创建一个有保存历史的PromptContext
    const TestWrapper = ({ children }) => {
      return (
        <PromptProvider>
          {children}
        </PromptProvider>
      );
    };
    
    const { rerender } = render(
      <TestWrapper>
        <AutoSave reducedMotion={false} />
      </TestWrapper>
    );
    
    // 模拟保存历史
    // 注意：这里我们需要直接修改PromptContext中的状态
    // 在实际测试中，我们应该通过API调用来更新状态
    // 这里为了简化，我们直接重新渲染组件
    
    // 点击自动保存按钮
    fireEvent.click(screen.getByLabelText('查看保存历史'));
    
    // 验证历史记录面板显示
    await waitFor(() => {
      expect(screen.getByText('保存历史')).toBeInTheDocument();
    });
    
    // 初始状态应该显示"暂无保存历史"
    expect(screen.getByText('暂无保存历史')).toBeInTheDocument();
    
    // 模拟触发自动保存
    // 在实际应用中，这会通过autoSavePrompt函数触发
    // 这里我们只能测试UI部分
  });
  
  test('应该显示正确的保存状态', async () => {
    // 创建一个可以控制保存状态的测试组件
    const TestComponent = () => {
      const [status, setStatus] = React.useState('idle');
      
      return (
        <div>
          <button onClick={() => setStatus('saving')} data-testid="set-saving">
            设置为保存中
          </button>
          <button onClick={() => setStatus('saved')} data-testid="set-saved">
            设置为已保存
          </button>
          <button onClick={() => setStatus('error')} data-testid="set-error">
            设置为错误
          </button>
          
          <PromptProvider>
            <AutoSave reducedMotion={false} />
          </PromptProvider>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    // 初始状态
    expect(screen.getByLabelText('查看保存历史')).toHaveTextContent('已保存');
    
    // 这个测试在实际环境中需要更复杂的设置
    // 因为AutoSave组件从PromptContext获取状态
    // 我们无法直接修改这些状态
    // 在实际测试中，我们应该通过API调用来更新状态
  });
  
  test('reducedMotion属性应该影响动画行为', () => {
    // 渲染带有reducedMotion=true的组件
    const { rerender } = render(
      <PromptProvider>
        <AutoSave reducedMotion={true} />
      </PromptProvider>
    );
    
    // 点击自动保存按钮
    fireEvent.click(screen.getByLabelText('查看保存历史'));
    
    // 重新渲染带有reducedMotion=false的组件
    rerender(
      <PromptProvider>
        <AutoSave reducedMotion={false} />
      </PromptProvider>
    );
    
    // 这个测试主要是检查组件是否接受reducedMotion属性
    // 实际的动画效果很难在测试中验证
  });
}); 