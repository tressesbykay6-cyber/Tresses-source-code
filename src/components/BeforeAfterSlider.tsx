import React, { useState, useRef, useCallback } from 'react';
import { Sliders } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  subtitle?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before Install',
  afterLabel = 'HD Melt Transformation',
  title,
  subtitle,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4 text-center sm:text-left">
          {title && <h3 className="font-serif text-2xl font-bold text-[#F6F0E4]">{title}</h3>}
          {subtitle && <p className="text-sm text-[#F6F0E4]/70 font-light mt-1">{subtitle}</p>}
        </div>
      )}

      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-[#C6A15B]/30 shadow-2xl group"
      >
        {/* After Image (Full width background) */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* After Badge */}
        <span className="absolute top-4 right-4 bg-[#0E0D0C]/80 text-[#C6A15B] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#C6A15B]/30 backdrop-blur-md z-10">
          {afterLabel}
        </span>

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
          />
          {/* Before Badge */}
          <span className="absolute top-4 left-4 bg-[#0E0D0C]/80 text-[#F6F0E4] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#F6F0E4]/20 backdrop-blur-md z-10">
            {beforeLabel}
          </span>
        </div>

        {/* Vertical Divider & Drag Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#C6A15B] z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#C6A15B] text-[#0E0D0C] flex items-center justify-center shadow-lg border-2 border-[#0E0D0C] cursor-grab active:cursor-grabbing">
            <Sliders className="w-5 h-5 rotate-90" />
          </div>
        </div>

        {/* Bottom Helper Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0E0D0C]/90 text-[#C6A15B] text-[11px] font-medium px-4 py-1 rounded-full border border-[#C6A15B]/30 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
          <span>Drag slider left or right to reveal transformation</span>
        </div>
      </div>
    </div>
  );
};
