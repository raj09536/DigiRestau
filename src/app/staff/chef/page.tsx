'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { ChefHat, LogOut, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createSound } from '@/lib/sounds';
import { getTimeAgo } from '@/lib/utils';
import { Order } from '@/lib/types';
import './chef.css';

export default function ChefDashboard() {
    const [staffData, setStaffData] = useState<any>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    // Auth Check
    useEffect(() => {
        const session = localStorage.getItem('staff_session');
        if (!session) {
            router.push('/staff-login');
            return;
        }
        const parsed = JSON.parse(session);
        if (parsed.role !== 'chef' && parsed.role !== 'manager') { // Manager also can see? User said chef.
            router.push('/staff-login');
            return;
        }
        setStaffData(parsed);
    }, [router]);

    const fetchOrders = useCallback(async () => {
        if (!staffData?.restaurant_id) return;
        
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items(*),
                tables(table_name, table_number)
            `)
            .eq('restaurant_id', staffData.restaurant_id)
            .in('status', ['accepted', 'preparing'])
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Fetch error:', error);
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    }, [staffData, supabase]);

    useEffect(() => {
        if (staffData?.restaurant_id) {
            fetchOrders();

            // Realtime subscription
            const channel = supabase
                .channel('chef-orders')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${staffData.restaurant_id}`
                }, (payload) => {
                    if (payload.eventType === 'INSERT') {
                        createSound('chime');
                        toast.success('New Order Received! 🍳');
                    }
                    fetchOrders();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [staffData, supabase, fetchOrders]);

    const updateStatus = async (orderId: string, status: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) {
            toast.error('Galti hui update karne mein.');
        } else {
            if (status === 'preparing') {
                toast.success('Order status: Preparing 👨‍🍳');
                createSound('ding');
            } else if (status === 'ready') {
                toast.success('Order is Ready! ✅');
                createSound('bell');
            }
            fetchOrders();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('staff_session');
        router.push('/staff-login');
    };

    if (!staffData || loading) {
        return (
            <div className="chef-container flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-saffron/20 border-t-saffron rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="chef-container selection:bg-saffron selection:text-white">
            <header className="chef-header animate-fade-in">
                <div className="chef-info">
                    <div className="p-2.5 bg-saffron/10 rounded-xl">
                        <ChefHat className="w-5 h-5 text-saffron" />
                    </div>
                    <span className="hidden sm:inline">Chef —</span> {staffData.name}
                </div>
                <div className="restaurant-name">
                    {staffData.restaurant_name}
                </div>
                <button className="logout-btn flex items-center gap-2" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
                </button>
            </header>

            <main className="kitchen-section">
                <div className="kitchen-title-area animate-fade-up">
                    <h2 className="kitchen-title">Kitchen Orders</h2>
                    <p className="kitchen-subtitle">Active orders handle karein</p>
                </div>

                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className={`kitchen-card ${order.status} animate-fade-up`}>
                            {/* Header */}
                            <div className="kitchen-header">
                                <div className="flex items-center gap-3">
                                    <span className="table-name">
                                        🪑 {order.tables?.table_name || `Table ${order.tables?.table_number}`}
                                    </span>
                                    <span className="order-time flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" /> {getTimeAgo(order.created_at)}
                                    </span>
                                </div>
                                <span className={`status-badge ${order.status}`}>
                                    {order.status === 'accepted' ? '🆕 New Order' : '👨‍🍳 Preparing'}
                                </span>
                            </div>

                            {/* Items */}
                            <div className="kitchen-items">
                                {order.order_items?.map((item, idx) => (
                                    <div key={idx} className="kitchen-item">
                                        <span className="item-qty">×{item.quantity}</span>
                                        <span className="item-name">{item.item_name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="kitchen-action">
                                {order.status === 'accepted' && (
                                    <button
                                        className="start-btn flex items-center justify-center gap-2"
                                        onClick={() => updateStatus(order.id, 'preparing')}
                                    >
                                        <PlayCircle className="w-5 h-5" /> Start Preparing
                                    </button>
                                )}
                                {order.status === 'preparing' && (
                                    <button
                                        className="ready-btn flex items-center justify-center gap-2"
                                        onClick={() => updateStatus(order.id, 'ready')}
                                    >
                                        <CheckCircle2 className="w-5 h-5" /> Mark Ready
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && !loading && (
                        <div className="no-orders animate-fade-in">
                            <span className="no-orders-icon">🍳</span>
                            <p className="no-orders-text">Saare orders complete hain. Mauj karo!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
