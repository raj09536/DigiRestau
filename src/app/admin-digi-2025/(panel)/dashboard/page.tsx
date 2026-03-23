'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
    Users, 
    Crown, 
    Smartphone, 
    Clock, 
    ArrowUpRight,
    Search,
    ChevronRight,
    Store
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function AdminOverview() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        proUsers: 0,
        freeUsers: 0,
        pendingCount: 0
    });
    const [recentSignups, setRecentSignups] = useState<any[]>([]);
    const [recentRequests, setRecentRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Total restaurants (exclude admins)
                const { count: totalUsers } = await supabase
                    .from('restaurants')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_admin', false);

                // Pro users
                const { count: proUsers } = await supabase
                    .from('restaurants')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_premium', true)
                    .eq('is_admin', false);

                // Pending approvals
                const { count: pendingCount } = await supabase
                    .from('subscription_requests')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending');

                setStats({
                    totalUsers: totalUsers || 0,
                    proUsers: proUsers || 0,
                    freeUsers: (totalUsers || 0) - (proUsers || 0),
                    pendingCount: pendingCount || 0
                });

                // Recent Signups
                const { data: signups } = await supabase
                    .from('restaurants')
                    .select('name, created_at, is_premium')
                    .eq('is_admin', false)
                    .order('created_at', { ascending: false })
                    .limit(5);
                setRecentSignups(signups || []);

                // Recent Requests
                const { data: requests } = await supabase
                    .from('subscription_requests')
                    .select(`*, restaurant:restaurant_id(name)`)
                    .order('created_at', { ascending: false })
                    .limit(5);
                setRecentRequests(requests || []);

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [supabase]);

    if (loading) {
        return (
            <div className="space-y-12 max-w-7xl mx-auto">
                {/* Stats Skeletons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-dark-2 border border-[rgba(244,98,42,0.1)] rounded-2xl animate-pulse" />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="h-96 bg-dark-2 border border-[rgba(244,98,42,0.1)] rounded-[20px] animate-pulse" />
                    <div className="h-96 bg-dark-2 border border-[rgba(244,98,42,0.1)] rounded-[20px] animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-7xl mx-auto pb-20">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Restaurants" 
                    value={stats.totalUsers} 
                    icon={Store} 
                    color="text-blue-400"
                    bg="bg-blue-400/10"
                />
                <StatCard 
                    title="Pro Users" 
                    value={stats.proUsers} 
                    icon={Crown} 
                    color="text-gold"
                    bg="bg-gold/10"
                />
                <StatCard 
                    title="Free Users" 
                    value={stats.freeUsers} 
                    icon={Smartphone} 
                    color="text-text-muted"
                    bg="bg-white/5"
                />
                <StatCard 
                    title="Pending Approvals" 
                    value={stats.pendingCount} 
                    icon={Clock} 
                    color="text-red-400"
                    bg="bg-red-400/10"
                    pulse={stats.pendingCount > 0}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Signups */}
                <div className="bg-dark-2 border border-border-custom rounded-[20px] overflow-hidden flex flex-col shadow-2xl shadow-black/20">
                    <div className="px-7 py-6 flex items-center justify-between border-b border-white/5 bg-white/2">
                        <h3 className="text-lg font-bold text-text-main font-fraunces flex items-center gap-2">
                            <span className="text-saffron-light/60">✦</span> Recent Signups
                        </h3>
                        <Link href="/admin-digi-2025/users" className="text-xs font-black text-saffron uppercase tracking-widest hover:text-saffron-light transition-colors">
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y divide-white/5">
                        {recentSignups.map((shop, i) => (
                            <div key={i} className="px-7 py-5 flex items-center justify-between hover:bg-white/2 transition-all">
                                <div>
                                    <p className="text-sm font-bold text-text-main tracking-tight">{shop.name}</p>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-40 mt-0.5">
                                        Joined {formatDistanceToNow(new Date(shop.created_at))} ago
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest leading-none ${shop.is_premium ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-white/5 text-text-muted border border-white/10'}`}>
                                    {shop.is_premium ? '✦ Pro' : 'Free'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Requests */}
                <div className="bg-dark-2 border border-border-custom rounded-[20px] overflow-hidden flex flex-col shadow-2xl shadow-black/20">
                    <div className="px-7 py-6 flex items-center justify-between border-b border-white/5 bg-white/2">
                        <h3 className="text-lg font-bold text-text-main font-fraunces flex items-center gap-2">
                            <span className="text-saffron-light/60">⏳</span> Recent Requests
                        </h3>
                        <Link href="/admin-digi-2025/subscriptions" className="text-xs font-black text-saffron uppercase tracking-widest hover:text-saffron-light transition-colors">
                            Manage →
                        </Link>
                    </div>
                    <div className="divide-y divide-white/5">
                        {recentRequests.map((req, i) => (
                            <div key={i} className="px-7 py-5 flex items-center justify-between hover:bg-white/2 transition-all">
                                <div>
                                    <p className="text-sm font-bold text-text-main tracking-tight">{req.restaurant?.name || 'Restaurant'}</p>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-40 mt-0.5">
                                        {req.plan} • {formatDistanceToNow(new Date(req.created_at))} ago
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest leading-none ${
                                    req.status === 'pending' ? 'bg-saffron/10 text-saffron border border-saffron/20' : 
                                    req.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                    'bg-red-400/10 text-red-400 border border-red-400/20'
                                }`}>
                                    {req.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg, pulse = false }: any) {
    return (
        <div className="bg-dark-2 border border-border-custom rounded-2xl p-7 transition-all duration-500 hover:border-saffron/30 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-5">
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-lg`}>
                    <Icon className={`w-5 h-5 ${color} ${pulse ? 'animate-pulse' : ''}`} />
                </div>
                {pulse && <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />}
            </div>
            <div>
                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] opacity-40 mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${color} font-fraunces tracking-tighter`}>{value}</span>
                </div>
            </div>
        </div>
    );
}
