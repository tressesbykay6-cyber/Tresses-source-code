import React, { useState } from 'react';
import { Menu, X, ShoppingBag, Calendar, Sparkles, MessageCircle, Home, Image, Store, Mail } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onOpenBooking: () => void;
  onOpenCart: () => void;
  cartCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  setActiveSection,
  onOpenBooking,
  onOpenCart,
  cartCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exact 4 pages requested by client: Home, Gallery, Shop, Contact
  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'shop', label: 'Shop' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E5D7C0]/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full border border-[#B88E39] bg-[#FFFDF9] flex items-center justify-center relative overflow-hidden group-hover:bg-[#F8E2C2]/40 transition-colors shadow-sm">
              <span className="font-serif font-bold text-lg text-[#B88E39]">T</span>
            </div>
            
            <div>
              <div className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1C1814] group-hover:text-[#B88E39] transition-colors">
                Tresses
              </div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#B88E39] font-semibold -mt-1">
                By Kay
              </div>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  activeSection === link.id
                    ? 'text-[#B88E39] font-bold'
                    : 'text-[#5C5247] hover:text-[#1C1814]'
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#B88E39] rounded-full animate-fade-in" />
                )}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full text-[#1C1814] hover:text-[#B88E39] hover:bg-[#FFFDF9] border border-[#E5D7C0]/60 transition-colors shadow-sm"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B88E39] text-[#FAF7F2] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Book Now Primary Button */}
            <button
              onClick={onOpenBooking}
              className="bg-[#1C1814] hover:bg-[#2C2620] text-[#FAF7F2] font-semibold text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-full transition-all duration-200 transform hover:scale-[1.02] active:scale-95 shadow-md flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#B88E39]" />
              <span>Book now</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#1C1814] hover:bg-[#FFFDF9] border border-[#E5D7C0]/60"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF7F2]/98 backdrop-blur-xl md:hidden flex flex-col pt-20 px-6 pb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5D7C0]">
            <div className="font-serif text-xl font-bold text-[#1C1814]">Navigation Menu</div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#1C1814] hover:text-[#B88E39]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col space-y-3 overflow-y-auto">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left text-lg font-medium py-3 border-b border-[#E5D7C0]/50 flex items-center justify-between ${
                  activeSection === link.id ? 'text-[#B88E39] font-bold' : 'text-[#1C1814]'
                }`}
              >
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full bg-[#1C1814] text-[#FAF7F2] font-semibold py-3 rounded-full text-center text-sm shadow-md flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#B88E39]" />
              <span>Book Appointment Now</span>
            </button>
            <a
              href="https://wa.me/254118831488?text=Hi%2C%20I'd%20like%20to%20book%20an%20appointment%20at%20Tresses%20by%20Kay"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-[#B88E39] text-[#1C1814] py-3 rounded-full text-center text-sm flex items-center justify-center gap-2 font-medium"
            >
              <MessageCircle className="w-4 h-4 text-[#B88E39]" />
              <span>WhatsApp Direct</span>
            </a>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#FAF7F2]/95 border-t border-[#E5D7C0] py-2 px-4 md:hidden flex items-center justify-around backdrop-blur-md shadow-lg">
        <button
          onClick={() => handleNavClick('home')}
          className={`flex flex-col items-center text-[10px] ${
            activeSection === 'home' ? 'text-[#B88E39] font-bold' : 'text-[#5C5247]'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleNavClick('gallery')}
          className={`flex flex-col items-center text-[10px] ${
            activeSection === 'gallery' ? 'text-[#B88E39] font-bold' : 'text-[#5C5247]'
          }`}
        >
          <Image className="w-4 h-4 mb-0.5" />
          <span>Gallery</span>
        </button>

        <button
          onClick={onOpenBooking}
          className="bg-[#1C1814] text-[#FAF7F2] p-3 rounded-full -mt-5 border-2 border-[#FAF7F2] shadow-xl flex items-center justify-center transform active:scale-95"
        >
          <Calendar className="w-5 h-5 text-[#B88E39]" />
        </button>

        <button
          onClick={() => handleNavClick('shop')}
          className={`flex flex-col items-center text-[10px] ${
            activeSection === 'shop' ? 'text-[#B88E39] font-bold' : 'text-[#5C5247]'
          }`}
        >
          <Store className="w-4 h-4 mb-0.5" />
          <span>Shop</span>
        </button>

        <button
          onClick={() => handleNavClick('contact')}
          className={`flex flex-col items-center text-[10px] ${
            activeSection === 'contact' ? 'text-[#B88E39] font-bold' : 'text-[#5C5247]'
          }`}
        >
          <Mail className="w-4 h-4 mb-0.5" />
          <span>Contact</span>
        </button>
      </div>
    </>
  );
};
