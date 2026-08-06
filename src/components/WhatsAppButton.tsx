import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const whatsappUrl = `https://wa.me/254118831488?text=${encodeURIComponent("Hi, I'd like to book an appointment at Tresses by Kay")}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 lg:bottom-8 right-5 z-40 w-12 h-12 lg:w-14 lg:h-14 bg-[#C6A15B] text-[#0E0D0C] rounded-full flex items-center justify-center shadow-xl shadow-[#C6A15B]/20 hover:bg-[#b8924b] hover:scale-110 active:scale-95 transition-all duration-300 group border border-[#0E0D0C]/20"
      aria-label="Chat on WhatsApp with Tresses by Kay"
      title="Chat on WhatsApp (+254 011 883 1488)"
    >
      <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7 stroke-[2.2]" />
      <span className="absolute right-full mr-3 bg-[#221F1C] text-[#F6F0E4] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#C6A15B]/30 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md hidden sm:block">
        Chat with us (+254 011 883 1488)
      </span>
    </a>
  );
};
