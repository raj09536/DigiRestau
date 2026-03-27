'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  BarChart3, 
  ShoppingBag, 
  Grid3X3, 
  LogOut, 
  Plus, 
  Wallet, 
  Smartphone, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Camera, 
  X,
  User,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { createSound } from '@/lib/sounds';
import { getTimeAgo } from '@/lib/utils';
import { Order, Table } from '@/lib/types';
import './manager.css';

export default function ManagerDashboard() {
    const [staffData, setStaffData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'revenue' | 'orders' | 'tables'>('revenue');
    const [loading, setLoading] = useState(true);
    const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Data States
    const [todayRevenue, setTodayRevenue] = useState({ total: 0, cash: 0, upi: 0 });
    const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [tables, setTables] = useState<Table[]>([]);

    // Form States
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState<'cash' | 'upi'>('cash');
    const [note, setNote] = useState('');
    const [uploading, setUploading] = useState(false);
    const [screenshotUrl, setScreenshotUrl] = useState('');

    // Auth Check
    useEffect(() => {
        const session = localStorage.getItem('staff_session');
        if (!session) {
            router.push('/staff-login');
            return;
        }
        const parsed = JSON.parse(session);
        if (parsed.role !== 'manager') {
            router.push('/staff-login');
            return;
        }
        setStaffData(parsed);
    }, [router]);

    const fetchRevenue = useCallback(async () => {
        if (!staffData?.restaurant_id) return;
        
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Fetch Today's Summary
        const { data: todayData } = await supabase
            .from('manager_revenue')
            .select('*')
            .eq('restaurant_id', staffData.restaurant_id)
            .eq('date', todayStr);

        const summary = (todayData || []).reduce((acc, curr) => {
            acc.total += Number(curr.amount);
            if (curr.payment_type === 'cash') acc.cash += Number(curr.amount);
            if (curr.payment_type === 'upi') acc.upi += Number(curr.amount);
            return acc;
        }, { total: 0, cash: 0, upi: 0 });
        
        setTodayRevenue(summary);

        // Fetch Last 7 Days
        const { data: historyData } = await supabase
            .from('manager_revenue')
            .select('*')
            .eq('restaurant_id', staffData.restaurant_id)
            .order('created_at', { ascending: false })
            .limit(50);
        
        setRevenueHistory(historyData || []);
    }, [staffData, supabase]);

    const fetchOrdersAndTables = useCallback(async () => {
        if (!staffData?.restaurant_id) return;

        // Fetch All Orders
        const { data: ordersData } = await supabase
            .from('orders')
            .select('*, order_items(*), tables(*)')
            .eq('restaurant_id', staffData.restaurant_id)
            .order('created_at', { ascending: false });
        
        setOrders(ordersData || []);

        // Fetch All Tables
        const { data: tablesData } = await supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', staffData.restaurant_id)
            .order('table_number');
        
        setTables(tablesData || []);
        setLoading(false);
    }, [staffData, supabase]);

    useEffect(() => {
        if (staffData?.restaurant_id) {
            fetchRevenue();
            fetchOrdersAndTables();

            // Realtime for orders
            const channel = supabase
                .channel('manager-updates')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${staffData.restaurant_id}`
                }, (payload) => {
                    if (payload.eventType === 'INSERT') {
                        createSound('ding');
                        toast.info('New Order Received! 🛎️');
                    }
                    fetchOrdersAndTables();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [staffData, supabase, fetchRevenue, fetchOrdersAndTables]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !staffData) return;

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${staffData.restaurant_id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('revenue-screenshots')
            .upload(filePath, file);

        if (uploadError) {
            toast.error('Galti hui upload karne mein.');
            console.error(uploadError);
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('revenue-screenshots')
                .getPublicUrl(filePath);
            setScreenshotUrl(publicUrl);
            toast.success('Screenshot uploaded! ✅');
        }
        setUploading(false);
    };

    const handleAddRevenue = async () => {
        if (!amount || Number(amount) <= 0) return toast.error('Amount sahi daalo.');
        if (paymentType === 'upi' && !screenshotUrl) return toast.error('UPI ke liye screenshot upload karein.');

        const { error } = await supabase
            .from('manager_revenue')
            .insert({
                restaurant_id: staffData.restaurant_id,
                added_by: staffData.id,
                date: new Date().toISOString().split('T')[0],
                amount: Number(amount),
                payment_type: paymentType,
                screenshot_url: screenshotUrl || null,
                note: note
            });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Revenue record save ho gaya! 💰');
            setIsRevenueModalOpen(false);
            setAmount('');
            setNote('');
            setScreenshotUrl('');
            setPaymentType('cash');
            fetchRevenue();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('staff_session');
        router.push('/staff-login');
    };

    if (!staffData || loading) {
        return (
            <div className="manager-container flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-saffron/20 border-t-saffron rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="manager-container selection:bg-saffron selection:text-white">
            <header className="manager-header animate-fade-in shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-saffron/10 rounded-xl">
                        <User className="w-5 h-5 text-saffron" />
                    </div>
                    <span className="font-bold text-sm hidden sm:inline">Manager — 👔 {staffData.name}</span>
                </div>
                <div className="restaurant-name">
                    {staffData.restaurant_name}
                </div>
                <button className="logout-btn flex items-center gap-2" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
                </button>
            </header>

            <main className="manager-section">
                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="manager-tabs">
                        <button 
                            className={`manager-tab-btn flex items-center gap-2 ${activeTab === 'revenue' ? 'active' : ''}`}
                            onClick={() => setActiveTab('revenue')}
                        >
                            <BarChart3 className="w-4 h-4" /> Revenue
                        </button>
                        <button 
                            className={`manager-tab-btn flex items-center gap-2 ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <ShoppingBag className="w-4 h-4" /> Orders
                        </button>
                        <button 
                            className={`manager-tab-btn flex items-center gap-2 ${activeTab === 'tables' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tables')}
                        >
                            <Grid3X3 className="w-4 h-4" /> Tables
                        </button>
                    </div>
                </div>

                {/* TAB 1: REVENUE */}
                {activeTab === 'revenue' && (
                    <div className="animate-fade-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-fraunces">Revenue Report</h2>
                            <button className="bg-saffron text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-saffron/20" onClick={() => setIsRevenueModalOpen(true)}>
                                <Plus className="w-5 h-5" /> Add Revenue
                            </button>
                        </div>

                        <div className="revenue-summary-grid">
                            <div className="revenue-card relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-saffron/5 rounded-full group-hover:scale-110 transition-transform" />
                                <span className="card-label">💰 Today Total</span>
                                <span className="card-value">₹{todayRevenue.total}</span>
                            </div>
                            <div className="revenue-card relative overflow-hidden group">
                                <span className="card-label cash-text">💵 Cash Collection</span>
                                <span className="card-value">₹{todayRevenue.cash}</span>
                            </div>
                            <div className="revenue-card relative overflow-hidden group">
                                <span className="card-label upi-text">📱 UPI Collection</span>
                                <span className="card-value">₹{todayRevenue.upi}</span>
                            </div>
                        </div>

                        <div className="revenue-history-table-container">
                            <div className="p-6 border-b border-white/5 bg-white/2">
                                <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">Recent Transactions</h3>
                            </div>
                            <table className="revenue-history-table">
                                <thead>
                                    <tr>
                                        <th>Date/Time</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revenueHistory.map((item) => (
                                        <tr key={item.id}>
                                            <td className="text-text-muted">
                                                {new Date(item.created_at).toLocaleDateString()} <br />
                                                <span className="text-[10px] opacity-40">{new Date(item.created_at).toLocaleTimeString()}</span>
                                            </td>
                                            <td>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${item.payment_type === 'cash' ? 'bg-green-500/10 text-green-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                                    {item.payment_type}
                                                </span>
                                            </td>
                                            <td className="font-fraunces font-bold text-lg">₹{item.amount}</td>
                                            <td className="text-text-muted italic text-xs">{item.note || '-'}</td>
                                        </tr>
                                    ))}
                                    {revenueHistory.length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-10 text-text-muted">No revenue records found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: ORDERS */}
                {activeTab === 'orders' && (
                    <div className="animate-fade-up grid grid-cols-1 md:grid-cols-2 gap-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-dark-2 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-fraunces text-lg">🪑 {order.tables?.table_name || `Table ${order.tables?.table_number}`}</h4>
                                        <p className="text-xs text-text-muted">{getTimeAgo(order.created_at)}</p>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                        order.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                        'bg-saffron/10 text-saffron border-saffron/20'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="space-y-2 mb-4 bg-black/20 p-4 rounded-xl">
                                    {order.order_items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span>{item.item_name} × {item.quantity}</span>
                                            <span className="text-text-muted">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-text-muted italic flex items-center gap-1.5 align-center"><User className="w-3 h-3"/> {order.customer_name || 'Guest'}</span>
                                    <span className="font-fraunces text-xl text-saffron">₹{order.total}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB 3: TABLES */}
                {activeTab === 'tables' && (
                    <div className="animate-fade-up grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {tables.map(table => {
                            const isOccupied = orders.some(o => o.table_id === table.id && !['completed', 'cancelled'].includes(o.status));
                            return (
                                <div key={table.id} className={`p-6 rounded-2xl text-center border transition-all ${isOccupied ? 'bg-saffron/5 border-saffron/20' : 'bg-white/2 border-white/5 opacity-50'}`}>
                                    <span className="text-3xl block mb-2">🪑</span>
                                    <span className="font-fraunces block text-lg">{table.table_name || `Table ${table.table_number}`}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isOccupied ? 'text-saffron' : 'text-green-500'}`}>
                                        {isOccupied ? 'Occupied' : 'Free'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Revenue Modal */}
            {isRevenueModalOpen && (
                <div className="revenue-modal-overlay">
                    <div className="revenue-modal animate-pop-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="m-0">Add Revenue</h2>
                            <button className="text-text-muted hover:text-white" onClick={() => setIsRevenueModalOpen(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Amount</label>
                            <input 
                                type="number" 
                                className="modal-input" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="₹ Amount daalo"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Payment Type</label>
                            <div className="payment-type-selector">
                                <button 
                                    className={`payment-type-btn flex items-center justify-center gap-2 ${paymentType === 'cash' ? 'active' : ''}`}
                                    onClick={() => setPaymentType('cash')}
                                >
                                    <Wallet className="w-4 h-4" /> Cash
                                </button>
                                <button 
                                    className={`payment-type-btn flex items-center justify-center gap-2 ${paymentType === 'upi' ? 'active' : ''}`}
                                    onClick={() => setPaymentType('upi')}
                                >
                                    <Smartphone className="w-4 h-4" /> UPI
                                </button>
                            </div>
                        </div>

                        {paymentType === 'upi' && (
                            <div className="input-group">
                                <label className="input-label">UPI Screenshot</label>
                                {screenshotUrl ? (
                                    <div className="relative rounded-xl overflow-hidden mb-2">
                                        <img src={screenshotUrl} alt="UPI Screenshot" className="w-full h-32 object-cover" />
                                        <button className="absolute top-2 right-2 p-1 bg-red-500 rounded-lg" onClick={() => setScreenshotUrl('')}><X className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <label className="screenshot-upload block">
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                        <Camera className="w-8 h-8 text-text-muted/40 mx-auto mb-2" />
                                        <span className="text-xs text-text-muted font-bold uppercase tracking-widest">{uploading ? 'Uploading...' : 'Click to Upload'}</span>
                                    </label>
                                )}
                            </div>
                        )}

                        <div className="input-group">
                            <label className="input-label">Note (Optional)</label>
                            <input 
                                type="text" 
                                className="modal-input" 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Note daalo..."
                            />
                        </div>

                        <button className="modal-save-btn" onClick={handleAddRevenue} disabled={loading || uploading}>
                            Save Revenue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
