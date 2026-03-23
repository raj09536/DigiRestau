'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
    Package, 
    Wallet, 
    TrendingUp, 
    Trophy,
    Store,
    ArrowUpRight,
    Search,
    ChevronRight,
    Store as ShopIcon
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAnalytics() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        estimatedRevenue: 0,
        conversionRate: 0,
        mostActive: '—'
    });
    const [topRestaurants, setTopRestaurants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                // Total Orders
                const { count: totalOrders } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true });

                // Pro Users for revenue
                const { data: proUsers } = await supabase
                    .from('restaurants')
                    .select('id, name')
                    .eq('is_premium', true)
                    .eq('is_admin', false);

                // Total Restaurants for conversion
                const { count: totalRestaurants } = await supabase
                    .from('restaurants')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_admin', false);

                // Top 5 Restaurants with order count
                const { data: topShops } = await supabase
                    .from('restaurants')
                    .select(`
                        id,
                        name,
                        is_premium,
                        orders(count)
                    `)
                    .eq('is_admin', false)
                    .order('created_at', { ascending: false })
                    .limit(20); // Get more to sort by order count

                const sortedTop = (topShops || [])
                    .map((s: any) => ({
                        ...s,
                        order_count: s.orders?.[0]?.count || 0
                    }))
                    .sort((a, b) => b.order_count - a.order_count)
                    .slice(0, 5);

                const totalPro = proUsers?.length || 0;
                const totalRest = totalRestaurants || 0;

                setStats({
                    totalOrders: totalOrders || 0,
                    estimatedRevenue: totalPro * 499,
                    conversionRate: totalRest ? (totalPro / totalRest) * 100 : 0,
                    mostActive: sortedTop[0]?.name || '—'
                });

                setTopRestaurants(sortedTop);

            } catch (err) {
                console.error('Error fetching analytics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [supabase]);

    if (loading) {
        return (
            <div className="space-y-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 bg-dark-2 border border-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
                <div className="h-[400px] bg-dark-2 border border-white/5 rounded-[32px] animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-7xl mx-auto pb-20">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Orders" 
                    value={stats.totalOrders.toLocaleString()} 
                    subtitle="Lifetime across platform"
                    icon={Package} 
                    color="text-blue-400"
                    bg="bg-blue-400/10"
                />
                <StatCard 
                    title="Revenue Estimate" 
                    value={`₹${stats.estimatedRevenue.toLocaleString()}`} 
                    subtitle="Based on active Pro users"
                    icon={Wallet} 
                    color="text-green-400"
                    bg="bg-green-400/10"
                />
                <StatCard 
                    title="Pro Conversion" 
                    value={`${stats.conversionRate.toFixed(1)}%`} 
                    subtitle="Free to Pro conversion rate"
                    icon={TrendingUp} 
                    color="text-saffron"
                    bg="bg-saffron/10"
                />
                <StatCard 
                    title="Most Active Shop" 
                    value={stats.mostActive} 
                    subtitle="Highest order count today"
                    icon={Trophy} 
                    color="text-gold"
                    bg="bg-gold/10"
                />
            </div>

            {/* Top Restaurants Table */}
            <div className="bg-dark-2 border border-border-custom rounded-[32px] overflow-hidden shadow-2xl shadow-black/40">
                <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-text-main font-fraunces">Top Performing Restaurants</h3>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-40 mt-1">Sorted by total order volume</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/2">
                                <th className="px-10 py-6 text-left text-[11px] font-black text-text-muted uppercase tracking-widest opacity-40">Restaurant</th>
                                <th className="px-10 py-6 text-left text-[11px] font-black text-text-muted uppercase tracking-widest opacity-40">Plan</th>
                                <th className="px-10 py-6 text-right text-[11px] font-black text-text-muted uppercase tracking-widest opacity-40">Total Orders</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {topRestaurants.map((shop, i) => (
                                <tr key={shop.id} className="group hover:bg-white/2 transition-all">
                                    <td className="px-10 py-7">
                                        <div className="flex items-center gap-5">
                                            <div className="w-6 h-6 rounded-full bg-saffron/10 flex items-center justify-center text-[10px] font-bold text-saffron opacity-50">
                                                {i + 1}
                                            </div>
                                            <p className="text-base font-bold text-text-main tracking-tight">{shop.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-7">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest leading-none ${shop.is_premium ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-white/5 text-text-muted border border-white/10'}`}>
                                            {shop.is_premium ? '✦ Pro' : 'Free'}
                                        </div>
                                    </td>
                                    <td className="px-10 py-7 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-lg font-bold text-text-main font-fraunces">{shop.order_count.toLocaleString()}</span>
                                            {shop.order_count > 0 && <span className="text-[10px] text-green-400 font-bold opacity-60">↑ Growing</span>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {topRestaurants.length === 0 && (
                    <div className="p-20 text-center">
                        <p className="text-text-muted text-sm opacity-40 font-bold uppercase tracking-widest">No order data available yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, icon: Icon, color, bg }: any) {
    return (
        <div className="bg-dark-2 border border-white/5 hover:border-saffron/20 rounded-[28px] p-8 transition-all duration-500 hover:shadow-2xl shadow-black/20 group hover:-translate-y-1">
            <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <ArrowUpRight className="w-5 h-5 text-text-muted opacity-10 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.25em] opacity-40 mb-2">{title}</p>
                <h4 className={`text-4xl font-bold ${color} font-fraunces tracking-tighter mb-2`}>{value}</h4>
                <p className="text-[11px] text-text-muted font-bold opacity-60 tracking-wider">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}
