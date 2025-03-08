import React, { useRef, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';

interface GrowthTreeProps {
  data: {
    likes: number;
    metrics: {
      relevance: number;
      clarity: number;
      diversity: number;
      innovation: number;
      actionability: number;
    };
    totalPrompts: number;
  };
  expanded: boolean;
}

const GrowthTree: React.FC<GrowthTreeProps> = ({ data, expanded }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  
  // Animation for tree growth
  const growthProgress = useSpring({
    from: { progress: 0 },
    to: { progress: 1 },
    config: { duration: 3000, tension: 120, friction: 14 },
    delay: 300
  });
  
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = containerRef.current.offsetWidth;
    canvas.height = containerRef.current.offsetHeight;
    
    // Draw function that will be called on animation frame
    const draw = (progress: number) => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate metrics for tree size
      const avgMetric = Object.values(data.metrics).reduce((sum, val) => sum + val, 0) / 5;
      const likesFactor = Math.min(1, data.likes / 500); // Cap at 500 likes
      const promptsFactor = Math.min(1, data.totalPrompts / 200); // Cap at 200 prompts
      
      // Tree dimensions
      const treeHeight = canvas.height * 0.8 * progress;
      const baseWidth = canvas.width * 0.1;
      const baseX = canvas.width / 2;
      const baseY = canvas.height * 0.9;
      
      // Draw trunk
      ctx.beginPath();
      ctx.moveTo(baseX - baseWidth / 2, baseY);
      ctx.lineTo(baseX + baseWidth / 2, baseY);
      ctx.lineTo(baseX + baseWidth / 4, baseY - treeHeight * 0.4);
      ctx.lineTo(baseX - baseWidth / 4, baseY - treeHeight * 0.4);
      ctx.closePath();
      
      // Trunk gradient
      const trunkGradient = ctx.createLinearGradient(0, baseY, 0, baseY - treeHeight * 0.4);
      trunkGradient.addColorStop(0, 'rgba(97, 44, 26, 1)');
      trunkGradient.addColorStop(1, 'rgba(120, 53, 15, 1)');
      ctx.fillStyle = trunkGradient;
      ctx.fill();
      
      // Draw branches recursively
      const drawBranch = (x: number, y: number, length: number, angle: number, width: number, depth: number) => {
        if (depth > 5 || length < 5) return;
        
        const endX = x + Math.sin(angle) * length * progress;
        const endY = y - Math.cos(angle) * length * progress;
        
        // Draw branch
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = width;
        ctx.strokeStyle = depth > 3 ? 'rgba(52, 211, 153, 0.8)' : 'rgba(120, 53, 15, 0.9)';
        ctx.stroke();
        
        // Recursively draw smaller branches
        const newLength = length * 0.7;
        const newWidth = width * 0.7;
        
        // Branch spread based on metrics
        const spreadFactor = avgMetric * 0.5 + 0.3; // 0.3 to 0.8
        
        // More branches based on likes
        const branchCount = Math.floor(2 + likesFactor * 2); // 2 to 4 branches
        
        for (let i = 0; i < branchCount; i++) {
          const spreadAngle = (i / (branchCount - 1) - 0.5) * Math.PI * spreadFactor;
          drawBranch(endX, endY, newLength, angle + spreadAngle, newWidth, depth + 1);
        }
        
        // Draw leaves at the end of branches
        if (depth > 3) {
          const leafSize = 5 + avgMetric * 10; // 5 to 15
          const leafCount = Math.floor(3 + promptsFactor * 7); // 3 to 10 leaves
          
          for (let i = 0; i < leafCount; i++) {
            const leafAngle = angle + (Math.random() - 0.5) * Math.PI;
            const leafDistance = Math.random() * length * 0.5;
            const leafX = endX + Math.sin(leafAngle) * leafDistance * progress;
            const leafY = endY - Math.cos(leafAngle) * leafDistance * progress;
            
            // Leaf color based on metrics
            const hue = 120 + (data.metrics.innovation - 0.5) * 60; // 90 to 150 (green to teal)
            const saturation = 70 + data.metrics.diversity * 30; // 70% to 100%
            const lightness = 40 + data.metrics.clarity * 20; // 40% to 60%
            
            ctx.beginPath();
            ctx.arc(leafX, leafY, leafSize * progress, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.7)`;
            ctx.fill();
          }
        }
      };
      
      // Start drawing branches from the top of the trunk
      const initialBranchLength = treeHeight * 0.3;
      const initialBranchWidth = baseWidth * 0.3;
      
      // Draw main branches
      drawBranch(baseX, baseY - treeHeight * 0.4, initialBranchLength, -Math.PI / 4, initialBranchWidth, 1);
      drawBranch(baseX, baseY - treeHeight * 0.4, initialBranchLength, -Math.PI / 2, initialBranchWidth, 1);
      drawBranch(baseX, baseY - treeHeight * 0.4, initialBranchLength, -3 * Math.PI / 4, initialBranchWidth, 1);
      
      // Draw ground/pot
      ctx.beginPath();
      ctx.ellipse(baseX, baseY, baseWidth * 1.2, baseWidth * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(107, 114, 128, 0.5)';
      ctx.fill();
      
      // Draw metrics text
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.textAlign = 'center';
      ctx.fillText(`Growth Score: ${Math.round(avgMetric * 100)}%`, baseX, baseY + 30);
    };
    
    // Animation loop
    let animationFrame: number;
    const animate = () => {
      draw(growthProgress.progress.get());
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [data, expanded, growthProgress.progress]);
  
  // Generate particles
  const particles = Array.from({ length: 30 }, (_, i) => {
    const size = Math.random() * 4 + 2;
    const duration = Math.random() * 10 + 5;
    const delay = Math.random() * 5;
    
    return (
      <animated.div
        key={i}
        className="absolute rounded-full bg-green-400/30"
        style={{
          width: size,
          height: size,
          left: `${Math.random() * 100}%`,
          bottom: 0,
          opacity: growthProgress.progress.to(p => Math.min(1, p * 2) * 0.7),
          transform: growthProgress.progress.to(
            p => `translateY(${-Math.min(1, p * 2) * Math.random() * 100}px) translateX(${(Math.random() - 0.5) * 50 * Math.min(1, p * 2)}px)`
          ),
          transition: `transform ${duration}s ease-out ${delay}s, opacity ${duration}s ease-out ${delay}s`
        }}
      />
    );
  });
  
  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles}
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800/80 rounded-lg px-3 py-2 flex items-center space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-gray-300">Foliage Density: Quality</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-amber-700 mr-2"></div>
          <span className="text-gray-300">Tree Height: Likes</span>
        </div>
      </div>
    </div>
  );
};

export default GrowthTree;