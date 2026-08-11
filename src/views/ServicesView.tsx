import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Service, Review } from '../types';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface ServicesViewProps {
  services: Service[];
  pageSettings: any;
  onOpenBooking: (service?: Service) => void;
  onNavigate: (section: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  pageSettings,
  onOpenBooking,
}) => {
  const revealRef = useScrollReveal();
  const servicesSettings = pageSettings?.services || {};

  // Load reviews from Firestore
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'reviews'), (snap) => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
    });
    return () => unsub();
  }, []);

  return (
    <div ref={revealRef} className="space-y-16 sm:space-y-24 pt-24 pb-16 animate-fade-in">
      
      {/* PAGE HEADER */}
      <section className="reveal reveal-up max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs uppercase tracking-widest text-[#B88E39] font-bold">
          {servicesSettings.introSubtitle || "The Menu"}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C1814]">
          {servicesSettings.introTitle || "Curated Atelier Services"}
        </h1>
        <p className="text-sm text-[#5C5247] max-w-xl mx-auto font-light">
          {servicesSettings.introText || "From precise knotless braids to flawless HD wig installs, discover the signature transformations crafted by Kay."}
        </p>
      </section>

      {/* POPULAR SERVICES CATALOG HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`reveal reveal-up reveal-delay-${(index % 3) + 1} card-interactive bg-[#FFFDF9] rounded-3xl overflow-hidden border border-[#E5D7C0] transition-all duration-300 group flex flex-col justify-between shadow-sm`}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
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
                  {service.numberOfStylists && service.numberOfStylists > 0 && (
                    <p className="text-[10px] text-[#9A6F2E] font-bold mt-2">
                      {service.numberOfStylists} stylist{service.numberOfStylists > 1 ? 's' : ''} performing this service
                    </p>
                  )}
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
                    className="bg-[#1C1814] hover:bg-[#2C2620] hover:scale-[1.04] text-[#FAF7F2] text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-sm active:scale-95"
                  >
                    Book this
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CLIENT TESTIMONIAL PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="reveal reveal-up flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B88E39] font-bold">Client Reviews</span>
            <h2 className="font-serif text-3xl font-bold text-[#1C1814] mt-1">
              What Clients Say
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev, index) => (
            <div
              key={rev.id}
              className={`reveal reveal-scale reveal-delay-${(index % 2) + 1} card-interactive bg-[#FFFDF9] p-6 rounded-3xl border border-[#E5D7C0] shadow-sm flex flex-col justify-between space-y-4`}
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

    </div>
  );
};
