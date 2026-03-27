'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { ShoppingBag, LogOut, Table as TableIcon, User, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { createSound } from '@/lib/sounds';
import { Order, Table } from '@/lib/types';
import './waiter.css';

export default function WaiterDashboard() {
    const [staffData, setStaffData] = useState<any>(null);
    const [myTables, setMyTables] = useState<Table[]>([]);
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
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
        if (parsed.role !== 'waiter' && parsed.role !== 'manager') {
            router.push('/staff-login');
            return;
        }
        setStaffData(parsed);
    }, [router]);

    const fetchData = useCallback(async () => {
        if (!staffData?.restaurant_id) return;

        // 1. Fetch Assignments vs All Tables
        const { data: assignments } = await supabase
            .from('waiter_table_assignments')
            .select('*, tables(*)')
            .eq('staff_id', staffData.id);

        if (assignments && assignments.length > 0) {
            setMyTables(assignments.map(a => a.tables));
        } else {
            const { data: allTables } = await supabase
                .from('tables')
                .select('*')
                .eq('restaurant_id', staffData.restaurant_id)
                .order('table_number');
            setMyTables(allTables || []);
        }

        // 2. Fetch Active Orders for real-time status
        const { data: orders } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('restaurant_id', staffData.restaurant_id)
            .in('status', ['pending', 'accepted', 'preparing', 'ready']);

        setActiveOrders(orders || []);
        setLoading(false);
    }, [staffData, supabase]);

    useEffect(() => {
        if (staffData?.restaurant_id) {
            fetchData();

            // Realtime subscription
            const channel = supabase
                .channel('waiter-updates')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${staffData.restaurant_id}`
                }, (payload) => {
                    if (payload.eventType === 'INSERT') {
                        createSound('ding');
                        toast.info('New Order Received! 🛎️');
                    } else if (payload.eventType === 'UPDATE' && (payload.new as any).status === 'ready') {
                        createSound('bell');
                        toast.success('An order is Ready to be served! 🍽️');
                    }
                    fetchData();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [staffData, supabase, fetchData]);

    const hasActiveOrder = (tableId: string) => {
        return activeOrders.some(o => o.table_id === tableId);
    };

    const getActiveOrder = (tableId: string) => {
        return activeOrders.find(o => o.table_id === tableId);
    };

    const getTableOrders = (tableId: string) => {
        return activeOrders.filter(o => o.table_id === tableId);
    };

    const handleLogout = () => {
        localStorage.removeItem('staff_session');
        router.push('/staff-login');
    };

    if (!staffData || loading) {
        return (
            <div className="waiter-container flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-saffron/20 border-t-saffron rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="waiter-container selection:bg-saffron selection:text-white">
            <header className="waiter-header animate-fade-in">
                <div className="waiter-info">
                    <div className="p-2.5 bg-saffron/10 rounded-xl">
                        <ShoppingBag className="w-5 h-5 text-saffron" />
                    </div>
                    <span className="hidden sm:inline">Waiter —</span> {staffData.name}
                </div>
                <div className="restaurant-name">
                    {staffData.restaurant_name}
                </div>
                <button className="logout-btn flex items-center gap-2" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
                </button>
            </header>

            <main className="waiter-section">
                <div className="animate-fade-up">
                    <h2 className="waiter-title font-fraunces">Meri Tables</h2>
                    
                    <div className="waiter-tables-grid">
                        {myTables.map((table) => (
                            <div
                                key={table.id}
                                className={`waiter-table ${hasActiveOrder(table.id) ? 'active' : 'free'} ${selectedTable?.id === table.id ? 'selected' : ''}`}
                                onClick={() => setSelectedTable(selectedTable?.id === table.id ? null : table)}
                            >
                                <span className="table-icon">🪑</span>
                                <span className="table-name">{table.table_name || `Table ${table.table_number}`}</span>
                                <span className={`table-status ${hasActiveOrder(table.id) ? 'busy' : 'free'}`}>
                                    {hasActiveOrder(table.id) ? '🔴 Active Order' : '🟢 Free'}
                                </span>
                                {hasActiveOrder(table.id) && (
                                    <span className="order-items-count">
                                        {getActiveOrder(table.id)?.order_items?.length} items
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {selectedTable && (
                        <div className="table-orders animate-slide-up">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="m-0">{selectedTable.table_name || `Table ${selectedTable.table_number}`} — Orders</h3>
                                <button className="p-2 hover:bg-white/5 rounded-full" onClick={() => setSelectedTable(null)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {getTableOrders(selectedTable.id).length > 0 ? (
                                getTableOrders(selectedTable.id).map((order) => (
                                    <div key={order.id} className="waiter-order-card">
                                        <div className="order-customer flex items-center gap-2">
                                            <User className="w-4 h-4 text-saffron" /> {order.customer_name || 'Anonymous Guest'}
                                        </div>
                                        <div className="order-items-list">
                                            {order.order_items?.map((item, idx) => (
                                                <div key={idx} className="order-item-row">
                                                    <span>{item.item_name} × {item.quantity}</span>
                                                    <span>₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="order-footer">
                                            <span className="order-total">
                                                Total: ₹{order.total || 0}
                                            </span>
                                            <span className={`order-status ${order.status}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-text-muted text-center py-10">No active orders for this table.</p>
                            )}
                        </div>
                    )}

                    {myTables.length === 0 && !loading && (
                        <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                            <TableIcon className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
                            <p className="text-text-muted">Koi table assigned nahi mili.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
