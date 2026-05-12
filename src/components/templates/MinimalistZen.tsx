'use client';

import { useState } from 'react';
import { MenuCategory, MenuItem, CartItem } from '@/lib/types';
import { Plus, Minus, ShoppingCart, Circle } from 'lucide-react';
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

export default function MinimalistZen({
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
}: TemplateProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    
    const filteredItems = selectedCategory
        ? items.filter((i) => i.category_id === selectedCategory)
        : items;

    const getCartQuantity = (itemId: string) => {
        const found = cart.find((c) => c.menuItem.id === itemId);
        return found?.quantity || 0;
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-light text-[#2D3436] pb-32 selection:bg-[#2D3436]/5">
            {/* Header */}
            <header className="px-10 pt-20 pb-12">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="space-y-6"
                >
                    <div className="w-px h-16 bg-[#2D3436]/10 mx-auto" />
                    <h1 className="text-4xl font-fraunces text-center tracking-widest lowercase">{restaurantName}</h1>
                    <div className="flex justify-center gap-10 text-[10px] uppercase tracking-[0.3em] text-[#2D3436]/40 font-bold">
                        <span>{tableName}</span>
                        <span>•</span>
                        <span>Seasonal Menu</span>
                    </div>
                </motion.div>
            </header>

            {/* Subtle Categories */}
            <div className="px-10 py-4 mb-10 overflow-x-auto no-scrollbar border-y border-black/3">
                <div className="flex justify-center gap-12 whitespace-nowrap min-w-max mx-auto">
                    {[{ id: null, name: 'Menu' }, ...categories].map((cat) => (
                        <button
                            key={cat.id || 'all'}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`text-xs font-bold uppercase tracking-[0.2em] transition-all relative py-2 ${
                                selectedCategory === cat.id ? 'text-[#2D3436]' : 'text-[#2D3436]/30 hover:text-[#2D3436]'
                            }`}
                        >
                            {selectedCategory === cat.id && (
                                <motion.div 
                                    layoutId="zenDot"
                                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#2D3436] rounded-full"
                                />
                            )}
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Zen Menu Items */}
            <div className="px-10 space-y-24 max-w-lg mx-auto">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, index) => {
                        const qty = getCartQuantity(item.id);
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.2, delay: index * 0.1 }}
                                key={item.id}
                                className="group flex flex-col items-center text-center"
                            >
                                <div className="w-full aspect-4/5 bg-white rounded-sm overflow-hidden mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-1000">
                                    <img 
                                        src={item.image_url || 'https://images.unsplash.com/photo-1547517023-7ca0c162f816?q=80&w=400&auto=format&fit=crop'} 
                                        className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-2000"
                                        alt={item.name}
                                    />
                                </div>
                                <h4 className="text-2xl font-fraunces mb-3">{item.name}</h4>
                                <p className="text-sm text-[#2D3436]/50 max-w-xs leading-relaxed mb-6 font-medium italic">"{item.description}"</p>
                                <div className="text-lg font-bold tracking-widest mb-8">₹{item.price}</div>
                                
                                {item.is_available && isPremium && planTier !== 'starter' && (
                                    <div className="h-10 flex items-center justify-center min-w-[120px]">
                                        {qty === 0 ? (
                                            <button 
                                                onClick={() => addToCart(item)}
                                                className="text-[10px] font-black uppercase tracking-[0.4em] border-b border-black/20 pb-1 hover:border-black transition-all"
                                            >
                                                Add to Bag
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-10">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="text-xl font-light opacity-30 hover:opacity-100 transition-opacity">-</button>
                                                <span className="text-sm font-bold">{qty}</span>
                                                <button onClick={() => addToCart(item)} className="text-xl font-light opacity-30 hover:opacity-100 transition-opacity">+</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Minimal Cart Bar */}
            {cart.length > 0 && isPremium && planTier !== 'starter' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed bottom-10 left-10 right-10 flex justify-center z-50"
                >
                    <button 
                        onClick={() => setCartOpen(true)}
                        className="bg-white text-[#2D3436] px-10 py-5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-black/5 flex items-center gap-8 hover:bg-[#FDFDFD] transition-all group"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Bag ({cart.length})</span>
                        <div className="w-px h-4 bg-black/10" />
                        <span className="text-lg font-bold tracking-widest">₹{cart.reduce((s,c) => s+c.menuItem.price*c.quantity, 0)}</span>
                    </button>
                </motion.div>
            )}
        </div>
    );
}
