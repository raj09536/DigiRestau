'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
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

            {/* Card */}
            <div className="relative z-10 w-full max-w-[440px] animate-fade-up">
                <div className="bg-dark-2 rounded-[32px] p-10 lg:p-12 border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                    {!success ? (
                        <>
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-saffron/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-saffron/20">
                                    <Lock className="w-8 h-8 text-saffron" />
                                </div>
                                <h2 className="text-3xl font-fraunces font-bold text-white mb-3">New Password</h2>
                                <p className="text-text-muted font-light px-4">Choose a strong password</p>
                            </div>

                            {error && (
                                <div className="auth-error mb-6 flex items-start gap-3">
                                    <div className="w-5 h-5 shrink-0 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-[10px] font-bold">!</div>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between pr-1">
                                        <label className="auth-label">New Password</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-[11px] font-medium text-text-muted hover:text-saffron transition-colors"
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
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

                                <div className="space-y-2">
                                    <label className="auth-label">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className="auth-input"
                                            placeholder="Confirm password"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 rounded-2xl bg-saffron text-white font-bold text-lg shadow-xl shadow-saffron/20 hover:bg-saffron-light hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Update Password <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
                                    <CheckCircle2 className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-fraunces font-bold text-white mb-3">Password Updated!</h2>
                            <p className="text-text-muted font-light mb-8">
                                Redirecting you to login...
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes scale-in {
                    0% { transform: scale(0); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
        </div>
    );
}
