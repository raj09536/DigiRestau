'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Store, Users, Smartphone, Check } from 'lucide-react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';

const upcomingFeatures = [
    {
        icon: <BarChart3 className="w-8 h-8 text-gold" />,
        title: "Analytics Dashboard",
        description: "Get deep insights into your restaurant's performance. Track daily orders, peak hours, popular dishes, revenue trends, and customer behaviour — all in one beautiful dashboard.",
        availableFor: "✦ Pro Plan"
    },
    {
        icon: <Store className="w-8 h-8 text-gold" />,
        title: "Multiple Branches",
        description: "Manage multiple restaurant locations from a single account. Separate menus, separate tables, separate orders — one dashboard to rule them all.",
        availableFor: "✦ Pro Plan"
    },
    {
        icon: <Users className="w-8 h-8 text-gold" />,
        title: "Staff Management",
        description: "Add your staff members, assign roles, track performance, and manage shifts. Give your team the right access without sharing your owner credentials.",
        availableFor: "✦ Pro Plan"
    },
    {
        icon: <Smartphone className="w-8 h-8 text-gold" />,
        title: "Waiter App",
        description: "A dedicated mobile-friendly interface for your waiters. Accept orders on behalf of customers, update order status, and coordinate with the kitchen — all from their phone.",
        availableFor: "✦ Pro Plan"
    }
];

export default function UpcomingFeaturesPage() {
    useEffect(() => {
        // Scroll reveal observer
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen font-outfit" style={{ backgroundColor: '#120D0A', color: '#F5EDE8' }}>
            <LandingNavbar />

            <main className="pt-32 pb-24 px-6 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-saffron/5 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10" />

                <div className="max-w-6xl mx-auto">
                    {/* Hero Section */}
                    <div className="reveal text-center mb-24">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 text-sm font-medium text-gold backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                            🚀 What's Coming
                        </div>
                        <h1 className="text-5xl lg:text-[56px] font-fraunces font-bold mb-8 leading-tight">
                            The Future of <span className="text-saffron">digiRestau</span>
                        </h1>
                        <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-light">
                            We're constantly building new features to help your restaurant grow. 
                            Pro users get access to everything — automatically.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-24">
                        {upcomingFeatures.map((feature, i) => (
                            <div 
                                key={i}
                                className="reveal feature-card p-8 lg:p-10 transition-all duration-300 group"
                                style={{
                                    background: '#1E1510',
                                    border: '1px solid rgba(244,98,42,0.15)',
                                    borderRadius: '16px'
                                }}
                            >
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                            {feature.icon}
                                        </div>
                                        <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest rounded-full border border-gold/20">
                                            Coming Soon
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-fraunces font-bold mb-4">{feature.title}</h3>
                                    <p className="text-text-muted font-light leading-relaxed mb-8 flex-1">
                                        {feature.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-saffron text-xs font-black uppercase tracking-widest opacity-80">
                                        <Check className="w-4 h-4" />
                                        {feature.availableFor}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom CTA Section */}
                    <div 
                        className="reveal rounded-[20px] p-12 lg:p-20 text-center border border-white/10 relative overflow-hidden group"
                        style={{
                            background: '#1E1510',
                            borderColor: 'rgba(244,98,42,0.2)'
                        }}
                    >
                        {/* Glow effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-saffron/5 rounded-full blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative z-10">
                            <h2 className="text-3xl lg:text-5xl font-fraunces font-bold mb-6">
                                Get All Features — Automatically
                            </h2>
                            <p className="text-xl text-text-muted max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                                Upgrade to Pro today and every feature we build will be unlocked 
                                in your account the moment it launches. No extra cost. Ever.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                                <Link
                                    href="/signup"
                                    className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-saffron text-white font-bold text-lg shadow-2xl shadow-saffron/30 hover:bg-saffron-light hover:scale-105 transition-all flex items-center justify-center gap-2"
                                >
                                    Upgrade to Pro <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="/"
                                    className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all font-outfit"
                                >
                                    Go Back Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />

            <style jsx global>{`
                .feature-card:hover {
                    transform: translateY(-5px);
                    border-color: #F4622A !important;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }
                .reveal {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .reveal.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
}
