'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { 
    LayoutDashboard, 
    Users, 
    CreditCard, 
    BarChart3, 
    Settings, 
    LogOut, 
    Menu as MenuIcon, 
    X,
    TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [adminUser, setAdminUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/admin-digi-2025');
                return;
            }
            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('is_admin')
                .eq('owner_id', user.id)
                .single();

            if (!restaurant?.is_admin) {
                router.push('/admin-digi-2025');
                return;
            }
            setAdminUser(user);
            setLoading(false);
        };
        checkAdmin();
    }, [router, supabase]);

    useEffect(() => {
        const fetchPendingCount = async () => {
            const { count } = await supabase
                .from('subscription_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            setPendingCount(count || 0);
        };
        fetchPendingCount();

        // Realtime subscription requests
        const channel = supabase
            .channel('admin-requests-badge')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'subscription_requests'
            }, () => {
                fetchPendingCount();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const navItems = [
        { href: '/admin-digi-2025/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin-digi-2025/users', label: 'Users', icon: Users },
        { href: '/admin-digi-2025/subscriptions', label: 'Subscriptions', icon: CreditCard, hasBadge: true },
        { href: '/admin-digi-2025/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/admin-digi-2025/settings', label: 'Settings', icon: Settings },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin-digi-2025');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-saffron/20 border-t-saffron rounded-full animate-spin" />
                    <span className="text-text-muted text-sm animate-pulse tracking-widest font-bold uppercase">Validating...</span>
                </div>
            </div>
        );
    }

    const currentTitle = navItems.find(i => pathname.startsWith(i.href))?.label || 'Admin';

    return (
        <div className="min-h-screen flex bg-dark font-outfit selection:bg-saffron/20">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-60 w-[240px] bg-dark-2 border-r border-border-custom flex flex-col transition-transform duration-500 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-7 py-10 flex flex-col gap-1">
                    <div className="flex items-center gap-3 group">
                        <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🍽️</span>
                        <span className="text-xl font-bold text-text-main font-fraunces tracking-tight">
                            digi<span className="text-saffron">Restau</span>
                        </span>
                    </div>
                    <p className="text-saffron text-[10px] font-black uppercase tracking-[0.25em] px-1 opacity-50">Admin Panel</p>
                </div>

                <div className="h-px bg-[rgba(244,98,42,0.1)] mx-6 mb-8 opacity-30"></div>

                <nav className="flex-1 px-4 space-y-1.5">
                    {navItems.map(item => {
                        const active = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-2xl transition-all relative group ${
                                    active 
                                    ? 'bg-saffron text-white shadow-lg shadow-saffron/20' 
                                    : 'text-text-muted hover:text-text-main hover:bg-white/5'
                                }`}
                            >
                                <item.icon className={`w-5 h-5 transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`} />
                                <span>{item.label}</span>
                                {item.hasBadge && pendingCount > 0 && (
                                    <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 mt-auto border-t border-white/5 space-y-4">
                    <div className="px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-0.5 group">
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-50">Admin Account</p>
                        <p className="text-[13px] text-text-main font-bold truncate opacity-80">{adminUser?.email}</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-sm font-bold text-text-muted hover:text-red-400 transition-all rounded-2xl hover:bg-red-500/5 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-50 h-16 bg-[rgba(18,13,10,0.85)] backdrop-blur-[20px] border-b border-border-custom flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-text-muted hover:text-text-main bg-white/5 rounded-xl border border-white/10"
                        >
                            <MenuIcon className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-text-main font-fraunces leading-none">{currentTitle}</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-saffron/10 border border-saffron/20 rounded-full text-saffron text-[11px] font-black uppercase tracking-widest leading-none shadow-xl shadow-saffron/5">
                            <span className="animate-pulse">✦</span> Admin
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 animate-fade-in">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-55 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity duration-500"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
