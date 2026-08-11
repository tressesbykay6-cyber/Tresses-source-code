import React from 'react';
import { Sparkles, Shield, Eye, Lock, Database, Mail } from 'lucide-react';

export const PrivacyPolicyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 animate-fade-in">
      <header className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-[#B88E39] font-bold flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Legal & Privacy
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C1814]">Privacy Policy</h1>
        <p className="text-sm text-[#5C5247] leading-relaxed">
          Last Updated: August 11, 2026. Your privacy is paramount to us at Tresses by Kay.
        </p>
      </header>

      <div className="bg-[#FFFDF9] border border-[#E5D7C0] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-[#5C5247]">
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-[#1C1814]">
            <Shield className="w-5 h-5 text-[#B88E39]" />
            <h2 className="font-serif text-xl font-bold">1. Introduction</h2>
          </div>
          <p className="text-sm leading-relaxed font-light">
            Welcome to Tresses by Kay (referred to as "we" or "our"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you visit our website, book services with us, or contact us.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-[#1C1814]">
            <Eye className="w-5 h-5 text-[#B88E39]" />
            <h2 className="font-serif text-xl font-bold">2. Information We Collect</h2>
          </div>
          <p className="text-sm leading-relaxed font-light">
            When you use our website or request a booking, we may collect the following information:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1.5 font-light">
            <li><strong>Identity & Contact Details:</strong> Your full name, telephone number (for WhatsApp booking and direct calls), and notes regarding styling preferences.</li>
            <li><strong>Location Data:</strong> Neighborhood/estate name and detailed address directions for housecall bookings.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, and cookie data used to store local booking choices.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-[#1C1814]">
            <Database className="w-5 h-5 text-[#B88E39]" />
            <h2 className="font-serif text-xl font-bold">3. How We Use Your Information</h2>
          </div>
          <p className="text-sm leading-relaxed font-light">
            We use your personal data to facilitate booking appointments manually via WhatsApp, organize studio schedules, calculate dispatch fees for housecalls, and improve our website experience.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-[#1C1814]">
            <Lock className="w-5 h-5 text-[#B88E39]" />
            <h2 className="font-serif text-xl font-bold">4. Data Security</h2>
          </div>
          <p className="text-sm leading-relaxed font-light">
            We implement industry-standard security measures to prevent your personal data from being accidentally lost, altered, or accessed in an unauthorized way. Booking information is securely stored locally in your browser cache or on our secure system servers.
          </p>
        </section>

        <section className="space-y-3 pt-6 border-t border-[#E5D7C0]/60">
          <div className="flex items-center gap-2.5 text-[#1C1814]">
            <Mail className="w-5 h-5 text-[#B88E39]" />
            <h2 className="font-serif text-xl font-bold">5. Contact Us</h2>
          </div>
          <p className="text-sm leading-relaxed font-light">
            If you have any questions about this privacy policy, please contact our support desk:
          </p>
          <div className="mt-2.5">
            <a
              href="mailto:trassesbykay6@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-[#B88E39] hover:text-[#1C1814] font-bold"
            >
              <span>trassesbykay6@gmail.com</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
