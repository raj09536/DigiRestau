'use client';

import { useState, useEffect } from 'react';
import { X, Check, Crown, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    restaurantId?: string;
    currentPlan?: string;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const FEATURES = [
    'Inventory management',
    'Team & staff management',
    'Premium themes & icons',
    'Priority support',
    'Advanced analytics (coming soon)',
    'Custom domain (coming soon)',
];

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const supabase = createClient();
    const { restaurant, setRestaurant } = useRestaurant();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        const existing = document.getElementById('razorpay-script');
        if (existing) return;
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePayment = async () => {
        if (!restaurant) return;
        setLoading(true);
        setError('');

        try {
            // Step 1: Server se order create karo
            const res = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: 'monthly' }),
            });

            if (!res.ok) throw new Error('Order create failed');
            const { order_id, amount, currency } = await res.json();

            // Step 2: User email lo
            const { data: { user } } = await supabase.auth.getUser();

            // Step 3: Razorpay checkout kholo
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount,
                currency,
                name: 'digiRestau',
                description: 'Pro Plan — Monthly',
                image: '/logo.png',
                order_id,
                prefill: {
                    email: user?.email || '',
                },
                theme: { color: '#F4622A' },
                handler: async (response: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    // Step 4: Payment verify karo aur premium activate karo
                    const verifyRes = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            restaurant_id: restaurant.id,
                            plan: 'monthly',
                        }),
                    });

                    if (verifyRes.ok) {
                        setRestaurant({ ...restaurant, is_premium: true });
                        setSuccess(true);
                    } else {
                        setError('Payment verify nahi ho saka. Support se contact karo.');
                    }
                    setLoading(false);
                },
                modal: {
                    ondismiss: () => setLoading(false),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => {
                setError('Payment fail ho gaya. Dobara try karo.');
                setLoading(false);
            });
            rzp.open();
        } catch (err) {
            console.error(err);
            setError('Kuch problem ho gayi. Thodi der baad try karo.');
            setLoading(false);
        }
    };

    // Success screen
    if (success) {
        return (
            <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-dark-2 border border-saffron/40 w-full max-w-[400px] rounded-[32px] p-10 text-center animate-pop-in">
                    <div className="mb-6 text-6xl">🎉</div>
                    <h2 className="text-3xl font-bold text-text-main font-fraunces mb-3">
                        Welcome to Pro!
                    </h2>
                    <p className="text-text-muted text-sm leading-relaxed mb-8">
                        Aapka restaurant ab Pro plan pe hai.<br />
                        Saare features unlock ho gaye hain!
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-saffron hover:bg-saffron-light text-white rounded-2xl font-black transition-all shadow-xl shadow-saffron/20 btn-press uppercase tracking-widest text-xs"
                    >
                        Dashboard pe Jao
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-dark-2 border border-saffron/40 w-full max-w-[420px] rounded-[32px] overflow-hidden shadow-2xl animate-pop-in">
                {/* Header */}
                <div className="relative p-8 pb-6 border-b border-white/5">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4 text-text-muted" />
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-2xl bg-saffron/10 flex items-center justify-center">
                            <Crown className="w-5 h-5 text-saffron" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-main font-fraunces">Upgrade to Pro</h2>
                            <p className="text-xs text-text-muted opacity-60">Sab features unlock karo</p>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-text-main">₹499</span>
                        <span className="text-text-muted text-sm">/month</span>
                    </div>
                    <p className="text-[11px] text-text-muted opacity-40 mt-1">Cancel anytime</p>
                </div>

                {/* Features list */}
                <div className="p-8 pt-6 space-y-3">
                    {FEATURES.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-saffron/10 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-saffron" />
                            </div>
                            <span className="text-sm text-text-muted">{feature}</span>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="px-8 pb-8">
                    {error && (
                        <p className="text-red-400 text-xs text-center mb-4 bg-red-500/10 py-2 px-4 rounded-xl">
                            {error}
                        </p>
                    )}
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full py-4 bg-saffron hover:bg-saffron-light text-white rounded-2xl font-black transition-all shadow-xl shadow-saffron/20 btn-press disabled:opacity-60 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                Pay ₹499 — Upgrade Now
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-text-muted mt-3 opacity-40">
                        Secure payment via Razorpay • UPI, Cards, Netbanking
                    </p>
                </div>
            </div>
        </div>
    );
}
