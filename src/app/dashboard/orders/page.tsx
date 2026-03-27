'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';
import type { Order } from '@/lib/types';
import {
    Clock,
    CheckCircle2,
    ChefHat,
    PartyPopper,
    Volume2,
    VolumeX,
    Filter,
    Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { createSound } from '@/lib/sounds';
import { getTimeAgo } from '@/lib/utils';

const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-500/20', badge: 'bg-orange-500 text-white' },
    accepted: { label: 'Accepted', icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/20', badge: 'bg-blue-500 text-white' },
    preparing: { label: 'Preparing', icon: ChefHat, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/20', badge: 'bg-yellow-500 text-white' },
    ready: { label: 'Ready', icon: PartyPopper, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-500/20', badge: 'bg-green-500 text-white' },
};

type OrderStatus = keyof typeof statusConfig;
const statusFlow: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready'];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const supabase = createClient();
    const { restaurant } = useRestaurant();

    useEffect(() => {
        // Request browser notification permission
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        // Interaction toast for sound
        const hasInteracted = sessionStorage.getItem('digirestau_interacted');
        if (!hasInteracted) {
            toast('🔊 Sound is enabled!', {
                description: 'Click anywhere on the dashboard to ensure order sounds play correctly.',
                duration: 5000,
            });
            
            const handleInteraction = () => {
                sessionStorage.setItem('digirestau_interacted', 'true');
                window.removeEventListener('click', handleInteraction);
            };
            window.addEventListener('click', handleInteraction);
        }
    }, []);

    const playNotificationSound = () => {
        if (!soundEnabled) return;
        try {
            const savedSound = localStorage.getItem('digirestau_sound') || 'ding';
            createSound(savedSound);
        } catch (e) {
            console.error('Sound error:', e);
        }
    };

    const showOrderNotification = (order: any) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const tableStr = order.tables?.table_name || `Table ${order.tables?.table_number || 'Unknown'}`;
            new Notification('🛎️ New Order!', {
                body: `${tableStr} — ${order.customer_name || 'Anonymous Guest'}`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                requireInteraction: true,
            });
        }
        playNotificationSound();
    };

    const fetchOrders = useCallback(async () => {
        if (!restaurant) return;
        const { data } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    id,
                    item_name,
                    quantity,
                    price
                ),
                tables (
                    table_number,
                    table_name
                )
            `)
            .eq('restaurant_id', restaurant.id)
            .neq('status', 'completed')
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false });

        if (data) setOrders(data);
        setLoading(false);
    }, [restaurant, supabase]);


    useEffect(() => {
        if (!restaurant) return;

        fetchOrders();

        const channel = supabase
            .channel(`orders-realtime-${restaurant.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'orders',
                filter: `restaurant_id=eq.${restaurant.id}`,
            }, async (payload) => {
                // Fetch full order with items and table info
                const { data: newOrder } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        order_items (
                            id,
                            item_name,
                            quantity,
                            price
                        ),
                        tables (
                            table_number,
                            table_name
                        )
                    `)
                    .eq('id', payload.new.id)
                    .single();

                if (newOrder) {
                    setOrders(prev => [newOrder, ...prev]);
                    showOrderNotification(newOrder);
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `restaurant_id=eq.${restaurant.id}`,
            }, (payload) => {
                const updated = payload.new as Order;
                if (updated.status === 'completed' || updated.status === 'cancelled') {
                    setOrders(prev => prev.filter(o => o.id !== updated.id));
                } else {
                    setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [restaurant, soundEnabled, fetchOrders, supabase]);

    const deductInventory = async (order: Order) => {
        if (!order.order_items) return;
        
        for (const orderItem of order.order_items) {
            // Get linked ingredients
            const { data: links } = await supabase
                .from('inventory_menu_links')
                .select('*, inventory_items(*)')
                .eq('menu_item_id', orderItem.menu_item_id || '')
                .eq('is_auto_deduct', true);

            for (const link of links || []) {
                const totalDeduct = link.quantity_used * orderItem.quantity;
                const newStock = link.inventory_items.current_stock - totalDeduct;
                const isLow = newStock <= link.inventory_items.min_stock_level;

                // Update stock
                await supabase
                    .from('inventory_items')
                    .update({
                        current_stock: Math.max(0, newStock),
                        is_low_stock: isLow
                    })
                    .eq('id', link.inventory_item_id);

                // Record transaction
                await supabase
                    .from('stock_transactions')
                    .insert({
                        restaurant_id: order.restaurant_id,
                        inventory_item_id: link.inventory_item_id,
                        order_id: order.id,
                        type: 'deduct',
                        quantity: totalDeduct,
                        note: `Order #${order.id.slice(0,8)} complete`
                    });
            }
        }
    };

    const refundInventory = async (order: Order) => {
        if (!order.order_items) return;

        for (const orderItem of order.order_items) {
            const { data: links } = await supabase
                .from('inventory_menu_links')
                .select('*, inventory_items(*)')
                .eq('menu_item_id', orderItem.menu_item_id || '')
                .eq('is_auto_deduct', true);

            for (const link of links || []) {
                const refundQty = link.quantity_used * orderItem.quantity;
                const newStock = link.inventory_items.current_stock + refundQty;
                const isLow = newStock <= link.inventory_items.min_stock_level;

                await supabase
                    .from('inventory_items')
                    .update({
                        current_stock: newStock,
                        is_low_stock: isLow
                    })
                    .eq('id', link.inventory_item_id);

                await supabase
                    .from('stock_transactions')
                    .insert({
                        restaurant_id: order.restaurant_id,
                        inventory_item_id: link.inventory_item_id,
                        order_id: order.id,
                        type: 'cancel_refund',
                        quantity: refundQty,
                        note: `Order #${order.id.slice(0,8)} cancelled`
                    });
            }
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        const order = orders.find(o => o.id === orderId);
        
        await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);

        if (newStatus === 'completed' && order) {
            await deductInventory(order);
            toast.success('Order completed & Stock deducted');
        } else if (newStatus === 'cancelled' && order) {
            await refundInventory(order);
            toast.warning('Order cancelled & Stock refunded');
        }
    };

    const getNextStatus = (current: OrderStatus): { label: string, status: OrderStatus | 'completed', color: string } => {
        switch (current) {
            case 'pending': return { label: 'Accept', status: 'accepted', color: 'bg-green-500' };
            case 'accepted': return { label: 'Preparing', status: 'preparing', color: 'bg-yellow-500' };
            case 'preparing': return { label: 'Ready', status: 'ready', color: 'bg-blue-500' };
            case 'ready': return { label: 'Complete', status: 'completed', color: 'bg-green-500' };
            default: return { label: 'Done', status: 'completed', color: 'bg-green-500' };
        }
    };


    const filteredOrders = orders.filter(o => {
        const matchesTab = activeTab === 'all' || o.status === activeTab;
        const matchesSearch = 
            (o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
            (o.table_id?.toString().includes(searchQuery) ?? false);
        return matchesTab && matchesSearch;
    });

    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-text-main font-fraunces">Live Orders</h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Listening...</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-saffron transition-colors" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-dark-2 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-text-main focus:border-saffron/50 transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-2.5 rounded-xl border transition-all ${soundEnabled ? 'bg-saffron/10 border-saffron/20 text-saffron' : 'bg-white/5 border-white/5 text-text-muted'}`}
                        >
                            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>
                        
                        {/* Status Tabs */}
                        <div className="flex bg-dark-2 p-1 rounded-xl border border-white/10">
                            {['all', ...statusFlow].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                        activeTab === tab 
                                        ? 'bg-saffron text-white shadow-lg shadow-saffron/20' 
                                        : 'text-text-muted hover:text-text-main'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 w-full skeleton rounded-2xl" />
                    ))}
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-dark-2 rounded-[32px] p-24 text-center border border-white/5">
                    <div className="text-6xl mb-6">📦</div>
                    <h3 className="text-2xl font-bold text-text-main mb-2 font-fraunces">No live orders yet</h3>
                    <p className="text-text-muted max-w-sm mx-auto">Orders will appear here as soon as customers scan your table QR codes.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="order-card group">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">🪑</span>
                                        <span className="text-lg font-bold text-text-main font-fraunces">
                                            {order.tables?.table_name || `Table ${order.tables?.table_number || 'Unknown'}`}
                                        </span>
                                    </div>
                                    <p className="text-text-muted text-xs font-medium flex items-center gap-2">
                                        {order.customer_name || 'Anonymous Guest'}
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        {getTimeAgo(order.created_at)}
                                    </p>
                                    
                                    {order.status === 'pending' && restaurant && (
                                        <div className="mt-2">
                                            {restaurant.cancel_time_limit === 0 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 className="w-3 h-3" /> No Cancel Allowed
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                                                    Math.floor((new Date().getTime() - new Date(order.created_at + 'Z').getTime()) / (1000 * 60)) < (restaurant.cancel_time_limit || 2)
                                                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                    : 'bg-white/5 text-text-muted border-white/10'
                                                }`}>
                                                    <Clock className="w-3 h-3" />
                                                    {Math.floor((new Date().getTime() - new Date(order.created_at + 'Z').getTime()) / (1000 * 60)) < (restaurant.cancel_time_limit || 2)
                                                        ? 'Cancel Window Open'
                                                        : 'Cancel Window Closed'}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusConfig[order.status as OrderStatus]?.bg} ${statusConfig[order.status as OrderStatus]?.color} ${statusConfig[order.status as OrderStatus]?.border}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="space-y-3 mb-6 bg-black/20 rounded-xl p-4">
                                {Array.isArray(order.order_items) && order.order_items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 flex items-center justify-center rounded bg-white/5 text-[10px] font-bold text-saffron">
                                                {item.quantity}
                                            </span>
                                            <span className="text-text-main font-medium">{item.item_name}</span>
                                        </div>
                                        <span className="text-text-muted text-xs">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="text-xl font-bold text-text-main font-fraunces">
                                    <span className="text-text-muted text-xs font-sans font-normal mr-2">Total</span>
                                    ₹{order.total || 0}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {order.status === 'pending' && (
                                        <button 
                                            onClick={() => updateStatus(order.id, 'cancelled')}
                                            className="order-action-btn border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            ✗ Cancel
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={() => updateStatus(order.id, getNextStatus(order.status as OrderStatus).status)}
                                        className={`order-action-btn flex items-center gap-2 text-white shadow-lg transition-transform active:scale-95 ${getNextStatus(order.status as OrderStatus).color}`}
                                    >
                                        <span>{getNextStatus(order.status as OrderStatus).label}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
