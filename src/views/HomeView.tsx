import React from 'react';
import { Calendar, MessageCircle, Sparkles } from 'lucide-react';
import { Service, GalleryItem, Review } from '../types';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface HomeViewProps {
  services: Service[];
  reviews: Review[];
  galleryItems: GalleryItem[];
  pageSettings: any;
  onOpenBooking: (service?: Service) => void;
  onNavigate: (section: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  pageSettings,
  onOpenBooking,
}) => {
  const revealRef = useScrollReveal();
  const homeSettings = pageSettings?.home || {};

  return (
    <div ref={revealRef} className="space-y-16 sm:space-y-24 pt-4 animate-fade-in">
      
      {/* 1. HERO SECTION WITH AMBIENT GLOW */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-[#E5D7C0]/60">
        
        {/* Single Intro Video Background */}
        <video
          key={homeSettings.heroVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-10 opacity-[0.38] brightness-90 contrast-125 sepia-[.10] scale-100 transition-transform duration-1000"
        >
          <source src={homeSettings.heroVideoUrl || "/media/hero-intro.mp4"} type="video/mp4" />
        </video>

        {/* Soft Glowing Background Halos */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#F8E2C2]/40 via-[#F3D3A6]/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-20 left-10 w-[300px] h-[300px] bg-[#EADBB8]/30 rounded-full blur-2xl pointer-events-none -z-10" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-20 space-y-6">
          
          <div className="reveal reveal-scale inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFDF9] border border-[#B88E39]/40 text-[#B88E39] text-xs font-bold shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#B88E39] animate-pulse" />
            <span>{homeSettings.heroTagline || "Nairobi’s Boutique Beauty Atelier • JKUAT Towers & Mobile Housecalls"}</span>
          </div>

          <h1 className="reveal reveal-up reveal-delay-1 font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#1C1814] leading-[1.1] tracking-tight max-w-4xl mx-auto">
            {homeSettings.heroTitle || "Your crown, styled to perfection."}
          </h1>

          <p className="reveal reveal-up reveal-delay-2 font-sans text-base sm:text-lg text-[#5C5247] font-light max-w-2xl mx-auto leading-relaxed">
            {homeSettings.heroSubtitle || "Nairobi’s boutique studio for knotless braids, HD wig installs, custom color, and bridal glams — book your in-studio seat or mobile housecall in minutes."}
          </p>

          <div className="reveal reveal-up reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onOpenBooking()}
              className="btn-primary w-full sm:w-auto font-semibold text-sm px-8 py-4 rounded-full flex items-center justify-center gap-2 shadow-xl"
            >
              <Calendar className="w-4 h-4 text-[#FAF7F2]" />
              <span>Book now (Studio or Housecall)</span>
            </button>

            <a
              href="https://wa.me/254118831488?text=Hi%2C%20I'd%20like%20to%20book%20an%20appointment%20at%20Tresses%20by%20Kay"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto font-semibold text-sm px-8 py-4 rounded-full flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#B88E39]" />
              <span>WhatsApp Direct</span>
            </a>
          </div>

        </div>
      </section>

      {/* 5. EDITORIAL BRAND STORY BLOCK */}
      <section className="reveal reveal-scale max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="w-12 h-12 rounded-full border border-[#B88E39] bg-[#FFFDF9] flex items-center justify-center mx-auto shadow-sm glow-border">
          <span className="font-serif text-xl font-bold text-[#B88E39]">T</span>
        </div>

        <blockquote className="font-serif text-2xl sm:text-3xl font-normal text-[#1C1814] leading-relaxed italic">
          {homeSettings.brandStoryQuote || "“Tresses by Kay is a Nairobi hair and beauty studio built on precision, warmth, and craft. From knotless braids to bridal makeup, every appointment is treated as an occasion — not just a service.”"}
        </blockquote>

        <p className="text-xs uppercase tracking-widest text-[#B88E39] font-bold">
          {homeSettings.brandStoryAuthor || "— Kay, Founder & Master Stylist"}
        </p>
      </section>

      {/* 8. BOTTOM CTA BANNER */}
      <section className="reveal reveal-up max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1C1814] text-[#FAF7F2] rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden border border-[#B88E39]/30">
          
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#B88E39]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold">
              {homeSettings.ctaTitle || "Ready for your transformation?"}
            </h2>
            <p className="text-sm font-medium opacity-90 text-[#FAF7F2]/80 font-light">
              {homeSettings.ctaSubtitle || "Visit us at JKUAT Towers, Kenyatta Ave or request a mobile housecall. Seats book quickly — reserve your spot with a 30% M-Pesa deposit."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 relative z-10">
            <button
              onClick={() => onOpenBooking()}
              className="btn-primary w-full sm:w-auto font-bold text-sm px-8 py-4 rounded-full shadow-xl"
            >
              Book Appointment Now
            </button>
            <a
              href="https://wa.me/254118831488"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto font-semibold text-sm px-8 py-4 rounded-full flex items-center justify-center gap-2 border-white/20 text-white hover:border-[#B88E39]"
            >
              <MessageCircle className="w-4 h-4 text-[#B88E39]" />
              <span>WhatsApp +254 011 883 1488</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
