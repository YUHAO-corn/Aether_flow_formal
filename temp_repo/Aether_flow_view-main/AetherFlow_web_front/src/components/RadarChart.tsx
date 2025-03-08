import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RadarChartProps {
  data: {
    relevance: number;
    clarity: number;
    diversity: number;
    innovation: number;
    actionability: number;
  };
  expanded: boolean;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, expanded }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [expanded]);
  
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Calculate center and radius
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    const levels = 5;
    ctx.strokeStyle = 'rgba(107, 114, 128, 0.3)';
    ctx.fillStyle = 'rgba(107, 114, 128, 0.1)';
    
    for (let i = 1; i <= levels; i++) {
      ctx.beginPath();
      const levelRadius = (radius / levels) * i;
      
      // Draw pentagon for each level
      for (let j = 0; j < 5; j++) {
        const angle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
        const x = centerX + levelRadius * Math.cos(angle);
        const y = centerY + levelRadius * Math.sin(angle);
        
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.stroke();
      if (i === levels) {
        ctx.fill();
      }
    }
    
    // Draw axes
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.6)';
    ctx.beginPath();
    
    const dimensions = ['relevance', 'clarity', 'diversity', 'innovation', 'actionability'];
    const dimensionLabels = ['Relevance', 'Clarity', 'Diversity', 'Innovation', 'Actionability'];
    
    dimensions.forEach((_, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      
      // Draw dimension labels
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = hoveredDimension === dimensions[i] ? 'rgba(167, 139, 250, 1)' : 'rgba(209, 213, 219, 1)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Position labels slightly outside the chart
      const labelRadius = radius * 1.1;
      const labelX = centerX + labelRadius * Math.cos(angle);
      const labelY = centerY + labelRadius * Math.sin(angle);
      
      ctx.fillText(dimensionLabels[i], labelX, labelY);
    });
    
    ctx.stroke();
    
    // Draw data
    ctx.beginPath();
    
    dimensions.forEach((dim, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const value = data[dim as keyof typeof data];
      const x = centerX + radius * value * Math.cos(angle);
      const y = centerY + radius * value * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.fill();
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
    ctx.stroke();
    
    // Draw data points
    dimensions.forEach((dim, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const value = data[dim as keyof typeof data];
      const x = centerX + radius * value * Math.cos(angle);
      const y = centerY + radius * value * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 5, 0,
      )
    }
    )
  }
  )
}