import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PromptProvider, usePrompt } from './PromptContext';
import { promptAPI } from '../utils/apiClient';

// 模拟promptAPI
jest.mock('../utils/apiClient', () => ({
  promptAPI: {
    getPrompts: jest.fn(),
    getPrompt: jest.fn(),
    createPrompt: jest.fn(),
    updatePrompt: jest.fn(),
    deletePrompt: jest.fn(),
    autoSavePrompt: jest.fn()
  }
}));

// 测试组件
const TestComponent = () => {
  const { 
    prompts, 
    currentPrompt, 
    saveHistory, 
    saveStatus, 
    setCurrentPrompt, 
    createPrompt, 
    autoSavePrompt 
  } = usePrompt();
  
  return (
    <div>
      <div data-testid="status">{saveStatus}</div>
      <div data-testid="history-count">{saveHistory.length}</div>
      
      <button 
        onClick={() => setCurrentPrompt({ id: 'test-id', content: 'Test content' })}
        data-testid="set-current"
      >
        设置当前提示词
      </button>
      
      <button 
        onClick={() => createPrompt({ title: 'Test', content: 'Test content' })}
        data-testid="create-prompt"
      >
        创建提示词
      </button>
      
      <button 
        onClick={() => autoSavePrompt(currentPrompt)}
        data-testid="auto-save"
      >
        手动触发自动保存
      </button>
      
      <div data-testid="prompts-count">{prompts.length}</div>
      {currentPrompt && (
        <div data-testid="current-prompt">{currentPrompt.content}</div>
      )}
    </div>
  );
};

describe('PromptContext', () => {
  beforeEach(() => {
    // 清除所有模拟函数的调用
    jest.clearAllMocks();
    
    // 默认模拟getPrompts返回空数组
    promptAPI.getPrompts.mockResolvedValue({ data: [] });
    
    // 模拟createPrompt成功
    promptAPI.createPrompt.mockResolvedValue({ 
      data: { id: 'new-id', title: 'Test', content: 'Test content' } 
    });
    
    // 模拟autoSavePrompt成功
    promptAPI.autoSavePrompt.mockResolvedValue({ 
      data: { id: 'test-id', content: 'Test content', timestamp: new Date().toISOString() } 
    });
  });
  
  test('应该能够添加和更新提示词', async () => {
    render(
      <PromptProvider>
        <TestComponent />
      </PromptProvider>
    );
    
    // 初始状态应该没有提示词
    expect(screen.getByTestId('prompts-count').textContent).toBe('0');
    
    // 点击创建提示词按钮
    fireEvent.click(screen.getByTestId('create-prompt'));
    
    // 验证createPrompt被调用
    expect(promptAPI.createPrompt).toHaveBeenCalledWith({ 
      title: 'Test', 
      content: 'Test content' 
    });
    
    // 等待提示词数量更新
    await waitFor(() => {
      expect(screen.getByTestId('prompts-count').textContent).toBe('1');
    });
  });
  
  test('应该能够设置当前提示词', async () => {
    render(
      <PromptProvider>
        <TestComponent />
      </PromptProvider>
    );
    
    // 初始状态应该没有当前提示词
    expect(screen.queryByTestId('current-prompt')).toBeNull();
    
    // 点击设置当前提示词按钮
    fireEvent.click(screen.getByTestId('set-current'));
    
    // 验证当前提示词已设置
    expect(screen.getByTestId('current-prompt').textContent).toBe('Test content');
  });
  
  test('应该能够自动保存提示词', async () => {
    // 使用假定时器
    jest.useFakeTimers();
    
    render(
      <PromptProvider>
        <TestComponent />
      </PromptProvider>
    );
    
    // 设置当前提示词
    fireEvent.click(screen.getByTestId('set-current'));
    
    // 初始状态应该是idle
    expect(screen.getByTestId('status').textContent).toBe('idle');
    
    // 点击手动触发自动保存按钮
    fireEvent.click(screen.getByTestId('auto-save'));
    
    // 验证autoSavePrompt被调用
    expect(promptAPI.autoSavePrompt).toHaveBeenCalledWith({ 
      id: 'test-id', 
      content: 'Test content' 
    });
    
    // 等待状态变为saving
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('saving');
    });
    
    // 等待状态变为saved
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('saved');
    });
    
    // 验证保存历史记录已更新
    expect(screen.getByTestId('history-count').textContent).toBe('1');
    
    // 恢复真实定时器
    jest.useRealTimers();
  });
  
  test('应该处理自动保存错误', async () => {
    // 模拟autoSavePrompt失败
    promptAPI.autoSavePrompt.mockRejectedValue(new Error('保存失败'));
    
    render(
      <PromptProvider>
        <TestComponent />
      </PromptProvider>
    );
    
    // 设置当前提示词
    fireEvent.click(screen.getByTestId('set-current'));
    
    // 点击手动触发自动保存按钮
    fireEvent.click(screen.getByTestId('auto-save'));
    
    // 等待状态变为error
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('error');
    });
  });
  
  test('应该在组件挂载时加载提示词', async () => {
    // 模拟getPrompts返回数据
    promptAPI.getPrompts.mockResolvedValue({ 
      data: [
        { id: '1', title: 'Prompt 1', content: 'Content 1' },
        { id: '2', title: 'Prompt 2', content: 'Content 2' }
      ] 
    });
    
    render(
      <PromptProvider>
        <TestComponent />
      </PromptProvider>
    );
    
    // 验证getPrompts被调用
    expect(promptAPI.getPrompts).toHaveBeenCalled();
    
    // 等待提示词数量更新
    await waitFor(() => {
      expect(screen.getByTestId('prompts-count').textContent).toBe('2');
    });
  });
}); 