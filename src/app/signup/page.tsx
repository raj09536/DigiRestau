'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [restaurantName, setRestaurantName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            if (authData.user) {
                const slug = restaurantName
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');

                const { error: dbError } = await supabase.from('restaurants').insert({
                    name: restaurantName,
                    slug: slug,
                    owner_id: authData.user.id,
                });

                if (dbError) {
                    setError(dbError.message);
                    return;
                }

                router.push('/dashboard');
            }
        } catch {
            setError('Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-dark selection:bg-saffron selection:text-white font-outfit overflow-hidden">
            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-saffron/10 rounded-full blur-[120px] animate-drift" />
                <div className="absolute bottom-[20%] left-[20%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] animate-drift" style={{ animationDelay: '-4s' }} />
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
            </div>

            {/* Back Link */}
            <Link 
                href="/" 
                className="fixed top-8 left-8 flex items-center gap-2 text-sm font-medium text-text-muted hover:text-white transition-colors z-10"
            >
                ← Back to home
            </Link>

            {/* Signup Card */}
            <div className="relative z-10 w-full max-w-[440px] animate-fade-up">
                <div className="bg-dark-2 rounded-[32px] p-10 lg:p-12 border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
                            <div className="w-10 h-10 rounded-xl bg-saffron flex items-center justify-center relative shadow-lg shadow-saffron/20 group-hover:scale-110 transition-transform">
                                <span className="text-white text-xl font-bold">d</span>
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gold border-2 border-dark animate-pulse-custom" />
                            </div>
                            <span className="text-2xl font-fraunces font-bold tracking-tight text-white">
                                digi<span style={{ color: '#F4622A' }}>Restau</span>
                            </span>
                        </Link>
                        <h2 className="text-3xl font-fraunces font-bold text-white mb-3">Create your account</h2>
                        <p className="text-text-muted font-light">Set up your restaurant's digital menu in minutes</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="auth-error mb-6 flex items-start gap-3">
                            <div className="w-5 h-5 shrink-0 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-[10px] font-bold">!</div>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="auth-label">Restaurant Name</label>
                            <input
                                type="text"
                                value={restaurantName}
                                onChange={e => setRestaurantName(e.target.value)}
                                className="auth-input"
                                placeholder="e.g. Sharma's Dhaba"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="auth-label">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="auth-input"
                                placeholder="name@restaurant.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between pr-1">
                                <label className="auth-label">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-[11px] font-medium text-text-muted hover:text-saffron transition-colors"
                                >
                                    {showPassword ? 'Hide password' : 'Show password'}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="auth-input"
                                    placeholder="Min. 6 characters"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 rounded-2xl bg-saffron text-white font-bold text-lg shadow-xl shadow-saffron/20 hover:bg-saffron-light hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:translate-y-0"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-10 pt-10 border-t border-white/5 text-center">
                        <p className="text-sm text-text-muted mb-6">
                            Already have an account?{' '}
                            <Link href="/login" className="text-saffron font-bold hover:text-saffron-light transition-colors">
                                Sign in →
                            </Link>
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-bold text-text-muted/40 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Check className="w-3 h-3" /> Free forever</span>
                            <span>•</span>
                            <span>No card required</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx global>{`
                h1, h2, h3, h4, h5, h6, .font-fraunces {
                    font-family: var(--font-fraunces), serif;
                }
                body, .font-outfit {
                    font-family: var(--font-outfit), sans-serif;
                }
            `}</style>
        </div>
    );
}
