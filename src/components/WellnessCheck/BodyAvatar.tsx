import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface BodyZone {
  id: string;
  name: string;
  path: string;
  metrics: {
    bodyFat?: number;
    muscleMass?: number;
  };
}

interface BodyAvatarProps {
  onZoneSelect: (zone: BodyZone | null) => void;
  selectedZone: BodyZone | null;
  healthData?: {
    bodyFat?: number;
    muscleMass?: number;
  };
}

const bodyZones: BodyZone[] = [
  { 
    id: 'head', 
    name: 'Head & Neck',
    path: 'M100,20 Q100,10 110,10 L130,10 Q140,10 140,20 L140,40 Q140,55 120,55 Q100,55 100,40 Z',
    metrics: { bodyFat: 8, muscleMass: 5 }
  },
  { 
    id: 'chest', 
    name: 'Chest',
    path: 'M80,60 L160,60 L165,100 L155,130 L85,130 L75,100 Z',
    metrics: { bodyFat: 15, muscleMass: 25 }
  },
  { 
    id: 'arms-left', 
    name: 'Left Arm',
    path: 'M75,65 L55,70 L35,140 L50,145 L70,90 L75,130 Z',
    metrics: { bodyFat: 12, muscleMass: 18 }
  },
  { 
    id: 'arms-right', 
    name: 'Right Arm',
    path: 'M165,65 L185,70 L205,140 L190,145 L170,90 L165,130 Z',
    metrics: { bodyFat: 12, muscleMass: 18 }
  },
  { 
    id: 'core', 
    name: 'Core & Abdomen',
    path: 'M85,130 L155,130 L150,200 L90,200 Z',
    metrics: { bodyFat: 20, muscleMass: 22 }
  },
  { 
    id: 'legs-left', 
    name: 'Left Leg',
    path: 'M90,200 L115,200 L110,320 L85,320 Z',
    metrics: { bodyFat: 18, muscleMass: 30 }
  },
  { 
    id: 'legs-right', 
    name: 'Right Leg',
    path: 'M125,200 L150,200 L155,320 L130,320 Z',
    metrics: { bodyFat: 18, muscleMass: 30 }
  },
];

export function BodyAvatar({ onZoneSelect, selectedZone, healthData }: BodyAvatarProps) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastX = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastX.current;
    setRotation(prev => prev + deltaX * 0.5);
    lastX.current = e.clientX;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    lastX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - lastX.current;
    setRotation(prev => prev + deltaX * 0.5);
    lastX.current = e.touches[0].clientX;
  };

  const handleZoneClick = (zone: BodyZone) => {
    if (selectedZone?.id === zone.id) {
      onZoneSelect(null);
    } else {
      onZoneSelect(zone);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      <motion.div
        style={{ 
          transform: `perspective(1000px) rotateY(${rotation}deg)`,
          transformStyle: 'preserve-3d'
        }}
        className="relative"
      >
        <svg
          viewBox="0 0 240 340"
          className="w-full h-full max-h-[300px]"
          style={{ maxWidth: '200px' }}
        >
          {/* Subtle glow effect */}
          <defs>
            <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--health))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--health))" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background glow */}
          <ellipse cx="120" cy="170" rx="100" ry="160" fill="url(#bodyGlow)" />
          
          {/* Body zones */}
          {bodyZones.map((zone) => (
            <motion.path
              key={zone.id}
              d={zone.path}
              fill={selectedZone?.id === zone.id 
                ? 'hsl(var(--health) / 0.6)' 
                : 'hsl(var(--health) / 0.25)'
              }
              stroke={selectedZone?.id === zone.id 
                ? 'hsl(var(--health))' 
                : 'hsl(var(--health) / 0.5)'
              }
              strokeWidth={selectedZone?.id === zone.id ? 2 : 1}
              className="cursor-pointer transition-all duration-200"
              whileHover={{ 
                fill: 'hsl(var(--health) / 0.5)',
                stroke: 'hsl(var(--health))',
              }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                handleZoneClick(zone);
              }}
              filter={selectedZone?.id === zone.id ? 'url(#glow)' : undefined}
            />
          ))}
        </svg>
      </motion.div>

      {/* Selected zone info tooltip */}
      {selectedZone && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-health/30 min-w-[150px]"
        >
          <p className="text-sm font-semibold text-center mb-2">{selectedZone.name}</p>
          <div className="flex justify-around gap-3 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">Body Fat</p>
              <p className="font-bold text-health">{selectedZone.metrics.bodyFat}%</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Muscle</p>
              <p className="font-bold text-health">{selectedZone.metrics.muscleMass}%</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rotation hint */}
      <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/60">
        Drag to rotate • Tap zones
      </p>
    </div>
  );
}
