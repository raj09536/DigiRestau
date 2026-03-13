'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2, MessageCircle, CreditCard, ShieldCheck, Zap, Star, Shield } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { QRCodeSVG } from 'qrcode.react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    restaurantId?: string;
    currentPlan?: string;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const { t } = useTranslation();
    const [region, setRegion] = useState('INTL');
    const [alreadyPaid, setAlreadyPaid] = useState(false);

    useEffect(() => {
        const savedRegion = localStorage.getItem('digirestau_country') || 'INTL';
        setRegion(savedRegion);
    }, []);

    if (!isOpen) return null;

    const pricing = {
        IN: {
            monthly: '₹499/month',
            yearly: '₹4,790/year',
            upiId: 'digirestau@ybl',
            whatsapp: '+919999999999'
        },
        INTL: {
            monthly: '$12/month',
            yearly: '$115/year',
            upiId: 'digirestau@ybl',
            whatsapp: '+919999999999'
        }
    };

    const currentPricing = region === 'IN' ? pricing.IN : pricing.INTL;

    // UPI Payment Link (Example format)
    const upiLink = `upi://pay?pa=${currentPricing.upiId}&pn=digiRestau&cu=${region === 'IN' ? 'INR' : 'USD'}&tn=Pro Plan Upgrade`;

    return (
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-dark-2 border border-white/10 w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-pop-in">
                {/* Header */}
                <div className="relative p-8 text-center border-b border-white/5 bg-dark-2">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 rounded-xl hover:bg-white/5 text-text-muted transition-colors border border-white/5"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-20 h-20 bg-saffron/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Star className="w-10 h-10 text-saffron fill-saffron/20" />
                    </div>
                    <h2 className="text-3xl font-bold text-text-main mb-2 font-fraunces">
                        {alreadyPaid ? 'Wait for Activation' : 'Unlock Pro Access'}
                    </h2>
                    <p className="text-text-muted text-sm px-4">
                        {alreadyPaid
                            ? 'Our developers are verifying your payment. It usually takes less than 2 hours.'
                            : 'You have reached the free plan limit. Upgrade to continue growing.'}
                    </p>
                </div>

                {!alreadyPaid ? (
                    <>
                        {/* Features List */}
                        <div className="p-8 bg-dark-3">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    'Unlimited menu items',
                                    'Unlimited tables',
                                    'Custom brand colors',
                                    'Real-time order sound',
                                    'Premium dashboard',
                                    'Priority support'
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-text-muted">
                                        <div className="p-1 bg-saffron/10 rounded-lg">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-saffron" />
                                        </div>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pricing and Payment */}
                        <div className="p-8 space-y-8 bg-dark-2">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-white/5 border border-white/10 group hover:border-saffron/30 transition-all">
                                <div className="text-center sm:text-left">
                                    <p className="text-[10px] font-black text-saffron uppercase tracking-widest mb-2">Pro Lifetime Plan</p>
                                    <h3 className="text-2xl font-bold text-text-main font-fraunces">
                                        {currentPricing.monthly} <span className="text-sm font-normal text-text-muted">/mo</span>
                                    </h3>
                                    <p className="text-[10px] text-text-muted mt-2 font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded inline-block">Best for busy restaurants</p>
                                </div>
                                <div className="p-3 bg-white rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                    <QRCodeSVG value={upiLink} size={90} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 opacity-40">Scan QR or use UPI ID</p>
                                    <div className="relative inline-block px-6 py-3 bg-black/40 rounded-2xl border border-white/5 border-dashed">
                                        <p className="text-lg font-mono font-black text-saffron">{currentPricing.upiId}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <a
                                        href={`https://wa.me/${currentPricing.whatsapp.replace('+', '')}?text=Hi, I just paid for the digiRestau Pro plan. Here is my screenshot.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[#25D366] text-white font-black hover:bg-[#22c35e] transition-all shadow-xl shadow-green-500/10 btn-press"
                                    >
                                        <MessageCircle className="w-6 h-6" />
                                        Verify on WhatsApp
                                    </a>

                                    <button
                                        onClick={() => setAlreadyPaid(true)}
                                        className="w-full py-4 rounded-2xl bg-white/5 text-text-muted font-black uppercase tracking-widest hover:bg-white/10 transition-all text-xs border border-white/10"
                                    >
                                        Already Paid? Notify Team
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-16 text-center bg-dark-2">
                        <div className="w-24 h-24 bg-saffron/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <Zap className="w-12 h-12 text-saffron fill-saffron" />
                        </div>
                        <h3 className="text-2xl font-bold text-text-main font-fraunces mb-4">Under Verification</h3>
                        <p className="text-text-muted text-sm mb-10 leading-relaxed max-w-xs mx-auto">
                            We've received your data. Please ensure the payment screenshot is shared on WhatsApp for instant activation.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-saffron text-white font-black shadow-xl shadow-saffron/20 hover:bg-saffron-light transition-all btn-press"
                        >
                            Got it, thanks!
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
