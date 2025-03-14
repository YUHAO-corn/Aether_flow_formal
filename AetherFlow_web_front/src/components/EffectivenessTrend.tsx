import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';

interface EffectivenessTrendProps {
  data: {
    date: string;
    score: number;
  }[];
  expanded: boolean;
}

interface DataPoint {
  date: Date;
  score: number;
}

const EffectivenessTrend: React.FC<EffectivenessTrendProps> = ({ data, expanded }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Parse dates
    const parsedData: DataPoint[] = data.map(d => ({
      date: new Date(d.date),
      score: d.score
    }));

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(parsedData, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);

    // Create line generator
    const lineGenerator = d3.line<DataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.score))
      .curve(d3.curveMonotoneX);

    // Create area generator for gradient fill
    const areaGenerator = d3.area<DataPoint>()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(d.score))
      .curve(d3.curveMonotoneX);

    // Create group for chart
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'effectiveness-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(124, 58, 237, 0.8)'); // Purple

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(124, 58, 237, 0.1)');

    // Add area
    g.append('path')
      .datum(parsedData)
      .attr('fill', 'url(#effectiveness-gradient)')
      .attr('d', areaGenerator);

    // Add line
    g.append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', '#9333ea') // Purple
      .attr('stroke-width', 3)
      .attr('d', lineGenerator);

    // Add data points with glow effect
    g.selectAll('.data-point')
      .data(parsedData)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.score))
      .attr('r', 5)
      .attr('fill', '#9333ea')
      .attr('filter', 'url(#glow)');

    // Create glow filter
    const filter = svg.append('defs')
      .append('filter')
      .attr('id', 'glow');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(expanded ? 10 : 5)
      .tickFormat(d3.timeFormat('%b %d'));

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d * 100}%`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .attr('color', '#9CA3AF') // Gray-400
      .call(xAxis);

    g.append('g')
      .attr('color', '#9CA3AF') // Gray-400
      .call(yAxis);

    // Add axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '12px')
      .text('Date');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '12px')
      .text('Effectiveness Score');

    // Add tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', '#1F2937')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    g.selectAll('.data-point-hover')
      .data(parsedData)
      .enter()
      .append('circle')
      .attr('class', 'data-point-hover')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.score))
      .attr('r', 10)
      .attr('fill', 'transparent')
      .on('mouseover', function(event, d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip.html(`
          <div>
            <div>Date: ${(d as DataPoint).date.toLocaleDateString()}</div>
            <div>Score: ${((d as DataPoint).score * 100).toFixed(1)}%</div>
          </div>
        `)
          .style('left', `${(event as MouseEvent).pageX + 10}px`)
          .style('top', `${(event as MouseEvent).pageY - 28}px`);
      })
      .on('mouseout', function() {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Add trend line
    if (parsedData.length > 1) {
      // Simple linear regression
      const xMean = d3.mean(parsedData, d => d.date.getTime()) as number;
      const yMean = d3.mean(parsedData, d => d.score) as number;
      
      const ssxy = d3.sum(parsedData, d => (d.date.getTime() - xMean) * (d.score - yMean));
      const ssxx = d3.sum(parsedData, d => Math.pow(d.date.getTime() - xMean, 2));
      
      const slope = ssxy / ssxx;
      const intercept = yMean - slope * xMean;
      
      const trendLine: DataPoint[] = [
        { date: parsedData[0].date, score: slope * parsedData[0].date.getTime() + intercept },
        { date: parsedData[parsedData.length - 1].date, score: slope * parsedData[parsedData.length - 1].date.getTime() + intercept }
      ];
      
      g.append('path')
        .datum(trendLine)
        .attr('fill', 'none')
        .attr('stroke', '#F59E0B') // Amber-500
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', lineGenerator);
    }

    // Add annotations for significant improvements
    const significantPoints = parsedData.filter((d, i) => {
      if (i === 0) return false;
      return d.score - parsedData[i - 1].score > 0.1; // 10% improvement
    });

    g.selectAll('.annotation')
      .data(significantPoints)
      .enter()
      .append('g')
      .attr('class', 'annotation')
      .attr('transform', d => `translate(${xScale(d.date)},${yScale(d.score) - 15})`)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('fill', '#10B981') // Green-500
      .attr('font-size', '10px')
      .text(d => `+${((d.score - parsedData[parsedData.findIndex(p => p.date.getTime() === d.date.getTime()) - 1].score) * 100).toFixed(0)}%`);

    // Cleanup
    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [data, expanded]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-400">Effectiveness Score</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 border border-amber-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-400">Trend</span>
        </div>
      </div>
      
      <motion.div 
        className="flex-1 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg ref={svgRef} width="100%" height="100%" />
      </motion.div>
    </div>
  );
};

export default EffectivenessTrend; 