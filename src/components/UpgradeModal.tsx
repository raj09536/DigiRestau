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
    isMandatory?: boolean;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: 99,
        icon: Zap,
        description: 'Perfect for digital menus',
        features: [
            'QR Menu Generation',
            '10+ Premium Templates',
            'Unlimited Items & Tables',
            'View-only Menu access',
            'Standard Support',
        ]
    },
    {
        id: 'pro',
        name: 'Pro Plan',
        price: 499,
        icon: Crown,
        description: 'Complete ordering system',
        popular: true,
        features: [
            'Everything in Starter',
            'Real-time Live Orders',
            'Sound Notifications',
            'Order Management',
            'Priority Support',
        ]
    },
    {
        id: 'max',
        name: 'Max Plan',
        price: 999,
        icon: Crown,
        description: 'Unlimited scale & priority',
        features: [
            'Everything in Pro',
            'Unlimited Everything',
            'Advanced Analytics',
            'Custom Branding',
            '24/7 Dedicated Support',
        ]
    }
];

export default function UpgradeModal({ isOpen, onClose, isMandatory }: UpgradeModalProps) {
    const supabase = createClient();
    const { restaurant, setRestaurant } = useRestaurant();
    const [selectedPlanId, setSelectedPlanId] = useState(restaurant?.plan_tier || 'pro');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const selectedPlan = PLANS.find(p => p.id === selectedPlanId) || PLANS[1];

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
                body: JSON.stringify({ 
                    plan: selectedPlan.id,
                    amount: selectedPlan.price
                }),
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
                description: `${selectedPlan.name} — Monthly`,
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
                            plan: selectedPlan.id,
                        }),
                    });

                    if (verifyRes.ok) {
                        setRestaurant({ 
                            ...restaurant, 
                            is_premium: true,
                            plan_tier: selectedPlan.id as 'starter' | 'pro' | 'max'
                        });
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

    const handleClose = () => {
        if (success) {
            window.location.reload();
        } else if (!isMandatory) {
            onClose();
        }
    };

    // Success screen
    if (success) {
        return (
            <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-dark-2 border border-saffron/40 w-full max-w-[400px] rounded-[32px] p-10 text-center animate-pop-in">
                    <div className="mb-6 text-6xl">🎉</div>
                    <h2 className="text-3xl font-bold text-text-main font-fraunces mb-3">
                        Welcome to {selectedPlan.name}!
                    </h2>
                    <p className="text-text-muted text-sm leading-relaxed mb-8">
                        Aapka restaurant ab {selectedPlan.name} pe hai.<br />
                        Saare features unlock ho gaye hain!
                    </p>
                    <button
                        onClick={handleClose}
                        className="w-full py-4 bg-saffron hover:bg-saffron-light text-white rounded-2xl font-black transition-all shadow-xl shadow-saffron/20 btn-press uppercase tracking-widest text-xs"
                    >
                        Dashboard pe Jao
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-dark-2 border border-saffron/40 w-full max-w-[800px] rounded-[40px] overflow-hidden shadow-2xl animate-pop-in my-8">
                {/* Close Button */}
                {!isMandatory && (
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors z-10"
                    >
                        <X className="w-4 h-4 text-text-muted" />
                    </button>
                )}

                <div className="grid lg:grid-cols-5 h-full">
                    {/* Left - Plan Selection */}
                    <div className="lg:col-span-3 p-8 border-r border-white/5 bg-dark/30">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-saffron/10 flex items-center justify-center">
                                <Crown className="w-5 h-5 text-saffron" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-main font-fraunces">Upgrade Plan</h2>
                                <p className="text-xs text-text-muted opacity-60">Sahi plan choose karein</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {PLANS.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlanId(plan.id as 'starter' | 'pro' | 'max')}
                                    className={`w-full p-6 rounded-3xl border-2 transition-all text-left relative group ${
                                        selectedPlanId === plan.id 
                                            ? 'border-saffron bg-saffron/5' 
                                            : 'border-white/5 bg-white/20 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${selectedPlanId === plan.id ? 'bg-saffron/20' : 'bg-white/5'}`}>
                                                <plan.icon className={`w-4 h-4 ${selectedPlanId === plan.id ? 'text-saffron' : 'text-text-muted'}`} />
                                            </div>
                                            <h3 className="font-bold text-text-main">{plan.name}</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-text-main">₹{plan.price}</div>
                                            <div className="text-[10px] text-text-muted">/month</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-muted font-light">{plan.description}</p>
                                    
                                    {plan.popular && (
                                        <span className="absolute -top-3 left-6 px-3 py-1 bg-saffron text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-saffron/20">
                                            Recommended
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right - Features & CTA */}
                    <div className="lg:col-span-2 p-8 flex flex-col bg-dark-2">
                        <div className="mb-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-saffron mb-6">Plan Features</h4>
                            <div className="space-y-4">
                                {selectedPlan.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-saffron/10 flex items-center justify-center shrink-0">
                                            <Check className="w-2.5 h-2.5 text-saffron" />
                                        </div>
                                        <span className="text-xs text-text-muted">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-white/5">
                            {error && (
                                <p className="text-red-400 text-[10px] text-center mb-4 bg-red-500/10 py-2 px-4 rounded-xl">
                                    {error}
                                </p>
                            )}
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full py-4 bg-saffron hover:bg-saffron-light text-white rounded-2xl font-black transition-all shadow-xl shadow-saffron/30 btn-press disabled:opacity-60 flex items-center justify-center gap-2 uppercase tracking-wide text-xs"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-3.5 h-3.5" />
                                        Pay ₹{selectedPlan.price} — Upgrade
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[9px] text-text-muted mt-4 opacity-40 leading-relaxed">
                                Secure payment via Razorpay • UPI, Cards, Netbanking accepted.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
