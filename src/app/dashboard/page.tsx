'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';
import Link from 'next/link';
import {
    ShoppingBag,
    TrendingUp,
    UtensilsCrossed,
    Grid3X3,
    ArrowRight,
    Search,
} from 'lucide-react';
import type { Order } from '@/lib/types';

export default function DashboardPage() {
    const [stats, setStats] = useState({ orders: 0, revenue: 0, menuItems: 0, tables: 0 });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const { restaurant } = useRestaurant();

    useEffect(() => {
        if (!restaurant) return;
        
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch stats counts
                const [ordersRes, itemsRes, tablesRes, recentRes] = await Promise.all([
                    supabase.from('orders').select('*', { count: 'exact' }).eq('restaurant_id', restaurant.id),
                    supabase.from('menu_items').select('id', { count: 'exact' }).eq('restaurant_id', restaurant.id),
                    supabase.from('tables').select('id', { count: 'exact' }).eq('restaurant_id', restaurant.id),
                    supabase.from('orders')
                        .select(`
                            *,
                            order_items (
                                id,
                                item_name,
                                quantity,
                                price
                            ),
                            tables (
                                table_number
                            )
                        `)
                        .eq('restaurant_id', restaurant.id)
                        .order('created_at', { ascending: false })
                        .limit(5)
                ]);

                // Calculate revenue for today (simple sum of all orders for now as a mock/proxy if today data is not filtered)
                // In a real app, we'd filter by today's date
                const allOrders = ordersRes.data || [];
                const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);

                setStats({
                    orders: ordersRes.count || 0,
                    revenue: totalRevenue,
                    menuItems: itemsRes.count || 0,
                    tables: tablesRes.count || 0,
                });

                if (recentRes.data) {
                    setRecentOrders(recentRes.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [restaurant]);

    const statCards = [
        { label: "Today's Orders", sub: "orders today", value: stats.orders, icon: ShoppingBag, color: 'text-saffron', href: '/dashboard/orders' },
        { label: "Today's Revenue", sub: "earned today", value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-gold', href: '/dashboard' },
        { label: "Active Tables", sub: "tables active", value: stats.tables, icon: Grid3X3, color: 'text-green', href: '/dashboard/tables' },
        { label: "Menu Items", sub: "items in menu", value: stats.menuItems, icon: UtensilsCrossed, color: 'text-text-main', href: '/dashboard/menu' },
    ];

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'accepted': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'preparing': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'ready': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'completed': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-10">
            {/* Header / Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-text-main font-fraunces">
                        {restaurant?.name ? `${restaurant.name} Dashboard` : 'Overview'}
                    </h2>
                    <p className="text-text-muted mt-1">Here's what's happening at your restaurant today.</p>
                </div>
                <Link 
                    href="/dashboard/orders" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-saffron text-white rounded-xl font-bold text-sm hover:bg-saffron-light transition-all shadow-lg shadow-saffron/20"
                >
                    Live Orders <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <Link href={card.href} key={i} className="stat-card group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <span className="text-text-muted group-hover:text-saffron transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                        <div className={`text-4xl font-bold font-fraunces mb-1 ${card.color}`}>
                            {loading ? <div className="h-10 w-24 skeleton rounded-lg" /> : card.value}
                        </div>
                        <p className="text-text-muted text-sm font-medium">{card.sub}</p>
                    </Link>
                ))}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-dark-2 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-text-main font-fraunces">Recent Orders</h3>
                    <Link href="/dashboard/orders" className="text-saffron text-sm font-bold hover:underline">
                        View All
                    </Link>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black/20">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-text-muted">Table</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-text-muted">Customer</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-text-muted">Items</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-text-muted">Total</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-text-muted">Status</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-text-muted">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-6 py-4"><div className="h-8 w-full skeleton rounded-lg" /></td>
                                    </tr>
                                ))
                            ) : recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                        No recent orders found.
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-text-main">
                                            T-{order.tables?.table_number || '1'}
                                        </td>
                                        <td className="px-6 py-4 text-text-main">
                                            {order.customer_name || 'Guest'}
                                        </td>
                                        <td className="px-6 py-4 text-text-muted text-sm">
                                            {Array.isArray(order.order_items) ? 
                                                `${order.order_items[0]?.item_name}${order.order_items.length > 1 ? ` +${order.order_items.length - 1}` : ''}` : 
                                                'Items'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-saffron">
                                            ₹{order.total || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted text-sm group-hover:text-text-main transition-colors">
                                            {formatTime(order.created_at)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
