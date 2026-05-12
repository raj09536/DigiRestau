'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';
import { Loader2, Star, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { getTimeAgo } from '@/lib/utils';
import { OrderFeedback } from '@/lib/types';

export default function FeedbackPage() {
    const { restaurant } = useRestaurant();
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchFeedback = async () => {
            if (!restaurant) return;
            try {
                const { data, error } = await supabase
                    .from('order_feedback')
                    .select(`
                        *,
                        orders (
                            customer_name,
                            created_at,
                            tables (
                                table_name
                            )
                        )
                    `)
                    .eq('restaurant_id', restaurant.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setFeedbacks(data || []);
            } catch (err) {
                console.error('Error fetching feedback:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, [restaurant, supabase]);

    if (!restaurant) return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-12 h-12 border-4 border-saffron/20 border-t-saffron rounded-full animate-spin" />
            </div>
        );
    }

    const avgRating = feedbacks.length > 0 
        ? feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length 
        : 0;

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-text-main font-fraunces">Customer Feedback</h2>
                <p className="text-text-muted mt-1">Review your customers' experience and ratings.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-dark-2 border border-white/10 rounded-[32px] p-8 shadow-2xl flex items-center gap-6">
                    <div className="w-16 h-16 bg-saffron/10 rounded-2xl flex items-center justify-center shrink-0">
                        <TrendingUp className="w-8 h-8 text-saffron" />
                    </div>
                    <div>
                        <span className="text-4xl font-bold text-text-main font-fraunces">{avgRating.toFixed(1)}</span>
                        <p className="text-xs font-black uppercase tracking-widest text-text-muted mt-1">Avg Rating</p>
                        <div className="flex gap-0.5 mt-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star 
                                    key={s} 
                                    className={`w-3 h-3 ${s <= Math.round(avgRating) ? 'text-saffron fill-saffron' : 'text-white/10'}`} 
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-dark-2 border border-white/10 rounded-[32px] p-8 shadow-2xl flex items-center gap-6">
                    <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center shrink-0">
                        <Users className="w-8 h-8 text-gold" />
                    </div>
                    <div>
                        <span className="text-4xl font-bold text-text-main font-fraunces">{feedbacks.length}</span>
                        <p className="text-xs font-black uppercase tracking-widest text-text-muted mt-1">Total Reviews</p>
                    </div>
                </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
                {feedbacks.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 border-dashed rounded-[32px] p-20 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 text-text-muted opacity-20" />
                        </div>
                        <h4 className="text-xl font-bold text-text-main font-fraunces">No Feedback Yet</h4>
                        <p className="text-text-muted text-sm max-w-xs mx-auto mt-2">Feedback will appear here once customers start rating their experience.</p>
                    </div>
                ) : (
                    feedbacks.map((feedback) => (
                        <div key={feedback.id} className="feedback-card group hover:border-saffron/30 transition-all">
                            <div className="feedback-header">
                                <span className="customer-name">{feedback.orders?.customer_name || 'Guest'}</span>
                                <span className="feedback-table px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                    🪑 {feedback.orders?.tables?.table_name || 'Unknown Table'}
                                </span>
                                <span className="feedback-time">{getTimeAgo(feedback.created_at)}</span>
                            </div>
                            
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star 
                                        key={s} 
                                        className={`w-4 h-4 ${s <= feedback.rating ? 'text-saffron fill-saffron' : 'text-white/10'}`} 
                                    />
                                ))}
                            </div>

                            {feedback.comment && (
                                <div className="relative">
                                    <p className="feedback-comment pl-4 border-l-2 border-saffron/30">
                                        "{feedback.comment}"
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
