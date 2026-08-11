import React, { useState } from 'react';
import { MapPin, Phone, MessageCircle, Clock, Send, CheckCircle2, Star, Sparkles, Heart, Award, ShieldCheck, UserCheck, Mail } from 'lucide-react';
import { Review } from '../types';
import { MOCK_REVIEWS } from '../data/mockData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const ContactView: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  // Client Review submission form state
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewService, setReviewService] = useState('HD Frontal Wig Install');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewQuote, setReviewQuote] = useState('');
  const [localReviews, setLocalReviews] = useState<Review[]>(MOCK_REVIEWS);

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setName('');
      setPhone('');
      setMessage('');
    }, 4000);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewQuote) return;
    
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      clientName: reviewerName,
      serviceBooked: reviewService,
      rating: reviewRating,
      quote: reviewQuote,
      date: 'Just now',
      verified: true,
    };

    setLocalReviews([newRev, ...localReviews]);
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setReviewerName('');
      setReviewQuote('');
    }, 4000);
  };

  const revealRef = useScrollReveal();

  return (
    <div ref={revealRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20 animate-fade-in">
      
      {/* 1. HERO PAGE TITLE */}
      <div className="reveal reveal-up text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-[#B88E39] font-bold flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4" /> About Us • Contact • Client Reviews
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C1814]">
          Welcome to Tresses by Kay
        </h1>
        <p className="text-sm text-[#5C5247] font-light leading-relaxed">
          Nairobi’s premier boutique beauty atelier. Located at JKUAT Towers on Kenyatta Avenue, offering in-studio styling and mobile housecalls across Nairobi.
        </p>
      </div>

      {/* 2. ABOUT US & ATELIER HERITAGE SECTION (Folded into Contact page) */}
      <section className="reveal reveal-up bg-[#FFFDF9] border border-[#E5D7C0] rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#F8E2C2]/40 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#E5D7C0] shadow-xl">
              <img
                src="/media/kay-founder.webp"
                alt="Kay, founder and master hair artist at Tresses"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1814]/80 via-transparent to-transparent flex items-end p-6">
                <div>
                  <h4 className="font-serif text-xl font-bold text-[#FAF7F2]">Kay</h4>
                  <p className="text-xs text-[#B88E39] font-semibold">Founder & Master Hair Artist</p>
                </div>
              </div>
            </div>

            {/* Floating Trust Badge */}
            <div className="absolute -bottom-6 -right-4 sm:bottom-4 sm:right-4 bg-[#FAF7F2] border border-[#B88E39]/40 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-[#F8E2C2]/60 border border-[#B88E39] text-[#B88E39] flex items-center justify-center font-bold text-sm">
                ★ 4.9
              </div>
              <div>
                <p className="text-xs font-bold text-[#1C1814]">638+ Happy Clients</p>
                <p className="text-[10px] text-[#5C5247]">@tresses_by__kay Nairobi</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#B88E39] font-bold">
              Our Story & Philosophy
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1C1814] leading-tight">
              A boutique atelier built on precision, warmth, and craft.
            </h2>
            <p className="text-sm text-[#5C5247] leading-relaxed font-light">
              Tresses by Kay began with a simple mission: to give Nairobi women an elevated, stress-free hair care experience where every appointment feels like an occasion. Whether you are coming in for a big chop, custom HD frontal melt, knotless braids, or bridal makeover, we treat your hair with utmost care and artistry.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C0]/60 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1C1814]">
                  <Award className="w-4 h-4 text-[#B88E39]" />
                  <span>Master Craftmanship</span>
                </div>
                <p className="text-[11px] text-[#5C5247]">Seamless lace bleaching, custom tinting, and scalp protection.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5D7C0]/60 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1C1814]">
                  <ShieldCheck className="w-4 h-4 text-[#B88E39]" />
                  <span>Studio & Housecall</span>
                </div>
                <p className="text-[11px] text-[#5C5247]">Available at JKUAT Towers or delivered directly to your home.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. LOCATION & CONTACT FORM GRID */}
      <section className="reveal reveal-up grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Location, Direct Action Buttons & Hours Table (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Location Details Card */}
          <div className="card-interactive bg-[#FFFDF9] p-6 rounded-3xl border border-[#E5D7C0] shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F8E2C2]/50 border border-[#B88E39] text-[#B88E39] flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1C1814]">
                  JKUAT Towers Atelier
                </h3>
                <p className="text-sm text-[#5C5247] mt-0.5">
                  Kenyatta Ave, Mezzanine Floor, Shop M08
                </p>
                <p className="text-xs text-[#B88E39] mt-1 font-bold">
                  Nairobi CBD, Kenya (00100)
                </p>
              </div>
            </div>

            {/* Click to call / WhatsApp CTA buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href="tel:+254118831488"
                className="bg-[#1C1814] hover:bg-[#2C2620] text-[#FAF7F2] p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm"
              >
                <Phone className="w-4 h-4 text-[#B88E39]" />
                <span>Call +254 011 883 1488</span>
              </a>

              <a
                href="https://wa.me/254118831488?text=Hi%2C%20I'd%20like%20to%20inquire%20about%20an%20appointment"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#B88E39] hover:bg-[#A37B2C] text-[#FAF7F2] p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Atelier Direct</span>
              </a>

              <a
                href="mailto:trassesbykay6@gmail.com"
                className="bg-[#FAF7F2] hover:bg-[#F8E2C2]/30 border border-[#E5D7C0] text-[#1C1814] p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm col-span-1 sm:col-span-2"
              >
                <Mail className="w-4 h-4 text-[#B88E39]" />
                <span>Email: trassesbykay6@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Operating Hours Table */}
          <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-[#E5D7C0] shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#B88E39]" />
              <h3 className="font-serif text-lg font-bold text-[#1C1814]">Studio Hours & Mobile Schedule</h3>
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-[#E5D7C0]/60">
              <div className="flex justify-between pt-2">
                <span className="text-[#5C5247] font-medium">Monday – Friday</span>
                <span className="font-bold text-[#1C1814]">8:30 AM – 6:00 PM</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[#5C5247] font-medium">Saturday</span>
                <span className="font-bold text-[#1C1814]">8:30 AM – 6:00 PM</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[#B88E39] font-bold">Sunday</span>
                <span className="font-bold text-[#B88E39]">Closed for Rest & Prep</span>
              </div>
            </div>
          </div>

          {/* Map Frame */}
          <div className="bg-[#FFFDF9] rounded-3xl overflow-hidden border border-[#E5D7C0] aspect-[16/9] relative group shadow-sm">
            <iframe
              title="JKUAT Towers Map Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.817294436214!2d36.8202!3d-1.2847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d7a6e76811%3A0x62955f13fa1458e3!2sJKUAT%20Towers%2C%20Kenyatta%20Ave%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
              className="w-full h-full border-0 group-hover:contrast-105 transition-all"
              loading="lazy"
            />
            <div className="absolute top-3 left-3 bg-[#FAF7F2]/95 text-[#1C1814] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#E5D7C0] shadow-md backdrop-blur-md flex items-center gap-1.5">
              <span>📍 JKUAT Towers, Mezzanine M08</span>
            </div>
          </div>

        </div>

        {/* Right Column: Contact Inquiry Form (6 cols) */}
        <div className="lg:col-span-6 bg-[#FFFDF9] p-8 rounded-3xl border border-[#E5D7C0] shadow-sm space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B88E39] font-bold">Inquiries & Consultations</span>
            <h2 className="font-serif text-2xl font-bold text-[#1C1814] mt-1">
              Send Us a Direct Message
            </h2>
            <p className="text-xs text-[#5C5247] font-light mt-1">
              Have a question regarding custom wig coloring, bridal package quotes, or microlink consultations? Fill out the form below.
            </p>
          </div>

          {formSubmitted ? (
            <div className="bg-[#FAF7F2] p-8 rounded-2xl border border-[#B88E39] text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#B88E39] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#1C1814]">Inquiry Received!</h3>
              <p className="text-xs text-[#5C5247]">
                Thank you, {name}. Our atelier manager will contact you on WhatsApp or phone shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitInquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1814] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wanjira Njeri"
                  className="w-full bg-[#FAF7F2] border border-[#E5D7C0] rounded-xl p-3 text-xs text-[#1C1814] outline-none focus:border-[#B88E39]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1814] mb-1">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +254 712 345 678"
                  className="w-full bg-[#FAF7F2] border border-[#E5D7C0] rounded-xl p-3 text-xs text-[#1C1814] outline-none focus:border-[#B88E39]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1814] mb-1">
                  Message / Consultation Query
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your desired style, preferred date, or custom wig request..."
                  className="w-full bg-[#FAF7F2] border border-[#E5D7C0] rounded-xl p-3 text-xs text-[#1C1814] outline-none focus:border-[#B88E39]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1C1814] hover:bg-[#2C2620] text-[#FAF7F2] font-bold text-xs py-3.5 px-6 rounded-full transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-[#B88E39]" />
                <span>Send Inquiry to Tresses Team</span>
              </button>
            </form>
          )}
        </div>

      </section>

      {/* 4. CLIENT REVIEWS & TESTIMONIALS SECTION (Folded into Contact page) */}
      <section className="space-y-8 pt-8 border-t border-[#E5D7C0]">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B88E39] font-bold">Verified Client Feedback</span>
            <h2 className="font-serif text-3xl font-bold text-[#1C1814] mt-1">
              Words from Atelier Clients
            </h2>
            <p className="text-xs text-[#5C5247] font-light mt-1 max-w-lg">
              Read real client testimonials from appointments at our JKUAT Towers studio and housecall visits across Nairobi.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FFFDF9] border border-[#E5D7C0] p-3 rounded-2xl shadow-sm">
            <div className="flex text-[#B88E39]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-xs font-bold text-[#1C1814]">4.9 out of 5.0</span>
            <span className="text-[11px] text-[#5C5247]">(638+ reviews)</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#FFFDF9] p-6 rounded-3xl border border-[#E5D7C0] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#B88E39]/40 transition-all"
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

                <p className="font-serif text-sm text-[#1C1814] leading-relaxed italic">
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

        {/* Leave a Review Form */}
        <div className="bg-[#FFFDF9] p-8 rounded-3xl border border-[#E5D7C0] shadow-sm max-w-2xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-xl font-bold text-[#1C1814]">Were you styled by Kay?</h3>
            <p className="text-xs text-[#5C5247]">Share your experience with future clients!</p>
          </div>

          {reviewSubmitted ? (
            <div className="bg-[#FAF7F2] p-6 rounded-2xl text-center space-y-2 border border-[#B88E39]">
              <CheckCircle2 className="w-10 h-10 text-[#B88E39] mx-auto" />
              <p className="font-serif text-sm font-bold text-[#1C1814]">Thank you for your review!</p>
              <p className="text-xs text-[#5C5247]">Your review has been added to our feedback wall.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#1C1814] block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Joy Muthoni"
                    className="w-full bg-[#FAF7F2] border border-[#E5D7C0] rounded-xl p-2.5 text-xs text-[#1C1814] outline-none focus:border-[#B88E39]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#1C1814] block mb-1">Service Received</label>
                  <select
                    value={reviewService}
                    onChange={(e) => setReviewService(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5D7C0] rounded-xl p-2.5 text-xs text-[#1C1814] outline-none focus:border-[#B88E39]"
                  >
                    <option value="HD Frontal Wig Install">HD Frontal Wig Install</option>
                    <option value="Knotless Braids">Knotless Braids</option>
                    <option value="Microlink Extensions">Microlink Extensions</option>
                    <option value="Bridal Glam & Makeup">Bridal Glam & Makeup</option>
                    <option value="Silk Press & Treatment">Silk Press & Treatment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#1C1814] block mb-1">Rating</label>
                <div className="flex gap-2">
                  {[5, 4, 3, 2, 1].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewRating(num)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                        reviewRating === num
                          ? 'bg-[#B88E39] text-[#FAF7F2] border-[#B88E39]'
                          : 'bg-[#FAF7F2] text-[#5C5247] border-[#E5D7C0]'
                      }`}
                    >
                      ★ {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#1C1814] block mb-1">Review *</label>
                <textarea
                  rows={3}
                  required
                  value={reviewQuote}
                  onChange={(e) => setReviewQuote(e.target.value)}
                  placeholder="Tell us about your hair result, neatness, or stylist punctuality..."
                  className="w-full bg-[#FAF7F2] border border-[#E5D7C0] rounded-xl p-2.5 text-xs text-[#1C1814] outline-none focus:border-[#B88E39]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#B88E39] hover:bg-[#A37B2C] text-[#FAF7F2] font-bold text-xs py-3 px-6 rounded-full transition-all shadow-md"
              >
                Post Review
              </button>
            </form>
          )}
        </div>

      </section>

    </div>
  );
};
