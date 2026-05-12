'use client';

import { useState, useRef } from 'react';
import { MenuCategory, MenuItem, CartItem } from '@/lib/types';
import { Plus, Minus, ShoppingCart, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TemplateProps {
    categories: MenuCategory[];
    items: MenuItem[];
    cart: CartItem[];
    addToCart: (item: MenuItem) => void;
    updateQuantity: (itemId: string, delta: number) => void;
    restaurantName: string;
    restaurantLogo: string | null;
    tableName: string;
    isPremium: boolean;
    planTier: string;
    setCartOpen: (open: boolean) => void;
}

export default function DefaultTemplate({
    categories,
    items,
    cart,
    addToCart,
    updateQuantity,
    restaurantName,
    restaurantLogo,
    tableName,
    isPremium,
    planTier,
    setCartOpen
}: TemplateProps & { setCartOpen: (open: boolean) => void }) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const categoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    const filteredItems = selectedCategory
        ? items.filter((i) => i.category_id === selectedCategory)
        : items;

    const getCartQuantity = (itemId: string) => {
        const found = cart.find((c) => c.menuItem.id === itemId);
        return found?.quantity || 0;
    };

    const cartTotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
    const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

    return (
        <div className="min-h-screen bg-dark font-outfit text-text-main pb-32">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-dark/90 backdrop-blur-xl border-b border-saffron/15 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-dark-2 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {restaurantLogo ? (
                            <img src={restaurantLogo} alt={restaurantName} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                            <span className="text-lg">🍽️</span>
                        )}
                    </div>
                    <h1 className="text-xl font-fraunces font-bold text-white tracking-tight">{restaurantName}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {(!isPremium || planTier === 'starter') && (
                        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 shadow-inner">
                            <p className="text-[11px] font-black uppercase text-text-muted tracking-widest">View Only</p>
                        </div>
                    )}
                    <div className="bg-dark-2 border border-saffron/20 rounded-xl px-4 py-1.5 shadow-inner">
                        <p className="text-[11px] font-black uppercase text-saffron tracking-widest">{tableName}</p>
                    </div>
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
                        {!selectedCategory && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-saffron rounded-t-full shadow-[0_-2px_8px_rgba(244,98,42,0.4)]" />}
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
                            {selectedCategory === cat.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-saffron rounded-t-full shadow-[0_-2px_8px_rgba(244,98,42,0.4)]" />}
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu List */}
            <motion.div 
                layout
                className="p-5 space-y-4 max-w-lg mx-auto"
            >
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => {
                        const qty = getCartQuantity(item.id);
                        return (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={item.id} 
                                className={`flex items-start justify-between bg-dark-2 border border-saffron/12 rounded-2xl p-4 shadow-xl transition-all ${!item.is_available ? 'opacity-45' : ''}`}
                            >
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
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            "🍽️"
                                        )}
                                    </div>
                                    
                                    {item.is_available && isPremium && planTier !== 'starter' && (
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
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Floating Cart Bar */}
            {cart.length > 0 && isPremium && planTier !== 'starter' && (
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
        </div>
    );
}
