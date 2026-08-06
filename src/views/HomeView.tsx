import React, { useState } from 'react';
import { Calendar, MessageCircle, MapPin, Clock, Phone, Sparkles, Star, Instagram, ArrowRight, ShieldCheck, Heart, Home } from 'lucide-react';
import { Service, GalleryItem, Review } from '../types';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';

interface HomeViewProps {
  services: Service[];
  reviews: Review[];
  galleryItems: GalleryItem[];
  onOpenBooking: (service?: Service) => void;
  onNavigate: (section: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  services,
  reviews,
  galleryItems,
  onOpenBooking,
  onNavigate,
}) => {

  return (
    <div className="space-y-16 sm:space-y-24 animate-fade-in">
      
      {/* 1. HERO SECTION WITH AMBIENT GLOW */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden border-b border-[#E5D7C0]/60">
        
        {/* Single Intro Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-10 opacity-[0.35] brightness-90 contrast-125 sepia-[.10]"
        >
          <source src="/media/hero-intro.mp4" type="video/mp4" />
        </video>

        {/* Soft Glowing Background Halos */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#F8E2C2]/40 via-[#F3D3A6]/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-20 left-10 w-[300px] h-[300px] bg-[#EADBB8]/30 rounded-full blur-2xl pointer-events-none -z-10" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12 pb-16 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFDF9] border border-[#B88E39]/40 text-[#B88E39] text-xs font-bold shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#B88E39]" />
            <span>Nairobi’s Boutique Beauty Atelier • JKUAT Towers & Mobile Housecalls</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#1C1814] leading-[1.1] tracking-tight max-w-4xl mx-auto">
            Your crown, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1C1814] via-[#B88E39] to-[#1C1814]">
              styled to perfection.
            </span>
          </h1>

          <p className="font-sans text-base sm:text-lg text-[#5C5247] font-light max-w-2xl mx-auto leading-relaxed">
            Nairobi’s boutique studio for knotless braids, HD wig installs, custom color, and bridal glams — book your in-studio seat or mobile housecall in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onOpenBooking()}
              className="w-full sm:w-auto bg-[#1C1814] hover:bg-[#2C2620] text-[#FAF7F2] font-semibold text-sm px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-[1.02] shadow-xl flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#B88E39]" />
              <span>Book now (Studio or Housecall)</span>
            </button>

            <a
              href="https://wa.me/254118831488?text=Hi%2C%20I'd%20like%20to%20book%20an%20appointment%20at%20Tresses%20by%20Kay"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#FFFDF9] hover:bg-[#FAF7F2] text-[#1C1814] border border-[#B88E39]/50 font-semibold text-sm px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-[#B88E39]" />
              <span>WhatsApp Direct</span>
            </a>
          </div>

        </div>
      </section>





      {/* 5. EDITORIAL BRAND STORY BLOCK */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="w-12 h-12 rounded-full border border-[#B88E39] bg-[#FFFDF9] flex items-center justify-center mx-auto shadow-sm">
          <span className="font-serif text-xl font-bold text-[#B88E39]">T</span>
        </div>

        <blockquote className="font-serif text-2xl sm:text-3xl font-normal text-[#1C1814] leading-relaxed italic">
          “Tresses by Kay is a Nairobi hair and beauty studio built on precision, warmth, and craft. From knotless braids to bridal makeup, every appointment is treated as an occasion — not just a service.”
        </blockquote>

        <p className="text-xs uppercase tracking-widest text-[#B88E39] font-bold">
          — Kay, Founder & Master Stylist
        </p>
      </section>



      {/* 8. BOTTOM CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1C1814] text-[#FAF7F2] rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden border border-[#B88E39]/30">
          
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#B88E39]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold">
              Ready for your transformation?
            </h2>
            <p className="text-sm font-medium opacity-90 text-[#FAF7F2]/80">
              Visit us at JKUAT Towers, Kenyatta Ave or request a mobile housecall. Seats book quickly — reserve your spot with a 30% M-Pesa deposit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 relative z-10">
            <button
              onClick={() => onOpenBooking()}
              className="w-full sm:w-auto bg-[#B88E39] hover:bg-[#A37B2C] text-[#FAF7F2] font-bold text-sm px-8 py-4 rounded-full transition-all shadow-xl"
            >
              Book Appointment Now
            </button>
            <a
              href="https://wa.me/254118831488"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto border border-[#B88E39] text-[#FAF7F2] font-semibold text-sm px-8 py-4 rounded-full hover:bg-[#B88E39]/10 transition-all flex items-center justify-center gap-2"
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
