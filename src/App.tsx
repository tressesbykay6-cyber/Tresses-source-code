import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { BookingModal } from './components/BookingModal';
import { CartDrawer } from './components/CartDrawer';

import { HomeView } from './views/HomeView';
import { GalleryView } from './views/GalleryView';
import { ShopView } from './views/ShopView';
import { ContactView } from './views/ContactView';

import { Service, Product, CartItem } from './types';
import { MOCK_SERVICES, MOCK_PRODUCTS, MOCK_GALLERY, MOCK_REVIEWS } from './data/mockData';

export default function App() {
  // Exactly 4 sections: 'home' | 'gallery' | 'shop' | 'contact'
  const [activeSection, setActiveSection] = useState<string>('home');
  
  // Booking modal controls
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);

  // Cart controls
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Booking Handlers
  const handleOpenBooking = (service?: Service | null) => {
    setPreselectedService(service || null);
    setIsBookingOpen(true);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1814] font-['Manrope',sans-serif] selection:bg-[#B88E39] selection:text-[#FAF7F2] relative">
      
      {/* Background Radial Glow Layer */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FFF9EE] via-[#FAF7F2] to-[#F5EFE6] pointer-events-none z-0" />

      {/* Sticky Top Navigation */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenBooking={() => handleOpenBooking()}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartCount}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16 relative z-10">
        {activeSection === 'home' && (
          <HomeView
            services={MOCK_SERVICES}
            reviews={MOCK_REVIEWS}
            galleryItems={MOCK_GALLERY}
            onOpenBooking={handleOpenBooking}
            onNavigate={setActiveSection}
          />
        )}

        {activeSection === 'gallery' && (
          <GalleryView
            galleryItems={MOCK_GALLERY}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {activeSection === 'shop' && (
          <ShopView
            products={MOCK_PRODUCTS}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {activeSection === 'contact' && (
          <ContactView />
        )}
      </main>

      {/* Floating WhatsApp Quick Contact Button */}
      <WhatsAppButton />

      {/* Global Footer */}
      <Footer
        setActiveSection={setActiveSection}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Interactive Service Catalog & Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preselectedService={preselectedService}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

    </div>
  );
}
