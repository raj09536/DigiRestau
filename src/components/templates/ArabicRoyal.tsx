'use client';

import { useState } from 'react';
import { MenuCategory, MenuItem, CartItem } from '@/lib/types';
import { Plus, Minus, ShoppingCart, Star } from 'lucide-react';
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

export default function ArabicRoyal({
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
        <div className="min-h-screen bg-[#FDF5E6] font-outfit text-[#4A2C2A] pb-32">
            {/* Islamic Pattern Overlay */}
            <div className="fixed inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-exercise.png')]" />

            {/* Lantern Animation */}
            <div className="fixed top-0 left-10 pointer-events-none animate-swing origin-top">
                <div className="w-0.5 h-20 bg-gold/50 mx-auto" />
                <div className="text-3xl mt-[-5px]">🏮</div>
            </div>
            <div className="fixed top-0 right-10 pointer-events-none animate-swing-slow origin-top">
                <div className="w-0.5 h-14 bg-gold/50 mx-auto" />
                <div className="text-3xl mt-[-5px]">🏮</div>
            </div>

            {/* Arch Header */}
            <div className="pt-20 px-8 text-center pb-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative inline-block mb-6"
                >
                    <div className="w-24 h-32 bg-[#4A2C2A] rounded-t-full border-4 border-[#C5A059] flex items-center justify-center overflow-hidden shadow-2xl p-2">
                        {restaurantLogo ? (
                            <img src={restaurantLogo} className="w-full h-full object-contain rounded-t-full" alt="Logo" />
                        ) : (
                            <span className="text-4xl">🕌</span>
                        )}
                    </div>
                </motion.div>
                <h1 className="text-4xl font-fraunces font-bold text-[#4A2C2A] tracking-tight">{restaurantName}</h1>
                <div className="w-32 h-1 bg-[#C5A059] mx-auto mt-4 rounded-full opacity-30" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059] mt-3">Royal Dining Experience</p>
            </div>

            {/* Ornate Category Bar */}
            <div className="sticky top-0 z-30 bg-[#FDF5E6]/90 backdrop-blur-md px-6 py-6 overflow-x-auto no-scrollbar border-b border-[#C5A059]/10">
                <div className="flex gap-4">
                    {[{ id: null, name: 'All' }, ...categories].map((cat) => (
                        <button
                            key={cat.id || 'all'}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-8 py-3 rounded-[32px] text-xs font-black uppercase tracking-widest transition-all relative border-2 ${
                                (selectedCategory === cat.id) 
                                ? 'bg-[#4A2C2A] text-[#FDF5E6] border-[#C5A059]' 
                                : 'border-[#C5A059]/20 text-[#4A2C2A] hover:border-[#C5A059]/50'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu List with Arch Reveals */}
            <div className="px-6 space-y-12 mt-10 max-w-lg mx-auto">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => {
                        const qty = getCartQuantity(item.id);
                        return (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                key={item.id}
                                className="relative bg-white border border-[#C5A059]/20 rounded-[48px] p-8 shadow-xl text-center pt-28 mt-20"
                            >
                                {/* Floating Image in Arch */}
                                <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-48 h-48">
                                     <div className="w-full h-full bg-[#FDF5E6] rounded-t-full border-8 border-white shadow-2xl overflow-hidden relative">
                                        <img 
                                            src={item.image_url || 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=200&auto=format&fit=crop'} 
                                            className="w-full h-full object-cover"
                                            alt={item.name}
                                        />
                                        <div className="absolute inset-0 border-4 border-[#C5A059]/10 rounded-t-full pointer-events-none" />
                                     </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-2xl font-fraunces font-bold text-[#4A2C2A]">{item.name}</h4>
                                    <p className="text-sm text-[#4A2C2A]/60 leading-relaxed italic">"{item.description}"</p>
                                    <div className="flex items-center justify-center gap-4 py-4">
                                        <div className="h-px flex-1 bg-[#C5A059]/20" />
                                        <p className="text-2xl font-fraunces font-black text-[#C5A059]">₹{item.price}</p>
                                        <div className="h-px flex-1 bg-[#C5A059]/20" />
                                    </div>
                                    
                                    <div className="pt-2">
                                        {item.is_available && isPremium && planTier !== 'starter' && (
                                            qty === 0 ? (
                                                <button 
                                                    onClick={() => addToCart(item)}
                                                    className="px-12 py-3 bg-[#4A2C2A] text-white rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg hover:bg-[#633B39] transition-all"
                                                >
                                                    Select
                                                </button>
                                            ) : (
                                                <div className="flex items-center justify-center gap-8 bg-[#4A2C2A]/5 rounded-full px-4 py-2 border border-[#C5A059]/20">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="text-xl font-bold text-[#4A2C2A]">-</button>
                                                    <span className="text-lg font-black text-[#4A2C2A]">{qty}</span>
                                                    <button onClick={() => addToCart(item)} className="text-xl font-bold text-[#4A2C2A]">+</button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Cart Button */}
            {cart.length > 0 && isPremium && planTier !== 'starter' && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
                    <button 
                        onClick={() => setCartOpen(true)}
                        className="w-full bg-[#4A2C2A] text-white py-5 rounded-[32px] flex items-center justify-between px-10 shadow-[0_20px_40px_rgba(74,44,42,0.4)] border-2 border-[#C5A059]/30"
                    >
                        <span className="font-black text-[10px] uppercase tracking-[0.3em]">Checkout</span>
                        <div className="flex items-center gap-4">
                             <div className="h-6 w-px bg-white/20" />
                             <span className="text-2xl font-fraunces font-bold text-[#C5A059]">₹{cartTotal}</span>
                        </div>
                    </button>
                </div>
            )}

            <style jsx>{`
                @keyframes swing {
                    0% { transform: rotate(-5deg); }
                    100% { transform: rotate(5deg); }
                }
                .animate-swing {
                    animation: swing 3s ease-in-out infinite alternate;
                }
                .animate-swing-slow {
                    animation: swing 4.5s ease-in-out infinite alternate;
                }
            `}</style>
        </div>
    );
}
