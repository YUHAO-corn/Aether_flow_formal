import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

interface Tag {
  name: string;
  count: number;
}

interface WordCloudProps {
  tags: Tag[];
  expanded: boolean;
}

const WordCloud: React.FC<WordCloudProps> = ({ tags, expanded }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // 使用useMemo缓存计算结果，避免重复计算
  const processedData = useMemo(() => {
    // 计算最大和最小值，用于缩放字体大小
    const maxCount = Math.max(...tags.map(tag => tag.count));
    const minCount = Math.min(...tags.map(tag => tag.count));
    
    // 字体大小范围
    const minFontSize = 12;
    const maxFontSize = expanded ? 40 : 28;
    
    // 处理数据，计算每个标签的字体大小
    return tags.map(tag => ({
      text: tag.name,
      size: minFontSize + ((tag.count - minCount) / (maxCount - minCount)) * (maxFontSize - minFontSize),
      count: tag.count,
      // 使用固定的颜色范围，避免每次渲染都生成新颜色
      color: `hsl(${(tag.name.length * 5) % 360}, 70%, ${50 + (tag.count / maxCount) * 20}%)`
    }));
  }, [tags, expanded]);
  
  // 使用useMemo缓存布局计算
  const dimensions = useMemo(() => {
    const width = expanded ? 800 : 600;
    const height = expanded ? 500 : 300;
    return { width, height };
  }, [expanded]);
  
  useEffect(() => {
    if (!svgRef.current || processedData.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const { width, height } = dimensions;
    
    // 创建词云布局
    const layout = cloud()
      .size([width, height])
      .words(processedData)
      .padding(5)
      .rotate(() => 0) // 不旋转单词，提高可读性
      .font("Inter")
      .fontSize(d => (d as any).size)
      .on("end", draw);
    
    // 启动布局计算
    layout.start();
    
    // 绘制词云
    function draw(words: any) {
      svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`)
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", "Inter, sans-serif")
        .style("fill", d => d.color)
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .text(d => d.text)
        .style("cursor", "pointer")
        .style("opacity", 0)
        .transition()
        .duration(500)
        .delay((d, i) => i * 20)
        .style("opacity", 1)
        .on("end", function() {
          // 添加悬停效果
          d3.select(this)
            .on("mouseover", function() {
              d3.select(this)
                .transition()
                .duration(200)
                .style("font-size", d => `${(d as any).size * 1.2}px`)
                .style("font-weight", "bold");
            })
            .on("mouseout", function() {
              d3.select(this)
                .transition()
                .duration(200)
                .style("font-size", d => `${(d as any).size}px`)
                .style("font-weight", "normal");
            });
        });
      
      // 添加提示信息
      svg.selectAll("text")
        .append("title")
        .text(d => `${d.text}: ${d.count} prompts`);
    }
    
    // 清理函数
    return () => {
      svg.selectAll("*").remove();
    };
  }, [processedData, dimensions]);
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default React.memo(WordCloud); // 使用React.memo避免不必要的重渲染