'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    restaurantId?: string;
    currentPlan?: string;
}

export default function UpgradeModal({ isOpen, onClose, restaurantId, currentPlan }: UpgradeModalProps) {
    const supabase = createClient();
    const { restaurant } = useRestaurant();
    const [view, setView] = useState<'info' | 'submit'>('info');
    const [country, setCountry] = useState('IN');
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const savedCountry = localStorage.getItem('digirestau_country') || 'IN';
        setCountry(savedCountry);
    }, []);

    if (!isOpen) return null;

    const isINR = country === 'IN';
    const prices = {
        monthly: isINR ? 499 : 12,
        yearly: isINR ? 4790 : 115,
        currency: isINR ? 'INR' : 'USD',
        symbol: isINR ? '₹' : '$'
    };

    const whatsappBase = "https://wa.me/917351172025";
    const whatsappText = encodeURIComponent("Hi, maine digiRestau Pro ke liye payment ki hai. Screenshot attach kar raha hun.");
    const whatsappLink = `${whatsappBase}?text=${whatsappText}`;

    const features = [
        'Unlimited menu items',
        'Unlimited tables',
        'All themes & customization',
        'Logo & image upload',
        'All future features — forever',
        'Priority support'
    ];

    const handleSubmit = async () => {
        if (!whatsappNumber) {
            alert('Please enter your WhatsApp number');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user || !restaurant) {
                alert('User or restaurant not found');
                setIsSubmitting(false);
                return;
            }

            const { error } = await supabase
                .from('subscription_requests')
                .insert({
                    restaurant_id: restaurant.id,
                    owner_id: user.id,
                    plan: 'pro',
                    amount: selectedPlan === 'yearly' ? 4790 : 499,
                    currency: 'INR',
                    whatsapp_number: whatsappNumber,
                    status: 'pending'
                });

            if (!error) {
                onClose();
                window.location.reload();
            } else {
                console.error('Error submitting request:', error);
                alert(error.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            console.error('Submit failed:', err);
            alert('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
                className="bg-dark-2 border border-[rgba(244,98,42,0.4)] w-full max-w-[480px] rounded-[20px] overflow-hidden shadow-2xl relative p-9 animate-pop-in"
                style={{ borderColor: 'rgba(244,98,42,0.4)' }}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-text-muted hover:text-text-main transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {view === 'info' ? (
                    <div className="space-y-7">
                        <h2 className="text-[28px] font-bold text-text-main font-fraunces leading-tight">
                            ✦ Upgrade to Pro
                        </h2>

                        {/* Plan Comparison */}
                        <div className="space-y-4">
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Included in your FREE plan</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        'Unlimited menu items',
                                        'Unlimited tables',
                                        'Real-time orders',
                                        'QR codes',
                                        'Image upload'
                                    ].map((f, i) => (
                                        <div key={i} className="flex items-center gap-2.5 text-text-muted/80">
                                            <Check className="w-3.5 h-3.5 text-green-500" />
                                            <span className="text-[13px] font-medium">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-saffron/5 rounded-2xl p-5 border border-saffron/20">
                                <p className="text-[10px] font-black uppercase tracking-widest text-saffron mb-4">Unlock with PRO</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        'Everything in Free',
                                        'Custom themes & Colors',
                                        'All future features — forever',
                                        'Priority support'
                                    ].map((f, i) => (
                                        <div key={i} className="flex items-center gap-2.5 text-text-main">
                                            <div className="shrink-0 w-4 h-4 rounded-full bg-saffron/20 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-saffron" />
                                            </div>
                                            <span className="text-[13px] font-bold">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-2xl font-bold text-text-main font-outfit">
                                    {prices.symbol}{prices.monthly}<span className="text-sm font-normal text-text-muted opacity-60">/month</span>
                                </span>
                                <span className="text-text-muted text-xs font-black uppercase tracking-widest opacity-30">or</span>
                                <span className="text-2xl font-bold text-text-main font-outfit">
                                    {prices.symbol}{prices.yearly}<span className="text-sm font-normal text-text-muted opacity-60">/year</span>
                                </span>
                            </div>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] opacity-40">
                                {isINR ? 'International: $12/month or $115/year' : 'India: ₹499/month or ₹4,790/year'}
                            </p>
                        </div>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/5"></span>
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/40">
                                <span className="bg-dark-2 px-3">Pay via UPI</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-white p-2.5 rounded-xl shadow-2xl">
                                <img 
                                    src="https://rcqilnwpichtaijqqnho.supabase.co/storage/v1/object/public/logos/logos/upi-qr.png" 
                                    alt="UPI QR" 
                                    className="w-[180px] h-[180px] object-contain rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider text-center opacity-60">
                                Payment ke baad screenshot bhejo WhatsApp par:
                            </p>
                            <a 
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] hover:bg-[#22c35e] text-white rounded-2xl font-black transition-all shadow-lg shadow-green-500/10 btn-press group"
                            >
                                <span className="text-xl group-hover:scale-110 transition-transform">📱</span> Send Screenshot on WhatsApp →
                            </a>
                        </div>

                        <button 
                            onClick={() => setView('submit')}
                            className="w-full py-4 bg-saffron hover:bg-saffron-light text-white rounded-2xl font-black transition-all shadow-xl shadow-saffron/20 btn-press uppercase tracking-widest text-xs"
                        >
                            ✓ Maine Payment Kar Di
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-[28px] font-bold text-text-main font-fraunces leading-tight">
                                Payment Confirm Karo
                            </h2>
                            <p className="text-text-muted text-sm mt-2 opacity-80">
                                Hum 5-15 minute mein verify karenge
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">WhatsApp Number</label>
                                <input 
                                    type="text" 
                                    placeholder="+91 XXXXX XXXXX"
                                    value={whatsappNumber}
                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                    className="w-full bg-white/2 border border-white/10 rounded-2xl px-5 py-4 text-text-main focus:outline-none focus:border-saffron/50 transition-all font-bold placeholder:text-text-muted/20"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Plan selection</label>
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => setSelectedPlan('monthly')}
                                        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${selectedPlan === 'monthly' ? 'border-saffron bg-saffron/5 shadow-lg shadow-saffron/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'monthly' ? 'border-saffron' : 'border-text-muted/30'}`}>
                                                {selectedPlan === 'monthly' && <div className="w-2.5 h-2.5 bg-saffron rounded-full" />}
                                            </div>
                                            <span className="font-black text-text-main uppercase tracking-widest text-xs">Monthly — ₹499</span>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => setSelectedPlan('yearly')}
                                        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${selectedPlan === 'yearly' ? 'border-saffron bg-saffron/5 shadow-lg shadow-saffron/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'yearly' ? 'border-saffron' : 'border-text-muted/30'}`}>
                                                {selectedPlan === 'yearly' && <div className="w-2.5 h-2.5 bg-saffron rounded-full" />}
                                            </div>
                                            <div className="text-left">
                                                <span className="font-black text-text-main uppercase tracking-widest text-xs block">Yearly — ₹4,790</span>
                                                <span className="text-[9px] text-green-500 font-bold uppercase tracking-[0.2em]">Save 20%</span>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 space-y-4">
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-saffron hover:bg-saffron-light text-white rounded-2xl font-black transition-all shadow-xl shadow-saffron/20 flex items-center justify-center gap-3 btn-press uppercase tracking-widest text-xs"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Submit Request <span className="text-lg">→</span></>
                                )}
                            </button>
                            <button 
                                onClick={() => setView('info')}
                                className="w-full py-2 text-text-muted hover:text-text-main font-black uppercase tracking-[0.3em] transition-all text-[9px] opacity-40 hover:opacity-100"
                            >
                                ← Wapas Jao
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
