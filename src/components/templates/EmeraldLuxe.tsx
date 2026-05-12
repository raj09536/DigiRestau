'use client';

import { useState, useRef } from 'react';
import { MenuCategory, MenuItem, CartItem } from '@/lib/types';
import { Plus, Minus, ShoppingCart, Search, Leaf } from 'lucide-react';
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

export default function EmeraldLuxe({
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
        <div className="min-h-screen bg-[#0A2E28] font-outfit text-white pb-32">
            {/* Elegant Background Texture */}
            <div className="fixed inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />

            {/* Hero Header */}
            <div className="relative h-64 overflow-hidden rounded-b-[60px] shadow-2xl">
                <img 
                    src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop" 
                    className="w-full h-full object-cover brightness-50"
                    alt="Hero"
                />
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0A2E28]/40 to-[#0A2E28]" />
                <div className="absolute bottom-10 left-8 right-8 flex flex-col items-center text-center">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 mb-6 flex items-center justify-center overflow-hidden"
                    >
                        {restaurantLogo ? (
                            <img src={restaurantLogo} className="w-full h-full object-contain p-4" alt="Logo" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">🌿</div>
                        )}
                    </motion.div>
                    <h1 className="text-3xl font-fraunces font-bold tracking-tight text-center">{restaurantName}</h1>
                    <div className="flex gap-2 mt-3">
                         <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                            {tableName}
                         </span>
                         {(!isPremium || planTier === 'starter') && (
                            <span className="px-3 py-1 bg-saffron rounded-full text-[10px] font-black uppercase tracking-widest">
                                View Only
                            </span>
                         )}
                    </div>
                </div>
            </div>

            {/* Premium Category Selector */}
            <div className="sticky top-0 z-30 bg-[#0A2E28]/80 backdrop-blur-xl px-5 py-6 overflow-x-auto no-scrollbar scroll-smooth">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setSelectedCategory(null)}
                        className={`px-6 py-2 rounded-2xl text-sm font-bold transition-all border ${!selectedCategory ? 'bg-saffron border-saffron' : 'border-white/10 hover:border-white/30'}`}
                    >
                        Everything
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-6 py-2 rounded-2xl text-sm font-bold transition-all border ${selectedCategory === cat.id ? 'bg-saffron border-saffron' : 'border-white/10 hover:border-white/30'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Grid */}
            <div className="px-6 py-8 space-y-6 max-w-lg mx-auto">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => {
                        const qty = getCartQuantity(item.id);
                        return (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={item.id}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-3 flex gap-4 hover:bg-white/10 transition-all group"
                            >
                                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative">
                                    <img 
                                        src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop'} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        alt={item.name}
                                    />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
                                </div>
                                
                                <div className="flex-1 py-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-lg font-bold tracking-tight text-white/95 leading-tight">{item.name}</h4>
                                        <p className="text-xl font-fraunces text-saffron pl-4 shrink-0">₹{item.price}</p>
                                    </div>
                                    <p className="text-xs text-white/50 line-clamp-2 font-light leading-relaxed mb-4">{item.description}</p>
                                    
                                    <div className="flex justify-end">
                                        {item.is_available && isPremium && planTier !== 'starter' && (
                                            qty === 0 ? (
                                                <button 
                                                    onClick={() => addToCart(item)}
                                                    className="px-6 py-1.5 bg-white text-[#0A2E28] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-saffron hover:text-white transition-all shadow-lg"
                                                >
                                                    Add
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-4 bg-white/10 rounded-full px-3 py-1 border border-white/10">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-saffron transition-colors">
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-xs font-bold w-4 text-center">{qty}</span>
                                                    <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center rounded-full bg-saffron">
                                                        <Plus className="w-3 h-3" />
                                                    </button>
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

            {/* Fixed Bottom Cart */}
            {cart.length > 0 && isPremium && planTier !== 'starter' && (
                 <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-6 left-6 right-6 z-50"
                 >
                    <button 
                        onClick={() => setCartOpen(true)}
                        className="w-full bg-white text-[#0A2E28] h-16 rounded-[24px] flex items-center justify-between px-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0A2E28] rounded-xl flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-black text-xs uppercase tracking-[0.2em]">View Basket</span>
                        </div>
                        <span className="text-2xl font-fraunces font-bold">₹{cartTotal}</span>
                    </button>
                 </motion.div>
            )}
        </div>
    );
}
