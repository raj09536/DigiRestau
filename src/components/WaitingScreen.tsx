'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';

interface WaitingScreenProps {
    pendingRequest: any;
}

export default function WaitingScreen({ pendingRequest }: WaitingScreenProps) {
    const supabase = createClient();
    const router = useRouter();
    const { restaurant, refreshRestaurant } = useRestaurant();
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        if (!pendingRequest || !restaurant) return;

        const interval = setInterval(async () => {
            const { data } = await supabase
                .from('restaurants')
                .select('is_premium, plan')
                .eq('id', restaurant.id)
                .single();

            if (data?.is_premium) {
                clearInterval(interval);
                setShowCelebration(true);
                
                // Keep celebration for 3 seconds
                setTimeout(() => {
                    setShowCelebration(false);
                    window.location.reload(); 
                }, 3000);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [pendingRequest, restaurant, supabase]);

    if (!pendingRequest) return null;

    if (showCelebration) {
        return (
            <div className="fixed inset-0 z-2000 bg-dark flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="text-8xl mb-8 animate-bounce">🎉</div>
                <h1 className="text-4xl md:text-[44px] font-bold text-saffron font-fraunces mb-4">
                    Welcome to Pro!
                </h1>
                <p className="text-xl text-white mb-2">
                    Aapka Pro plan active ho gaya!
                </p>
                <p className="text-sm text-text-muted opacity-60 tracking-widest uppercase">
                    Dashboard unlock ho raha hai...
                </p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-500 bg-[rgba(12,8,6,0.97)] flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm animate-in fade-in duration-500">
            <div className="flex flex-col items-center max-w-md w-full">
                <div className="text-[48px] text-saffron animate-pulse mb-8 overflow-visible">⏳</div>
                
                <h1 className="text-3xl md:text-[32px] font-bold text-text-main font-fraunces mb-4 leading-tight">
                    Payment Verify Ho Rahi Hai
                </h1>
                
                <p className="text-text-muted text-lg mb-10 leading-relaxed opacity-80">
                    Hamari team aapki payment <br />
                    screenshot check kar rahi hai
                </p>

                <div className="w-full space-y-6 mb-12 px-4 max-w-[280px]">
                    <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                        <div className="text-left flex-1">
                            <p className="text-green-500 font-bold text-sm">Payment Submit Ki</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-6 h-6 flex items-center justify-center">
                            <span className="text-xl text-saffron animate-pulse">⏳</span>
                        </div>
                        <div className="text-left flex-1">
                            <p className="text-saffron font-bold text-sm">Verification Ho Rahi Hai</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 opacity-20">
                        <div className="w-6 h-6 bg-white/40 rounded-full flex items-center justify-center" />
                        <div className="text-left flex-1">
                            <p className="text-text-muted font-bold text-sm">Pro Plan Active</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-2 mb-8">
                    <p className="text-text-main/80 font-medium text-sm">
                        ⏱ Aam taur par 5-15 minute lagte hain
                    </p>
                </div>

                <a 
                    href="https://wa.me/917351172025" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/20 rounded-2xl font-black transition-all mb-8 btn-press"
                >
                    📱 WhatsApp par Contact Karo
                </a>

                <p className="text-text-muted text-[13px] opacity-50">
                    Page automatically update hoga <br />
                    jab Pro plan active ho jaye
                </p>
            </div>
        </div>
    );
}
