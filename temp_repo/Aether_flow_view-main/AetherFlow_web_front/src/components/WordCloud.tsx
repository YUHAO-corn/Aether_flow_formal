import React, { useEffect, useRef, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import * as d3Cloud from 'd3-cloud';

interface WordCloudProps {
  tags: { name: string; count: number }[];
  expanded: boolean;
}

const WordCloud: React.FC<WordCloudProps> = ({ tags, expanded }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [words, setWords] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState(0);
  
  // Rotation animation
  const rotationAnimation = useSpring({
    from: { rotation: 0 },
    to: { rotation: 360 },
    config: { duration: 100000, tension: 120, friction: 14 },
    loop: true,
    reset: true
  });
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [expanded]);
  
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    
    // Normalize tag counts for sizing
    const maxCount = Math.max(...tags.map(tag => tag.count));
    const minCount = Math.min(...tags.map(tag => tag.count));
    const minSize = 14;
    const maxSize = expanded ? 48 : 32;
    
    // Create layout
    const layout = d3Cloud()
      .size([dimensions.width, dimensions.height])
      .words(tags.map(tag => ({
        text: tag.name,
        size: minSize + ((tag.count - minCount) / (maxCount - minCount)) * (maxSize - minSize),
        count: tag.count
      })))
      .padding(5)
      .rotate(() => Math.random() > 0.5 ? 0 : 90 * Math.round(Math.random()) - 45)
      .fontSize(d => d.size)
      .on('end', output => {
        setWords(output);
      });
    
    layout.start();
    
    // Rotate the cloud slightly every few seconds
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.1) % 360);
    }, 100);
    
    return () => clearInterval(interval);
  }, [tags, dimensions, expanded]);
  
  // Colors for the nebula effect
  const colors = [
    'text-blue-400', 'text-purple-400', 'text-indigo-400', 
    'text-violet-400', 'text-fuchsia-400', 'text-pink-400',
    'text-cyan-400', 'text-teal-400'
  ];
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => {
          const size = Math.random() * 3 + 1;
          const top = Math.random() * 100;
          const left = Math.random() * 100;
          const animationDuration = Math.random() * 10 + 10;
          const delay = Math.random() * 5;
          
          return (
            <div 
              key={i}
              className="absolute rounded-full bg-purple-400/30"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${top}%`,
                left: `${left}%`,
                animation: `float ${animationDuration}s ease-in-out ${delay}s infinite`,
                opacity: Math.random() * 0.5 + 0.2
              }}
            />
          );
        })}
      </div>
      
      {/* 3D Word Cloud */}
      <animated.div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: rotationAnimation.rotation.to(r => `rotateY(${r * 0.05}deg) rotateX(${Math.sin(r * 0.01) * 5}deg)`)
        }}
      >
        {words.map((word, i) => {
          const color = colors[i % colors.length];
          const fontSize = word.size;
          const opacity = 0.7 + (word.size / 48) * 0.3;
          
          return (
            <animated.div
              key={i}
              className={`absolute ${color} hover:text-white transition-all duration-300 cursor-pointer`}
              style={{
                fontSize: `${fontSize}px`,
                fontWeight: word.size > 24 ? 'bold' : 'normal',
                transform: `translate(${word.x}px, ${word.y}px) rotate(${word.rotate}deg)`,
                opacity,
                textShadow: `0 0 ${fontSize / 4}px currentColor`,
                zIndex: Math.floor(word.size)
              }}
            >
              {word.text}
            </animated.div>
          );
        })}
      </animated.div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-10px) translateX(5px);
          }
          50% {
            transform: translateY(5px) translateX(-5px);
          }
          75% {
            transform: translateY(10px) translateX(10px);
          }
        }
      `}</style>
    </div>
  );
};

export default WordCloud;