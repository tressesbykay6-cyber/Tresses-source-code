import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Calendar, Clock, MapPin, Home, MessageCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { Service, ServiceCategory, Stylist } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  stylists: Stylist[];
  preselectedService?: Service | null;
  onBookingComplete?: (bookingData: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  services,
  stylists,
  preselectedService = null,
  onBookingComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('Braids');
  const [selectedService, setSelectedService] = useState<Service | null>(preselectedService || services[0] || null);
  
  // Service Format: 'studio' | 'housecall'
  const [serviceLocationType, setServiceLocationType] = useState<'studio' | 'housecall'>('studio');
  
  // Housecall Address Details
  const [housecallEstate, setHousecallEstate] = useState('');
  const [housecallAddress, setHousecallAddress] = useState('');
  const [housecallLandmark, setHousecallLandmark] = useState('');

  // Schedule & Client
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('11:00 AM');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [requestedStylist, setRequestedStylist] = useState<string>(''); // For preferred stylist selection

  useEffect(() => {
    if (preselectedService) setSelectedService(preselectedService);
    else if (!selectedService || !services.some((service) => service.id === selectedService.id)) setSelectedService(services[0] || null);
  }, [preselectedService, services, selectedService]);

  if (!isOpen) return null;

  const categories: ServiceCategory[] = ['Braids', 'Wigs & Extensions', 'Hair Treatments & Color', 'Makeup', 'Nails'];
  const availableTimes = ['09:00 AM', '10:30 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM'];
  const filteredServices = services.filter(s => s.category === selectedCategory);

  // Dynamic pricing
  const basePrice = selectedService ? selectedService.price : 0;
  const housecallFee = serviceLocationType === 'housecall' ? 1500 : 0;
  const totalPrice = basePrice + housecallFee;
  const depositAmount = Math.round(totalPrice * 0.30);
  const balanceRemaining = totalPrice - depositAmount;

  // Build the WhatsApp message with all booking details
  const buildWhatsAppMessage = () => {
    const locationInfo = serviceLocationType === 'housecall'
      ? `📍 Housecall to ${housecallEstate}${housecallAddress ? `, ${housecallAddress}` : ''}${housecallLandmark ? ` (Near: ${housecallLandmark})` : ''}`
      : '📍 Studio at JKUAT Towers, Kenyatta Ave, Shop M08, Nairobi CBD';

    const lines = [
      `Hi Kay! 👋 I'd like to book an appointment at Tresses by Kay.`,
      ``,
      `✨ *Service:* ${selectedService?.name}`,
      `⏱ *Duration:* ${selectedService?.durationLabel}`,
      locationInfo,
      `📅 *Preferred Date:* ${selectedDate}`,
      `🕐 *Preferred Time:* ${selectedTime}`,
      ...(requestedStylist ? [`💇‍♀️ *Requested Stylist:* ${requestedStylist}`] : []),
      ``,
      `👤 *Name:* ${clientName}`,
      `📱 *Phone:* ${clientPhone}`,
      ...(clientNotes ? [`📝 *Notes:* ${clientNotes}`] : []),
      ``,
      `💰 *Price Breakdown:*`,
      `   Service: KSh ${basePrice.toLocaleString()}`,
      ...(serviceLocationType === 'housecall' ? [`   Housecall Fee: KSh ${housecallFee.toLocaleString()}`] : []),
      `   Total: KSh ${totalPrice.toLocaleString()}`,
      `   30% Deposit: KSh ${depositAmount.toLocaleString()}`,
      `   Balance: KSh ${balanceRemaining.toLocaleString()}`,
      ``,
      `Please confirm availability and share payment details for the deposit. Thank you! 🙏`,
    ];
    return lines.join('\n');
  };

  const whatsappUrl = `https://wa.me/254118831488?text=${encodeURIComponent(buildWhatsAppMessage())}`;

  const handleBookViaWhatsApp = () => {
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
        depositPaid: 0,
        totalPrice: totalPrice,
        balanceDue: totalPrice,
        status: 'Pending',
        clientName,
        clientPhone,
        notes: clientNotes,
        requestedStylistName: requestedStylist || 'None',
        durationMinutes: selectedService.durationMinutes || 60,
      };
      onBookingComplete(newBooking);
    }

    window.open(whatsappUrl, '_blank');
    setStep(4);
  };

  const handleResetModal = () => {
    setStep(1);
    setRequestedStylist('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] border border-[#E5D7C0] rounded-3xl shadow-2xl overflow-hidden my-6">
        
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-[#F8E2C2]/50 via-[#F3D3A6]/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 bg-[#FFFDF9] px-6 py-4 border-b border-[#E5D7C0]/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#B88E39] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Step {step} of 4
            </span>
            <h3 className="font-serif text-lg font-bold text-[#1C1814]">
              {step === 1 && '1. Choose Service Catalog'}
              {step === 2 && '2. Studio Visit or Housecall'}
              {step === 3 && '3. Date & Client Details'}
              {step === 4 && '4. Booking Confirmed'}
            </h3>
          </div>

          <button
            onClick={handleResetModal}
            className="p-1.5 rounded-full text-[#5C5247] hover:text-[#B88E39] hover:bg-[#FAF7F2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full bg-[#E5D7C0]/30 h-1.5 flex">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-full flex-1 transition-all duration-300 ${
                i <= step ? 'bg-[#B88E39]' : 'bg-[#E5D7C0]/40'
              }`}
            />
          ))}
        </div>

        <div className="relative z-10 p-6 max-h-[75vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6">
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
                          {service.numberOfStylists && service.numberOfStylists > 0 && (
                            <>
                              <span className="text-[#E5D7C0]">•</span>
                              <span className="text-[#9A6F2E] font-bold">
                                {service.numberOfStylists} stylist{service.numberOfStylists > 1 ? 's' : ''} available
                              </span>
                            </>
                          )}
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

          {step === 2 && (
            <div className="space-y-6">
              <p className="text-xs text-[#5C5247] leading-relaxed">
                Choose whether you'd like to be styled at our Kenyatta Ave atelier or receive full mobile service at your residence or hotel in Nairobi.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

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
                </div>
              </div>

              {serviceLocationType === 'housecall' && (
                <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#B88E39]/30 space-y-3 animate-fade-in">
                  <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[#B88E39]">Housecall Location Details</h4>
                  <input type="text" placeholder="Neighborhood / Estate *" value={housecallEstate} onChange={(e) => setHousecallEstate(e.target.value)} className="w-full bg-[#FAF7F2] border border-[#E5D7C0] rounded-xl p-2.5 text-xs text-[#1C1814] outline-none" />
                  <input type="text" placeholder="Apartment / House / Street Address" value={housecallAddress} onChange={(e) => setHousecallAddress(e.target.value)} className="w-full bg-[#FAF7F2] border border-[#E5D7C0] rounded-xl p-2.5 text-xs text-[#1C1814] outline-none" />
                  <input type="text" placeholder="Landmark or Gate Directions" value={housecallLandmark} onChange={(e) => setHousecallLandmark(e.target.value)} className="w-full bg-[#FAF7F2] border border-[#E5D7C0] rounded-xl p-2.5 text-xs text-[#1C1814] outline-none" />
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-[#E5D7C0]/60">
                <button onClick={() => setStep(1)} className="text-xs text-[#5C5247] hover:text-[#B88E39] flex items-center gap-1 font-medium"><ArrowLeft className="w-4 h-4" /> Back</button>
                <button onClick={() => setStep(3)} className="bg-[#B88E39] hover:bg-[#A37B2C] text-[#FAF7F2] font-semibold text-xs py-3 px-6 rounded-full transition-all shadow-md">Next: Schedule & Client</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#B88E39] uppercase tracking-wider mb-2">Select Appointment Date</label>
                <input type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-[#FFFDF9] border border-[#E5D7C0] rounded-xl p-3 text-[#1C1814] outline-none font-medium text-xs shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#B88E39] uppercase tracking-wider mb-2">Preferred Time Slot</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {availableTimes.map((time) => (
                    <button key={time} onClick={() => setSelectedTime(time)} className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${selectedTime === time ? 'bg-[#1C1814] text-[#FAF7F2]' : 'bg-[#FFFDF9]'}`}>{time}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#665B53] mb-1">Select Stylist (Optional)</label>
                  <select
                    value={requestedStylist}
                    onChange={(e) => setRequestedStylist(e.target.value)}
                    className="w-full bg-[#FFFDF9] border border-[#E5D7C0] rounded-xl p-2.5 text-xs text-[#1C1814] outline-none"
                  >
                    <option value="">Choose a stylist (or any available)</option>
                    {stylists.map(st => (
                      <option key={st.id} value={st.name}>{st.name} ({st.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#665B53] mb-1">Your Full Name *</label>
                  <input type="text" placeholder="e.g. Sharon Wanjiku" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full bg-[#FFFDF9] border border-[#E5D7C0] rounded-xl p-2.5 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#665B53] mb-1">Phone Number (WhatsApp / M-Pesa) *</label>
                  <input type="tel" placeholder="e.g. +254 712 345 678" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full bg-[#FFFDF9] border border-[#E5D7C0] rounded-xl p-2.5 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#665B53] mb-1">Additional Notes (Optional)</label>
                  <input type="text" placeholder="e.g. Pre-stretched extensions, specific color blend" value={clientNotes} onChange={(e) => setClientNotes(e.target.value)} className="w-full bg-[#FFFDF9] border border-[#E5D7C0] rounded-xl p-2.5 text-xs" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-[#E5D7C0]/60">
                <button onClick={() => setStep(2)} className="text-xs text-[#5C5247] hover:text-[#B88E39] flex items-center gap-1 font-medium"><ArrowLeft className="w-4 h-4" /> Back</button>
                <button onClick={handleBookViaWhatsApp} disabled={!selectedDate || !selectedTime || !clientName || !clientPhone} className="bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-xs py-3 px-6 rounded-full transition-all shadow-md">Complete Booking via WhatsApp</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#25D366]/15 border-2 border-[#25D366] text-[#25D366] flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#1C1814]">Booking Request Sent!</h3>
                <p className="text-xs text-[#5C5247] mt-2">Your request was sent to Kay. She will be in touch shortly to confirm and arrange your deposit.</p>
              </div>
              <button onClick={handleResetModal} className="text-xs text-[#B88E39] hover:text-[#1C1814] underline font-medium">Return to Website</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
