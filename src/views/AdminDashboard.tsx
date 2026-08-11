import React, { FormEvent, useMemo, useRef, useState, useEffect } from 'react';
import {
  CalendarDays, Check, ChevronRight, CircleAlert, ClipboardList, Edit3,
  FileImage, LayoutDashboard, LoaderCircle, Plus, Scissors, ShieldCheck,
  Trash2, UploadCloud, X, MessageCircle, Download, Users, Star,
  Search, LogOut, Lock, TrendingUp, DollarSign, Clock, Eye, Send,
  RefreshCw, AlertTriangle, CheckCircle2, MessageSquare, Filter, Play,
} from 'lucide-react';
import { Service, ServiceCategory, Stylist, GalleryItem } from '../types';
import { PreparedUpload, allowUploadAttempt, cacheUpload, prepareUpload } from '../lib/mediaUpload';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { MOCK_SERVICES, MOCK_GALLERY, MOCK_STYLISTS } from '../data/mockData';
import { DEFAULT_PAGE_SETTINGS } from '../App';

/* ─── Types ──────────────────────────────────────────────────── */

export interface AdminBooking {
  id: string;
  service: Service;
  date: string;
  timeSlot: string;
  depositPaid: number;
  totalPrice: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'Verified' | 'Refunded';
  clientName: string;
  clientPhone: string;
  notes?: string;
  adminComment?: string;
  verifiedAt?: string;
  refundAmount?: number;
  createdAt?: string;
  requestedStylistName?: string;
  durationMinutes?: number;
}

export interface ClientComment {
  id: string;
  bookingId: string;
  clientName: string;
  message: string;
  date: string;
  adminReply?: string;
  adminReplyDate?: string;
}

interface AdminDashboardProps {
  services: Service[];
  bookings: AdminBooking[];
  onServicesChange: (services: Service[]) => void;
  onBookingsChange: (bookings: AdminBooking[]) => void;
  stylists: Stylist[];
  onStylistsChange: (stylists: Stylist[]) => void;
  galleryItems: GalleryItem[];
  onGalleryItemsChange: (items: GalleryItem[]) => void;
  pageSettings: any;
  onPageSettingsChange: (settings: any) => void;
  onExit: () => void;
}

/* ─── Constants ──────────────────────────────────────────────── */

const ADMIN_USERNAME = 'kavatah';
const ADMIN_PASSCODE = 'kavatahkarembo123';
const REFUND_RATE = 0.85; // 85% refund
const REFUND_FEE_RATE = 0.15; // 15% fee
const REFUND_WAITING_DAYS = 7;

type Panel = 'overview' | 'bookings' | 'calendar' | 'services' | 'stylists' | 'clients' | 'comments' | 'media' | 'pages' | 'settings';
const categories: ServiceCategory[] = ['Braids', 'Wigs & Extensions', 'Hair Treatments & Color', 'Makeup', 'Nails'];
const CHART_COLORS = ['#B88E39', '#1C1814', '#5C5247', '#E5D7C0', '#D4A853'];

const emptyService: Service = {
  id: '',
  name: '',
  category: 'Braids',
  price: 0,
  durationMinutes: 60,
  durationLabel: '1 hr',
  stylistName: 'Kay',
  stylistId: 'st2',
  rating: 5,
  reviewCount: 0,
  image: '/media/gallery/DbkZiW1l7NZ.webp',
  description: '',
  depositAmount: 0,
  numberOfStylists: 1,
};

const emptyStylist: Stylist = {
  id: '',
  name: '',
  role: '',
  bio: '',
  photo: '/media/kay-founder.webp',
  specialties: ['Braids'],
  experienceYears: 3,
  rating: 5.0,
  reviewCount: 0,
  portfolio: [],
  availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const emptyGalleryItem: GalleryItem = {
  id: '',
  title: '',
  category: 'Braids',
  image: '/media/gallery/DbkZiW1l7NZ.webp',
  likes: 0,
  stylistName: 'Kay (Founder)',
  isBeforeAfter: false,
  beforeImage: '',
  afterImage: '',
  videoUrl: '',
};

/* ─── Login Gate ──────────────────────────────────────────────── */

const AdminLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && passcode === ADMIN_PASSCODE) {
      sessionStorage.setItem('tresses-admin-auth', 'true');
      onLogin();
    } else {
      setError('Invalid credentials. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1814] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#B88E39]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#B88E39]/5 rounded-full blur-3xl" />
      </div>

      <form onSubmit={handleLogin} className="relative z-10 w-full max-w-sm bg-[#2C2620] border border-[#B88E39]/30 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#B88E39]/20 border border-[#B88E39]/40 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-[#B88E39]" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#FAF7F2]">Tresses Admin</h1>
          <p className="text-xs text-[#8C8071]">Studio workspace • Authorized access only</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium rounded-xl p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-[#8C8071] uppercase tracking-wider">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-[#1C1814] border border-[#5C5247] rounded-xl px-4 py-3 text-[#FAF7F2] text-sm focus:outline-none focus:border-[#B88E39] transition-colors placeholder:text-[#5C5247]"
              placeholder="Enter username"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-[#8C8071] uppercase tracking-wider">Passcode</span>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-[#1C1814] border border-[#5C5247] rounded-xl px-4 py-3 pr-10 text-[#FAF7F2] text-sm focus:outline-none focus:border-[#B88E39] transition-colors placeholder:text-[#5C5247]"
                placeholder="Enter passcode"
              />
              <button type="button" onClick={() => setShowPasscode(!showPasscode)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C5247] hover:text-[#B88E39] transition-colors">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </label>
        </div>

        <button type="submit" className="w-full bg-[#B88E39] hover:bg-[#A37B2C] text-[#FAF7F2] font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg">
          Sign In
        </button>

        <p className="text-center text-[10px] text-[#5C5247]">
          Protected by session auth • Tresses by Kay © {new Date().getFullYear()}
        </p>
      </form>
    </div>
  );
};

/* ─── Helpers ──────────────────────────────────────────────── */

function exportBookingsCSV(bookings: AdminBooking[]) {
  const headers = ['ID', 'Client', 'Phone', 'Service', 'Duration (Mins)', 'Date', 'Time', 'DepositPaid (KSh)', 'Total (KSh)', 'Status', 'Requested Stylist', 'Admin Comment', 'Notes'];
  const rows = bookings.map(b => [
    b.id, b.clientName, b.clientPhone, b.service.name, b.durationMinutes || b.service.durationMinutes || 60, b.date, b.timeSlot,
    b.depositPaid, b.totalPrice, b.status, b.requestedStylistName || 'None', b.adminComment || '', b.notes || '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tresses-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function buildWhatsAppUrl(phone: string, message: string) {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return `https://wa.me/${cleaned.startsWith('+') ? cleaned.slice(1) : cleaned}?text=${encodeURIComponent(message)}`;
}

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

/* ─── Main Dashboard ──────────────────────────────────────── */

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  services, bookings, onServicesChange, onBookingsChange,
  stylists, onStylistsChange,
  galleryItems, onGalleryItemsChange,
  pageSettings, onPageSettingsChange,
  onExit
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('tresses-admin-auth') === 'true');
  const [panel, setPanel] = useState<Panel>('overview');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [editingPage, setEditingPage] = useState<'home' | 'services' | 'gallery' | 'contact' | null>(null);

  const [upload, setUpload] = useState<PreparedUpload | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [commentReply, setCommentReply] = useState<Record<string, string>>({});
  const [adminCommentInput, setAdminCommentInput] = useState<Record<string, string>>({});
  const fileInput = useRef<HTMLInputElement>(null);

  // Specialties input helper
  const [stylistSpecialtiesStr, setStylistSpecialtiesStr] = useState('');

  // Page Content Local Edits
  const [localHomeSettings, setLocalHomeSettings] = useState(() => pageSettings.home);
  const [localServicesSettings, setLocalServicesSettings] = useState(() => pageSettings.services);
  const [localGallerySettings, setLocalGallerySettings] = useState(() => pageSettings.gallery);
  const [localContactSettings, setLocalContactSettings] = useState(() => pageSettings.contact);

  // Media list from Firestore
  const [mediaList, setMediaList] = useState<any[]>([]);
  useEffect(() => {
    if (panel === 'media') {
      const unsub = onSnapshot(collection(db, 'media'), (snap) => {
        setMediaList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [panel]);

  useEffect(() => {
    setLocalHomeSettings(pageSettings.home);
    setLocalServicesSettings(pageSettings.services);
    setLocalGallerySettings(pageSettings.gallery);
    setLocalContactSettings(pageSettings.contact);
  }, [pageSettings]);

  // Comments from Firestore
  const [comments, setComments] = useState<ClientComment[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'comments'), (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as ClientComment)));
    });
    return () => unsub();
  }, []);

  /* ─── Computed KPIs ───────────────────────────────── */
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Verified').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;
  const refundedCount = bookings.filter(b => b.status === 'Refunded').length;
  const totalRevenue = bookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Refunded').reduce((t, b) => t + b.totalPrice, 0);
  const totalDeposits = bookings.filter(b => b.status !== 'Cancelled').reduce((t, b) => t + b.depositPaid, 0);
  const avgBookingValue = bookings.length > 0 ? Math.round(totalRevenue / Math.max(bookings.filter(b => b.status !== 'Cancelled').length, 1)) : 0;

  /* ─── Analytics Data ──────────────────────────────── */
  const bookingsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach(b => { map[b.date] = (map[b.date] || 0) + 1; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([date, count]) => ({ date: date.slice(5), count }));
  }, [bookings]);

  const revenueByDate = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.filter(b => b.status !== 'Cancelled').forEach(b => { map[b.date] = (map[b.date] || 0) + b.totalPrice; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([date, revenue]) => ({ date: date.slice(5), revenue }));
  }, [bookings]);

  const servicePopularity = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach(b => { map[b.service.name] = (map[b.service.name] || 0) + 1; });
    return Object.entries(map).sort((mapA, mapB) => mapB[1] - mapA[1]).slice(0, 6).map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 18) + '…' : name, count }));
  }, [bookings]);

  const statusBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach(b => { map[b.status] = (map[b.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  /* ─── Client Directory ────────────────────────────── */
  const clients = useMemo(() => {
    const map: Record<string, { name: string; phone: string; bookings: AdminBooking[]; totalSpent: number; lastVisit: string }> = {};
    bookings.forEach(b => {
      const key = b.clientPhone;
      if (!map[key]) map[key] = { name: b.clientName, phone: b.clientPhone, bookings: [], totalSpent: 0, lastVisit: b.date };
      map[key].bookings.push(b);
      if (b.status !== 'Cancelled' && b.status !== 'Refunded') map[key].totalSpent += b.totalPrice;
      if (b.date > map[key].lastVisit) map[key].lastVisit = b.date;
    });
    return Object.values(map).sort((a, b) => b.bookings.length - a.bookings.length);
  }, [bookings]);

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [clients, searchQuery]);

  const dates = useMemo(() => [...new Set(bookings.map(b => b.date))].sort(), [bookings]);

  /* ─── Filtered bookings ───────────────────────────── */
  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    if (statusFilter !== 'all') filtered = filtered.filter(b => b.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(b => b.clientName.toLowerCase().includes(q) || b.clientPhone.includes(q) || b.service.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [bookings, statusFilter, searchQuery]);

  /* ─── Actions ─────────────────────────────────────── */
  const updateStatus = async (id: string, status: AdminBooking['status']) => {
    const b = bookings.find(bk => bk.id === id);
    if (!b) return;
    const updates: any = { status };
    if (status === 'Confirmed') updates.depositPaid = b.depositPaid || Math.round(b.totalPrice * 0.3);
    if (status === 'Verified') updates.verifiedAt = new Date().toISOString();
    if (status === 'Refunded') updates.refundAmount = Math.round(b.depositPaid * REFUND_RATE);
    try { await updateDoc(doc(db, 'bookings', id), updates); } catch (err) { console.error(err); }
  };

  const deleteBooking = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this booking?')) {
      try { await deleteDoc(doc(db, 'bookings', id)); } catch (err) { console.error(err); }
    }
  };

  const addAdminComment = async (id: string) => {
    const comment = adminCommentInput[id]?.trim();
    if (!comment) return;
    try { await updateDoc(doc(db, 'bookings', id), { adminComment: comment }); } catch (err) { console.error(err); }
    setAdminCommentInput(prev => ({ ...prev, [id]: '' }));
  };

  const replyToComment = async (commentId: string) => {
    const reply = commentReply[commentId]?.trim();
    if (!reply) return;
    try { await updateDoc(doc(db, 'comments', commentId), { adminReply: reply, adminReplyDate: new Date().toISOString().slice(0, 10) }); } catch (err) { console.error(err); }
    setCommentReply(prev => ({ ...prev, [commentId]: '' }));
  };

  /* ─── Stylists CRUD ───────────────────────────────── */
  const saveStylist = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStylist || !editingStylist.name.trim()) return;
    const specialties = stylistSpecialtiesStr.split(',').map(s => s.trim()).filter(Boolean);
    const stylistId = editingStylist.id || `stylist-${Date.now()}`;
    const nextStylist = { ...editingStylist, id: stylistId, specialties };
    try { await setDoc(doc(db, 'stylists', stylistId), nextStylist); } catch (err) { console.error(err); }
    setEditingStylist(null);
  };

  const deleteStylist = async (id: string) => {
    if (confirm('Are you sure you want to delete this stylist?')) {
      try { await deleteDoc(doc(db, 'stylists', id)); } catch (err) { console.error(err); }
    }
  };

  const startEditStylist = (stylist: Stylist) => {
    setEditingStylist(stylist);
    setStylistSpecialtiesStr(stylist.specialties.join(', '));
  };

  /* ─── Gallery CRUD ────────────────────────────────── */
  const saveGalleryItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingGalleryItem || !editingGalleryItem.title.trim()) return;
    const itemId = editingGalleryItem.id || `gallery-${Date.now()}`;
    const nextItem = { ...editingGalleryItem, id: itemId };
    try { await setDoc(doc(db, 'gallery', itemId), nextItem); } catch (err) { console.error(err); }
    setEditingGalleryItem(null);
  };

  const deleteGalleryItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this Lookbook item?')) {
      try { await deleteDoc(doc(db, 'gallery', id)); } catch (err) { console.error(err); }
    }
  };

  /* ─── Page Settings CMS ───────────────────────────── */
  const savePageChanges = async (pageKey: 'home' | 'services' | 'gallery' | 'contact') => {
    let targetSettings = localHomeSettings;
    if (pageKey === 'services') targetSettings = localServicesSettings;
    if (pageKey === 'gallery') targetSettings = localGallerySettings;
    if (pageKey === 'contact') targetSettings = localContactSettings;

    try {
      await setDoc(doc(db, 'settings', 'pageSettings'), { ...pageSettings, [pageKey]: targetSettings });
    } catch (err) { console.error(err); }
    setEditingPage(null);
    alert(`${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)} page content updated successfully!`);
  };

  /* ─── Service Edit CRUD ───────────────────────────── */
  const saveService = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingService || !editingService.name.trim() || !editingService.description.trim()) return;
    const durationLabel = editingService.durationMinutes >= 60 ? `${editingService.durationMinutes / 60} hr${editingService.durationMinutes === 60 ? '' : 's'}` : `${editingService.durationMinutes} mins`;
    const serviceId = editingService.id || `service-${Date.now()}`;
    const next = { ...editingService, id: serviceId, durationLabel, depositAmount: Math.round(editingService.price * 0.3) };
    try { await setDoc(doc(db, 'services', serviceId), next); } catch (err) { console.error(err); }
    setEditingService(null);
  };

  const removeService = async (id: string) => { try { await deleteDoc(doc(db, 'services', id)); } catch (err) { console.error(err); } };

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
      
      let finalUrl = ready.previewUrl;
      try {
        const data = new FormData();
        data.append('asset', ready.file);
        const response = await fetch('/api/admin/assets', { method: 'POST', credentials: 'include', body: data });
        if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || 'The secure upload endpoint did not accept the file.');
        const result = await response.json();
        setUploadMessage(result.kind === 'video' ? 'MP4 accepted by the secure processor and queued for web transcode.' : `Optimized WebP uploaded securely (${Math.round(result.bytes / 1024)} KB).`);
        if (result.url) finalUrl = result.url;
      } catch (publishError) {
        setUploadMessage(`Prepared and cached on this device. ${publishError instanceof Error ? publishError.message : 'Connect the protected API to publish it.'}`);
      }

      // Record successful file in Firestore media list
      await addDoc(collection(db, 'media'), {
        name: ready.file.name,
        url: finalUrl,
        type: ready.file.type.startsWith('video/') ? 'video' : 'image',
        size: ready.file.size,
        uploadedAt: new Date().toISOString()
      });

    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Upload could not be prepared.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tresses-admin-auth');
    setIsAuthenticated(false);
  };

  /* ─── Nav Items ───────────────────────────────────── */
  const sideItems: { id: Panel; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: ClipboardList, badge: pendingCount },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'services', label: 'Services', icon: Scissors, badge: services.length },
    { id: 'stylists', label: 'Stylists', icon: Users, badge: stylists.length },
    { id: 'clients', label: 'Clients', icon: Users, badge: clients.length },
    { id: 'comments', label: 'Comments', icon: MessageSquare, badge: comments.filter(c => !c.adminReply).length },
    { id: 'media', label: 'Media uploads', icon: UploadCloud },
    { id: 'pages', label: 'Public pages', icon: FileImage },
    { id: 'settings', label: 'Settings', icon: ShieldCheck },
  ];

  /* ─── Auth Gate ───────────────────────────────────── */
  if (!isAuthenticated) return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;

  /* ─── Render ──────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#F7F2EB] text-[#2F2924] p-3 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[260px_1fr] gap-5">

        {/* ─── Sidebar ───────────────────────────── */}
        <aside className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-4 lg:min-h-[calc(100vh-4rem)] shadow-sm flex flex-col">
          <div className="flex items-center justify-between gap-3 px-2 pb-5 border-b border-[#EADCCB]">
            <div>
              <p className="font-serif text-xl font-bold">Tresses Admin</p>
              <p className="text-[10px] uppercase tracking-[.16em] text-[#9A6F2E] font-bold">Studio workspace</p>
            </div>
            <ShieldCheck className="w-6 h-6 text-[#C59648]" aria-label="Admin workspace" />
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto py-4 flex-1" aria-label="Admin sections">
            {sideItems.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => { setPanel(id); setSearchQuery(''); setStatusFilter('all'); setEditingPage(null); }} className={`min-h-11 shrink-0 flex items-center gap-3 rounded-xl px-3 text-sm font-semibold text-left transition-colors ${panel === id ? 'bg-[#403833] text-[#FAF7F2] shadow-sm' : 'text-[#665B53] hover:bg-[#F7F2EB]'}`}>
                <Icon className="w-4 h-4" />
                <span className="flex-1">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${panel === id ? 'bg-[#B88E39] text-white' : 'bg-[#F7F2EB] text-[#B88E39]'}`}>{badge}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="hidden lg:block rounded-2xl bg-[#F7F2EB] p-4 text-xs leading-relaxed text-[#665B53] mb-3">
            <strong className="block text-[#2F2924] mb-1">Refund Policy</strong>
            85% of deposits refunded after {REFUND_WAITING_DAYS} days. 15% processing fee applies.
          </div>

          <div className="flex gap-2">
            <button onClick={onExit} className="flex-1 min-h-11 rounded-xl border border-[#C59648] text-[#2F2924] text-sm font-bold hover:bg-[#F8E7CD] transition-colors">Exit</button>
            <button onClick={handleLogout} className="min-h-11 rounded-xl border border-red-300 text-red-600 px-3 hover:bg-red-50 transition-colors" title="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* ─── Main Content ──────────────────────── */}
        <main className="min-w-0 space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Admin control centre</p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2">{sideItems.find(i => i.id === panel)?.label}</h1>
            </div>
            {(panel === 'bookings' || panel === 'clients') && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8071]" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2.5 rounded-xl border border-[#DECDBD] bg-[#FFFDF9] text-sm w-48 focus:outline-none focus:border-[#B88E39]" />
                </div>
                {panel === 'bookings' && (
                  <>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="py-2.5 px-3 rounded-xl border border-[#DECDBD] bg-[#FFFDF9] text-sm focus:outline-none focus:border-[#B88E39]">
                      <option value="all">All statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Verified">Verified</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                    <button onClick={() => exportBookingsCSV(filteredBookings)} className="min-h-10 bg-[#403833] text-white rounded-xl px-4 text-xs font-bold flex items-center gap-2 hover:bg-[#2C2620] transition-colors">
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                  </>
                )}
              </div>
            )}
          </header>

          {/* ═══ OVERVIEW ═══════════════════════════ */}
          {panel === 'overview' && (
            <div className="space-y-6">
              {/* KPI Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { value: pendingCount, label: 'Pending Bookings', icon: Clock, tone: 'bg-[#FFF4DE]', iconColor: 'text-amber-600' },
                  { value: confirmedCount, label: 'Confirmed / Verified', icon: CheckCircle2, tone: 'bg-[#E8F2E6]', iconColor: 'text-green-600' },
                  { value: `KSh ${totalRevenue.toLocaleString()}`, label: 'Total Revenue', icon: DollarSign, tone: 'bg-[#F3EAF6]', iconColor: 'text-purple-600' },
                  { value: `KSh ${avgBookingValue.toLocaleString()}`, label: 'Avg Booking Value', icon: TrendingUp, tone: 'bg-[#E8F0F7]', iconColor: 'text-blue-600' },
                ].map(({ value, label, icon: Icon, tone, iconColor }) => (
                  <div key={label} className={`${tone} rounded-2xl border border-[#DECDBD] p-5`}>
                    <div className="flex items-start justify-between">
                      <p className="text-2xl sm:text-3xl font-serif font-bold">{value}</p>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <p className="text-xs text-[#665B53] mt-1.5 font-medium">{label}</p>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-5">
                {/* Bookings Over Time */}
                <div className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-6">
                  <h3 className="font-serif text-lg font-bold mb-4">Bookings (Last 14 Days)</h3>
                  {bookingsByDate.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={bookingsByDate}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5D7C0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#665B53' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#665B53' }} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5D7C0', fontSize: 12 }} />
                        <Bar dataKey="count" fill="#B88E39" radius={[6, 6, 0, 0]} name="Bookings" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-sm text-[#665B53] py-10 text-center">Bookings will chart here as they arrive.</p>}
                </div>

                {/* Revenue Trend */}
                <div className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-6">
                  <h3 className="font-serif text-lg font-bold mb-4">Revenue Trend (KSh)</h3>
                  {revenueByDate.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={revenueByDate}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5D7C0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#665B53' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#665B53' }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5D7C0', fontSize: 12 }} />
                        <Line type="monotone" dataKey="revenue" stroke="#1C1814" strokeWidth={2} dot={{ fill: '#B88E39', r: 4 }} name="Revenue" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <p className="text-sm text-[#665B53] py-10 text-center">Revenue trends will display here.</p>}
                </div>
              </div>

              {/* Bottom Row: Popular Services + Status Breakdown */}
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-6">
                  <h3 className="font-serif text-lg font-bold mb-4">Most Popular Services</h3>
                  {servicePopularity.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={servicePopularity} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#665B53' }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#665B53' }} width={110} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5D7C0', fontSize: 12 }} />
                        <Bar dataKey="count" fill="#1C1814" radius={[0, 6, 6, 0]} name="Bookings" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-sm text-[#665B53] py-10 text-center">Service popularity will show here.</p>}
                </div>

                <div className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-6">
                  <h3 className="font-serif text-lg font-bold mb-4">Status Breakdown</h3>
                  {statusBreakdown.length > 0 ? (
                    <div className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={statusBreakdown} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                            {statusBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5D7C0', fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <p className="text-sm text-[#665B53] py-10 text-center">Status breakdown will display here.</p>}
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Completed', value: completedCount, color: 'text-green-700' },
                  { label: 'Cancelled', value: cancelledCount, color: 'text-red-600' },
                  { label: 'Refunded', value: refundedCount, color: 'text-orange-600' },
                  { label: 'Total Deposits', value: `KSh ${totalDeposits.toLocaleString()}`, color: 'text-[#B88E39]' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[#FFFDF9] border border-[#DECDBD] rounded-2xl p-4 text-center">
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-[10px] text-[#665B53] mt-1 uppercase tracking-wider font-bold">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ BOOKINGS ═══════════════════════════ */}
          {panel === 'bookings' && (
            <section className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full text-sm">
                  <thead className="bg-[#F7F2EB] text-left text-xs uppercase tracking-wide text-[#665B53]">
                    <tr>
                      <th className="p-4">Client</th>
                      <th className="p-4">Appointment</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Deposit</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Comment</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(booking => (
                      <tr key={booking.id} className="border-t border-[#EADCCB] hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="p-4">
                          <b>{booking.clientName}</b><br />
                          <span className="text-xs text-[#665B53]">{booking.clientPhone}</span>
                        </td>
                        <td className="p-4">
                          {booking.service.name}<br />
                          <span className="text-xs text-[#665B53]">{booking.date} · {booking.timeSlot}</span>
                          {booking.requestedStylistName && (
                            <p className="text-[10px] text-[#B88E39] font-bold mt-0.5">Requested Stylist: {booking.requestedStylistName}</p>
                          )}
                        </td>
                        <td className="p-4 font-bold text-xs text-[#665B53]">
                          {booking.durationMinutes || booking.service.durationMinutes} mins
                        </td>
                        <td className="p-4">
                          KSh {booking.depositPaid.toLocaleString()}
                          {booking.refundAmount && <><br /><span className="text-[10px] text-orange-600">Refund: KSh {booking.refundAmount.toLocaleString()}</span></>}
                        </td>
                        <td className="p-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            booking.status === 'Verified' ? 'bg-blue-100 text-blue-700' :
                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            booking.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            booking.status === 'Refunded' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>{booking.status}</span>
                          {booking.verifiedAt && <p className="text-[10px] text-[#665B53] mt-1">Verified {booking.verifiedAt.slice(0, 10)}</p>}
                        </td>
                        <td className="p-4 max-w-[150px]">
                          {booking.adminComment ? (
                            <p className="text-xs text-[#665B53] italic font-medium">"{booking.adminComment}"</p>
                          ) : (
                            <div className="flex gap-1">
                              <input value={adminCommentInput[booking.id] || ''} onChange={e => setAdminCommentInput(p => ({ ...p, [booking.id]: e.target.value }))} placeholder="Add note…" className="flex-1 text-xs border border-[#DECDBD] rounded-lg px-2 py-1.5 min-w-0 focus:outline-none focus:border-[#B88E39]" />
                              <button onClick={() => addAdminComment(booking.id)} className="shrink-0 p-1.5 rounded-lg bg-[#403833] text-white hover:bg-[#2C2620]"><Send className="w-3 h-3" /></button>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {booking.status === 'Pending' && (
                              <>
                                <button onClick={() => updateStatus(booking.id, 'Confirmed')} className="min-h-8 rounded-lg bg-[#403833] text-white px-2.5 text-[11px] font-bold hover:bg-[#2C2620]">Approve</button>
                                <button onClick={() => updateStatus(booking.id, 'Cancelled')} className="min-h-8 rounded-lg border border-red-300 text-red-600 px-2.5 text-[11px] font-bold hover:bg-red-50">Cancel</button>
                              </>
                            )}
                            {booking.status === 'Confirmed' && (
                              <button onClick={() => updateStatus(booking.id, 'Verified')} className="min-h-8 rounded-lg bg-blue-600 text-white px-2.5 text-[11px] font-bold hover:bg-blue-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Verify</button>
                            )}
                            {(booking.status === 'Confirmed' || booking.status === 'Verified') && (
                              <button onClick={() => updateStatus(booking.id, 'Completed')} className="min-h-8 rounded-lg bg-emerald-600 text-white px-2.5 text-[11px] font-bold hover:bg-emerald-700">Complete</button>
                            )}
                            {(booking.status === 'Confirmed' || booking.status === 'Verified') && booking.date && daysAgo(booking.date) >= REFUND_WAITING_DAYS && (
                              <button onClick={() => updateStatus(booking.id, 'Refunded')} className="min-h-8 rounded-lg bg-orange-500 text-white px-2.5 text-[11px] font-bold hover:bg-orange-600 flex items-center gap-1"><RefreshCw className="w-3 h-3" />Refund</button>
                            )}
                            <button onClick={() => deleteBooking(booking.id)} className="min-h-8 rounded-lg border border-red-200 text-red-600 px-2.5 text-[11px] font-bold hover:bg-red-50 flex items-center gap-1"><Trash2 className="w-3 h-3" />Delete</button>
                            <a
                              href={buildWhatsAppUrl(booking.clientPhone, `Hi ${booking.clientName}, this is Kay from Tresses by Kay. Regarding your ${booking.service.name} booking on ${booking.date} at ${booking.timeSlot} — `)}
                              target="_blank" rel="noopener noreferrer"
                              className="min-h-8 rounded-lg bg-green-600 text-white px-2.5 text-[11px] font-bold hover:bg-green-700 flex items-center gap-1"
                            ><MessageCircle className="w-3 h-3" />WhatsApp</a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredBookings.length === 0 && <p className="p-6 text-sm text-[#665B53] text-center">{searchQuery || statusFilter !== 'all' ? 'No bookings match your filters.' : 'No bookings yet. They will appear here when clients book via the site.'}</p>}
            </section>
          )}

          {/* ═══ CALENDAR ═══════════════════════════ */}
          {panel === 'calendar' && (
            <div className="space-y-4">
              {dates.map(date => (
                <section key={date} className="bg-[#FFFDF9] border border-[#DECDBD] rounded-2xl p-5">
                  <h2 className="font-serif text-xl font-bold">{date}</h2>
                  <div className="mt-3 grid md:grid-cols-2 gap-3">
                    {bookings.filter(b => b.date === date).map(b => (
                      <div key={b.id} className="rounded-xl bg-[#F7F2EB] p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold">{b.timeSlot} · {b.clientName}</p>
                            <p className="text-xs text-[#665B53] mt-1">{b.service.name}</p>
                            {b.requestedStylistName && (
                              <p className="text-[10px] text-[#B88E39] font-bold mt-1">Stylist: {b.requestedStylistName}</p>
                            )}
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${b.status === 'Verified' ? 'bg-blue-100 text-blue-700' : b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{b.status}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <a href={buildWhatsAppUrl(b.clientPhone, `Hi ${b.clientName}, reminder: your ${b.service.name} appointment is on ${b.date} at ${b.timeSlot}. See you at Tresses!`)} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-green-700 flex items-center gap-1 hover:underline"><MessageCircle className="w-3 h-3" />Remind via WhatsApp</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
              {dates.length === 0 && <div className="rounded-3xl border border-dashed border-[#C59648] p-10 text-center text-sm text-[#665B53]">Your appointment calendar will populate as bookings arrive.</div>}
            </div>
          )}

          {/* ═══ SERVICES ═══════════════════════════ */}
          {panel === 'services' && (
            <div className="space-y-5">
              <button onClick={() => setEditingService({ ...emptyService })} className="min-h-11 bg-[#403833] text-white rounded-xl px-5 text-sm font-bold hover:bg-[#2C2620] transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />Add service</button>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map(service => (
                  <article key={service.id} className="bg-[#FFFDF9] border border-[#DECDBD] rounded-2xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between gap-4">
                      <div className="flex gap-3">
                        <img src={service.image} alt={service.name} className="w-14 h-14 rounded-xl object-cover border border-[#E5D7C0] shrink-0" />
                        <div>
                          <p className="font-serif text-lg font-bold">{service.name}</p>
                          <p className="text-xs text-[#9A6F2E] font-bold mt-0.5">{service.category}</p>
                          <p className="text-[10px] text-[#665B53] font-semibold mt-1">Available Stylists count: {service.numberOfStylists || 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">KSh {service.price.toLocaleString()}</p>
                        <p className="text-[10px] text-[#665B53]">Deposit: KSh {service.depositAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#665B53] mt-3 line-clamp-2">{service.description}</p>
                    <div className="flex gap-2 mt-5">
                      <button onClick={() => setEditingService({ ...service })} className="min-h-10 border border-[#DECDBD] rounded-lg px-3 text-xs font-bold hover:bg-[#F7F2EB] transition-colors"><Edit3 className="w-3.5 h-3.5 inline mr-1" />Edit</button>
                      <button onClick={() => removeService(service.id)} className="min-h-10 border border-[#EAB4A6] text-[#A94731] rounded-lg px-3 text-xs font-bold hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5 inline mr-1" />Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* ═══ STYLISTS ═══════════════════════════ */}
          {panel === 'stylists' && (
            <div className="space-y-5">
              <button onClick={() => { setEditingStylist({ ...emptyStylist }); setStylistSpecialtiesStr(''); }} className="min-h-11 bg-[#403833] text-white rounded-xl px-5 text-sm font-bold hover:bg-[#2C2620] transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />Add Stylist</button>
              <div className="grid md:grid-cols-2 gap-4">
                {stylists.map(stylist => (
                  <article key={stylist.id} className="bg-[#FFFDF9] border border-[#DECDBD] rounded-2xl p-5 hover:shadow-md transition-shadow flex gap-4">
                    <img src={stylist.photo} alt={stylist.name} className="w-20 h-20 rounded-full object-cover border border-[#E5D7C0] shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-serif text-lg font-bold">{stylist.name}</h3>
                          <p className="text-xs text-[#9A6F2E] font-bold">{stylist.role}</p>
                        </div>
                        <span className="text-xs font-bold bg-[#FAF7F2] border border-[#E5D7C0] px-2 py-0.5 rounded-full">★ {stylist.rating}</span>
                      </div>
                      <p className="text-xs text-[#665B53] line-clamp-2">{stylist.bio}</p>
                      <div className="flex flex-wrap gap-1">
                        {stylist.specialties.map(spec => (
                          <span key={spec} className="text-[9px] bg-[#FAF7F2] border border-[#DECDBD] rounded-full px-2 py-0.5 font-semibold text-[#665B53]">{spec}</span>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-[#E5D7C0]/60 flex justify-between items-center">
                        <span className="text-[10px] text-[#665B53]">Exp: <b>{stylist.experienceYears} Years</b></span>
                        <div className="flex gap-2">
                          <button onClick={() => startEditStylist(stylist)} className="min-h-8 border border-[#DECDBD] rounded-lg px-2 text-[10px] font-bold hover:bg-[#F7F2EB] transition-colors"><Edit3 className="w-3 h-3 inline mr-1" />Edit</button>
                          <button onClick={() => deleteStylist(stylist.id)} className="min-h-8 border border-[#EAB4A6] text-[#A94731] rounded-lg px-2 text-[10px] font-bold hover:bg-red-50 transition-colors"><Trash2 className="w-3 h-3 inline mr-1" />Delete</button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* ═══ CLIENTS ═══════════════════════════ */}
          {panel === 'clients' && (
            <div className="space-y-4">
              {filteredClients.length === 0 && <p className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-8 text-center text-sm text-[#665B53]">No clients found. Client profiles are built automatically from bookings.</p>}
              {filteredClients.map(client => (
                <div key={client.phone} className="bg-[#FFFDF9] border border-[#DECDBD] rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#B88E39]/20 flex items-center justify-center text-[#B88E39] font-bold text-sm">{client.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <h3 className="font-serif text-lg font-bold">{client.name}</h3>
                          <p className="text-xs text-[#665B53]">{client.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold">{client.bookings.length}</p>
                        <p className="text-[10px] text-[#665B53] uppercase tracking-wider">Visits</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[#B88E39]">KSh {client.totalSpent.toLocaleString()}</p>
                        <p className="text-[10px] text-[#665B53] uppercase tracking-wider">Spent</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold">{client.lastVisit}</p>
                        <p className="text-[10px] text-[#665B53] uppercase tracking-wider">Last Visit</p>
                      </div>
                      <a href={buildWhatsAppUrl(client.phone, `Hi ${client.name}, this is Kay from Tresses by Kay. `)} target="_blank" rel="noopener noreferrer" className="min-h-9 rounded-lg bg-green-600 text-white px-3 text-xs font-bold hover:bg-green-700 flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />Chat</a>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {client.bookings.slice(0, 5).map(b => (
                      <span key={b.id} className="text-[10px] bg-[#F7F2EB] border border-[#DECDBD] rounded-full px-2 py-0.5 font-medium">{b.service.name} · {b.status}</span>
                    ))}
                    {client.bookings.length > 5 && <span className="text-[10px] text-[#665B53]">+{client.bookings.length - 5} more</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ COMMENTS ═══════════════════════════ */}
          {panel === 'comments' && (
            <div className="space-y-4">
              {comments.length === 0 && <p className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-8 text-center text-sm text-[#665B53]">No client comments yet. Comments submitted through the contact form will appear here.</p>}
              {comments.map(comment => (
                <div key={comment.id} className="bg-[#FFFDF9] border border-[#DECDBD] rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm">{comment.clientName}</h3>
                      <p className="text-[10px] text-[#665B53]">{comment.date} · Booking: {comment.bookingId}</p>
                    </div>
                    {!comment.adminReply && <span className="shrink-0 text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Needs reply</span>}
                  </div>
                  <p className="text-sm text-[#2F2924] bg-[#F7F2EB] rounded-xl p-3 italic">"{comment.message}"</p>
                  {comment.adminReply ? (
                    <div className="bg-[#E8F2E6] rounded-xl p-3 text-sm">
                      <p className="text-[10px] font-bold text-green-700 mb-1">Admin Reply · {comment.adminReplyDate}</p>
                      <p className="text-[#2F2924]">{comment.adminReply}</p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={commentReply[comment.id] || ''} onChange={e => setCommentReply(p => ({ ...p, [comment.id]: e.target.value }))} placeholder="Write reply…" className="flex-1 border border-[#DECDBD] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#B88E39]" />
                      <button onClick={() => replyToComment(comment.id)} className="min-h-10 bg-[#403833] text-white rounded-xl px-4 text-xs font-bold hover:bg-[#2C2620] flex items-center gap-1"><Send className="w-3.5 h-3.5" />Reply</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ═══ MEDIA ═══════════════════════════════ */}
          {panel === 'media' && (
            <div className="space-y-6">
              <section className="max-w-2xl bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-6 sm:p-8">
                <div className="flex gap-3">
                  <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#F8E7CD] grid place-items-center"><UploadCloud className="w-5 h-5 text-[#9A6F2E]" /></div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold">Phone-ready media upload</h2>
                    <p className="text-sm text-[#665B53] mt-1">JPG, PNG, WebP, MP4, and WebM only. Three attempts per minute. Images are converted to WebP before they enter the device cache.</p>
                  </div>
                </div>
                <input ref={fileInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" capture="environment" onChange={(event) => selectUpload(event.target.files?.[0])} />
                <button disabled={uploading} onClick={() => fileInput.current?.click()} className="mt-6 min-h-12 w-full rounded-xl bg-[#403833] text-white font-bold text-sm disabled:opacity-50 hover:bg-[#2C2620] transition-colors">{uploading ? <><LoaderCircle className="w-4 h-4 animate-spin inline mr-2" />Preparing asset...</> : 'Choose photo or video'}</button>
                {uploadMessage && <div className={`mt-4 rounded-xl p-4 text-sm flex gap-2 ${uploadMessage.includes('could not') || uploadMessage.includes('must') || uploadMessage.includes('limit') ? 'bg-[#FCE8E3] text-[#8E3C29]' : 'bg-[#E8F2E6] text-[#35643A]'}`}><CircleAlert className="w-4 h-4 shrink-0 mt-0.5" />{uploadMessage}</div>}
                {upload && <div className="mt-5 rounded-2xl border border-[#DECDBD] overflow-hidden"><div className="aspect-video bg-[#403833]">{upload.file.type.startsWith('image/') ? <img src={upload.previewUrl} className="w-full h-full object-contain" alt="Prepared upload preview" /> : <video src={upload.previewUrl} className="w-full h-full object-contain" controls />}</div><div className="p-4 flex flex-wrap justify-between gap-2 text-xs"><span className="font-bold">{upload.file.name}</span><span>{Math.round(upload.file.size / 1024)} KB · {upload.requiresServerTranscode ? 'Server transcode required' : 'WebP optimized'}</span></div></div>}
                <p className="mt-5 text-xs leading-relaxed text-[#665B53]"><Check className="w-3.5 h-3.5 inline text-[#35643A]" /> Cached uploads are not public. A signed, authenticated server endpoint must transcode MP4 assets and issue the final public URL.</p>
              </section>

              {/* Grid of uploaded media */}
              <section className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-6 sm:p-8 space-y-4">
                <h3 className="font-serif text-xl font-bold">Existing Media Assets</h3>
                {mediaList.length === 0 ? (
                  <p className="text-sm text-[#665B53]">No media uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {mediaList.map((item) => (
                      <div key={item.id} className="border border-[#EADCCB] rounded-xl overflow-hidden p-2.5 bg-[#FAF7F2] flex flex-col justify-between space-y-2.5">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-[#403833]">
                          {item.type === 'video' ? (
                            <video src={item.url} className="w-full h-full object-cover" controls />
                          ) : (
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold line-clamp-1 text-[#1C1814]">{item.name}</p>
                          <p className="text-[9px] text-[#665B53]">{Math.round(item.size / 1024)} KB</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.url);
                              alert('Media URL copied to clipboard!');
                            }}
                            className="flex-1 min-h-7 bg-[#FFFDF9] border border-[#DECDBD] text-[9px] font-bold rounded-lg hover:bg-[#F7F2EB] transition-colors"
                          >
                            Copy URL
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this media asset?')) {
                                try { await deleteDoc(doc(db, 'media', item.id)); } catch (err) { console.error(err); }
                              }
                            }}
                            className="p-1 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═══ PUBLIC PAGES CMS ═══════════════════ */}
          {panel === 'pages' && (
            <div className="space-y-6">
              {!editingPage ? (
                <section className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-6">
                  <h2 className="font-serif text-2xl font-bold">Public pages</h2>
                  <p className="text-sm text-[#665B53] mt-2">Click any page button below to edit its dynamic titles, images, videos, operating hours, and more.</p>
                  <div className="mt-5 grid sm:grid-cols-2 gap-3">
                    {[
                      { id: 'home', name: 'Home' },
                      { id: 'services', name: 'Services' },
                      { id: 'gallery', name: 'Gallery' },
                      { id: 'contact', name: 'Contact' }
                    ].map((page) => (
                      <button
                        key={page.id}
                        onClick={() => setEditingPage(page.id as any)}
                        className="border border-[#EADCCB] rounded-xl p-4 flex items-center justify-between hover:bg-[#FAF7F2]/50 hover:border-[#B88E39] text-left font-bold transition-all"
                      >
                        <span>{page.name} Page Editor</span>
                        <ChevronRight className="w-4 h-4 text-[#9A6F2E]" />
                      </button>
                    ))}
                  </div>
                </section>
              ) : (
                <div className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#EADCCB] pb-4">
                    <div>
                      <h2 className="font-serif text-2xl font-bold">Editing {editingPage.toUpperCase()} Page Details</h2>
                      <p className="text-xs text-[#665B53] mt-1">Changes are saved in local state for live preview.</p>
                    </div>
                    <button onClick={() => setEditingPage(null)} className="min-h-10 border border-[#DECDBD] text-xs font-bold px-4 rounded-xl hover:bg-[#F7F2EB] flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to list</button>
                  </div>

                  {/* ──────────────── HOME CMS ──────────────── */}
                  {editingPage === 'home' && (
                    <div className="space-y-4 max-w-3xl">
                      <label className="admin-field">Hero Notification Text
                        <input value={localHomeSettings.heroTagline} onChange={e => setLocalHomeSettings({...localHomeSettings, heroTagline: e.target.value})} />
                      </label>
                      <label className="admin-field">Hero Heading (Title)
                        <input value={localHomeSettings.heroTitle} onChange={e => setLocalHomeSettings({...localHomeSettings, heroTitle: e.target.value})} />
                      </label>
                      <label className="admin-field">Hero Subtitle Text
                        <textarea rows={3} value={localHomeSettings.heroSubtitle} onChange={e => setLocalHomeSettings({...localHomeSettings, heroSubtitle: e.target.value})} />
                      </label>
                      <label className="admin-field">Hero Intro Video Path / URL
                        <input value={localHomeSettings.heroVideoUrl} onChange={e => setLocalHomeSettings({...localHomeSettings, heroVideoUrl: e.target.value})} />
                      </label>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <label className="admin-field sm:col-span-2">Brand Quote Text
                          <textarea rows={3} value={localHomeSettings.brandStoryQuote} onChange={e => setLocalHomeSettings({...localHomeSettings, brandStoryQuote: e.target.value})} />
                        </label>
                        <label className="admin-field">Brand Quote Author
                          <input value={localHomeSettings.brandStoryAuthor} onChange={e => setLocalHomeSettings({...localHomeSettings, brandStoryAuthor: e.target.value})} />
                        </label>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <label className="admin-field">Bottom Banner Title
                          <input value={localHomeSettings.ctaTitle} onChange={e => setLocalHomeSettings({...localHomeSettings, ctaTitle: e.target.value})} />
                        </label>
                        <label className="admin-field">Bottom Banner Description
                          <input value={localHomeSettings.ctaSubtitle} onChange={e => setLocalHomeSettings({...localHomeSettings, ctaSubtitle: e.target.value})} />
                        </label>
                      </div>
                      <button onClick={() => savePageChanges('home')} className="mt-4 min-h-12 bg-[#403833] text-white px-6 rounded-xl font-bold hover:bg-[#2C2620]">Save Home Changes</button>
                    </div>
                  )}

                  {/* ──────────────── SERVICES CMS ──────────── */}
                  {editingPage === 'services' && (
                    <div className="space-y-4 max-w-3xl">
                      <label className="admin-field">Menu Subtitle Label
                        <input value={localServicesSettings.introSubtitle} onChange={e => setLocalServicesSettings({...localServicesSettings, introSubtitle: e.target.value})} />
                      </label>
                      <label className="admin-field">Menu Heading Title
                        <input value={localServicesSettings.introTitle} onChange={e => setLocalServicesSettings({...localServicesSettings, introTitle: e.target.value})} />
                      </label>
                      <label className="admin-field">Menu Introduction description
                        <textarea rows={3} value={localServicesSettings.introText} onChange={e => setLocalServicesSettings({...localServicesSettings, introText: e.target.value})} />
                      </label>
                      <button onClick={() => savePageChanges('services')} className="mt-4 min-h-12 bg-[#403833] text-white px-6 rounded-xl font-bold hover:bg-[#2C2620]">Save Services Changes</button>
                    </div>
                  )}

                  {/* ──────────────── GALLERY CMS ───────────── */}
                  {editingPage === 'gallery' && (
                    <div className="space-y-6">
                      <div className="space-y-4 max-w-3xl">
                        <h3 className="font-serif text-lg font-bold border-b pb-2">1. Lookbook Headers</h3>
                        <label className="admin-field">Lookbook Subtitle Label
                          <input value={localGallerySettings.introSubtitle} onChange={e => setLocalGallerySettings({...localGallerySettings, introSubtitle: e.target.value})} />
                        </label>
                        <label className="admin-field">Lookbook Title Heading
                          <input value={localGallerySettings.introTitle} onChange={e => setLocalGallerySettings({...localGallerySettings, introTitle: e.target.value})} />
                        </label>
                        <label className="admin-field">Lookbook Intro description
                          <textarea rows={3} value={localGallerySettings.introText} onChange={e => setLocalGallerySettings({...localGallerySettings, introText: e.target.value})} />
                        </label>
                        <button onClick={() => savePageChanges('gallery')} className="min-h-11 bg-[#403833] text-white px-6 rounded-xl font-bold hover:bg-[#2C2620]">Save Headers</button>
                      </div>

                      <div className="space-y-4 border-t border-[#E5D7C0] pt-6">
                        <div className="flex justify-between items-center">
                          <h3 className="font-serif text-lg font-bold">2. Manage Lookbook Grid Items</h3>
                          <button onClick={() => setEditingGalleryItem({ ...emptyGalleryItem })} className="min-h-9 bg-[#B88E39] text-white text-xs font-bold px-4 rounded-xl hover:bg-[#9A6F2E] flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Lookbook Item</button>
                        </div>

                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {galleryItems.map(item => (
                            <div key={item.id} className="bg-[#FAF7F2] border border-[#DECDBD] rounded-xl overflow-hidden p-3 flex flex-col justify-between space-y-3">
                              <div className="space-y-2">
                                <div className="relative aspect-square rounded-lg overflow-hidden bg-[#403833]">
                                  {item.videoUrl ? (
                                    <video src={item.videoUrl} className="w-full h-full object-cover" controls />
                                  ) : (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                  )}
                                  <span className="absolute top-2 left-2 bg-[#FAF7F2] text-[#B88E39] border border-[#DECDBD] text-[9px] font-bold px-2 py-0.5 rounded-full">{item.category}</span>
                                </div>
                                <h4 className="font-bold text-xs line-clamp-1">{item.title}</h4>
                                <p className="text-[10px] text-[#665B53] font-medium">Stylist: {item.stylistName}</p>
                                {item.isBeforeAfter && <span className="text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">Before & After</span>}
                              </div>
                              <div className="flex gap-2 pt-2 border-t border-[#DECDBD]">
                                <button onClick={() => setEditingGalleryItem(item)} className="flex-1 min-h-8 border border-[#DECDBD] rounded-lg text-[10px] font-bold hover:bg-[#F7F2EB] flex items-center justify-center gap-1"><Edit3 className="w-3 h-3" />Edit</button>
                                <button onClick={() => deleteGalleryItem(item.id)} className="flex-1 min-h-8 border border-red-200 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-50 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" />Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ──────────────── CONTACT CMS ───────────── */}
                  {editingPage === 'contact' && (
                    <div className="space-y-4 max-w-3xl">
                      <label className="admin-field">Welcome Title
                        <input value={localContactSettings.introTitle} onChange={e => setLocalContactSettings({...localContactSettings, introTitle: e.target.value})} />
                      </label>
                      <label className="admin-field">Welcome Text Description
                        <textarea rows={3} value={localContactSettings.introText} onChange={e => setLocalContactSettings({...localContactSettings, introText: e.target.value})} />
                      </label>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <label className="admin-field">Atelier Room Address
                          <input value={localContactSettings.address} onChange={e => setLocalContactSettings({...localContactSettings, address: e.target.value})} />
                        </label>
                        <label className="admin-field">Support Phone Number
                          <input value={localContactSettings.phone} onChange={e => setLocalContactSettings({...localContactSettings, phone: e.target.value})} />
                        </label>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <label className="admin-field">Atelier Support Email
                          <input value={localContactSettings.email} onChange={e => setLocalContactSettings({...localContactSettings, email: e.target.value})} />
                        </label>
                        <label className="admin-field">WhatsApp URL or Direct Number
                          <input value={localContactSettings.whatsappNumber} onChange={e => setLocalContactSettings({...localContactSettings, whatsappNumber: e.target.value})} />
                        </label>
                      </div>
                      <label className="admin-field">Google Maps iframe Embed source URL
                        <input value={localContactSettings.mapsEmbedUrl} onChange={e => setLocalContactSettings({...localContactSettings, mapsEmbedUrl: e.target.value})} />
                      </label>
                      <div className="grid sm:grid-cols-3 gap-3 border-t pt-4">
                        <label className="admin-field">Mon-Fri Hours
                          <input value={localContactSettings.hoursMonFri} onChange={e => setLocalContactSettings({...localContactSettings, hoursMonFri: e.target.value})} />
                        </label>
                        <label className="admin-field">Saturday Hours
                          <input value={localContactSettings.hoursSat} onChange={e => setLocalContactSettings({...localContactSettings, hoursSat: e.target.value})} />
                        </label>
                        <label className="admin-field">Sunday Hours
                          <input value={localContactSettings.hoursSun} onChange={e => setLocalContactSettings({...localContactSettings, hoursSun: e.target.value})} />
                        </label>
                      </div>
                      <button onClick={() => savePageChanges('contact')} className="mt-4 min-h-12 bg-[#403833] text-white px-6 rounded-xl font-bold hover:bg-[#2C2620]">Save Contact Changes</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══ SETTINGS ═══════════════════════════ */}
          {panel === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <section className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-6 space-y-4">
                <h2 className="font-serif text-2xl font-bold">Refund Policy</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-[#F7F2EB] rounded-xl p-4">
                    <p className="text-xs font-bold text-[#665B53] uppercase tracking-wider">Refund Rate</p>
                    <p className="text-2xl font-serif font-bold text-[#B88E39] mt-1">{REFUND_RATE * 100}%</p>
                    <p className="text-xs text-[#665B53] mt-1">of deposit returned to client</p>
                  </div>
                  <div className="bg-[#F7F2EB] rounded-xl p-4">
                    <p className="text-xs font-bold text-[#665B53] uppercase tracking-wider">Processing Fee</p>
                    <p className="text-2xl font-serif font-bold text-[#1C1814] mt-1">{REFUND_FEE_RATE * 100}%</p>
                    <p className="text-xs text-[#665B53] mt-1">retained as service fee</p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-bold">Waiting Period: {REFUND_WAITING_DAYS} days</p>
                    <p className="text-xs mt-1">Refunds can only be processed {REFUND_WAITING_DAYS} days after the original booking date. The refund button will appear automatically on eligible bookings.</p>
                  </div>
                </div>
              </section>

              <section className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-6 space-y-4">
                <h2 className="font-serif text-2xl font-bold">Admin Account</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-[#F7F2EB] rounded-xl p-4">
                    <p className="text-xs font-bold text-[#665B53] uppercase tracking-wider">Username</p>
                    <p className="text-sm font-bold mt-1">{ADMIN_USERNAME}</p>
                  </div>
                  <div className="bg-[#F7F2EB] rounded-xl p-4">
                    <p className="text-xs font-bold text-[#665B53] uppercase tracking-wider">Auth Method</p>
                    <p className="text-sm font-bold mt-1">Session-based PIN</p>
                  </div>
                </div>
                <p className="text-xs text-[#665B53]">To update credentials, modify the admin constants in the source code. Firebase Auth integration is recommended for production.</p>
              </section>

              <section className="bg-[#FFFDF9] border border-[#DECDBD] rounded-3xl p-6 space-y-4">
                <h2 className="font-serif text-2xl font-bold">Firestore Database</h2>
                <p className="text-xs text-[#665B53]">
                  All data (services, stylists, gallery, bookings, page settings, comments) is stored in Cloud Firestore and syncs in real-time across all devices.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-[#F7F2EB] rounded-xl p-4">
                    <p className="text-xs font-bold text-[#665B53] uppercase tracking-wider">Services</p>
                    <p className="text-2xl font-serif font-bold text-[#B88E39] mt-1">{services.length}</p>
                  </div>
                  <div className="bg-[#F7F2EB] rounded-xl p-4">
                    <p className="text-xs font-bold text-[#665B53] uppercase tracking-wider">Stylists</p>
                    <p className="text-2xl font-serif font-bold text-[#B88E39] mt-1">{stylists.length}</p>
                  </div>
                  <div className="bg-[#F7F2EB] rounded-xl p-4">
                    <p className="text-xs font-bold text-[#665B53] uppercase tracking-wider">Gallery Items</p>
                    <p className="text-2xl font-serif font-bold text-[#B88E39] mt-1">{galleryItems.length}</p>
                  </div>
                  <div className="bg-[#F7F2EB] rounded-xl p-4">
                    <p className="text-xs font-bold text-[#665B53] uppercase tracking-wider">Bookings</p>
                    <p className="text-2xl font-serif font-bold text-[#B88E39] mt-1">{bookings.length}</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm('This will populate Firestore with default catalog data (services, stylists, gallery, page settings). Existing documents with the same IDs will be overwritten. Continue?')) return;
                    try {
                      for (const service of MOCK_SERVICES) { await setDoc(doc(db, 'services', service.id), service); }
                      for (const stylist of MOCK_STYLISTS) { await setDoc(doc(db, 'stylists', stylist.id), stylist); }
                      for (const item of MOCK_GALLERY) { await setDoc(doc(db, 'gallery', item.id), item); }
                      await setDoc(doc(db, 'settings', 'pageSettings'), DEFAULT_PAGE_SETTINGS);
                      alert('Default data seeded to Firestore successfully! The dashboard will update automatically.');
                    } catch (err) {
                      console.error(err);
                      alert('Failed to seed data: ' + (err instanceof Error ? err.message : 'Unknown error'));
                    }
                  }}
                  className="w-full min-h-12 rounded-xl bg-[#B88E39] text-white font-bold hover:bg-[#A37B2C] transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Seed Default Data to Firestore
                </button>
                <p className="text-[10px] text-[#8C8071]">Use this to populate an empty Firestore database with the default service catalog, stylists, and page content. Existing data with matching IDs will be overwritten.</p>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* ═══ EDIT SERVICE MODAL ═══════════════════ */}
      {editingService && (
        <div className="fixed inset-0 z-50 p-4 grid place-items-center bg-[#2F2924]/50 backdrop-blur-sm">
          <form onSubmit={saveService} className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#FFFDF9] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-5">
              <h2 className="font-serif text-2xl font-bold">{editingService.id ? 'Edit service' : 'Add service'}</h2>
              <button type="button" onClick={() => setEditingService(null)} className="p-2 hover:bg-[#F7F2EB] rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="admin-field sm:col-span-2">Service name
                <input required value={editingService.name} onChange={e => setEditingService({ ...editingService, name: e.target.value })} />
              </label>
              <label className="admin-field">Category
                <select value={editingService.category} onChange={e => setEditingService({ ...editingService, category: e.target.value as ServiceCategory })}>{categories.map(c => <option key={c}>{c}</option>)}</select>
              </label>
              <label className="admin-field">Price (KSh)
                <input required min="0" type="number" value={editingService.price} onChange={e => setEditingService({ ...editingService, price: Number(e.target.value) })} />
              </label>
              <label className="admin-field">Duration (minutes)
                <input required min="15" step="15" type="number" value={editingService.durationMinutes} onChange={e => setEditingService({ ...editingService, durationMinutes: Number(e.target.value) })} />
              </label>
              <label className="admin-field">Stylists Count (Number of stylists performing this style)
                <input min="1" type="number" value={editingService.numberOfStylists || 1} onChange={e => setEditingService({ ...editingService, numberOfStylists: Number(e.target.value) })} />
              </label>
              <label className="admin-field sm:col-span-2">Service Image Path / URL
                <input placeholder="e.g. /media/gallery/some-pic.webp" value={editingService.image} onChange={e => setEditingService({ ...editingService, image: e.target.value })} />
              </label>
              <label className="admin-field sm:col-span-2">Description
                <textarea required rows={4} value={editingService.description} onChange={e => setEditingService({ ...editingService, description: e.target.value })} />
              </label>
            </div>
            <button className="mt-6 w-full min-h-12 rounded-xl bg-[#403833] text-white font-bold hover:bg-[#2C2620] transition-colors">Save service</button>
          </form>
        </div>
      )}

      {/* ═══ EDIT STYLIST MODAL ═══════════════════ */}
      {editingStylist && (
        <div className="fixed inset-0 z-50 p-4 grid place-items-center bg-[#2F2924]/50 backdrop-blur-sm">
          <form onSubmit={saveStylist} className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#FFFDF9] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-5">
              <h2 className="font-serif text-2xl font-bold">{editingStylist.id ? 'Edit Stylist' : 'Add Stylist'}</h2>
              <button type="button" onClick={() => setEditingStylist(null)} className="p-2 hover:bg-[#F7F2EB] rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="admin-field sm:col-span-2">Stylist Name
                <input required value={editingStylist.name} onChange={e => setEditingStylist({ ...editingStylist, name: e.target.value })} />
              </label>
              <label className="admin-field">Role / Job Title
                <input required placeholder="e.g. Lead Braid Artisan" value={editingStylist.role} onChange={e => setEditingStylist({ ...editingStylist, role: e.target.value })} />
              </label>
              <label className="admin-field">Experience Years
                <input required type="number" min="0" value={editingStylist.experienceYears} onChange={e => setEditingStylist({ ...editingStylist, experienceYears: Number(e.target.value) })} />
              </label>
              <label className="admin-field sm:col-span-2">Photo Path / URL
                <input placeholder="e.g. /media/kay-founder.webp" value={editingStylist.photo} onChange={e => setEditingStylist({ ...editingStylist, photo: e.target.value })} />
              </label>
              <label className="admin-field sm:col-span-2">Specialties (comma separated)
                <input required placeholder="e.g. Knotless Braids, Boho Goddess, Cornrows" value={stylistSpecialtiesStr} onChange={e => setStylistSpecialtiesStr(e.target.value)} />
              </label>
              <label className="admin-field sm:col-span-2">Bio Description
                <textarea required rows={3} value={editingStylist.bio} onChange={e => setEditingStylist({ ...editingStylist, bio: e.target.value })} />
              </label>
            </div>
            <button className="mt-6 w-full min-h-12 rounded-xl bg-[#403833] text-white font-bold hover:bg-[#2C2620] transition-colors">Save Stylist</button>
          </form>
        </div>
      )}

      {/* ═══ EDIT GALLERY ITEM MODAL ═══════════════ */}
      {editingGalleryItem && (
        <div className="fixed inset-0 z-50 p-4 grid place-items-center bg-[#2F2924]/50 backdrop-blur-sm">
          <form onSubmit={saveGalleryItem} className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#FFFDF9] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-5">
              <h2 className="font-serif text-2xl font-bold">{editingGalleryItem.id ? 'Edit Lookbook Item' : 'Add Lookbook Item'}</h2>
              <button type="button" onClick={() => setEditingGalleryItem(null)} className="p-2 hover:bg-[#F7F2EB] rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="admin-field sm:col-span-2">Title Description
                <input required value={editingGalleryItem.title} onChange={e => setEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })} />
              </label>
              <label className="admin-field">Category
                <select value={editingGalleryItem.category} onChange={e => setEditingGalleryItem({ ...editingGalleryItem, category: e.target.value as any })}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                  <option value="Videos">Videos</option>
                </select>
              </label>
              <label className="admin-field">Stylist Name
                <select value={editingGalleryItem.stylistName} onChange={e => setEditingGalleryItem({ ...editingGalleryItem, stylistName: e.target.value })}>
                  {stylists.map(st => <option key={st.id} value={st.name}>{st.name}</option>)}
                </select>
              </label>
              <label className="admin-field sm:col-span-2">Primary Image URL
                <input required placeholder="e.g. /media/gallery/some-pic.webp" value={editingGalleryItem.image} onChange={e => setEditingGalleryItem({ ...editingGalleryItem, image: e.target.value })} />
              </label>
              <label className="admin-field sm:col-span-2">Video URL (only if Category is Videos)
                <input placeholder="e.g. https://assets.mixkit.co/..." value={editingGalleryItem.videoUrl} onChange={e => setEditingGalleryItem({ ...editingGalleryItem, videoUrl: e.target.value })} />
              </label>

              <div className="sm:col-span-2 border border-[#E5D7C0] rounded-2xl p-4 space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold select-none">
                  <input type="checkbox" checked={editingGalleryItem.isBeforeAfter} onChange={e => setEditingGalleryItem({ ...editingGalleryItem, isBeforeAfter: e.target.checked })} />
                  Include Before & After Comparison Photos
                </label>
                {editingGalleryItem.isBeforeAfter && (
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    <label className="admin-field">Before Image Path / URL
                      <input required value={editingGalleryItem.beforeImage} onChange={e => setEditingGalleryItem({ ...editingGalleryItem, beforeImage: e.target.value })} />
                    </label>
                    <label className="admin-field">After Image Path / URL
                      <input required value={editingGalleryItem.afterImage} onChange={e => setEditingGalleryItem({ ...editingGalleryItem, afterImage: e.target.value })} />
                    </label>
                  </div>
                )}
              </div>
            </div>
            <button className="mt-6 w-full min-h-12 rounded-xl bg-[#403833] text-white font-bold hover:bg-[#2C2620] transition-colors">Save Lookbook Item</button>
          </form>
        </div>
      )}
    </div>
  );
};
