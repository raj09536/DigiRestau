'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Smartphone, 
    CreditCard,
    ExternalLink,
    Store,
    Calendar,
    MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function AdminSubscriptions() {
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('subscription_requests')
                .select(`*, restaurant:restaurant_id(name)`)
                .order('created_at', { ascending: false });
            setRequests(data || []);
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();

        // Realtime Subscription Requests
        const channel = supabase
            .channel('admin-requests-live')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'subscription_requests'
            }, () => {
                fetchRequests();
                toast('🔔 New upgrade request received!');
                try {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                    audio.play().catch(e => console.log('Audio blocked by browser'));
                } catch (e) {}
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const handleApprove = async (request: any) => {
        try {
            const expiryDate = request.amount >= 4000
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            // Update Restaurant
            const { error: restError } = await supabase
                .from('restaurants')
                .update({
                    is_premium: true,
                    plan: 'pro',
                    plan_expires_at: expiryDate.toISOString()
                })
                .eq('id', request.restaurant_id);

            if (restError) throw restError;

            // Update Request
            const { error: reqError } = await supabase
                .from('subscription_requests')
                .update({
                    status: 'approved',
                    approved_at: new Date().toISOString(),
                    approved_by: 'admin'
                })
                .eq('id', request.id);

            if (reqError) throw reqError;

            toast.success(`✓ Pro activated for ${request.restaurant?.name}`);
            fetchRequests();
        } catch (err) {
            toast.error('Failed to approve request');
        }
    };

    const handleReject = async (request: any) => {
        try {
            const { error } = await supabase
                .from('subscription_requests')
                .update({ status: 'rejected' })
                .eq('id', request.id);

            if (error) throw error;

            toast.success('Request rejected');
            fetchRequests();
        } catch (err) {
            toast.error('Failed to reject request');
        }
    };

    const pending = requests.filter(r => r.status === 'pending');
    const approved = requests.filter(r => r.status === 'approved');
    const rejected = requests.filter(r => r.status === 'rejected');

    const displayRequests = activeTab === 'pending' ? pending : activeTab === 'approved' ? approved : rejected;

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20">
            {/* Tabs */}
            <div className="flex bg-dark-2 border border-border-custom p-1.5 rounded-[24px] shadow-2xl shadow-black/20 w-full sm:max-w-md mx-auto">
                <TabButton 
                    active={activeTab === 'pending'} 
                    onClick={() => setActiveTab('pending')}
                    label="Pending"
                    count={pending.length}
                    color="saffron"
                />
                <TabButton 
                    active={activeTab === 'approved'} 
                    onClick={() => setActiveTab('approved')}
                    label="Approved"
                    count={approved.length}
                    color="green-500"
                />
                <TabButton 
                    active={activeTab === 'rejected'} 
                    onClick={() => setActiveTab('rejected')}
                    label="Rejected"
                    count={rejected.length}
                    color="red-500"
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-dark-2 border border-white/5 rounded-[20px] animate-pulse" />
                    ))
                ) : displayRequests.length === 0 ? (
                    <div className="text-center py-20 px-10 bg-dark-2/30 border border-white/5 rounded-[32px]">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
                            <CreditCard className="w-8 h-8 text-text-muted" />
                        </div>
                        <h3 className="text-text-muted font-black uppercase tracking-widest text-xs opacity-50">No {activeTab} requests</h3>
                    </div>
                ) : (
                    displayRequests.map((req) => (
                        <div key={req.id} className={`bg-dark-2 border rounded-[24px] p-7 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-8 shadow-2xl shadow-black/30 hover:shadow-black animate-fade-in ${
                            req.status === 'pending' ? 'border-[rgba(244,98,42,0.25)] hover:border-saffron/40' : 'border-white/5 hover:border-white/10'
                        }`}>
                            <div className="space-y-5 flex-1">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${req.status === 'pending' ? 'bg-saffron/10 text-saffron' : req.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-red-400/10 text-red-500'}`}>
                                        <Store className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-text-main font-fraunces tracking-tight">{req.restaurant?.name || 'Restaurant'}</h3>
                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] opacity-40 mt-0.5">Subscription Request</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 text-sm font-bold text-text-main">
                                        <span className="text-text-muted opacity-40">💰</span>
                                        <span>₹{req.amount} — {req.amount >= 4000 ? 'Yearly' : 'Monthly'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-text-main">
                                        <span className="text-text-muted opacity-40 font-black">📱</span>
                                        <a href={`https://wa.me/91${req.whatsapp_number?.replace(/[^0-9]/g, '')}`} target="_blank" className="text-green-400 hover:underline flex items-center gap-1.5 transition-all">
                                            {req.whatsapp_number} <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-text-muted opacity-60">
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatDistanceToNow(new Date(req.created_at))} ago
                                    </div>
                                </div>
                            </div>

                            {req.status === 'pending' && (
                                <div className="flex items-center gap-3 pt-4 sm:pt-0 sm:pl-8 sm:border-l border-white/5">
                                    <button 
                                        onClick={() => handleReject(req)}
                                        className="reject-btn hover:bg-red-500/10 transition-all flex-1 sm:flex-none py-3"
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => handleApprove(req)}
                                        className="approve-btn hover:bg-green-500/20 transition-all flex-1 sm:flex-none py-3"
                                    >
                                        Approve ✓
                                    </button>
                                </div>
                            )}

                            {req.status !== 'pending' && (
                                <div className="flex flex-col items-end gap-1 opacity-50">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${req.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                                        {req.status}
                                    </p>
                                    <p className="text-[9px] font-bold text-text-muted tracking-widest">
                                        {req.approved_at ? formatDistanceToNow(new Date(req.approved_at)) + ' ago' : 'Handled'}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label, count, color }: any) {
    return (
        <button 
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all ${
                active 
                ? `bg-white/10 text-text-main shadow-lg` 
                : 'text-text-muted hover:text-text-main opacity-60 hover:opacity-100'
            }`}
        >
            {label}
            {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] bg-saffron/10 text-saffron border border-saffron/20`}>
                    {count}
                </span>
            )}
        </button>
    );
}
