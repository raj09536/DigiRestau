'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkExistingAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: restaurant } = await supabase
                    .from('restaurants')
                    .select('is_admin')
                    .eq('owner_id', user.id)
                    .single();
                
                if (restaurant?.is_admin) {
                    router.push('/admin-digi-2025/dashboard');
                }
            }
        };
        checkExistingAuth();
    }, [router, supabase]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                toast.error('Wrong credentials');
                setLoading(false);
                return;
            }

            if (data.user) {
                const { data: restaurant } = await supabase
                    .from('restaurants')
                    .select('is_admin')
                    .eq('owner_id', data.user.id)
                    .single();

                if (!restaurant?.is_admin) {
                    toast.error('Unauthorized personnel only');
                    await supabase.auth.signOut();
                    setLoading(false);
                    return;
                }

                toast.success('Access granted');
                router.push('/admin-digi-2025/dashboard');
            }
        } catch (err) {
            toast.error('Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-6 font-outfit">
            <div className="w-full max-w-[400px] bg-dark-2 border border-border-custom rounded-[20px] p-10 shadow-2xl animate-pop-in">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-saffron/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-saffron/5">
                        <Lock className="w-10 h-10 text-saffron" />
                    </div>
                    <h1 className="text-3xl font-bold text-text-main font-fraunces mb-2 tracking-tight">Admin Access</h1>
                    <p className="text-text-muted text-sm font-medium opacity-60">Authorized personnel only</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Email</label>
                        <input 
                            type="email" 
                            required
                            placeholder="admin@digirestau.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-dark-3 border border-[rgba(244,98,42,0.2)] rounded-2xl px-5 py-4 text-text-main outline-none focus:border-saffron/50 transition-all font-bold placeholder:text-text-muted/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-dark-3 border border-[rgba(244,98,42,0.2)] rounded-2xl px-5 py-4 text-text-main outline-none focus:border-saffron/50 transition-all font-bold placeholder:text-text-muted/20"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-saffron transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-saffron hover:bg-saffron-light text-white rounded-2xl py-4 font-black transition-all shadow-xl shadow-saffron/20 flex items-center justify-center gap-2 btn-press disabled:opacity-50 mt-4 uppercase tracking-widest text-xs"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Enter Dashboard <span>→</span></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
