'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';
import {
    LayoutDashboard,
    ShoppingBag,
    UtensilsCrossed,
    Grid3X3,
    Settings,
    LogOut,
    Menu as MenuIcon,
    X,
    Star,
    Crown,
} from 'lucide-react';

import UpgradeModal from '@/components/UpgradeModal';
import WaitingScreen from '@/components/WaitingScreen';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showNudgePopup, setShowNudgePopup] = useState(false);
    const [nudgeMessageIndex, setNudgeMessageIndex] = useState(0);
    const [itemCount, setItemCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const { restaurant, setRestaurant } = useRestaurant();
    const [pendingRequest, setPendingRequest] = useState<any>(null);

    useEffect(() => {
        const fetchRestaurantAndData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            const { data } = await supabase
                .from('restaurants')
                .select('*')
                .eq('owner_id', user.id)
                .single();
            if (data) {
                setRestaurant(data);
                
                // Fetch item count for nudges
                const { count } = await supabase
                    .from('menu_items')
                    .select('*', { count: 'exact', head: true })
                    .eq('restaurant_id', data.id);
                setItemCount(count || 0);
            }
            setLoading(false);
        };
        fetchRestaurantAndData();
    }, []);

    useEffect(() => {
        const checkPending = async () => {
            if (!restaurant) return;
            const { data } = await supabase
                .from('subscription_requests')
                .select('*')
                .eq('restaurant_id', restaurant.id)
                .eq('status', 'pending')
                .maybeSingle();
            setPendingRequest(data);
        };
        checkPending();
    }, [restaurant]);

    // 5-Minute Upgrade Popup for Free Users
    useEffect(() => {
        if (!restaurant || restaurant.is_premium) return;

        // Show first popup after 2 minutes
        const firstTimer = setTimeout(() => {
            setNudgeMessageIndex(Math.floor(Math.random() * 3));
            setShowNudgePopup(true);
        }, 2 * 60 * 1000);

        // Then every 5 minutes
        const interval = setInterval(() => {
            setNudgeMessageIndex(Math.floor(Math.random() * 3));
            setShowNudgePopup(true);
        }, 5 * 60 * 1000);

        return () => {
            clearTimeout(firstTimer);
            clearInterval(interval);
        };
    }, [restaurant]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const navItems = [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/orders', label: 'Live Orders', icon: ShoppingBag, badge: true },
        { href: '/dashboard/menu', label: 'Menu', icon: UtensilsCrossed },
        { href: '/dashboard/tables', label: 'Tables', icon: Grid3X3 },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    const getPageTitle = () => {
        const item = navItems.find(i => isActive(i.href));
        return item?.label || 'Dashboard';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-saffron/20 border-t-saffron rounded-full animate-spin" />
                    <span className="text-sm font-medium text-text-muted">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex dashboard-container font-outfit selection:bg-saffron/30">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-600 w-[240px] flex flex-col transition-transform duration-500 lg:translate-x-0 dashboard-sidebar border-r border-white/5 ${sidebarOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="px-7 py-10">
                        <Link href="/dashboard" className="flex items-center gap-3 mb-1 group">
                            <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🍽️</span>
                            <span className="text-xl font-bold text-text-main font-fraunces tracking-tight">
                                digi<span className="text-saffron">Restau</span>
                            </span>
                        </Link>
                        {restaurant && (
                            <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] px-1 truncate opacity-50">
                                {restaurant.name}
                            </p>
                        )}
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 mt-2 px-3 space-y-1">
                        {navItems.map(item => {
                            const active = isActive(item.href);
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
                                    {item.badge && !active && (
                                        <span className="ml-auto w-2 h-2 rounded-full bg-saffron animate-pulse" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Section */}
                    <div className="p-6 border-t border-white/5 space-y-4">
                        {!restaurant?.is_premium && (
                            <div 
                                className="sidebar-upgrade-box group"
                                onClick={() => setShowUpgradeModal(true)}
                            >
                                <div className="upgrade-box-icon">✦</div>
                                <div className="upgrade-box-text flex-1">
                                    <strong>Upgrade to Pro</strong>
                                    <span>Unlimited everything</span>
                                </div>
                                <button className="text-saffron group-hover:translate-x-1 transition-transform">→</button>
                            </div>
                        )}

                        <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 group cursor-default">
                            <Star className={`w-4 h-4 ${restaurant?.is_premium ? 'text-gold fill-gold' : 'text-text-muted opacity-30'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${restaurant?.is_premium ? 'text-text-main' : 'text-text-muted'}`}>
                                {restaurant?.is_premium ? 'Pro Member' : 'Free Account'}
                            </span>
                        </div>

                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-muted hover:text-red-400 transition-all rounded-2xl hover:bg-red-500/5 group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-550 bg-black/90 backdrop-blur-sm lg:hidden transition-opacity duration-500" 
                    onClick={() => setSidebarOpen(false)} 
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-[240px] min-h-screen flex flex-col relative bg-dark">
                {/* Header */}
                <header className="sticky top-0 z-30 h-20 flex items-center justify-between px-8 dashboard-header border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(true)} 
                            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-text-main"
                        >
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-text-main font-fraunces">
                                {getPageTitle()}
                            </h1>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40 hidden sm:block">Dashboard / {getPageTitle()}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        {/* Premium Button/Badge */}
                        {!restaurant?.is_premium && (
                            <button 
                                onClick={() => setShowUpgradeModal(true)}
                                className="get-premium-btn hidden md:flex"
                            >
                                <span className="premium-star">✦</span>
                                Get Premium
                                <span className="premium-arrow">→</span>
                            </button>
                        )}

                        {restaurant?.is_premium && (
                            <div className="premium-badge hidden md:flex">
                                <span>✦</span> Pro
                            </div>
                        )}
                        
                        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                            <div className="text-right hidden lg:block">
                                <p className="text-xs font-black text-text-main uppercase tracking-wider">{restaurant?.name || 'Restaurant'}</p>
                                <p className="text-[10px] font-bold text-saffron uppercase tracking-widest opacity-60">Verified Admin</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-saffron flex items-center justify-center font-black text-white shadow-xl shadow-saffron/20 border-2 border-white/10 hover:scale-105 transition-transform cursor-pointer">
                                {restaurant?.name?.[0]?.toUpperCase() || 'R'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 animate-fade-in relative z-10 w-full max-w-7xl mx-auto">
                    {children}
                </main>
            </div>

            {/* Nudge Popup */}
            {showNudgePopup && (
                <div className="nudge-popup">
                    <button 
                        onClick={() => setShowNudgePopup(false)}
                        className="absolute top-4 right-4 text-text-muted hover:text-text-main"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    
                    {nudgeMessageIndex === 0 && (
                        <div className="pr-4">
                            <h4 className="text-text-main font-bold flex items-center gap-2 mb-2">
                                <span className="text-gold">✦</span> You're on the Free Plan
                            </h4>
                            <p className="text-text-muted text-sm leading-relaxed mb-4">
                                You've used {itemCount}/6 menu items. Upgrade to Pro and get unlimited items, tables, themes + all future features.
                            </p>
                            <button onClick={() => { setShowNudgePopup(false); setShowUpgradeModal(true); }} className="nudge-cta">Upgrade Now →</button>
                            <button onClick={() => setShowNudgePopup(false)} className="nudge-dismiss">Maybe Later</button>
                        </div>
                    )}

                    {nudgeMessageIndex === 1 && (
                        <div className="pr-4">
                            <h4 className="text-text-main font-bold flex items-center gap-2 mb-2">
                                <span className="text-gold">🚀</span> Unlock Your Full Potential
                            </h4>
                            <p className="text-text-muted text-sm leading-relaxed mb-4">
                                Free plan limits your growth. Pro users get unlimited everything and every new feature we build — forever.
                            </p>
                            <button onClick={() => { setShowNudgePopup(false); setShowUpgradeModal(true); }} className="nudge-cta">Get Pro for ₹499/mo →</button>
                            <button onClick={() => setShowNudgePopup(false)} className="nudge-dismiss">Dismiss</button>
                        </div>
                    )}

                    {nudgeMessageIndex === 2 && (
                        <div className="pr-4">
                            <h4 className="text-text-main font-bold flex items-center gap-2 mb-2">
                                <span className="text-gold">⏰</span> Limited Launch Offer
                            </h4>
                            <p className="text-text-muted text-sm leading-relaxed mb-4">
                                First 20 restaurants get Pro at ₹499/mo forever. Only a few spots left.
                            </p>
                            <button onClick={() => { setShowNudgePopup(false); setShowUpgradeModal(true); }} className="nudge-cta">Claim Your Spot →</button>
                            <button onClick={() => setShowNudgePopup(false)} className="nudge-dismiss">Not Now</button>
                        </div>
                    )}
                </div>
            )}

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <UpgradeModal 
                    isOpen={showUpgradeModal} 
                    onClose={() => setShowUpgradeModal(false)}
                />
            )}

            {/* Waiting Screen Overlay */}
            {pendingRequest && (
                <WaitingScreen pendingRequest={pendingRequest} />
            )}

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-1100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-dark-2 border border-white/10 rounded-[40px] p-10 max-w-sm w-full shadow-2xl text-center animate-pop-in">
                        <div className="w-20 h-20 bg-saffron/10 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                            <LogOut className="w-10 h-10 text-saffron" />
                        </div>
                        <h3 className="text-3xl font-bold text-text-main mb-3 font-fraunces">
                            Leaving so soon?
                        </h3>
                        <p className="text-text-muted text-sm leading-relaxed mb-10 px-4">
                            You'll need to sign in again to access your restaurant management tools.
                        </p>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleLogout}
                                className="w-full py-4 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 transition-all btn-press shadow-xl shadow-red-500/10"
                            >
                                Confirm Logout
                            </button>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="w-full py-4 rounded-2xl text-text-muted font-black uppercase tracking-widest hover:text-text-main transition-all text-xs"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
