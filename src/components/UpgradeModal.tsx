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

    return (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-dark-2 border border-saffron/40 w-full max-w-[400px] rounded-[32px] overflow-hidden shadow-2xl relative p-10 text-center animate-pop-in">
                <div className="mb-6 flex justify-center">
                    <span className="text-6xl animate-bounce">🚀</span>
                </div>
                <h2 className="text-3xl font-bold text-text-main font-fraunces mb-3 leading-tight">
                    Coming Soon!
                </h2>
                <div className="space-y-2 mb-8 text-text-muted">
                    <p className="font-medium">Pro plan jald hi available hoga.</p>
                    <p className="text-sm opacity-60">Abhi ke liye free plan enjoy karein!</p>
                </div>
                <button 
                    onClick={onClose}
                    className="w-full py-4 bg-saffron hover:bg-saffron-light text-white rounded-2xl font-black transition-all shadow-xl shadow-saffron/20 btn-press uppercase tracking-widest text-xs"
                >
                    Theek Hai
                </button>
            </div>
        </div>
    );
}
