'use client';

import { useState } from 'react';
import { MenuCategory, MenuItem, CartItem } from '@/lib/types';
import { Plus, Minus, ShoppingCart, Grid } from 'lucide-react';
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

export default function MosaicGrid({
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
        <div className="min-h-screen bg-[#F0F2F5] font-outfit text-[#1A1A1A] pb-32 overflow-hidden">
            {/* Artistic Header */}
            <header className="px-6 py-12">
                <div className="flex flex-col items-center">
                    <motion.div 
                        animate={{ rotate: [0, 90, 180, 270, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 border-4 border-dashed border-saffron/20 rounded-full flex items-center justify-center mb-6"
                    >
                         <div className="w-16 h-16 bg-saffron rounded-2xl rotate-12 flex items-center justify-center text-white text-3xl shadow-lg">
                            {restaurantLogo ? (
                                <img src={restaurantLogo} className="w-full h-full object-contain p-2 -rotate-12" alt="Logo" />
                            ) : (
                                <Grid className="-rotate-12" />
                            )}
                         </div>
                    </motion.div>
                    <h1 className="text-4xl font-fraunces text-center tracking-widest lowercase">{restaurantName}</h1>
                    <div className="bg-white/50 backdrop-blur-md px-6 py-1 rounded-full border border-white text-[10px] font-black uppercase tracking-widest text-saffron">
                        {tableName} Selection
                    </div>
                </div>
            </header>

            {/* Pill Categories */}
            <div className="px-6 py-2 mb-8 overflow-x-auto no-scrollbar scroll-smooth">
                <div className="flex gap-3">
                    {[{ id: null, name: 'All Dishes' }, ...categories].map((cat) => (
                        <button
                            key={cat.id || 'all'}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-8 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${
                                selectedCategory === cat.id 
                                ? 'bg-white text-saffron shadow-xl border border-saffron/10' 
                                : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mosaic Grid */}
            <motion.div 
                layout
                className="px-6 grid grid-cols-2 gap-4 max-w-4xl mx-auto"
            >
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, index) => {
                        const qty = getCartQuantity(item.id);
                        const isLarge = index % 5 === 0;
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={item.id}
                                className={`group relative bg-white rounded-[48px] p-6 flex flex-col shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden ${
                                    isLarge ? 'col-span-2 aspect-video' : 'aspect-square'
                                }`}
                            >
                                <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className={`w-full overflow-hidden rounded-[24px] bg-dark-2 mb-4 relative flex-1`}>
                                    <img 
                                        src={item.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=300&auto=format&fit=crop'} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={item.name}
                                    />
                                    {isLarge && (
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-saffron">
                                            Featured
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="text-sm font-black truncate uppercase tracking-tight">{item.name}</h4>
                                        <span className="text-sm font-bold text-saffron">₹{item.price}</span>
                                    </div>
                                    {isLarge && <p className="text-[11px] text-[#1A1A1A]/50 line-clamp-2 leading-tight pr-10">{item.description}</p>}
                                </div>

                                {/* Hover Add Button Overlay */}
                                <div className="absolute bottom-4 right-4">
                                    {item.is_available && isPremium && planTier !== 'starter' && (
                                        qty === 0 ? (
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => addToCart(item)}
                                                className="w-10 h-10 bg-saffron text-white rounded-2xl flex items-center justify-center shadow-lg shadow-saffron/40"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </motion.button>
                                        ) : (
                                            <div className="flex items-center gap-4 bg-saffron text-white rounded-2xl p-1 shadow-lg">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center">-</button>
                                                <span className="font-black text-xs">{qty}</span>
                                                <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center">+</button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Bubble Cart Bar */}
            {cart.length > 0 && isPremium && planTier !== 'starter' && (
                <div className="fixed bottom-8 left-0 right-0 z-50 px-8 flex justify-center">
                    <button 
                        onClick={() => setCartOpen(true)}
                        className="bg-[#1A1A1A] text-white h-20 rounded-full flex items-center gap-10 px-10 shadow-2xl transition-all hover:scale-[1.05] active:scale-95 border-4 border-white"
                    >
                        <div className="relative">
                            <ShoppingCart className="w-6 h-6" />
                            <span className="absolute -top-2 -right-2 bg-saffron text-white w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center">{cart.length}</span>
                        </div>
                        <div className="h-6 w-px bg-white/20" />
                        <span className="text-2xl font-black italic tracking-tighter">₹{cart.reduce((s,c) => s+c.menuItem.price*c.quantity, 0)}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
