'use client';

import { useState } from 'react';
import { MenuCategory, MenuItem, CartItem } from '@/lib/types';
import { Plus, Minus, ShoppingCart, Award } from 'lucide-react';
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

export default function LuxuryGold({
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

    const cartTotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);

    return (
        <div className="min-h-screen bg-[#000000] font-fraunces text-[#C5A059] pb-32">
            {/* Elegant Noise Texture */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]" />

            {/* Header */}
            <header className="px-8 py-20 text-center relative">
                <div className="absolute top-0 left-0 right-0 h-40 bg-linear-to-b from-[#C5A059]/10 to-transparent pointer-events-none" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 border-2 border-[#C5A059] rounded-full p-1 rotate-45 group">
                            <div className="w-full h-full border border-[#C5A059] rounded-full flex items-center justify-center -rotate-45 overflow-hidden">
                                {restaurantLogo ? (
                                    <img src={restaurantLogo} className="w-full h-full object-contain p-2" alt="Logo" referrerPolicy="no-referrer" />
                                ) : (
                                    <Award className="w-10 h-10" />
                                )}
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white uppercase">{restaurantName}</h1>
                    <div className="flex items-center justify-center gap-4 text-[9px] font-bold uppercase tracking-[0.5em] text-[#C5A059]/60">
                        <div className="w-8 h-px bg-[#C5A059]/30" />
                        <span>Experience the Finest</span>
                        <div className="w-8 h-px bg-[#C5A059]/30" />
                    </div>
                </motion.div>
            </header>

            {/* Premium Category Bar */}
            <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-y border-[#C5A059]/10 px-6 py-8 overflow-x-auto no-scrollbar">
                <div className="flex justify-center gap-12 whitespace-nowrap min-w-max mx-auto">
                    {[{ id: null, name: 'Overview' }, ...categories].map((cat) => (
                        <button
                            key={cat.id || 'all'}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
                                selectedCategory === cat.id ? 'text-white' : 'text-[#C5A059]/40 hover:text-[#C5A059]'
                            }`}
                        >
                            {cat.name}
                            {selectedCategory === cat.id && (
                                <motion.div 
                                    layoutId="goldUnderline"
                                    className="absolute -bottom-2 left-0 right-0 h-px bg-[#C5A059]"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Luxury Menu List */}
            <div className="px-8 space-y-12 mt-12 max-w-2xl mx-auto">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, index) => {
                        const qty = getCartQuantity(item.id);
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={item.id}
                                className="group grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                            >
                                <div className="md:col-span-4 relative">
                                    <div className="aspect-square bg-dark-2 overflow-hidden border border-[#C5A059]/20 group-hover:border-[#C5A059] transition-all duration-700">
                                        <img 
                                            src={item.image_url || 'https://images.unsplash.com/photo-1546202983-593440ca4444?q=80&w=200&auto=format&fit=crop'} 
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                            alt={item.name}
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b border-r border-[#C5A059] opacity-0 group-hover:opacity-100 transition-all duration-1000" />
                                </div>
                                <div className="md:col-span-8 flex flex-col items-center md:items-start text-center md:text-left">
                                    <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-[#C5A059] transition-colors">{item.name}</h4>
                                    <p className="text-sm text-[#C5A059]/40 font-outfit font-light italic mb-6 line-clamp-2 leading-relaxed tracking-wide">
                                        "{item.description}"
                                    </p>
                                    <div className="flex items-center gap-8">
                                        <span className="text-2xl font-bold tracking-widest text-[#C5A059]">₹{item.price}</span>
                                        
                                        {item.is_available && isPremium && planTier !== 'starter' && (
                                            <div className="h-10">
                                                {qty === 0 ? (
                                                    <button 
                                                        onClick={() => addToCart(item)}
                                                        className="px-8 h-full border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#C5A059] hover:text-black transition-all"
                                                    >
                                                        Reserve
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-6 h-full border border-[#C5A059] px-4">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="text-lg opacity-50 hover:opacity-100">-</button>
                                                        <span className="text-sm font-bold w-4 text-center">{qty}</span>
                                                        <button onClick={() => addToCart(item)} className="text-lg opacity-50 hover:opacity-100">+</button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Luxury Cart Bar */}
            {cart.length > 0 && isPremium && planTier !== 'starter' && (
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed bottom-10 left-10 right-10 flex justify-center z-50"
                >
                    <button 
                        onClick={() => setCartOpen(true)}
                        className="bg-[#C5A059] text-black px-12 h-20 flex items-center gap-12 shadow-[0_20px_60px_rgba(197,160,89,0.3)] hover:scale-[1.02] active:scale-98 transition-all relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Selection</p>
                            <p className="text-lg font-bold uppercase">{cart.length} Fine Dishes</p>
                        </div>
                        <div className="w-px h-8 bg-black/10" />
                        <span className="text-3xl font-black italic">₹{cartTotal}</span>
                    </button>
                </motion.div>
            )}
        </div>
    );
}
