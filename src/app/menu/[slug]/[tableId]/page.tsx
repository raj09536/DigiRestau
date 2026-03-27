'use client';

import { useEffect, useState, useCallback, use, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { MenuCategory, MenuItem, CartItem, Order, OrderStatus } from '@/lib/types';
import {
    Plus,
    Minus,
    Trash2,
    X,
    Loader2,
    Check,
    Clock,
    ChefHat,
    Package,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    User,
    ShoppingCart,
    AlertTriangle,
} from 'lucide-react';

const statusSteps: { key: OrderStatus; label: string; icon: any }[] = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'accepted', label: 'Accepted', icon: Check },
    { key: 'preparing', label: 'Preparing', icon: ChefHat },
    { key: 'ready', label: 'Ready', icon: Package },
];

export default function CustomerMenuPage({
    params,
}: {
    params: Promise<{ slug: string; tableId: string }>;
}) {
    const resolvedParams = use(params);
    const { slug, tableId } = resolvedParams;

    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [nameModalOpen, setNameModalOpen] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [placing, setPlacing] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [restaurantName, setRestaurantName] = useState('');
    const [restaurantLogo, setRestaurantLogo] = useState<string | null>(null);
    const [tableName, setTableName] = useState('');
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [cancelTimeLimit, setCancelTimeLimit] = useState(2);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [thankYouMessage, setThankYouMessage] = useState<string | null>(null);
    
    // Feedback state
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const supabase = createClient();
    const categoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    const fetchMenu = useCallback(async () => {
        try {
            const { data: restaurant, error: restError } = await supabase
                .from('restaurants')
                .select('id, name, logo_url, cancel_time_limit, thank_you_message')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (restError || !restaurant) {
                setError('Restaurant not found');
                setLoading(false);
                return;
            }

            setRestaurantId(restaurant.id);
            setRestaurantName(restaurant.name);
            setRestaurantLogo(restaurant.logo_url);
            setCancelTimeLimit(restaurant.cancel_time_limit ?? 2);
            setThankYouMessage(restaurant.thank_you_message);

            const { data: tableData } = await supabase
                .from('tables')
                .select('table_number')
                .eq('id', tableId)
                .maybeSingle();

            if (tableData) setTableName(`Table ${tableData.table_number}`);

            const [catRes, itemRes] = await Promise.all([
                supabase
                    .from('menu_categories')
                    .select('*')
                    .eq('restaurant_id', restaurant.id)
                    .order('position'),
                supabase
                    .from('menu_items')
                    .select('*')
                    .eq('restaurant_id', restaurant.id)
                    .order('name'),
            ]);

            if (catRes.data) setCategories(catRes.data);
            if (itemRes.data) setItems(itemRes.data);
        } catch (err) {
            console.error('Error fetching menu:', err);
            setError('Failed to load menu');
        } finally {
            setLoading(false);
        }
    }, [slug, tableId, supabase]);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    // Realtime order tracking
    useEffect(() => {
        if (!currentOrder) return;

        const channel = supabase
            .channel(`order-${currentOrder.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${currentOrder.id}`,
                },
                (payload) => {
                    setCurrentOrder((prev) => prev ? { ...prev, ...payload.new } : null);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentOrder?.id, supabase]);

    // Check if feedback already exists
    useEffect(() => {
        const checkFeedback = async () => {
            if (!currentOrder || currentOrder.status !== 'ready') return;
            const { data } = await supabase
                .from('order_feedback')
                .select('id')
                .eq('order_id', currentOrder.id)
                .maybeSingle();
            if (data) setSubmitted(true);
        };
        checkFeedback();
    }, [currentOrder?.id, currentOrder?.status, supabase]);

    // Countdown logic
    const getRemainingSeconds = useCallback(() => {
        if (!currentOrder || cancelTimeLimit === 0) return 0;
        const orderTime = new Date(currentOrder.created_at + 'Z').getTime();
        const now = new Date().getTime();
        const secondsPassed = (now - orderTime) / 1000;
        const limitSeconds = cancelTimeLimit * 60;
        return Math.max(0, limitSeconds - secondsPassed);
    }, [currentOrder, cancelTimeLimit]);

    useEffect(() => {
        if (!currentOrder || currentOrder.status !== 'pending' || cancelTimeLimit === 0) {
            setTimeLeft(0);
            return;
        }

        const initial = getRemainingSeconds();
        setTimeLeft(initial);
        if (initial <= 0) return;

        const timer = setInterval(() => {
            const remaining = getRemainingSeconds();
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [currentOrder?.id, currentOrder?.status, cancelTimeLimit, getRemainingSeconds]);

    const canCancel = () => {
        if (!currentOrder || currentOrder.status !== 'pending') return false;
        if (cancelTimeLimit === 0) return false;
        return getRemainingSeconds() > 0;
    };

    const addToCart = (item: MenuItem) => {
        if (!item.is_available) return;
        setCart((prev) => {
            const existing = prev.find((c) => c.menuItem.id === item.id);
            if (existing) {
                return prev.map((c) =>
                    c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
                );
            }
            return [...prev, { menuItem: item, quantity: 1 }];
        });
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart((prev) => {
            return prev
                .map((c) => {
                    if (c.menuItem.id === itemId) {
                        const newQty = c.quantity + delta;
                        return newQty >= 0 ? { ...c, quantity: newQty } : c;
                    }
                    return c;
                })
                .filter((c) => c.quantity > 0);
        });
    };

    const cartTotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
    const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

    const placeOrder = async () => {
        if (!restaurantId || !customerName.trim() || cart.length === 0) return;
        setPlacing(true);

        try {
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    restaurant_id: restaurantId,
                    table_id: tableId,
                    customer_name: customerName.trim(),
                    status: 'pending',
                    total: cartTotal,
                })
                .select()
                .single();

            if (orderError) throw orderError;

            const orderItems = cart.map((c) => ({
                order_id: order.id,
                menu_item_id: c.menuItem.id,
                item_name: c.menuItem.name,
                quantity: c.quantity,
                price: c.menuItem.price,
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;

            setCurrentOrder({ ...order, order_items: orderItems });
            setCart([]);
            setCartOpen(false);
            setNameModalOpen(false);
        } catch (err) {
            console.error('Error placing order:', err);
        } finally {
            setPlacing(false);
        }
    };

    const cancelOrder = async () => {
        if (!currentOrder || currentOrder.status !== 'pending') return;
        if (!canCancel()) {
            alert('Cancel window has closed.');
            return;
        }
        setCancelling(true);

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', currentOrder.id);

            if (error) throw error;
            setCurrentOrder((prev) => prev ? { ...prev, status: 'cancelled' as OrderStatus } : null);
            setShowCancelConfirm(false);
        } catch (err) {
            console.error('Error cancelling order:', err);
        } finally {
            setCancelling(false);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!currentOrder || rating === 0) return;
        setFeedbackLoading(true);
        try {
            const { error } = await supabase
                .from('order_feedback')
                .insert({
                    order_id: currentOrder.id,
                    restaurant_id: restaurantId,
                    rating: rating,
                    comment: comment.trim() || null
                });
            if (error) throw error;
            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting feedback:', err);
        } finally {
            setFeedbackLoading(false);
        }
    };

    const filteredItems = selectedCategory
        ? items.filter((i) => i.category_id === selectedCategory)
        : items;

    const getCartQuantity = (itemId: string) => {
        const found = cart.find((c) => c.menuItem.id === itemId);
        return found?.quantity || 0;
    };

    const getCurrentStepIndex = () => {
        if (!currentOrder) return -1;
        // Map completed to ready for tracking steps
        const status = currentOrder.status === 'completed' ? 'ready' : currentOrder.status;
        return statusSteps.findIndex((s) => s.key === status);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-saffron mx-auto mb-4" />
                    <p className="text-text-muted font-outfit animate-pulse">Loading Menu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center p-6">
                <div className="text-center bg-dark-2 border border-saffron/10 p-10 rounded-[32px] shadow-2xl">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-fraunces text-text-main mb-2">Oops!</h2>
                    <p className="text-text-muted font-outfit">{error}</p>
                </div>
            </div>
        );
    }

    // Success & Tracker View
    if (currentOrder) {
        const stepIndex = getCurrentStepIndex();
        const isCancelled = currentOrder.status === 'cancelled';
        const isCompleted = currentOrder.status === 'completed';

        return (
            <div className="min-h-screen bg-dark flex flex-col items-center p-6 pt-12 animate-fade-in relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-saffron/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-saffron/5 blur-[120px] rounded-full" />

                {!isCancelled && !isCompleted ? (
                    <div className="w-full max-w-md text-center">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pop-in">
                            <Check className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-fraunces text-text-main mb-2 tracking-tight">Order Placed!</h2>
                        <p className="text-text-muted font-outfit mb-8">We'll notify you when it's ready.</p>

                        <div className="bg-dark-2 border border-white/5 rounded-2xl p-4 mb-10 flex items-center justify-between shadow-xl">
                            <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Order ID</span>
                            <span className="font-mono text-sm text-saffron uppercase tracking-wider">{currentOrder.id.slice(0, 8)}</span>
                        </div>

                        {/* Tracker */}
                        <div className="relative mb-12 py-4">
                            <div className="flex items-center justify-between mb-2 px-2">
                                {statusSteps.map((step, idx) => {
                                    const isActive = idx <= stepIndex;
                                    const isCurrent = idx === stepIndex;
                                    const StepIcon = step.icon;

                                    return (
                                        <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                                                isActive 
                                                    ? 'bg-saffron border-saffron text-white shadow-[0_0_20px_rgba(244,98,42,0.3)]' 
                                                    : 'bg-dark-2 border-white/10 text-text-muted'
                                                } ${isCurrent ? 'ring-saffron/20 animate-pulse' : ''}`}>
                                                <StepIcon className="w-5 h-5" />
                                            </div>
                                            <p className={`text-[9px] font-black tracking-widest uppercase mt-4 ${isActive ? 'text-text-main' : 'text-text-muted opacity-50'}`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Line Connector */}
                            <div className="absolute top-[28px] left-[12%] right-[12%] h-0.5 bg-white/5 z-0">
                                <div className="h-full bg-saffron transition-all duration-1000 ease-out" style={{ width: `${(stepIndex / (statusSteps.length - 1)) * 100}%` }} />
                            </div>
                        </div>

                        {/* Message */}
                        <div className="bg-dark-2/80 backdrop-blur-md rounded-3xl p-6 border border-white/5 mb-8 shadow-2xl">
                            <p className="text-text-main font-medium text-lg leading-relaxed">
                                {currentOrder.status === 'pending' && "Waiting for restaurant to confirm..."}
                                {currentOrder.status === 'accepted' && "Your order is confirmed! 🎉"}
                                {currentOrder.status === 'preparing' && "Chef is cooking your food 👨🍳"}
                                {currentOrder.status === 'ready' && "Your food is ready! Enjoy 🍽️"}
                            </p>
                        </div>

                        {currentOrder.status === 'pending' && (
                            <div className="w-full max-w-sm mx-auto bg-dark-2/50 border border-white/5 rounded-[24px] p-5 shadow-inner">
                                {cancelTimeLimit === 0 ? (
                                    <div className="flex items-center justify-center gap-3 text-text-muted opacity-60">
                                        <XCircle className="w-5 h-5 text-red-500/50" />
                                        <p className="text-xs font-medium">Orders cannot be cancelled here</p>
                                    </div>
                                ) : timeLeft > 0 ? (
                                    <div className="space-y-4">
                                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 15 ? 'bg-red-500' : 'bg-saffron'}`}
                                                style={{ width: `${(timeLeft / (cancelTimeLimit * 60)) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-text-muted animate-pulse">
                                            ⏱ <span className="text-text-main">{Math.ceil(timeLeft)}s</span> left to cancel
                                        </p>
                                        <button 
                                            onClick={() => setShowCancelConfirm(true)} 
                                            className="w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold text-xs transition-all tracking-wide"
                                        >
                                            Cancel Order
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-3 text-text-muted opacity-60">
                                        <Clock className="w-5 h-5" />
                                        <p className="text-xs font-medium">Cancellation window closed</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Feedback Section */}
                        {currentOrder.status === 'ready' && (
                            <div className="feedback-section mt-10 animate-fade-in text-left">
                                {/* Payment Instruction */}
                                <div className="payment-box">
                                    <span style={{ fontSize: '24px' }}>💵</span>
                                    <div>
                                        <strong>Counter Par Payment Karein</strong>
                                        <p>Khana enjoy karne ke baad counter par payment karein</p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="divider">
                                    <span>Aapka feedback</span>
                                </div>

                                {!submitted ? (
                                    <>
                                        {/* Star Rating */}
                                        <div className="rating-section mb-6">
                                            <p className="rating-title mb-4">Khana kaisa laga? ⭐</p>
                                            <div className="stars flex justify-center gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        className={`star-btn text-4xl ${rating >= star ? 'active text-saffron' : 'text-white/10'}`}
                                                        onClick={() => setRating(star)}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                            {rating > 0 && (
                                                <p className="rating-label text-center mt-3 font-bold text-saffron">
                                                    {rating === 1 && '😞 Bahut Bura'}
                                                    {rating === 2 && '😕 Theek Nahi'}
                                                    {rating === 3 && '😊 Theek Tha'}
                                                    {rating === 4 && '😄 Achha Tha'}
                                                    {rating === 5 && '🤩 Bahut Achha!'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Comment */}
                                        <textarea
                                            className="feedback-input w-full bg-dark border border-white/5 rounded-2xl p-4 text-white text-sm outline-none focus:border-saffron/30 transition-all"
                                            placeholder="Koi suggestion ya comment? (optional)"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows={3}
                                        />

                                        {/* Submit */}
                                        <button
                                            className="submit-feedback-btn w-full mt-6 py-4 bg-saffron text-white rounded-full font-bold shadow-lg shadow-saffron/20 disabled:opacity-50"
                                            onClick={handleSubmitFeedback}
                                            disabled={rating === 0 || feedbackLoading}
                                        >
                                            {feedbackLoading ? 'Submitting...' : rating === 0 ? 'Pehle Rating Do ⭐' : 'Feedback Submit Karo →'}
                                        </button>

                                        {/* Skip */}
                                        <button
                                            className="skip-btn w-full mt-4 text-text-muted hover:text-white transition-colors"
                                            onClick={() => setSubmitted(true)}
                                        >
                                            Skip karo
                                        </button>
                                    </>
                                ) : (
                                    /* Thank You Screen */
                                    <div className="thankyou-screen text-center py-6 animate-pop-in">
                                        <div className="thankyou-icon text-5xl mb-4">🙏</div>
                                        <h3 className="thankyou-title text-2xl font-fraunces text-white mb-2 tracking-tight">Shukriya!</h3>
                                        <p className="thankyou-message text-text-muted">
                                            {thankYouMessage || 'Khana enjoy kiya? Dobara aana! Aur payment counter par karein. 🙏'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full max-w-md text-center py-10">
                        {isCancelled ? (
                           <div className="animate-pop-in">
                               <XCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
                               <h2 className="text-3xl font-fraunces text-text-main mb-2 tracking-tight">Order Cancelled</h2>
                               <p className="text-text-muted font-outfit mb-8">Aapka order cancel kar diya gaya hai.</p>
                           </div>
                        ) : (
                            <div className="animate-pop-in">
                                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                                <h2 className="text-3xl font-fraunces text-text-main mb-2 tracking-tight">Enjoy your meal!</h2>
                                <p className="text-text-muted font-outfit mb-8">Thanks for ordering with us. Hope you loved it!</p>
                            </div>
                        )}
                        <button onClick={() => setCurrentOrder(null)} className="w-full py-4 bg-saffron text-white rounded-2xl font-black text-lg shadow-xl shadow-saffron/20 transition-all hover:scale-[1.02] active:scale-95">
                            Place Another Order
                        </button>
                    </div>
                )}

                {/* Cancel Confirmation Modal */}
                {showCancelConfirm && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
                        <div className="relative w-full max-w-sm bg-dark-2 border border-white/10 rounded-[32px] p-8 shadow-2xl animate-pop-in text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-fraunces text-white mb-2">Cancel Order?</h3>
                            <p className="text-text-muted text-sm leading-relaxed mb-8">
                                This action cannot be undone. Are you sure you want to cancel this order?
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={cancelOrder}
                                    disabled={cancelling}
                                    className="w-full py-4 bg-red-500 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                >
                                    {cancelling ? 'Processing...' : 'Yes, Cancel Now'}
                                </button>

                                <button 
                                    onClick={() => setShowCancelConfirm(false)} 
                                    className="w-full py-4 text-text-muted font-bold text-sm hover:text-white transition-colors"
                                >
                                    No, Keep It
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Main Menu Page View
    return (
        <div className="min-h-screen bg-dark font-outfit text-text-main pb-32">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-dark/90 backdrop-blur-xl border-b border-saffron/15 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-dark-2 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {restaurantLogo ? (
                            <img src={restaurantLogo} alt={restaurantName} className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-lg">🍽️</span>
                        )}
                    </div>
                    <h1 className="text-xl font-fraunces font-bold text-white tracking-tight">{restaurantName}</h1>
                </div>
                <div className="bg-dark-2 border border-saffron/20 rounded-xl px-4 py-1.5 shadow-inner">
                    <p className="text-[11px] font-black uppercase text-saffron tracking-widest">{tableName}</p>
                </div>
            </header>

            {/* Category Scroll */}
            <div className="sticky top-[73px] z-20 bg-dark border-b border-saffron/15 overflow-x-auto no-scrollbar scroll-smooth">
                <div className="flex items-center whitespace-nowrap min-w-full">
                    <button 
                        onClick={() => {
                            setSelectedCategory(null);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`px-6 py-4 text-sm font-medium transition-all relative ${!selectedCategory ? 'text-white' : 'text-text-muted hover:text-white'}`}
                    >
                        {!selectedCategory && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-saffron rounded-t-full shadow-[0_-2px_8px_rgba(244,98,42,0.4)]" />}
                        All Items
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            ref={(el) => { categoryRefs.current[cat.id] = el }}
                            onClick={() => {
                                setSelectedCategory(cat.id);
                                categoryRefs.current[cat.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                            }}
                            className={`px-6 py-4 text-sm font-medium transition-all relative ${selectedCategory === cat.id ? 'text-white' : 'text-text-muted hover:text-white'}`}
                        >
                            {selectedCategory === cat.id && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-saffron rounded-t-full shadow-[0_-2px_8px_rgba(244,98,42,0.4)]" />}
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu List */}
            <div className="p-5 space-y-4 max-w-lg mx-auto">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-20 px-10">
                        <div className="w-20 h-20 rounded-3xl bg-dark-2 border border-white/5 flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">🍽️</span>
                        </div>
                        <h3 className="text-xl font-fraunces mb-2">No items here yet</h3>
                        <p className="text-text-muted text-sm leading-relaxed">Try switching to another category to see what's cooking!</p>
                    </div>
                ) : (
                    filteredItems.map((item) => {
                        const qty = getCartQuantity(item.id);
                        return (
                            <div key={item.id} className={`flex items-start justify-between bg-dark-2 border border-saffron/12 rounded-2xl p-4 shadow-xl transition-all ${!item.is_available ? 'opacity-45' : ''}`}>
                                <div className="flex-1 pr-4 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-[15px] font-medium text-white truncate">{item.name}</h4>
                                        {!item.is_available && (
                                            <span className="bg-white/10 text-white/50 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">Unavailable</span>
                                        )}
                                    </div>
                                    <p className="text-[13px] text-text-muted line-clamp-2 leading-relaxed mb-4">{item.description}</p>
                                    <p className="text-xl font-fraunces text-saffron leading-none">₹{item.price}</p>
                                </div>

                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-20 h-20 rounded-xl bg-dark-3 border border-white/5 overflow-hidden shadow-inner flex items-center justify-center text-3xl">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            "🍽️"
                                        )}
                                    </div>
                                    
                                    {item.is_available && (
                                        qty === 0 ? (
                                            <button 
                                                onClick={() => addToCart(item)}
                                                className="w-full py-1.5 px-6 rounded-lg bg-saffron text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-saffron/20 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                Add
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-4 text-saffron">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 bg-saffron/10 rounded-lg hover:bg-saffron/20 transition-all">
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="text-sm font-bold w-4 text-center text-white">{qty}</span>
                                                <button onClick={() => addToCart(item)} className="p-1.5 bg-saffron/10 rounded-lg hover:bg-saffron/20 transition-all">
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Floating Cart Bar */}
            {cart.length > 0 && !cartOpen && (
                <div className="fixed bottom-0 left-0 right-0 z-40 p-4 animate-slide-up">
                    <button 
                        onClick={() => setCartOpen(true)}
                        className="max-w-md mx-auto w-full bg-saffron text-white flex items-center justify-between p-4 px-6 rounded-2xl shadow-[0_8px_32px_rgba(244,98,42,0.4)] transition-all hover:scale-[1.02] active:scale-98"
                    >
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="w-5 h-5" />
                            <span className="font-bold text-sm tracking-wide">{cartCount} items</span>
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest">View Cart</span>
                        <span className="font-fraunces text-lg">₹{cartTotal}</span>
                    </button>
                </div>
            )}

            {/* Cart Drawer */}
            {cartOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => setCartOpen(false)} />
                    <div className="relative w-full max-w-lg mx-auto bg-dark-2 rounded-t-[32px] overflow-hidden max-h-[85vh] animate-slide-up flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                        {/* Header */}
                        <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-2xl font-fraunces text-white">Your Order</h3>
                            <button onClick={() => setCartOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-muted hover:text-white transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                            {cart.map((cartItem) => (
                                <div key={cartItem.menuItem.id} className="flex items-center gap-5 group">
                                    <div className="w-16 h-16 rounded-xl bg-dark-3 overflow-hidden shrink-0">
                                        {cartItem.menuItem.image_url ? (
                                            <img src={cartItem.menuItem.image_url} alt={cartItem.menuItem.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-medium text-[15px] mb-2">{cartItem.menuItem.name}</h4>
                                        <div className="flex items-center gap-4 text-saffron">
                                            <button onClick={() => updateQuantity(cartItem.menuItem.id, -1)} className="p-1 bg-saffron/10 rounded-md">
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center text-white">{cartItem.quantity}</span>
                                            <button onClick={() => addToCart(cartItem.menuItem)} className="p-1 bg-saffron/10 rounded-md">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <p className="text-lg font-fraunces text-gold">₹{cartItem.menuItem.price * cartItem.quantity}</p>
                                        <button onClick={() => updateQuantity(cartItem.menuItem.id, -cartItem.quantity)} className="text-text-muted hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-dark/50 border-t border-white/5 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-medium text-text-muted">Total</span>
                                <span className="text-3xl font-fraunces text-white">₹{cartTotal}</span>
                            </div>
                            <button 
                                onClick={() => {
                                    setCartOpen(false);
                                    setNameModalOpen(true);
                                }}
                                className="w-full py-5 bg-saffron text-white rounded-2xl font-black text-xl shadow-xl shadow-saffron/30 hover:bg-saffron-light transition-all hover:scale-[1.02] active:scale-95"
                            >
                                Place Order →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Name Input Modal */}
            {nameModalOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="relative w-full max-w-md bg-dark-2 border border-white/10 rounded-[32px] p-8 shadow-2xl animate-pop-in">
                        <User className="w-12 h-12 text-saffron mx-auto mb-6" />
                        <h3 className="text-2xl font-fraunces text-white text-center mb-2">Almost there!</h3>
                        <p className="text-text-muted text-center mb-8">What should we call you?</p>

                        <div className="space-y-6">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    autoFocus
                                    className="w-full px-6 py-4 rounded-xl bg-dark border border-white/10 focus:border-saffron outline-none text-white font-medium text-center transition-all"
                                />
                            </div>

                            <button
                                onClick={placeOrder}
                                disabled={placing || !customerName.trim()}
                                className="w-full py-4 bg-saffron text-white rounded-xl font-black text-lg shadow-lg shadow-saffron/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            >
                                {placing ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Confirm Order →'}
                            </button>

                            <button onClick={() => setNameModalOpen(false)} className="w-full py-2 text-text-muted font-bold text-sm hover:text-white transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
