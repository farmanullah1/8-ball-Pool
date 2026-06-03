import React, { useRef } from 'react';
import { useGameStore } from '../store/gameStore';

const SpinControl: React.FC = () => {
  const { cueSpin, setCueSpin, phase } = useGameStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== 'aiming') return;
    
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((clientY - rect.top) / rect.height) * 2 - 1;

    // Constrain to circle
    const dist = Math.sqrt(x * x + y * y);
    if (dist <= 1) {
      setCueSpin({ x, y });
    } else {
      setCueSpin({ x: x / dist, y: y / dist });
    }
  };

  if (phase !== 'aiming') return null;

  return (
    <div className="flex flex-col items-center gap-2 bg-slate-900/50 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-xl">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spin (English)</p>
      <div 
        ref={containerRef}
        className="relative w-20 h-20 rounded-full bg-white shadow-inner cursor-crosshair overflow-hidden border-2 border-slate-700"
        onMouseMove={(e) => e.buttons === 1 && handleMouseMove(e)}
        onMouseDown={handleMouseMove}
        onTouchMove={handleMouseMove}
      >
        {/* Ball Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 w-full h-px bg-black" />
          <div className="absolute left-1/2 h-full w-px bg-black" />
        </div>
        
        {/* Spin Indicator (Red Dot) */}
        <div 
          className="absolute w-3 h-3 bg-red-600 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ 
            left: `${(cueSpin.x + 1) * 50}%`, 
            top: `${(cueSpin.y + 1) * 50}%` 
          }}
        />
      </div>
      <button 
        onClick={() => setCueSpin({ x: 0, y: 0 })}
        className="text-[9px] text-blue-400 hover:text-blue-300 font-bold uppercase"
      >
        Reset
      </button>
    </div>
  );
};

export default SpinControl;
