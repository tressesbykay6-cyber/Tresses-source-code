import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { GalleryItem } from '../types';

interface GalleryViewProps {
  galleryItems: GalleryItem[];
  pageSettings: any;
  onOpenBooking?: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ galleryItems, pageSettings, onOpenBooking }) => {
  const [visibleCount, setVisibleCount] = useState(24);
  const [currentReel, setCurrentReel] = useState(0);
  const reelRef = useRef<HTMLVideoElement>(null);
  
  const gallerySettings = pageSettings?.gallery || {};

  // Extract reels and stills dynamically from state
  const reels = useMemo(() => {
    const videoUrls = galleryItems
      .filter(item => item.category === 'Videos' && item.videoUrl)
      .map(item => item.videoUrl as string);
    
    return videoUrls.length > 0 ? videoUrls : [
      'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-combing-a-clients-hair-41228-large.mp4'
    ];
  }, [galleryItems]);

  const images = useMemo(() => {
    return galleryItems.filter(item => item.category !== 'Videos');
  }, [galleryItems]);

  const changeReel = useCallback((step: number) => {
    setCurrentReel((current) => (current + step + reels.length) % reels.length);
  }, [reels.length]);

  useEffect(() => {
    const player = reelRef.current;
    if (!player) return;
    player.load();
    player.play().catch(() => undefined);
  }, [currentReel, reels]);

  const gridClass = (index: number) => {
    const pattern = index % 12;
    return pattern === 0 || pattern === 5 ? 'col-span-2 row-span-2' : pattern === 3 || pattern === 9 ? 'col-span-2' : '';
  };

  const revealRef = useScrollReveal();

  return (
    <div ref={revealRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14 animate-fade-in">
      <header className="reveal reveal-up text-center space-y-3 max-w-2xl mx-auto">
        <span className="eyebrow"><Sparkles className="w-4 h-4" /> {gallerySettings.introSubtitle || "Visual Lookbook"}</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#2F2924]">{gallerySettings.introTitle || "The Style Grid"}</h1>
        <p className="text-sm text-[#665B53] leading-relaxed font-light">{gallerySettings.introText || "A curated, fast-loading collection of real Tresses by Kay transformations."}</p>
      </header>

      <section aria-label="Featured video reel" className="reveal reveal-scale relative aspect-video rounded-3xl overflow-hidden border border-[#DECDBD] shadow-lg group bg-[#403833]">
        <video ref={reelRef} autoPlay muted playsInline preload="metadata" onEnded={() => changeReel(1)} className="w-full h-full object-cover grayscale brightness-95 contrast-125">
          <source src={reels[currentReel]} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#2F2924]/65 via-transparent to-[#2F2924]/15 pointer-events-none" />
        <button aria-label="Previous reel" onClick={() => changeReel(-1)} className="gallery-arrow left-3 sm:left-5"><ChevronLeft className="w-5 h-5" /></button>
        <button aria-label="Next reel" onClick={() => changeReel(1)} className="gallery-arrow right-3 sm:right-5"><ChevronRight className="w-5 h-5" /></button>
        <div className="absolute bottom-4 left-4 sm:left-6 text-[#FAF7F2]">
          <span className="eyebrow bg-[#2F2924]/75 text-[#FAF7F2] border-white/15"><Play className="w-3.5 h-3.5 text-[#E8C987] fill-current" /> Monochrome studio reel {currentReel + 1} of {reels.length}</span>
        </div>
      </section>

      <section aria-labelledby="gallery-grid-title" className="space-y-6">
        <div className="reveal reveal-up flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="eyebrow">The work</span>
            <h2 id="gallery-grid-title" className="font-serif text-3xl font-bold text-[#2F2924] mt-2">Cinematic stills</h2>
          </div>
          <p className="text-xs text-[#665B53]">{images.length} optimized items</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[150px] sm:auto-rows-[200px]">
          {images.slice(0, visibleCount).map((item, index) => {
            const motionSrc = item.videoUrl;
            return (
            <article key={item.id || index} className={`reveal reveal-up reveal-delay-${(index % 4) + 1} group relative rounded-2xl overflow-hidden border border-[#DECDBD] bg-[#FFFDF9] shadow-sm hover:shadow-lg transition-all duration-300 ${gridClass(index)}`}>
              {item.isBeforeAfter && item.beforeImage && item.afterImage ? (
                <div className="w-full h-full flex relative">
                  <div className="w-1/2 h-full relative overflow-hidden border-r border-[#DECDBD]">
                    <img src={item.beforeImage} alt="Before transformation" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Before</span>
                  </div>
                  <div className="w-1/2 h-full relative overflow-hidden">
                    <img src={item.afterImage} alt="After transformation" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-[#B88E39]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">After</span>
                  </div>
                </div>
              ) : motionSrc ? (
                <video autoPlay muted loop playsInline preload="metadata" className="w-full h-full object-cover brightness-95 contrast-110 grayscale group-hover:scale-105 transition-transform duration-700" aria-label={`Monochrome motion study of Tresses by Kay style ${index + 1}`}>
                  <source src={motionSrc} type="video/mp4" />
                </video>
              ) : (
                <img src={item.image} alt={item.title || `Tresses by Kay style ${index + 1}`} loading={index < 6 ? 'eager' : 'lazy'} decoding="async" className="w-full h-full object-cover brightness-[.96] contrast-105 saturate-[.94] group-hover:scale-[1.03] group-hover:brightness-100 transition-all duration-700" />
              )}
              {motionSrc && !item.isBeforeAfter && <span className="absolute top-3 left-3 rounded-full bg-[#2F2924]/75 px-2.5 py-1 text-[10px] uppercase tracking-wide text-white font-bold">Monochrome motion</span>}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2F2924]/85 via-[#2F2924]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <p className="text-white text-xs font-bold mb-1.5">{item.title}</p>
                <p className="text-[10px] text-[#EADCCB] mb-3">Stylist: {item.stylistName}</p>
                {onOpenBooking && <button onClick={onOpenBooking} className="min-h-10 bg-[#C59648] hover:bg-[#AD8038] text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl translate-y-3 group-hover:translate-y-0 transition-transform"><Calendar className="w-3.5 h-3.5 inline mr-1.5" />Book this style</button>}
              </div>
            </article>
            );
          })}
        </div>
        {visibleCount < images.length && <div className="flex justify-center pt-8"><button onClick={() => setVisibleCount((count) => Math.min(count + 12, images.length))} className="min-h-11 px-7 rounded-full border border-[#C59648] text-[#2F2924] hover:bg-[#C59648] hover:text-white text-sm font-bold transition-colors">Load more looks</button></div>}
      </section>
    </div>
  );
};
