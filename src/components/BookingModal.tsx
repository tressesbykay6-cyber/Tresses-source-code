import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, Clock, MapPin, Home, Phone, Smartphone, ArrowLeft, Share2, Sparkles } from 'lucide-react';
import { Service, ServiceCategory } from '../types';
import { MOCK_SERVICES } from '../data/mockData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: Service | null;
  onBookingComplete?: (bookingData: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preselectedService = null,
  onBookingComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('Braids');
  const [selectedService, setSelectedService] = useState<Service | null>(preselectedService || MOCK_SERVICES[0]);
  
  // Service Format: 'studio' | 'housecall'
  const [serviceLocationType, setServiceLocationType] = useState<'studio' | 'housecall'>('studio');
  
  // Housecall Address Details
  const [housecallEstate, setHousecallEstate] = useState('Lavington');
  const [housecallAddress, setHousecallAddress] = useState('');
  const [housecallLandmark, setHousecallLandmark] = useState('');

  // Schedule & Client
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-15');
  const [selectedTime, setSelectedTime] = useState<string>('11:00 AM');
  const [clientName, setClientName] = useState('Zari Hassan');
  const [clientPhone, setClientPhone] = useState('0712345678');
  const [clientNotes, setClientNotes] = useState('');

  // M-Pesa Payment State
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'stk_prompt' | 'verifying' | 'success'>('idle');

  if (!isOpen) return null;

  const categories: ServiceCategory[] = ['Braids', 'Wigs & Extensions', 'Hair Treatments & Color', 'Makeup', 'Nails'];
  const availableTimes = ['09:00 AM', '10:30 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM'];
  const filteredServices = MOCK_SERVICES.filter(s => s.category === selectedCategory);

  // Dynamic 30% Deposit Calculation
  const basePrice = selectedService ? selectedService.price : 0;
  const housecallFee = serviceLocationType === 'housecall' ? 1500 : 0;
  const totalPrice = basePrice + housecallFee;
  const depositAmount = Math.round(totalPrice * 0.30); // Dynamic 30% deposit
  const balanceRemaining = totalPrice - depositAmount;

  const handleSimulateMPesaSTK = () => {
    setPaymentStatus('stk_prompt');

    setTimeout(() => {
      setPaymentStatus('verifying');
      
      setTimeout(() => {
        setPaymentStatus('success');
        setStep(5);

        if (onBookingComplete && selectedService) {
          const newBooking = {
            id: `bk-${Math.floor(1000 + Math.random() * 9000)}`,
            service: selectedService,
            locationType: serviceLocationType,
            housecallDetails: serviceLocationType === 'housecall' ? {
              estate: housecallEstate,
              address: housecallAddress,
              landmark: housecallLandmark,
            } : null,
            date: selectedDate,
            timeSlot: selectedTime,
            depositPaid: depositAmount,
            totalPrice: totalPrice,
            balanceDue: balanceRemaining,
            status: 'Confirmed',
            clientName,
            clientPhone,
            notes: clientNotes,
          };
          onBookingComplete(newBooking);
        }
      }, 2500);
    }, 2000);
  };

  const handleResetModal = () => {
    setStep(1);
    setPaymentStatus('idle');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] border border-[#E5D7C0] rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Glow Header Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-[#F8E2C2]/50 via-[#F3D3A6]/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 bg-[#FFFDF9] px-6 py-4 border-b border-[#E5D7C0]/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#B88E39] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Step {step} of 5
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1C1814]">
              {step === 1 && '1. Choose Service Catalog'}
              {step === 2 && '2. Studio Visit or Housecall'}
              {step === 3 && '3. Date & Client Details'}
              {step === 4 && '4. Review & 30% M-Pesa Deposit'}
              {step === 5 && '5. Booking Confirmed'}
            </h3>
          </div>

          <button
            onClick={handleResetModal}
            className="p-1.5 rounded-full text-[#5C5247] hover:text-[#B88E39] hover:bg-[#FAF7F2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E5D7C0]/30 h-1.5 flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-full flex-1 transition-all duration-300 ${
                i <= step ? 'bg-[#B88E39]' : 'bg-[#E5D7C0]/40'
              }`}
            />
          ))}
        </div>

        {/* Body Content */}
        <div className="relative z-10 p-6 max-h-[75vh] overflow-y-auto">

          {/* STEP 1: CHOOSE SERVICE */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Category tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                      selectedCategory === cat
                        ? 'bg-[#1C1814] text-[#FAF7F2] border-[#1C1814] shadow-md'
                        : 'bg-[#FFFDF9] text-[#5C5247] border-[#E5D7C0] hover:border-[#B88E39]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Service List */}
              <div className="space-y-3">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      selectedService?.id === service.id
                        ? 'bg-[#FFFDF9] border-[#B88E39] shadow-lg shadow-[#B88E39]/10 ring-2 ring-[#B88E39]/20'
                        : 'bg-[#FFFDF9]/60 border-[#E5D7C0]/70 hover:border-[#B88E39]/50'
                    }`}
                  >
                    <div className="flex gap-3.5 items-center">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#E5D7C0]"
                      />
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#1C1814]">
                          {service.name}
                        </h4>
                        <p className="text-xs text-[#5C5247] line-clamp-1 mt-0.5">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#B88E39]">
                          <span className="font-bold text-sm">KSh {service.price.toLocaleString()}</span>
                          <span className="text-[#E5D7C0]">•</span>
                          <span className="text-[#5C5247] flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-[#B88E39]" /> {service.durationLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="self-end sm:self-center">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedService?.id === service.id
                          ? 'border-[#B88E39] bg-[#B88E39]'
                          : 'border-[#5C5247]/30'
                      }`}>
                        {selectedService?.id === service.id && (
                          <div className="w-2 h-2 rounded-full bg-[#FAF7F2]" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-[#E5D7C0]/60">
                <button
                  disabled={!selectedService}
                  onClick={() => setStep(2)}
                  className="bg-[#B88E39] hover:bg-[#A37B2C] text-[#FAF7F2] font-semibold text-xs py-3 px-6 rounded-full transition-all shadow-md disabled:opacity-50"
                >
                  Next: Studio or Housecall
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: STUDIO OR HOUSECALL */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-xs text-[#5C5247] leading-relaxed">
                Choose whether you'd like to be styled at our Kenyatta Ave atelier or receive full mobile service at your residence or hotel in Nairobi.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Studio Option */}
                <div
                  onClick={() => setServiceLocationType('studio')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    serviceLocationType === 'studio'
                      ? 'bg-[#FFFDF9] border-[#B88E39] shadow-md ring-2 ring-[#B88E39]/20'
                      : 'bg-[#FFFDF9]/60 border-[#E5D7C0]/70 hover:border-[#B88E39]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F8E2C2]/50 border border-[#B88E39]/30 text-[#B88E39] flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1C1814]">Studio Appointment</h4>
                      <p className="text-[11px] text-[#5C5247]">JKUAT Towers, Kenyatta Ave, Nairobi CBD</p>
                    </div>
                  </div>
                  <div className="text-[11px] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5D7C0]/60 text-[#5C5247]">
                    ✨ Complimentary tea/coffee & private styling station included.
                  </div>
                </div>

                {/* Housecall Option */}
                <div
                  onClick={() => setServiceLocationType('housecall')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    serviceLocationType === 'housecall'
                      ? 'bg-[#FFFDF9] border-[#B88E39] shadow-md ring-2 ring-[#B88E39]/20'
                      : 'bg-[#FFFDF9]/60 border-[#E5D7C0]/70 hover:border-[#B88E39]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F8E2C2]/50 border border-[#B88E39]/30 text-[#B88E39] flex items-center justify-center shrink-0">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#1C1814]">Housecall / In-Home</h4>
                      <p className="text-[11px] text-[#B88E39] font-bold">Mobile Atelier across Nairobi (+ KSh 1,500)</p>
                    </div>
                  </div>
                  <div className="text-[11px] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5D7C0]/60 text-[#5C5247]">
                    🚗 Our team brings all equipment, lighting & tools to your door.
                  </div>
                </div>

              </div>

              {/* If Housecall, capture details */}
              {serviceLocationType === 'housecall' && (
                <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#B88E39]/30 space-y-3 animate-fade-in">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[#B88E39]">
                    Housecall Location Details (Nairobi)
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[#1C1814] block mb-1">
                        Neighborhood / Estate *
                      </label>
                      <input
                        type="text"
                        required
                        value={housecallEstate}
                        onChange={(e) => setHousecallEstate(e.target.value)}
                        placeholder="e.g. Lavington, Kilimani, Westlands, Karen, South B"
                        className="w-full bg-[#FAF7F2] border border-[#E5D7C0] rounded-xl p-2.5 text-xs text-[#1C1814] outline-none focus:border-[#B88E39]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#1C1814] block mb-1">
                        Apartment / House / Street Address
                      </label>
                      <input
                        type="text"
                        value={housecallAddress}
                        onChange={(e) => setHousecallAddress(e.target.value)}
                        placeholder="e.g. Court 4, House 12B / Kingara Road"
                        className="w-full bg-[#FAF7F2] border border-[#E5D7C0] rounded-xl p-2.5 text-xs text-[#1C1814] outline-none focus:border-[#B88E39]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#1C1814] block mb-1">
                      Landmark or Gate Directions
                    </label>
                    <input
                      type="text"
                      value={housecallLandmark}
                      onChange={(e) => setHousecallLandmark(e.target.value)}
                      placeholder="e.g. Opposite Shell petrol station / Near Valley Arcade"
                      className="w-full bg-[#FAF7F2] border border-[#E5D7C0] rounded-xl p-2.5 text-xs text-[#1C1814] outline-none focus:border-[#B88E39]"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-[#E5D7C0]/60">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-[#5C5247] hover:text-[#B88E39] flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Services
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-[#B88E39] hover:bg-[#A37B2C] text-[#FAF7F2] font-semibold text-xs py-3 px-6 rounded-full transition-all shadow-md"
                >
                  Next: Schedule & Client Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DATE & TIME + CLIENT INFO */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#B88E39] uppercase tracking-wider mb-2">
                  Select Appointment Date
                </label>
                <input
                  type="date"
                  min="2026-08-06"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#FFFDF9] border border-[#E5D7C0] rounded-xl p-3 text-[#1C1814] focus:border-[#B88E39] outline-none font-medium text-xs shadow-sm"
                />
                <p className="text-[11px] text-[#5C5247] mt-1">
                  Atelier hours: Monday – Saturday, 8:30 AM – 6:00 PM
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#B88E39] uppercase tracking-wider mb-2">
                  Available Time Slots
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        selectedTime === time
                          ? 'bg-[#1C1814] text-[#FAF7F2] border-[#1C1814]'
                          : 'bg-[#FFFDF9] text-[#1C1814] border-[#E5D7C0] hover:border-[#B88E39]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-[#B88E39]" />
                      <span>{time}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Client Info inputs */}
              <div className="space-y-3 pt-4 border-t border-[#E5D7C0]/60">
                <h4 className="font-serif text-sm font-bold text-[#1C1814]">Client Contact Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#5C5247] block mb-1 font-semibold">Your Full Name *</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Zari Hassan"
                      className="w-full bg-[#FFFDF9] border border-[#E5D7C0] rounded-xl p-2.5 text-xs text-[#1C1814] focus:border-[#B88E39] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#5C5247] block mb-1 font-semibold">M-Pesa Phone Number *</label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full bg-[#FFFDF9] border border-[#E5D7C0] rounded-xl p-2.5 text-xs text-[#1C1814] focus:border-[#B88E39] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#5C5247] block mb-1 font-semibold">Special Hair Notes / Color Preferences (Optional)</label>
                  <input
                    type="text"
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="e.g. Sensitive scalp / bring honey blonde lace tint"
                    className="w-full bg-[#FFFDF9] border border-[#E5D7C0] rounded-xl p-2.5 text-xs text-[#1C1814] focus:border-[#B88E39] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#E5D7C0]/60">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-[#5C5247] hover:text-[#B88E39] flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Location
                </button>
                <button
                  disabled={!selectedDate || !selectedTime || !clientName || !clientPhone}
                  onClick={() => setStep(4)}
                  className="bg-[#B88E39] hover:bg-[#A37B2C] text-[#FAF7F2] font-semibold text-xs py-3 px-6 rounded-full transition-all shadow-md disabled:opacity-50"
                >
                  Next: Review & 30% Deposit
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & DYNAMIC 30% DEPOSIT */}
          {step === 4 && (
            <div className="space-y-6">
              
              {/* Summary Card */}
              <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#B88E39]/40 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-[#E5D7C0]/60 pb-3">
                  <div>
                    <span className="text-[10px] uppercase text-[#B88E39] font-bold">Appointment Breakdown</span>
                    <h4 className="font-serif text-lg font-bold text-[#1C1814]">
                      {selectedService?.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#5C5247] block">Total Investment</span>
                    <span className="text-base font-bold text-[#1C1814]">
                      KSh {totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-[#5C5247]">
                  <div>
                    <span className="text-[#8C8071] text-[11px] block">Format & Location</span>
                    <span className="font-semibold text-[#1C1814]">
                      {serviceLocationType === 'housecall'
                        ? `Housecall (${housecallEstate})`
                        : 'Studio at JKUAT Towers, CBD'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8C8071] text-[11px] block">Date & Time</span>
                    <span className="font-semibold text-[#1C1814]">
                      {selectedDate} at {selectedTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8C8071] text-[11px] block">Client Name</span>
                    <span className="font-semibold text-[#1C1814]">{clientName}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8071] text-[11px] block">M-Pesa Phone</span>
                    <span className="font-semibold text-[#1C1814]">{clientPhone}</span>
                  </div>
                </div>

                {/* 30% Deposit Calculation Box */}
                <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E5D7C0] space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-[#5C5247]">
                    <span>Base Service Price:</span>
                    <span>KSh {basePrice.toLocaleString()}</span>
                  </div>
                  {serviceLocationType === 'housecall' && (
                    <div className="flex items-center justify-between text-xs font-medium text-[#5C5247]">
                      <span>Mobile Housecall Dispatch Surcharge:</span>
                      <span>KSh {housecallFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs font-bold text-[#B88E39] pt-1 border-t border-[#E5D7C0]/60">
                    <span>Required 30% Deposit (Payable Now):</span>
                    <span className="text-sm text-[#B88E39]">KSh {depositAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#5C5247]">
                    <span>70% Balance Due at Seat / Appointment:</span>
                    <span className="font-semibold text-[#1C1814]">KSh {balanceRemaining.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* M-Pesa Payment Box */}
              <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#E5D7C0] text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-[#B88E39]">
                  <Smartphone className="w-5 h-5" />
                  <span className="font-serif text-sm font-bold">Safaricom M-Pesa STK Push Payment</span>
                </div>

                {paymentStatus === 'idle' && (
                  <>
                    <p className="text-xs text-[#5C5247]">
                      Click below to trigger an instant M-Pesa prompt directly to <strong className="text-[#1C1814]">{clientPhone}</strong> for <strong>KSh {depositAmount.toLocaleString()}</strong>.
                    </p>

                    <button
                      onClick={handleSimulateMPesaSTK}
                      className="w-full bg-[#1C1814] hover:bg-[#2C2620] text-[#FAF7F2] font-bold text-xs py-3.5 px-6 rounded-full transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                      <span>Pay KSh {depositAmount.toLocaleString()} (30% Deposit) via M-Pesa</span>
                    </button>
                  </>
                )}

                {paymentStatus === 'stk_prompt' && (
                  <div className="py-6 space-y-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full border-2 border-[#B88E39] border-t-transparent animate-spin mx-auto" />
                    <p className="text-sm font-bold text-[#B88E39]">STK Push Prompt Sent to {clientPhone}!</p>
                    <p className="text-xs text-[#5C5247]">
                      Please check your mobile phone screen now and enter your M-Pesa PIN...
                    </p>
                  </div>
                )}

                {paymentStatus === 'verifying' && (
                  <div className="py-6 space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-[#1C1814] border-t-transparent animate-spin mx-auto" />
                    <p className="text-sm font-bold text-[#1C1814]">Verifying Safaricom M-Pesa Callback...</p>
                    <p className="text-xs text-[#5C5247]">Matching payment receipt against Tresses Till...</p>
                  </div>
                )}
              </div>

              <div className="flex justify-start">
                <button
                  disabled={paymentStatus !== 'idle'}
                  onClick={() => setStep(3)}
                  className="text-xs text-[#5C5247] hover:text-[#B88E39] flex items-center gap-1 font-medium disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4" /> Edit Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION */}
          {step === 5 && (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#F8E2C2]/60 border-2 border-[#B88E39] text-[#B88E39] flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-[#B88E39] font-bold">Appointment Reserved</span>
                <h3 className="font-serif text-2xl font-bold text-[#1C1814] mt-1">
                  We look forward to styling you, {clientName.split(' ')[0]}!
                </h3>
                <p className="text-xs text-[#5C5247] mt-2 max-w-md mx-auto">
                  Your 30% deposit of KSh {depositAmount.toLocaleString()} has been verified.
                  {serviceLocationType === 'housecall'
                    ? ` Our mobile team will arrive at ${housecallEstate} on ${selectedDate} at ${selectedTime}.`
                    : ` Your seat is reserved at JKUAT Towers, Kenyatta Ave on ${selectedDate} at ${selectedTime}.`}
                </p>
              </div>

              <div className="bg-[#FFFDF9] p-4 rounded-2xl text-left border border-[#E5D7C0] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#8C8071]">Service:</span>
                  <span className="font-semibold text-[#1C1814]">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C8071]">Location:</span>
                  <span className="font-semibold text-[#1C1814]">
                    {serviceLocationType === 'housecall'
                      ? `Housecall (${housecallEstate})`
                      : 'JKUAT Towers, Shop M08, Nairobi'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C8071]">Date & Time:</span>
                  <span className="font-semibold text-[#B88E39]">{selectedDate} at {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C8071]">30% Deposit Paid:</span>
                  <span className="font-semibold text-[#B88E39]">KSh {depositAmount.toLocaleString()} (M-Pesa STK)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#E5D7C0]/60">
                  <span className="text-[#8C8071]">Balance Due on Date:</span>
                  <span className="font-bold text-[#1C1814]">KSh {balanceRemaining.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Appointment at Tresses by Kay - ${selectedService?.name}`)}&location=${encodeURIComponent(serviceLocationType === 'housecall' ? housecallEstate : 'JKUAT Towers, Kenyatta Ave, Shop M08, Nairobi')}&details=${encodeURIComponent(`Service: ${selectedService?.name}. Contact: 0118831488`)}`;
                    window.open(calendarUrl, '_blank');
                  }}
                  className="bg-[#FFFDF9] hover:bg-[#FAF7F2] text-[#1C1814] text-xs font-semibold py-3 px-5 rounded-full border border-[#E5D7C0] flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-[#B88E39]" />
                  <span>Add to Google Calendar</span>
                </button>

                <a
                  href={`https://wa.me/254118831488?text=${encodeURIComponent(`Hi Tresses team, I just booked ${selectedService?.name} (${serviceLocationType}) for ${selectedDate} at ${selectedTime}. Deposit KSh ${depositAmount} paid via M-Pesa.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1C1814] hover:bg-[#2C2620] text-[#FAF7F2] text-xs font-bold py-3 px-5 rounded-full flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-[#B88E39]" />
                  <span>WhatsApp Confirmation</span>
                </a>
              </div>

              <button
                onClick={handleResetModal}
                className="text-xs text-[#5C5247] hover:text-[#B88E39] underline font-medium"
              >
                Return to Website
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
