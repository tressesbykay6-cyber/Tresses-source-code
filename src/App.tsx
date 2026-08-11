import React, { useEffect, useRef, useState } from 'react';
import { collection, doc, onSnapshot, addDoc, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';

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

import { Service, Stylist, GalleryItem } from './types';
import { MOCK_REVIEWS } from './data/mockData';

/* ─── Firestore default page settings (used only as fallback if doc doesn't exist yet) ── */
export const DEFAULT_PAGE_SETTINGS = {
  home: {
    heroTitle: "Your crown, styled to perfection.",
    heroTagline: "Nairobi's Boutique Beauty Atelier • JKUAT Towers & Mobile Housecalls",
    heroSubtitle: "Nairobi's boutique studio for knotless braids, HD wig installs, custom color, and bridal glams — book your in-studio seat or mobile housecall in minutes.",
    heroVideoUrl: "/media/hero-intro.mp4",
    brandStoryQuote: "\u201cTresses by Kay is a Nairobi hair and beauty studio built on precision, warmth, and craft. From knotless braids to bridal makeup, every appointment is treated as an occasion — not just a service.\u201d",
    brandStoryAuthor: "— Kay, Founder & Master Stylist",
    ctaTitle: "Ready for your transformation?",
    ctaSubtitle: "Visit us at JKUAT Towers, Kenyatta Ave or request a mobile housecall. Seats book quickly — reserve your spot with a 30% M-Pesa deposit."
  },
  services: {
    introSubtitle: "The Menu",
    introTitle: "Curated Atelier Services",
    introText: "From precise knotless braids to flawless HD wig installs, discover the signature transformations crafted by Kay."
  },
  gallery: {
    introSubtitle: "Visual Lookbook",
    introTitle: "The Style Grid",
    introText: "A curated, fast-loading collection of real Tresses by Kay transformations. Every image is delivered as modern WebP; every reel is reduced for mobile playback."
  },
  contact: {
    introTitle: "Welcome to Tresses by Kay",
    introText: "Nairobi's premier boutique beauty atelier. Located at JKUAT Towers on Kenyatta Avenue, offering in-studio styling and mobile housecalls across Nairobi.",
    address: "Kenyatta Ave, Mezzanine Floor, Shop M08",
    phone: "+254 011 883 1488",
    email: "trassesbykay6@gmail.com",
    whatsappNumber: "+254118831488",
    mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.817294436214!2d36.8202!3d-1.2847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d7a6e76811%3A0x62955f13fa1458e3!2sJKUAT%20Towers%2C%20Kenyatta%20Ave%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske",
    hoursMonFri: "8:30 AM – 6:00 PM",
    hoursSat: "8:30 AM – 6:00 PM",
    hoursSun: "Closed for Rest & Prep"
  }
};

/* ─── Helper: convert Firestore doc to typed object ── */
function docToObj<T>(snap: QueryDocumentSnapshot): T {
  return { id: snap.id, ...snap.data() } as T;
}

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');

  // Booking modal controls
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);

  // ── Firestore-synced state ──
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [pageSettings, setPageSettings] = useState(DEFAULT_PAGE_SETTINGS);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [adminOpen, setAdminOpen] = useState(() => window.location.hash === '#admin');

  // ── Real-time Firestore Listeners ──
  useEffect(() => {
    // 1. Services collection
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      setServices(snap.docs.map((d) => docToObj<Service>(d)));
    });

    // 2. Stylists collection
    const unsubStylists = onSnapshot(collection(db, 'stylists'), (snap) => {
      setStylists(snap.docs.map((d) => docToObj<Stylist>(d)));
    });

    // 3. Gallery collection
    const unsubGallery = onSnapshot(collection(db, 'gallery'), (snap) => {
      setGalleryItems(snap.docs.map((d) => docToObj<GalleryItem>(d)));
    });

    // 4. Bookings collection
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
      setBookings(snap.docs.map((d) => docToObj<AdminBooking>(d)));
    });

    // 5. Page settings document (single doc)
    const unsubSettings = onSnapshot(doc(db, 'settings', 'pageSettings'), (snap) => {
      if (snap.exists()) {
        setPageSettings(snap.data() as typeof DEFAULT_PAGE_SETTINGS);
      } else {
        setPageSettings(DEFAULT_PAGE_SETTINGS);
      }
    });

    return () => {
      unsubServices();
      unsubStylists();
      unsubGallery();
      unsubBookings();
      unsubSettings();
    };
  }, []);

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
    const syncAdminRoute = () => setAdminOpen(window.location.hash === '#admin');
    window.addEventListener('hashchange', syncAdminRoute);
    return () => window.removeEventListener('hashchange', syncAdminRoute);
  }, []);

  const handleBookingComplete = async (booking: AdminBooking) => {
    try {
      // Write new booking directly to Firestore — the onSnapshot listener will update local state
      const { id, ...bookingData } = booking;
      await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to save booking to Firestore:', err);
      // Fallback: at least add to local state
      setBookings((current) => [booking, ...current]);
    }
  };

  if (adminOpen) {
    return (
      <AdminDashboard
        services={services}
        bookings={bookings}
        onServicesChange={setServices}
        onBookingsChange={setBookings}
        stylists={stylists}
        onStylistsChange={setStylists}
        galleryItems={galleryItems}
        onGalleryItemsChange={setGalleryItems}
        pageSettings={pageSettings}
        onPageSettingsChange={setPageSettings}
        onExit={() => { window.location.hash = ''; }}
      />
    );
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
            galleryItems={galleryItems}
            pageSettings={pageSettings}
            onOpenBooking={handleOpenBooking}
            onNavigate={setActiveSection}
          />
        )}

        {activeSection === 'services' && (
          <ServicesView
            services={services}
            reviews={MOCK_REVIEWS}
            pageSettings={pageSettings}
            onOpenBooking={handleOpenBooking}
            onNavigate={setActiveSection}
          />
        )}

        {activeSection === 'gallery' && (
          <GalleryView
            galleryItems={galleryItems}
            pageSettings={pageSettings}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {activeSection === 'contact' && (
          <ContactView
            pageSettings={pageSettings}
          />
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
        stylists={stylists}
        onBookingComplete={handleBookingComplete}
      />

    </div>
  );
}
