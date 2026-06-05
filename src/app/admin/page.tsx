'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
    Shield, 
    Mail, 
    MessageSquare, 
    Star, 
    Search, 
    RefreshCw, 
    AlertTriangle, 
    Calendar,
    ChevronRight,
    ArrowLeft,
    Sparkles,
    User,
    Store
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContactRaw {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface FeedbackRaw {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    restaurant_id: string;
    restaurants: {
        name: string;
        slug: string;
    } | null;
}

interface ParsedContact {
    id: string;
    name: string;
    email: string;
    message: string;
    created_at: string;
}

interface ParsedFeedback {
    id: string;
    restaurantName: string;
    restaurantSlug: string;
    rating: number;
    features: string;
    comments: string;
    created_at: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    
    const [contacts, setContacts] = useState<ParsedContact[]>([]);
    const [feedbacks, setFeedbacks] = useState<ParsedFeedback[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'contacts' | 'feedbacks'>('contacts');

    // Parse functions
    const parseContact = (c: ContactRaw): ParsedContact => {
        const comment = c.comment || '';
        const lines = comment.split('\n');
        let name = '';
        let email = '';
        let message = '';

        const nameLine = lines.find(l => l.startsWith('Name:'));
        if (nameLine) name = nameLine.replace('Name:', '').trim();

        const emailLine = lines.find(l => l.startsWith('Email:'));
        if (emailLine) email = emailLine.replace('Email:', '').trim();

        const messageIndex = lines.findIndex(l => l.startsWith('Message:'));
        if (messageIndex !== -1) {
            message = lines.slice(messageIndex).join('\n').replace('Message:', '').trim();
        } else {
            message = comment;
        }

        return {
            id: c.id,
            name: name || 'Anonymous',
            email: email || 'Unknown Email',
            message: message || comment,
            created_at: c.created_at
        };
    };

    const parseFeedback = (f: FeedbackRaw): ParsedFeedback => {
        const comment = f.comment || '';
        const lines = comment.split('\n');
        let features = 'None';
        let comments = 'None';

        const featuresLine = lines.find(l => l.startsWith('Features requested:'));
        if (featuresLine) features = featuresLine.replace('Features requested:', '').trim();

        const commentsLine = lines.find(l => l.startsWith('General comments:'));
        if (commentsLine) comments = commentsLine.replace('General comments:', '').trim();

        if (features === 'None' && comments === 'None' && !comment.includes('[PLATFORM FEEDBACK]')) {
            comments = comment;
        }

        return {
            id: f.id,
            restaurantName: f.restaurants?.name || 'Unknown Restaurant',
            restaurantSlug: f.restaurants?.slug || '',
            rating: f.rating,
            features,
            comments,
            created_at: f.created_at
        };
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/data');
            if (res.status === 401 || res.status === 403) {
                setAuthorized(false);
                setLoading(false);
                return;
            }
            if (!res.ok) throw new Error('Failed to load data');
            const data = await res.json();
            
            const parsedContacts = (data.contacts || []).map(parseContact);
            const parsedFeedbacks = (data.feedbacks || []).map(parseFeedback);

            setContacts(parsedContacts);
            setFeedbacks(parsedFeedbacks);
            setAuthorized(true);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter results based on search query
    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFeedbacks = feedbacks.filter(f => 
        f.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.comments.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.features.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate analytics
    const avgFeedbackRating = feedbacks.length > 0
        ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
        : '0.0';

    if (loading) {
        return (
            <div className="min-h-screen bg-dark text-text-main font-outfit flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-saffron/20 border-t-saffron rounded-full animate-spin" />
                <span className="text-sm font-medium text-text-muted">Loading Admin dashboard data...</span>
            </div>
        );
    }

    if (!authorized) {
        return (
            <div className="min-h-screen bg-dark text-text-main font-outfit flex flex-col items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                        <Shield className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold font-fraunces text-text-main mb-3">Access Denied</h2>
                    <p className="text-text-muted text-sm leading-relaxed mb-8">
                        Your account does not have administrator privileges to view this page. If you believe this is an error, please contact support.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-text-main rounded-2xl transition-all text-sm font-bold w-full"
                    >
                        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark text-text-main font-outfit selection:bg-saffron/30">
            {/* Simple Standalone Admin Navbar */}
            <nav className="h-20 flex items-center justify-between px-6 sm:px-12 border-b border-white/5 bg-dark-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-saffron flex items-center justify-center font-bold text-white shadow-lg shadow-saffron/20">
                        d
                    </div>
                    <span className="text-xl font-bold font-fraunces tracking-tight text-white">
                        digi<span className="text-saffron">Restau</span> Admin
                    </span>
                </div>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-text-main rounded-xl transition-all font-bold cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" /> Dashboard
                </button>
            </nav>
            <main className="p-6 sm:p-12 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-saffron/10 border border-saffron/20 text-saffron text-[9px] font-black uppercase tracking-wider rounded-md">
                            Super Admin
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-text-main font-fraunces">Admin Panel</h2>
                    <p className="text-text-muted mt-1 text-sm">Monitor landing page inquiries and restaurant platform feedback.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl text-text-muted hover:text-text-main transition-all flex items-center justify-center self-start sm:self-center hover:bg-white/10"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Quick Analytics Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-dark-2 border border-white/5 rounded-[32px] p-6 shadow-xl flex items-center gap-5">
                    <div className="w-14 h-14 bg-saffron/10 rounded-2xl flex items-center justify-center text-saffron shrink-0">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Contact Inquiries</p>
                        <h4 className="text-3xl font-extrabold text-text-main mt-1">{contacts.length}</h4>
                    </div>
                </div>

                <div className="bg-dark-2 border border-white/5 rounded-[32px] p-6 shadow-xl flex items-center gap-5">
                    <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 shrink-0">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Platform Feedbacks</p>
                        <h4 className="text-3xl font-extrabold text-text-main mt-1">{feedbacks.length}</h4>
                    </div>
                </div>

                <div className="bg-dark-2 border border-white/5 rounded-[32px] p-6 shadow-xl flex items-center gap-5">
                    <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center text-gold shrink-0">
                        <Star className="w-6 h-6 fill-gold" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Average Rating</p>
                        <h4 className="text-3xl font-extrabold text-text-main mt-1">{avgFeedbackRating} <span className="text-xs text-text-muted font-normal">/ 5.0</span></h4>
                    </div>
                </div>
            </div>

            {/* Filter & Tabs */}
            <div className="bg-dark-2 border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Tabs */}
                    <div className="flex bg-dark p-1 rounded-2xl border border-white/10 self-start">
                        <button
                            onClick={() => { setActiveTab('contacts'); setSearchQuery(''); }}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeTab === 'contacts'
                                ? 'bg-saffron text-white shadow-lg shadow-saffron/20'
                                : 'text-text-muted hover:text-text-main'
                            }`}
                        >
                            Contact Messages ({contacts.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab('feedbacks'); setSearchQuery(''); }}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeTab === 'feedbacks'
                                ? 'bg-saffron text-white shadow-lg shadow-saffron/20'
                                : 'text-text-muted hover:text-text-main'
                            }`}
                        >
                            Platform Feedback ({feedbacks.length})
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-saffron transition-colors" />
                        <input
                            type="text"
                            placeholder={activeTab === 'contacts' ? "Search inquiries..." : "Search feedbacks..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-dark border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-text-main focus:border-saffron/50 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Table View */}
                {activeTab === 'contacts' ? (
                    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-dark/30 no-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2">
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Visitor</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Message</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContacts.map((c) => (
                                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/1 transition-all">
                                        <td className="p-4 align-top w-1/4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-saffron/10 flex items-center justify-center text-saffron text-xs font-black">
                                                    {c.name[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="max-w-[200px]">
                                                    <p className="text-xs font-bold text-text-main truncate">{c.name}</p>
                                                    <p className="text-[10px] text-text-muted font-mono truncate">{c.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top w-2/4">
                                            <p className="text-xs text-text-main/90 leading-relaxed whitespace-pre-wrap max-w-lg">{c.message}</p>
                                        </td>
                                        <td className="p-4 align-top text-xs text-text-muted w-1/4">
                                            <div className="flex items-center gap-1.5 opacity-80">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                                            </div>
                                            <p className="text-[9px] font-mono mt-1 opacity-40">{new Date(c.created_at).toLocaleString()}</p>
                                        </td>
                                    </tr>
                                ))}

                                {filteredContacts.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-16 text-text-muted text-xs opacity-50">
                                            No contact messages found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-dark/30 no-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2">
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Restaurant</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted w-20">Rating</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Features Requested</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Comments</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFeedbacks.map((f) => (
                                    <tr key={f.id} className="border-b border-white/5 hover:bg-white/1 transition-all">
                                        <td className="p-4 align-top w-1/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 text-xs font-black">
                                                    {f.restaurantName[0]?.toUpperCase() || 'R'}
                                                </div>
                                                <div className="max-w-[180px]">
                                                    <p className="text-xs font-bold text-text-main truncate">{f.restaurantName}</p>
                                                    {f.restaurantSlug && (
                                                        <a 
                                                            href={`/menu/${f.restaurantSlug}`} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="text-[10px] text-saffron hover:underline font-mono truncate block"
                                                        >
                                                            /{f.restaurantSlug}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top w-20">
                                            <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 justify-center">
                                                <span className="text-xs font-extrabold text-gold">{f.rating}</span>
                                                <Star className="w-3.5 h-3.5 text-gold fill-gold shrink-0" />
                                            </div>
                                        </td>
                                        <td className="p-4 align-top w-1/4">
                                            <div className="flex items-start gap-2 max-w-sm">
                                                <Sparkles className="w-4 h-4 text-saffron shrink-0 mt-0.5 opacity-60" />
                                                <p className="text-xs text-text-main/90 leading-relaxed whitespace-pre-wrap">{f.features}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top w-1/4">
                                            <p className="text-xs text-text-main/80 leading-relaxed whitespace-pre-wrap max-w-sm">{f.comments}</p>
                                        </td>
                                        <td className="p-4 align-top text-xs text-text-muted w-1/5">
                                            <div className="flex items-center gap-1.5 opacity-80">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{formatDistanceToNow(new Date(f.created_at), { addSuffix: true })}</span>
                                            </div>
                                            <p className="text-[9px] font-mono mt-1 opacity-40">{new Date(f.created_at).toLocaleString()}</p>
                                        </td>
                                    </tr>
                                ))}

                                {filteredFeedbacks.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-16 text-text-muted text-xs opacity-50">
                                            No platform feedback found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    </div>
    );
}
