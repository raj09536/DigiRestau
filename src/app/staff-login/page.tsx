'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { ChefHat, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './staff-login.css';

export default function StaffLoginPage() {
    const [restaurantId, setRestaurantId] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleStaffLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Find staff member
            const { data: staff, error: fetchError } = await supabase
                .from('staff_members')
                .select('*, restaurants(id, name, slug)')
                .eq('phone', phone)
                .eq('password', password)
                .eq('restaurant_id', restaurantId)
                .eq('is_active', true)
                .single();

            if (fetchError || !staff) {
                setError('Wrong credentials. Check karo.');
                setLoading(false);
                return;
            }

            // Save staff session in localStorage
            localStorage.setItem('staff_session', JSON.stringify({
                id: staff.id,
                name: staff.name,
                role: staff.role,
                restaurant_id: staff.restaurant_id,
                restaurant_name: staff.restaurants?.name
            }));

            // Redirect based on role
            if (staff.role === 'chef') router.push('/staff/chef');
            else if (staff.role === 'waiter') router.push('/staff/waiter');
            else if (staff.role === 'manager') router.push('/staff/manager');
            else router.push('/staff/dashboard'); // Default fallback

        } catch (err) {
            console.error('Login error:', err);
            setError('Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="staff-login-container selection:bg-saffron selection:text-white">
            <div className="staff-login-card animate-fade-in">
                <div className="staff-login-header">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-saffron/10 flex items-center justify-center">
                            <ChefHat className="w-10 h-10 text-saffron" />
                        </div>
                    </div>
                    <h1 className="staff-login-title">Staff Login</h1>
                    <p className="staff-login-subtitle">Apne restaurant mein login karein</p>
                </div>

                {error && (
                    <div className="staff-login-error animate-shake">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleStaffLogin} className="staff-login-form">
                    <div className="staff-input-group">
                        <label className="staff-input-label">Restaurant ID</label>
                        <input
                            type="text"
                            value={restaurantId}
                            onChange={(e) => setRestaurantId(e.target.value)}
                            placeholder="Restaurant ID daalo"
                            className="staff-input"
                            required
                        />
                    </div>

                    <div className="staff-input-group">
                        <label className="staff-input-label">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Phone number daalo"
                            className="staff-input"
                            required
                        />
                    </div>

                    <div className="staff-input-group">
                        <label className="staff-input-label">Password</label>
                        <div className="password-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password daalo"
                                className="staff-input"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="staff-login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Login <ArrowRight className="w-5 h-5" /></>
                        )}
                    </button>
                </form>

                <div className="staff-login-footer">
                    <Link href="/login" className="back-to-login">
                       Are you a Restaurant Owner? Login Here
                    </Link>
                </div>
            </div>
        </div>
    );
}
