import React from 'react';
import { MapPin, Phone, Clock, Instagram, Heart, Mail } from 'lucide-react';

interface FooterProps {
  setActiveSection: (section: string) => void;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveSection, onOpenBooking }) => {
  return (
    <footer className="bg-[#FFFDF9] border-t border-[#E5D7C0] text-[#5C5247] pt-16 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#B88E39] bg-[#FAF7F2] flex items-center justify-center">
              <span className="font-serif font-bold text-[#B88E39] text-xl">T</span>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-[#1C1814]">Tresses</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#B88E39] font-semibold -mt-1">
                BY KAY
              </div>
            </div>
          </div>

          <p className="text-sm text-[#5C5247] leading-relaxed font-light">
            All things hair & beauty. Nairobi’s boutique beauty studio built on precision, warmth, and craft. Every appointment is treated as an occasion.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://instagram.com/tresses_by__kay"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E5D7C0] flex items-center justify-center text-[#B88E39] hover:bg-[#B88E39] hover:text-[#FAF7F2] transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <span className="text-xs text-[#B88E39] font-medium">@tresses_by__kay</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-serif text-lg font-bold text-[#1C1814] mb-4">
            Navigation
          </h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { id: 'home', label: 'Home Page' },
              { id: 'services', label: 'Services & Booking' },
              { id: 'gallery', label: 'Gallery & Transformations' },
              { id: 'contact', label: 'Location, About & Reviews' },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveSection(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#B88E39] transition-colors font-medium"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Visit Us */}
        <div className="space-y-3">
          <h4 className="font-serif text-lg font-bold text-[#1C1814] mb-4">
            Studio Location
          </h4>
          
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="w-5 h-5 text-[#B88E39] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#1C1814]">JKUAT Towers</p>
              <p className="text-[#5C5247]">Kenyatta Ave, Mezzanine Floor, Shop M08</p>
              <p className="text-[#5C5247]">Nairobi, Kenya (00100)</p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm pt-2">
            <Clock className="w-5 h-5 text-[#B88E39] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#1C1814]">Monday – Saturday</p>
              <p className="text-[#5C5247]">8:30am – 6:00pm</p>
              <p className="text-xs text-[#B88E39] mt-0.5 font-semibold">Sunday: Closed</p>
            </div>
          </div>
        </div>

        {/* Contact & Booking */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-bold text-[#1C1814] mb-4">
            Direct Line
          </h4>

          <a
            href="tel:+254118831488"
            className="flex items-center gap-3 text-sm hover:text-[#B88E39] transition-colors bg-[#FAF7F2] p-3 rounded-2xl border border-[#E5D7C0]"
          >
            <Phone className="w-4 h-4 text-[#B88E39]" />
            <span className="font-bold text-[#1C1814]">+254 011 883 1488</span>
          </a>

          <a
            href="mailto:trassesbykay6@gmail.com"
            className="flex items-center gap-3 text-sm hover:text-[#B88E39] transition-colors bg-[#FAF7F2] p-3 rounded-2xl border border-[#E5D7C0]"
          >
            <Mail className="w-4 h-4 text-[#B88E39]" />
            <span className="font-medium text-[#1c1814] break-all">trassesbykay6@gmail.com</span>
          </a>

          <button
            onClick={onOpenBooking}
            className="w-full bg-[#1C1814] hover:bg-[#2C2620] text-[#FAF7F2] font-semibold text-sm py-3 px-6 rounded-full transition-all shadow-md"
          >
            Book Appointment
          </button>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#E5D7C0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C8071] gap-4">
        <p>© {new Date().getFullYear()} Tresses by Kay. All rights reserved.</p>
        <div className="flex gap-4">
          <button onClick={() => { setActiveSection('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:underline hover:text-[#B88E39]">Privacy Policy</button>
          <button onClick={() => { setActiveSection('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:underline hover:text-[#B88E39]">Terms of Service</button>
        </div>
        <p className="flex items-center gap-1">
          Crafted with <Heart className="w-3.5 h-3.5 text-[#B88E39] fill-current" /> for Nairobi’s finest crown.
        </p>
      </div>
    </footer>
  );
};
