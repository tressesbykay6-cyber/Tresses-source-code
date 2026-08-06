import React from 'react';
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
  const featuredServices = services.slice(0, 6);
  const instagramFeed = galleryItems.slice(0, 6);

  return (
    <div className="space-y-16 sm:space-y-24 animate-fade-in">
      
      {/* 1. HERO SECTION WITH AMBIENT GLOW */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFE6] border-b border-[#E5D7C0]/60">
        
        {/* Soft Glowing Background Halos */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#F8E2C2]/60 via-[#F3D3A6]/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-[300px] h-[300px] bg-[#EADBB8]/40 rounded-full blur-2xl pointer-events-none" />

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

      {/* 2. TRUST STRIP BENEATH THE FOLD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-20">
        <div className="bg-[#FFFDF9] border border-[#E5D7C0] rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F8E2C2]/50 border border-[#B88E39]/40 flex items-center justify-center text-[#B88E39] shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-[#B88E39] font-bold">Studio Hours</p>
              <p className="text-sm font-bold text-[#1C1814]">Mon–Sat: 8:30am–6pm</p>
              <p className="text-[11px] text-[#5C5247]">Closed Sundays</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F8E2C2]/50 border border-[#B88E39]/40 flex items-center justify-center text-[#B88E39] shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-[#B88E39] font-bold">Studio & Housecalls</p>
              <p className="text-sm font-bold text-[#1C1814]">JKUAT Towers, CBD</p>
              <p className="text-[11px] text-[#5C5247]">+ Mobile Service Nairobi</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F8E2C2]/50 border border-[#B88E39]/40 flex items-center justify-center text-[#B88E39] shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-[#B88E39] font-bold">Direct Line</p>
              <p className="text-sm font-bold text-[#1C1814]">+254 011 883 1488</p>
              <p className="text-[11px] text-[#5C5247]">Calls & WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#FAF7F2] p-3 rounded-2xl border border-[#E5D7C0]">
            <div className="w-10 h-10 rounded-xl bg-[#B88E39] text-[#FAF7F2] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              ★ 4.9
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C1814]">638+ Happy Clients</p>
              <p className="text-[11px] text-[#B88E39] font-semibold">Verified @tresses_by__kay</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. POPULAR SERVICES CATALOG HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B88E39] font-bold">Curated Atelier Services</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1814] mt-1">
              Popular Transformations
            </h2>
          </div>
          <button
            onClick={() => onOpenBooking()}
            className="text-xs font-bold text-[#B88E39] hover:underline flex items-center gap-1.5 self-start md:self-auto bg-[#FFFDF9] border border-[#E5D7C0] px-4 py-2 rounded-full shadow-sm"
          >
            <span>Open Full Service Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service) => (
            <div
              key={service.id}
              className="bg-[#FFFDF9] rounded-3xl overflow-hidden border border-[#E5D7C0] hover:border-[#B88E39]/60 transition-all duration-300 group flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#FFFDF9]/90 text-[#B88E39] text-[11px] font-bold px-3 py-1 rounded-full border border-[#E5D7C0] backdrop-blur-md shadow-sm">
                  {service.category}
                </span>
                <span className="absolute bottom-3 right-3 bg-[#1C1814]/80 text-[#FAF7F2] text-xs font-bold px-3 py-1 rounded-full border border-[#B88E39]/30 backdrop-blur-md">
                  ★ {service.rating}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1C1814] group-hover:text-[#B88E39] transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-[#5C5247] mt-2 line-clamp-2 font-light leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E5D7C0]/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#8C8071] block">Service Price</span>
                    <span className="text-base font-bold text-[#B88E39]">
                      KSh {service.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenBooking(service)}
                    className="bg-[#1C1814] hover:bg-[#2C2620] text-[#FAF7F2] text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-sm"
                  >
                    Book this
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SIGNATURE BEFORE / AFTER TRANSFORMATION SLIDER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFDF9] p-8 sm:p-12 rounded-3xl border border-[#E5D7C0] space-y-8 shadow-sm">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#B88E39] font-bold">
              The Tresses Transformation
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1C1814]">
              Signature HD Frontal Wig Melt
            </h2>
            <p className="text-xs text-[#5C5247] max-w-lg mx-auto">
              Slide back and forth to inspect our seamless bleaching, plucking, and lace melting technique by Kay.
            </p>
          </div>

          <BeforeAfterSlider
            beforeImage="https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=1200"
            afterImage="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200"
            beforeLabel="Raw Hair Install"
            afterLabel="Kay's HD Melt Result"
          />
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

      {/* 6. INSTAGRAM FEED GRID (@tresses_by__kay) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#B88E39] uppercase tracking-wider">
              <Instagram className="w-4 h-4" />
              <span>@tresses_by__kay</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#1C1814] mt-1">
              As Seen on Instagram
            </h2>
          </div>
          <a
            href="https://instagram.com/tresses_by__kay"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#B88E39] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Follow our feed</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramFeed.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-[#E5D7C0] cursor-pointer shadow-sm"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#1C1814]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 text-center">
                <Instagram className="w-6 h-6 text-[#B88E39] mb-1" />
                <p className="text-[10px] text-[#FAF7F2] font-medium line-clamp-2">{item.title}</p>
                <span className="text-[9px] text-[#B88E39] mt-1 font-bold">♥ {item.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CLIENT TESTIMONIAL PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B88E39] font-bold">Client Reviews</span>
            <h2 className="font-serif text-3xl font-bold text-[#1C1814] mt-1">
              What Clients Say
            </h2>
          </div>
          <button
            onClick={() => onNavigate('contact')}
            className="text-xs text-[#B88E39] hover:underline font-bold flex items-center gap-1"
          >
            <span>Read all reviews & about us</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.slice(0, 2).map((rev) => (
            <div
              key={rev.id}
              className="bg-[#FFFDF9] p-6 rounded-3xl border border-[#E5D7C0] shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#B88E39]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#8C8071]">{rev.date}</span>
                </div>

                <p className="font-serif text-sm sm:text-base text-[#1C1814] leading-relaxed italic">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#E5D7C0]/60 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#1C1814]">{rev.clientName}</h4>
                  <p className="text-[11px] text-[#B88E39] font-medium">{rev.serviceBooked}</p>
                </div>
                <span className="text-[10px] bg-[#FAF7F2] text-[#1C1814] font-bold px-2.5 py-1 rounded-full border border-[#E5D7C0]">
                  Verified Visit
                </span>
              </div>
            </div>
          ))}
        </div>
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
