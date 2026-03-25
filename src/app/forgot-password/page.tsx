'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, ArrowRight, Key, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState('');
    const supabase = createClient();

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) {
            setError(error.message);
        } else {
            setEmailSent(true);
        }
        setLoading(false);
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
                href="/login" 
                className="fixed top-8 left-8 flex items-center gap-2 text-sm font-medium text-text-muted hover:text-white transition-colors z-10"
            >
                <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>

            {/* Card */}
            <div className="relative z-10 w-full max-w-[440px] animate-fade-up">
                <div className="bg-dark-2 rounded-[32px] p-10 lg:p-12 border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                    {!emailSent ? (
                        <>
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-saffron/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-saffron/20">
                                    <Key className="w-8 h-8 text-saffron" />
                                </div>
                                <h2 className="text-3xl font-fraunces font-bold text-white mb-3">Reset Password</h2>
                                <p className="text-text-muted font-light px-4">Enter your email and we'll send you a reset link</p>
                            </div>

                            {error && (
                                <div className="auth-error mb-6 flex items-start gap-3">
                                    <div className="w-5 h-5 shrink-0 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-[10px] font-bold">!</div>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleForgotPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="auth-label">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="auth-input"
                                        placeholder="you@restaurant.com"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 rounded-2xl bg-saffron text-white font-bold text-lg shadow-xl shadow-saffron/20 hover:bg-saffron-light hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Send Reset Link <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-fraunces font-bold text-white mb-3">Reset link sent!</h2>
                            <p className="text-text-muted font-light mb-10 leading-relaxed">
                                Check your email for password reset instructions
                            </p>

                            <Link 
                                href="/login"
                                className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" /> Back to login
                            </Link>
                        </div>
                    )}
                </div>
            </div>

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
