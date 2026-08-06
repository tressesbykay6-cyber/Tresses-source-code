import React, { FormEvent, useMemo, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronRight, CircleAlert, ClipboardList, Edit3, FileImage, LayoutDashboard, LoaderCircle, Plus, Scissors, ShieldCheck, Trash2, UploadCloud, X } from 'lucide-react';
import { Service, ServiceCategory } from '../types';
import { PreparedUpload, allowUploadAttempt, cacheUpload, prepareUpload } from '../lib/mediaUpload';

export interface AdminBooking {
  id: string;
  service: Service;
  date: string;
  timeSlot: string;
  depositPaid: number;
  totalPrice: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  clientName: string;
  clientPhone: string;
  notes?: string;
}

interface AdminDashboardProps {
  services: Service[];
  bookings: AdminBooking[];
  onServicesChange: (services: Service[]) => void;
  onBookingsChange: (bookings: AdminBooking[]) => void;
  onExit: () => void;
}

type Panel = 'overview' | 'bookings' | 'calendar' | 'services' | 'media' | 'pages';
const categories: ServiceCategory[] = ['Braids', 'Wigs & Extensions', 'Hair Treatments & Color', 'Makeup', 'Nails'];
const emptyService: Service = { id: '', name: '', category: 'Braids', price: 0, durationMinutes: 60, durationLabel: '1 hr', stylistName: 'Kay', stylistId: 'st2', rating: 5, reviewCount: 0, image: '/media/gallery/DbkZiW1l7NZ.webp', description: '', depositAmount: 0 };

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ services, bookings, onServicesChange, onBookingsChange, onExit }) => {
  const [panel, setPanel] = useState<Panel>('overview');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [upload, setUpload] = useState<PreparedUpload | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const pendingCount = bookings.filter((booking) => booking.status === 'Pending').length;
  const confirmedCount = bookings.filter((booking) => booking.status === 'Confirmed').length;
  const revenue = bookings.filter((booking) => booking.status !== 'Cancelled').reduce((total, booking) => total + booking.depositPaid, 0);
  const dates = useMemo(() => [...new Set(bookings.map((booking) => booking.date))].sort(), [bookings]);

  const sideItems: { id: Panel; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: ClipboardList },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'media', label: 'Media uploads', icon: UploadCloud },
    { id: 'pages', label: 'Public pages', icon: FileImage },
  ];

  const updateStatus = (id: string, status: AdminBooking['status']) => onBookingsChange(bookings.map((booking) => booking.id === id ? { ...booking, status } : booking));

  const saveService = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingService || !editingService.name.trim() || !editingService.description.trim()) return;
    const durationLabel = editingService.durationMinutes >= 60 ? `${editingService.durationMinutes / 60} hr${editingService.durationMinutes === 60 ? '' : 's'}` : `${editingService.durationMinutes} mins`;
    const next = { ...editingService, id: editingService.id || `service-${Date.now()}`, durationLabel, depositAmount: Math.round(editingService.price * 0.3) };
    onServicesChange(editingService.id ? services.map((service) => service.id === editingService.id ? next : service) : [next, ...services]);
    setEditingService(null);
  };

  const removeService = (id: string) => onServicesChange(services.filter((service) => service.id !== id));

  const selectUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploadMessage('');
    setUploading(true);
    try {
      allowUploadAttempt();
      const ready = await prepareUpload(file);
      await cacheUpload(ready);
      if (upload) URL.revokeObjectURL(upload.previewUrl);
      setUpload(ready);
      try {
        const data = new FormData();
        data.append('asset', ready.file);
        const response = await fetch('/api/admin/assets', { method: 'POST', credentials: 'include', body: data });
        if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || 'The secure upload endpoint did not accept the file.');
        const result = await response.json();
        setUploadMessage(result.kind === 'video' ? 'MP4 accepted by the secure processor and queued for web transcode. It will not be public until processing finishes.' : `Optimized WebP uploaded securely (${Math.round(result.bytes / 1024)} KB).`);
      } catch (publishError) {
        setUploadMessage(`Prepared and cached on this device. ${publishError instanceof Error ? publishError.message : 'Connect the protected API to publish it.'}`);
      }
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Upload could not be prepared.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F2EB] text-[#2F2924] p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[250px_1fr] gap-5">
        <aside className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-4 lg:min-h-[calc(100vh-4rem)] shadow-sm">
          <div className="flex items-center justify-between gap-3 px-2 pb-5 border-b border-[#EADCCB]">
            <div><p className="font-serif text-xl font-bold">Tresses Admin</p><p className="text-[10px] uppercase tracking-[.16em] text-[#9A6F2E] font-bold">Studio workspace</p></div>
            <ShieldCheck className="w-6 h-6 text-[#C59648]" aria-label="Admin workspace" />
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto py-4" aria-label="Admin sections">
            {sideItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setPanel(id)} className={`min-h-11 shrink-0 flex items-center gap-3 rounded-xl px-3 text-sm font-semibold text-left transition-colors ${panel === id ? 'bg-[#403833] text-[#FAF7F2] shadow-sm' : 'text-[#665B53] hover:bg-[#F7F2EB]'}`}><Icon className="w-4 h-4" />{label}</button>)}
          </nav>
          <div className="hidden lg:block mt-auto rounded-2xl bg-[#F7F2EB] p-4 text-xs leading-relaxed text-[#665B53]"><strong className="block text-[#2F2924] mb-1">Production safe by design</strong>Media is queued locally; publishing must use a server-only processor and authenticated session.</div>
          <button onClick={onExit} className="w-full mt-4 min-h-11 rounded-xl border border-[#C59648] text-[#2F2924] text-sm font-bold hover:bg-[#F8E7CD]">Exit admin</button>
        </aside>

        <main className="min-w-0">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Admin control centre</p><h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2">{sideItems.find((item) => item.id === panel)?.label}</h1></div><p className="text-xs text-[#665B53] max-w-xs">Changes save in this browser for preview. Connect the protected API before using production data.</p></header>

          {panel === 'overview' && <div className="space-y-5"><div className="grid sm:grid-cols-3 gap-4">{[[pendingCount, 'Awaiting confirmation', 'bg-[#FFF4DE]'], [confirmedCount, 'Confirmed visits', 'bg-[#E8F2E6]'], [`KSh ${revenue.toLocaleString()}`, 'Deposits tracked', 'bg-[#F3EAF6]']].map(([value, label, tone]) => <div key={String(label)} className={`${tone} rounded-2xl border border-[#DECDBD] p-5`}><p className="text-3xl font-serif font-bold">{value}</p><p className="text-sm text-[#665B53] mt-1">{label}</p></div>)}</div><section className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-6"><h2 className="font-serif text-2xl font-bold">Today’s attention</h2><div className="mt-4 space-y-3">{bookings.slice(0, 4).map((booking) => <div key={booking.id} className="flex flex-wrap justify-between gap-3 border-b border-[#EADCCB] last:border-0 pb-3 last:pb-0"><div><p className="font-bold text-sm">{booking.clientName} · {booking.service.name}</p><p className="text-xs text-[#665B53]">{booking.date} at {booking.timeSlot}</p></div><span className="text-xs font-bold text-[#9A6F2E]">{booking.status}</span></div>)}{bookings.length === 0 && <p className="text-sm text-[#665B53]">New bookings will appear here after customers confirm.</p>}</div></section></div>}

          {panel === 'bookings' && <section className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl overflow-hidden"><div className="overflow-x-auto"><table className="min-w-[720px] w-full text-sm"><thead className="bg-[#F7F2EB] text-left text-xs uppercase tracking-wide text-[#665B53]"><tr><th className="p-4">Client</th><th className="p-4">Appointment</th><th className="p-4">Deposit</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody>{bookings.map((booking) => <tr key={booking.id} className="border-t border-[#EADCCB]"><td className="p-4"><b>{booking.clientName}</b><br/><span className="text-xs text-[#665B53]">{booking.clientPhone}</span></td><td className="p-4">{booking.service.name}<br/><span className="text-xs text-[#665B53]">{booking.date} · {booking.timeSlot}</span></td><td className="p-4">KSh {booking.depositPaid.toLocaleString()}</td><td className="p-4"><span className="rounded-full bg-[#F7F2EB] px-2.5 py-1 text-xs font-bold">{booking.status}</span></td><td className="p-4"><div className="flex gap-2"><button onClick={() => updateStatus(booking.id, 'Confirmed')} className="min-h-9 rounded-lg bg-[#403833] text-white px-3 text-xs font-bold">Confirm</button><button onClick={() => updateStatus(booking.id, 'Cancelled')} className="min-h-9 rounded-lg border border-[#DECDBD] px-3 text-xs font-bold">Cancel</button></div></td></tr>)}</tbody></table></div>{bookings.length === 0 && <p className="p-6 text-sm text-[#665B53]">No bookings to manage yet.</p>}</section>}

          {panel === 'calendar' && <div className="space-y-4">{dates.map((date) => <section key={date} className="bg-[#FFFDF9] border border-[#DECDBD] rounded-2xl p-5"><h2 className="font-serif text-xl font-bold">{date}</h2><div className="mt-3 grid md:grid-cols-2 gap-3">{bookings.filter((booking) => booking.date === date).map((booking) => <div key={booking.id} className="rounded-xl bg-[#F7F2EB] p-4"><p className="font-bold">{booking.timeSlot} · {booking.clientName}</p><p className="text-xs text-[#665B53] mt-1">{booking.service.name}</p><p className="text-xs font-bold text-[#9A6F2E] mt-2">{booking.status}</p></div>)}</div></section>)}{dates.length === 0 && <div className="rounded-3xl border border-dashed border-[#C59648] p-10 text-center text-sm text-[#665B53]">Your appointment calendar will populate as bookings arrive.</div>}</div>}

          {panel === 'services' && <div className="space-y-5"><button onClick={() => setEditingService({ ...emptyService })} className="min-h-11 bg-[#403833] text-white rounded-xl px-5 text-sm font-bold"><Plus className="w-4 h-4 inline mr-2" />Add service</button><div className="grid md:grid-cols-2 gap-4">{services.map((service) => <article key={service.id} className="bg-[#FFFDF9] border border-[#DECDBD] rounded-2xl p-5"><div className="flex justify-between gap-4"><div><p className="font-serif text-xl font-bold">{service.name}</p><p className="text-xs text-[#9A6F2E] font-bold mt-1">{service.category}</p></div><p className="font-bold">KSh {service.price.toLocaleString()}</p></div><p className="text-sm text-[#665B53] mt-3 line-clamp-2">{service.description}</p><div className="flex gap-2 mt-5"><button onClick={() => setEditingService({ ...service })} className="min-h-10 border border-[#DECDBD] rounded-lg px-3 text-xs font-bold"><Edit3 className="w-3.5 h-3.5 inline mr-1" />Edit</button><button onClick={() => removeService(service.id)} className="min-h-10 border border-[#EAB4A6] text-[#A94731] rounded-lg px-3 text-xs font-bold"><Trash2 className="w-3.5 h-3.5 inline mr-1" />Delete</button></div></article>)}</div></div>}

          {panel === 'media' && <section className="max-w-2xl bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-6 sm:p-8"><div className="flex gap-3"><div className="w-11 h-11 shrink-0 rounded-2xl bg-[#F8E7CD] grid place-items-center"><UploadCloud className="w-5 h-5 text-[#9A6F2E]" /></div><div><h2 className="font-serif text-2xl font-bold">Phone-ready media upload</h2><p className="text-sm text-[#665B53] mt-1">JPG, PNG, WebP, MP4, and WebM only. Three attempts per minute. Images are converted to WebP before they enter the device cache.</p></div></div><input ref={fileInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" capture="environment" onChange={(event) => selectUpload(event.target.files?.[0])} /><button disabled={uploading} onClick={() => fileInput.current?.click()} className="mt-6 min-h-12 w-full rounded-xl bg-[#403833] text-white font-bold text-sm disabled:opacity-50">{uploading ? <><LoaderCircle className="w-4 h-4 animate-spin inline mr-2" />Preparing asset...</> : 'Choose photo or video'}</button>{uploadMessage && <div className={`mt-4 rounded-xl p-4 text-sm flex gap-2 ${uploadMessage.includes('could not') || uploadMessage.includes('must') || uploadMessage.includes('limit') ? 'bg-[#FCE8E3] text-[#8E3C29]' : 'bg-[#E8F2E6] text-[#35643A]'}`}><CircleAlert className="w-4 h-4 shrink-0 mt-0.5" />{uploadMessage}</div>}{upload && <div className="mt-5 rounded-2xl border border-[#DECDBD] overflow-hidden"><div className="aspect-video bg-[#403833]">{upload.file.type.startsWith('image/') ? <img src={upload.previewUrl} className="w-full h-full object-contain" alt="Prepared upload preview" /> : <video src={upload.previewUrl} className="w-full h-full object-contain" controls />}</div><div className="p-4 flex flex-wrap justify-between gap-2 text-xs"><span className="font-bold">{upload.file.name}</span><span>{Math.round(upload.file.size / 1024)} KB · {upload.requiresServerTranscode ? 'Server transcode required' : 'WebP optimized'}</span></div></div>}<p className="mt-5 text-xs leading-relaxed text-[#665B53]"><Check className="w-3.5 h-3.5 inline text-[#35643A]" /> Cached uploads are not public. A signed, authenticated server endpoint must transcode MP4 assets and issue the final public URL; no API key is stored in this app.</p></section>}

          {panel === 'pages' && <section className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-6"><h2 className="font-serif text-2xl font-bold">Public pages</h2><p className="text-sm text-[#665B53] mt-2">Use these as a quick content checklist. Services are edited in the Services panel; gallery assets are prepared in Media uploads.</p><div className="mt-5 grid sm:grid-cols-2 gap-3">{['Home', 'Services', 'Gallery', 'Contact'].map((page) => <div key={page} className="border border-[#EADCCB] rounded-xl p-4 flex items-center justify-between"><span className="font-bold">{page}</span><ChevronRight className="w-4 h-4 text-[#9A6F2E]" /></div>)}</div></section>}
        </main>
      </div>

      {editingService && <div className="fixed inset-0 z-50 p-4 grid place-items-center bg-[#2F2924]/50 backdrop-blur-sm"><form onSubmit={saveService} className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#FFFDF9] rounded-3xl p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">{editingService.id ? 'Edit service' : 'Add service'}</h2><button type="button" onClick={() => setEditingService(null)} className="p-2"><X className="w-5 h-5" /></button></div><div className="grid sm:grid-cols-2 gap-4 mt-5"><label className="admin-field sm:col-span-2">Service name<input required value={editingService.name} onChange={(event) => setEditingService({ ...editingService, name: event.target.value })} /></label><label className="admin-field">Category<select value={editingService.category} onChange={(event) => setEditingService({ ...editingService, category: event.target.value as ServiceCategory })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="admin-field">Price (KSh)<input required min="0" type="number" value={editingService.price} onChange={(event) => setEditingService({ ...editingService, price: Number(event.target.value) })} /></label><label className="admin-field">Duration (minutes)<input required min="15" step="15" type="number" value={editingService.durationMinutes} onChange={(event) => setEditingService({ ...editingService, durationMinutes: Number(event.target.value) })} /></label><label className="admin-field">Stylist<input required value={editingService.stylistName} onChange={(event) => setEditingService({ ...editingService, stylistName: event.target.value })} /></label><label className="admin-field sm:col-span-2">Description<textarea required rows={4} value={editingService.description} onChange={(event) => setEditingService({ ...editingService, description: event.target.value })} /></label></div><button className="mt-6 w-full min-h-12 rounded-xl bg-[#403833] text-white font-bold">Save service</button></form></div>}
    </div>
  );
};
