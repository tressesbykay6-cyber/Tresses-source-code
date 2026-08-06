import React, { useState } from 'react';
import { Heart, Play, Sparkles, Calendar } from 'lucide-react';
import { GalleryItem, ServiceCategory } from '../types';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';

interface GalleryViewProps {
  galleryItems: GalleryItem[];
  onOpenBooking?: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ galleryItems, onOpenBooking }) => {
  const [selectedFilter, setSelectedFilter] = useState<ServiceCategory | 'Videos' | 'All'>('All');
  const [likesMap, setLikesMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    galleryItems.forEach((item) => {
      initial[item.id] = item.likes;
    });
    return initial;
  });

  const filters: (ServiceCategory | 'Videos' | 'All')[] = [
    'All',
    'Braids',
    'Wigs & Extensions',
    'Hair Treatments & Color',
    'Makeup',
    'Nails',
    'Videos',
  ];

  const filteredItems = galleryItems.filter((item) => {
    if (selectedFilter === 'All') return true;
    return item.category === selectedFilter;
  });

  const toggleLike = (id: string) => {
    setLikesMap((prev) => ({
      ...prev,
      [id]: prev[id] + 1,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in">
      
      {/* Title */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-[#B88E39] font-bold flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Visual Lookbook
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C1814]">
          Atelier Portfolio & Transformations
        </h1>
        <p className="text-sm text-[#5C5247] font-light leading-relaxed">
          Explore real client results, knotless braid precision, and HD frontal wig melts crafted at JKUAT Towers and mobile housecalls across Nairobi.
        </p>
      </div>

      {/* Signature Before/After Transformation Highlight */}
      <div className="bg-[#FFFDF9] p-6 sm:p-10 rounded-3xl border border-[#E5D7C0] space-y-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#B88E39] font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Interactive Signature Transformation</span>
        </div>
        
        <BeforeAfterSlider
          title="HD Frontal Wig Melt & Custom Hairline Pluck"
          subtitle="Drag the center slider left or right to inspect raw wig placement vs. Kay's seamless melted finish."
          beforeImage="https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=1200"
          afterImage="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200"
          beforeLabel="Raw Frontal"
          afterLabel="Melted & Styled"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedFilter === filter
                ? 'bg-[#1C1814] text-[#FAF7F2] border-[#1C1814] shadow-md'
                : 'bg-[#FFFDF9] text-[#5C5247] border-[#E5D7C0] hover:border-[#B88E39]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Bento-Style Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, idx) => (
          <div
            key={item.id}
            className={`group relative rounded-3xl overflow-hidden border border-[#E5D7C0] bg-[#FFFDF9] hover:border-[#B88E39]/60 transition-all duration-300 shadow-sm hover:shadow-md ${
              idx % 4 === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
            }`}
          >
            <div className="relative w-full h-80 sm:h-full min-h-[320px]">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {item.videoUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                  <div className="w-14 h-14 rounded-full bg-[#B88E39] text-[#FAF7F2] flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1814]/90 via-[#1C1814]/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Category Badge */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-[#FAF7F2]/90 text-[#B88E39] text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border border-[#E5D7C0] backdrop-blur-md">
                  {item.category}
                </span>
              </div>

              {/* Like Button */}
              <button
                onClick={() => toggleLike(item.id)}
                className="absolute top-4 right-4 bg-[#FAF7F2]/90 hover:bg-[#1C1814] hover:text-[#FAF7F2] text-[#1C1814] p-2 rounded-full border border-[#E5D7C0] backdrop-blur-md transition-colors flex items-center gap-1.5 text-xs font-bold"
              >
                <Heart className="w-3.5 h-3.5 text-[#B88E39] fill-current" />
                <span>{likesMap[item.id]}</span>
              </button>

              {/* Content Bottom */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-[#FAF7F2]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#B88E39] font-medium">
                    Styled by: {item.stylistName}
                  </p>
                </div>

                {onOpenBooking && (
                  <button
                    onClick={onOpenBooking}
                    className="bg-[#B88E39] hover:bg-[#A37B2C] text-[#FAF7F2] p-2.5 rounded-full text-xs font-bold shadow-md shrink-0 flex items-center gap-1"
                    title="Book This Style"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Book This</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
