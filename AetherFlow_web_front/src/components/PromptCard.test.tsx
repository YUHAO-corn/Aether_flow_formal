import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PromptCard from './PromptCard';

// 模拟props
const mockPrompt = {
  id: '1',
  content: '测试提示词内容',
  response: '测试回答内容',
  responseSummary: '测试回答摘要...',
  platform: 'test-platform',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  isFavorite: false,
  tags: [
    { id: 'tag1', name: '标签1', color: '#FF5733' },
    { id: 'tag2', name: '标签2', color: '#33FF57' }
  ]
};

// 模拟函数
const mockOnClick = vi.fn();
const mockOnFavorite = vi.fn();
const mockOnTagClick = vi.fn();
const mockOnEditTags = vi.fn();

describe('PromptCard组件', () => {
  it('正确渲染提示词卡片', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        onClick={mockOnClick}
        onFavorite={mockOnFavorite}
        onTagClick={mockOnTagClick}
        onEditTags={mockOnEditTags}
      />
    );

    // 验证提示词内容是否正确渲染
    expect(screen.getByText('测试提示词内容')).toBeInTheDocument();
    expect(screen.getByText('测试回答摘要...')).toBeInTheDocument();
    
    // 验证标签是否正确渲染
    expect(screen.getByText('标签1')).toBeInTheDocument();
    expect(screen.getByText('标签2')).toBeInTheDocument();
    
    // 验证平台信息是否正确渲染
    expect(screen.getByText('test-platform')).toBeInTheDocument();
    
    // 验证日期是否正确渲染
    const date = new Date(mockPrompt.createdAt).toLocaleDateString();
    expect(screen.getByText(date)).toBeInTheDocument();
  });

  it('点击卡片时调用onClick函数', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        onClick={mockOnClick}
        onFavorite={mockOnFavorite}
        onTagClick={mockOnTagClick}
        onEditTags={mockOnEditTags}
      />
    );

    // 点击卡片
    fireEvent.click(screen.getByText('测试提示词内容'));
    
    // 验证onClick函数是否被调用
    expect(mockOnClick).toHaveBeenCalledWith(mockPrompt);
  });

  it('点击收藏按钮时调用onFavorite函数', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        onClick={mockOnClick}
        onFavorite={mockOnFavorite}
        onTagClick={mockOnTagClick}
        onEditTags={mockOnEditTags}
      />
    );

    // 点击收藏按钮
    const favoriteButton = screen.getByRole('button', { name: /收藏/i });
    fireEvent.click(favoriteButton);
    
    // 验证onFavorite函数是否被调用
    expect(mockOnFavorite).toHaveBeenCalledWith(mockPrompt.id, true);
  });

  it('点击标签时调用onTagClick函数', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        onClick={mockOnClick}
        onFavorite={mockOnFavorite}
        onTagClick={mockOnTagClick}
        onEditTags={mockOnEditTags}
      />
    );

    // 点击标签
    fireEvent.click(screen.getByText('标签1'));
    
    // 验证onTagClick函数是否被调用
    expect(mockOnTagClick).toHaveBeenCalledWith('tag1');
  });

  it('双击标签区域时调用onEditTags函数', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        onClick={mockOnClick}
        onFavorite={mockOnFavorite}
        onTagClick={mockOnTagClick}
        onEditTags={mockOnEditTags}
      />
    );

    // 双击标签区域
    const tagContainer = screen.getByTestId('tag-container');
    fireEvent.doubleClick(tagContainer);
    
    // 验证onEditTags函数是否被调用
    expect(mockOnEditTags).toHaveBeenCalledWith(mockPrompt.id, mockPrompt.tags);
  });

  it('已收藏的提示词显示正确的收藏图标', () => {
    const favoritePrompt = {
      ...mockPrompt,
      isFavorite: true
    };

    render(
      <PromptCard
        prompt={favoritePrompt}
        onClick={mockOnClick}
        onFavorite={mockOnFavorite}
        onTagClick={mockOnTagClick}
        onEditTags={mockOnEditTags}
      />
    );

    // 验证收藏图标是否正确显示
    const favoriteButton = screen.getByRole('button', { name: /取消收藏/i });
    expect(favoriteButton).toBeInTheDocument();
  });
}); 