'use client';

import { useEffect, useState, useCallback, use, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { MenuCategory, MenuItem, CartItem, Order, OrderStatus } from '@/lib/types';
import MenuTemplateRenderer from '@/components/MenuTemplateRenderer';
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
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = use(params);
    const { slug } = resolvedParams;

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
    const [tableName, setTableName] = useState('View Only');
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [menuTemplate, setMenuTemplate] = useState('default');
    const [planTier, setPlanTier] = useState<'starter' | 'pro' | 'max'>('pro');
    const [isPremium, setIsPremium] = useState(false);

    const supabase = createClient();

    const fetchMenu = useCallback(async () => {
        try {
            const { data: restaurant, error: restError } = await supabase
                .from('restaurants')
                .select('id, name, logo_url, plan_tier, is_premium, menu_template')
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
            setPlanTier(restaurant.plan_tier || 'pro');
            setIsPremium(restaurant.is_premium || false);
            setMenuTemplate(restaurant.menu_template || 'default');

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
    }, [slug, supabase]);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

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

    return (
        <div className="min-h-screen bg-dark">
            <MenuTemplateRenderer
                template={menuTemplate}
                categories={categories}
                items={items}
                cart={cart}
                addToCart={addToCart}
                updateQuantity={updateQuantity}
                restaurantName={restaurantName}
                restaurantLogo={restaurantLogo}
                tableName={tableName}
                isPremium={isPremium}
                planTier={planTier}
                setCartOpen={setCartOpen}
            />

            {/* View Only Message when cart is opened */}
            {cartOpen && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => setCartOpen(false)} />
                    <div className="relative w-full max-w-lg mx-auto bg-dark-2 rounded-t-[32px] overflow-hidden p-10 animate-slide-up flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] text-center">
                        <div className="w-20 h-20 bg-saffron/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="w-10 h-10 text-saffron" />
                        </div>
                        <h3 className="text-2xl font-fraunces text-white mb-4">View Only Mode</h3>
                        <p className="text-text-muted mb-8 leading-relaxed">
                            You can browse the menu, but to place an order please scan the QR code at your table.
                        </p>
                        <button 
                            onClick={() => setCartOpen(false)}
                            className="w-full py-4 bg-saffron text-white rounded-2xl font-black text-lg shadow-xl shadow-saffron/30 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            Browse Menu
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
