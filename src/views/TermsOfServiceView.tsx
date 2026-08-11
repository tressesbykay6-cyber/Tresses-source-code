import React from 'react';
import { Sparkles, Calendar, BadgeAlert, Coins, HelpCircle, Mail } from 'lucide-react';

export const TermsOfServiceView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 animate-fade-in">
      <header className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-[#B88E39] font-bold flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Legal & Terms
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C1814]">Terms of Service</h1>
        <p className="text-sm text-[#5C5247] leading-relaxed">
          Last Updated: August 11, 2026. Please read these terms carefully before booking.
        </p>
      </header>

      <div className="bg-[#FFFDF9] border border-[#E5D7C0] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-[#5C5247]">
        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-[#1C1814]">
            <Calendar className="w-5 h-5 text-[#B88E39]" />
            <h2 className="font-serif text-xl font-bold">1. Booking & Scheduling</h2>
          </div>
          <p className="text-sm leading-relaxed font-light">
            By requesting an appointment, you agree to connect with Kay on WhatsApp to review date availability and complete booking parameters. Due to high demand, your preferred time slot is only guaranteed once deposit terms have been satisfied.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-[#1C1814]">
            <Coins className="w-5 h-5 text-[#B88E39]" />
            <h2 className="font-serif text-xl font-bold">2. 30% Deposit Policy</h2>
          </div>
          <p className="text-sm leading-relaxed font-light">
            A required 30% deposit is payable for all bookings to secure your slot. This deposit is sent to Kay's Till number manually as agreed upon during your WhatsApp conversation. The remaining 70% balance is due at the time of your styling.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-[#1C1814]">
            <BadgeAlert className="w-5 h-5 text-[#B88E39]" />
            <h2 className="font-serif text-xl font-bold">3. Cancellation & Rescheduling</h2>
          </div>
          <p className="text-sm leading-relaxed font-light">
            Cancellations and rescheduling requests must be submitted through WhatsApp at least 24 hours prior to your scheduled appointment. Failure to do so may result in the forfeiture of your deposit.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2.5 text-[#1C1814]">
            <HelpCircle className="w-5 h-5 text-[#B88E39]" />
            <h2 className="font-serif text-xl font-bold">4. Housecall Rules</h2>
          </div>
          <p className="text-sm leading-relaxed font-light">
            Housecall appointments require providing accurate location details (estate, gate, house number, landmark). A mobile dispatch surcharge of KSh 1,500 is added to all housecall appointments. Customers must ensure a safe and well-lit workspace for the styling team.
          </p>
        </section>

        <section className="space-y-3 pt-6 border-t border-[#E5D7C0]/60">
          <div className="flex items-center gap-2.5 text-[#1C1814]">
            <Mail className="w-5 h-5 text-[#B88E39]" />
            <h2 className="font-serif text-xl font-bold">5. Contact Support</h2>
          </div>
          <p className="text-sm leading-relaxed font-light">
            For inquiries regarding corporate bridal booking contracts, custom wig pricing negotiations, or billing disputes:
          </p>
          <div className="mt-2.5">
            <a
              href="mailto:tressesbykay6@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-[#B88E39] hover:text-[#1C1814] font-bold"
            >
              <span>tressesbykay6@gmail.com</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
