import React, { useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { BookingModal } from './components/BookingModal';

import { HomeView } from './views/HomeView';
import { ServicesView } from './views/ServicesView';
import { GalleryView } from './views/GalleryView';
import { ContactView } from './views/ContactView';
import { AdminBooking, AdminDashboard } from './views/AdminDashboard';
import { PrivacyPolicyView } from './views/PrivacyPolicyView';
import { TermsOfServiceView } from './views/TermsOfServiceView';

import { Service } from './types';
import { MOCK_SERVICES, MOCK_GALLERY, MOCK_REVIEWS } from './data/mockData';

export default function App() {
  // Home, services, gallery, and contact are the only customer-facing pages.
  const [activeSection, setActiveSection] = useState<string>('home');
  
  // Booking modal controls
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('tresses-services') || 'null') || MOCK_SERVICES;
    } catch {
      return MOCK_SERVICES;
    }
  });
  const [bookings, setBookings] = useState<AdminBooking[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('tresses-bookings') || '[]');
    } catch {
      return [];
    }
  });
  const [adminOpen, setAdminOpen] = useState(() => window.location.hash === '#admin');

  // Booking Handlers
  const handleOpenBooking = (service?: Service | null) => {
    setPreselectedService(service || null);
    setIsBookingOpen(true);
  };

  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateGlow = (event: PointerEvent) => {
      appRef.current?.style.setProperty('--glow-x', `${event.clientX}px`);
      appRef.current?.style.setProperty('--glow-y', `${event.clientY}px`);
    };

    window.addEventListener('pointermove', updateGlow, { passive: true });
    return () => window.removeEventListener('pointermove', updateGlow);
  }, []);

  useEffect(() => {
    localStorage.setItem('tresses-services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('tresses-bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    const syncAdminRoute = () => setAdminOpen(window.location.hash === '#admin');
    window.addEventListener('hashchange', syncAdminRoute);
    return () => window.removeEventListener('hashchange', syncAdminRoute);
  }, []);

  const handleBookingComplete = (booking: AdminBooking) => {
    setBookings((current) => [booking, ...current]);
  };

  if (adminOpen) {
    return <AdminDashboard services={services} bookings={bookings} onServicesChange={setServices} onBookingsChange={setBookings} onExit={() => { window.location.hash = ''; }} />;
  }

  return (
    <div ref={appRef} className="site-shell min-h-screen flex flex-col bg-[#FAF7F2] text-[#2F2924] font-['Manrope',sans-serif] selection:bg-[#B88E39] selection:text-[#FAF7F2] relative">
      
      {/* Background Radial Glow Layer */}
      <div className="site-ambient-bg fixed inset-0 pointer-events-none z-0" />

      {/* Sticky Top Navigation */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16 relative z-10">
        {activeSection === 'home' && (
          <HomeView
            services={services}
            reviews={MOCK_REVIEWS}
            galleryItems={MOCK_GALLERY}
            onOpenBooking={handleOpenBooking}
            onNavigate={setActiveSection}
          />
        )}

        {activeSection === 'services' && (
          <ServicesView
            services={services}
            reviews={MOCK_REVIEWS}
            onOpenBooking={handleOpenBooking}
            onNavigate={setActiveSection}
          />
        )}

        {activeSection === 'gallery' && (
          <GalleryView
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {activeSection === 'contact' && (
          <ContactView />
        )}

        {activeSection === 'privacy' && (
          <PrivacyPolicyView />
        )}

        {activeSection === 'terms' && (
          <TermsOfServiceView />
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
        services={services}
        onBookingComplete={handleBookingComplete}
      />

    </div>
  );
}
