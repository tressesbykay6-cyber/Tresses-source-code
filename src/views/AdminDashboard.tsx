import React, { FormEvent, useMemo, useRef, useState, useEffect } from 'react';
import {
  CalendarDays, Check, ChevronRight, CircleAlert, ClipboardList, Edit3,
  FileImage, LayoutDashboard, LoaderCircle, Plus, Scissors, ShieldCheck,
  Trash2, UploadCloud, X, MessageCircle, Download, Users, Star,
  Search, LogOut, Lock, TrendingUp, DollarSign, Clock, Eye, Send,
  RefreshCw, AlertTriangle, CheckCircle2, MessageSquare, Filter,
} from 'lucide-react';
import { Service, ServiceCategory } from '../types';
import { PreparedUpload, allowUploadAttempt, cacheUpload, prepareUpload } from '../lib/mediaUpload';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

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
  onExit: () => void;
}

/* ─── Constants ──────────────────────────────────────────────── */

const ADMIN_USERNAME = 'kavatah';
const ADMIN_PASSCODE = 'kavatahkarembo123';
const REFUND_RATE = 0.85; // 85% refund
const REFUND_FEE_RATE = 0.15; // 15% fee
const REFUND_WAITING_DAYS = 7;

type Panel = 'overview' | 'bookings' | 'calendar' | 'services' | 'clients' | 'comments' | 'media' | 'settings';
const categories: ServiceCategory[] = ['Braids', 'Wigs & Extensions', 'Hair Treatments & Color', 'Makeup', 'Nails'];
const CHART_COLORS = ['#B88E39', '#1C1814', '#5C5247', '#E5D7C0', '#D4A853'];
const emptyService: Service = { id: '', name: '', category: 'Braids', price: 0, durationMinutes: 60, durationLabel: '1 hr', stylistName: 'Kay', stylistId: 'st2', rating: 5, reviewCount: 0, image: '/media/gallery/DbkZiW1l7NZ.webp', description: '', depositAmount: 0 };

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
  const headers = ['ID', 'Client', 'Phone', 'Service', 'Date', 'Time', 'Deposit (KSh)', 'Total (KSh)', 'Status', 'Admin Comment', 'Notes'];
  const rows = bookings.map(b => [
    b.id, b.clientName, b.clientPhone, b.service.name, b.date, b.timeSlot,
    b.depositPaid, b.totalPrice, b.status, b.adminComment || '', b.notes || '',
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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ services, bookings, onServicesChange, onBookingsChange, onExit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('tresses-admin-auth') === 'true');
  const [panel, setPanel] = useState<Panel>('overview');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [upload, setUpload] = useState<PreparedUpload | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [commentReply, setCommentReply] = useState<Record<string, string>>({});
  const [adminCommentInput, setAdminCommentInput] = useState<Record<string, string>>({});
  const fileInput = useRef<HTMLInputElement>(null);

  // Comments from localStorage
  const [comments, setComments] = useState<ClientComment[]>(() => {
    try { return JSON.parse(localStorage.getItem('tresses-comments') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('tresses-comments', JSON.stringify(comments)); }, [comments]);

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
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 18) + '…' : name, count }));
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
  const updateStatus = (id: string, status: AdminBooking['status']) => {
    onBookingsChange(bookings.map(b => {
      if (b.id !== id) return b;
      const updates: Partial<AdminBooking> = { status };
      if (status === 'Verified') updates.verifiedAt = new Date().toISOString();
      if (status === 'Refunded') updates.refundAmount = Math.round(b.depositPaid * REFUND_RATE);
      return { ...b, ...updates };
    }));
  };

  const addAdminComment = (id: string) => {
    const comment = adminCommentInput[id]?.trim();
    if (!comment) return;
    onBookingsChange(bookings.map(b => b.id === id ? { ...b, adminComment: comment } : b));
    setAdminCommentInput(prev => ({ ...prev, [id]: '' }));
  };

  const replyToComment = (commentId: string) => {
    const reply = commentReply[commentId]?.trim();
    if (!reply) return;
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, adminReply: reply, adminReplyDate: new Date().toISOString().slice(0, 10) } : c));
    setCommentReply(prev => ({ ...prev, [commentId]: '' }));
  };

  const saveService = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingService || !editingService.name.trim() || !editingService.description.trim()) return;
    const durationLabel = editingService.durationMinutes >= 60 ? `${editingService.durationMinutes / 60} hr${editingService.durationMinutes === 60 ? '' : 's'}` : `${editingService.durationMinutes} mins`;
    const next = { ...editingService, id: editingService.id || `service-${Date.now()}`, durationLabel, depositAmount: Math.round(editingService.price * 0.3) };
    onServicesChange(editingService.id ? services.map(s => s.id === editingService.id ? next : s) : [next, ...services]);
    setEditingService(null);
  };

  const removeService = (id: string) => onServicesChange(services.filter(s => s.id !== id));

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
        setUploadMessage(result.kind === 'video' ? 'MP4 accepted by the secure processor and queued for web transcode.' : `Optimized WebP uploaded securely (${Math.round(result.bytes / 1024)} KB).`);
      } catch (publishError) {
        setUploadMessage(`Prepared and cached on this device. ${publishError instanceof Error ? publishError.message : 'Connect the protected API to publish it.'}`);
      }
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
    { id: 'clients', label: 'Clients', icon: Users, badge: clients.length },
    { id: 'comments', label: 'Comments', icon: MessageSquare, badge: comments.filter(c => !c.adminReply).length },
    { id: 'media', label: 'Media', icon: UploadCloud },
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
              <button key={id} onClick={() => { setPanel(id); setSearchQuery(''); setStatusFilter('all'); }} className={`min-h-11 shrink-0 flex items-center gap-3 rounded-xl px-3 text-sm font-semibold text-left transition-colors ${panel === id ? 'bg-[#403833] text-[#FAF7F2] shadow-sm' : 'text-[#665B53] hover:bg-[#F7F2EB]'}`}>
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
                        <td className="p-4 max-w-[200px]">
                          {booking.adminComment ? (
                            <p className="text-xs text-[#665B53] italic">"{booking.adminComment}"</p>
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
                                <button onClick={() => updateStatus(booking.id, 'Confirmed')} className="min-h-8 rounded-lg bg-[#403833] text-white px-2.5 text-[11px] font-bold hover:bg-[#2C2620]">Confirm</button>
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
                      <div>
                        <p className="font-serif text-xl font-bold">{service.name}</p>
                        <p className="text-xs text-[#9A6F2E] font-bold mt-1">{service.category}</p>
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
                <h2 className="font-serif text-2xl font-bold">Contact & Support</h2>
                <div className="bg-[#F7F2EB] rounded-xl p-4 space-y-2">
                  <p className="text-sm"><strong>Email:</strong> trassesbykay6@gmail.com</p>
                  <p className="text-sm"><strong>WhatsApp:</strong> +254 011 883 1488</p>
                  <p className="text-sm"><strong>Location:</strong> JKUAT Towers, Kenyatta Ave, Nairobi</p>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* ═══ EDIT SERVICE MODAL ═══════════════════ */}
      {editingService && (
        <div className="fixed inset-0 z-50 p-4 grid place-items-center bg-[#2F2924]/50 backdrop-blur-sm">
          <form onSubmit={saveService} className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#FFFDF9] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold">{editingService.id ? 'Edit service' : 'Add service'}</h2>
              <button type="button" onClick={() => setEditingService(null)} className="p-2 hover:bg-[#F7F2EB] rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <label className="admin-field sm:col-span-2">Service name<input required value={editingService.name} onChange={e => setEditingService({ ...editingService, name: e.target.value })} /></label>
              <label className="admin-field">Category<select value={editingService.category} onChange={e => setEditingService({ ...editingService, category: e.target.value as ServiceCategory })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
              <label className="admin-field">Price (KSh)<input required min="0" type="number" value={editingService.price} onChange={e => setEditingService({ ...editingService, price: Number(e.target.value) })} /></label>
              <label className="admin-field">Duration (minutes)<input required min="15" step="15" type="number" value={editingService.durationMinutes} onChange={e => setEditingService({ ...editingService, durationMinutes: Number(e.target.value) })} /></label>
              <label className="admin-field">Stylist<input required value={editingService.stylistName} onChange={e => setEditingService({ ...editingService, stylistName: e.target.value })} /></label>
              <label className="admin-field sm:col-span-2">Description<textarea required rows={4} value={editingService.description} onChange={e => setEditingService({ ...editingService, description: e.target.value })} /></label>
            </div>
            <button className="mt-6 w-full min-h-12 rounded-xl bg-[#403833] text-white font-bold hover:bg-[#2C2620] transition-colors">Save service</button>
          </form>
        </div>
      )}
    </div>
  );
};
