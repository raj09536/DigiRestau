'use client';

import { useState } from 'react';
import { MenuCategory, MenuItem, CartItem } from '@/lib/types';
import { Plus, Minus, ShoppingCart, Utensils } from 'lucide-react';
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

export default function StreetFoodPop({
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
        <div className="min-h-screen bg-[#FFD700] font-bold text-[#E63946] pb-32 overflow-hidden">
            {/* Comic Style Background */}
            <div className="fixed inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            
            {/* Animated Shapes */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="fixed top-[-10%] right-[-10%] w-64 h-64 bg-[#E63946]/10 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="fixed bottom-[-10%] left-[-10%] w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none"
            />

            {/* Header */}
            <header className="px-6 pt-10 pb-6">
                <motion.div 
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 5 }}
                    className="bg-white border-4 border-[#E63946] p-6 rounded-[40px] shadow-[8px_8px_0px_#E63946] relative"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#FFD700] rounded-full border-4 border-[#E63946] flex items-center justify-center text-3xl shadow-inner">
                            {restaurantLogo ? (
                                <img src={restaurantLogo} className="w-full h-full object-contain p-2" alt="Logo" />
                            ) : (
                                "🍔"
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight leading-none">{restaurantName}</h1>
                            <p className="text-xs uppercase mt-1 tracking-widest text-[#E63946]/70">The Best in Town! 🔥</p>
                        </div>
                    </div>
                    {/* Badge */}
                    <div className="absolute top-[-15px] right-[-10px] bg-[#E63946] text-white px-3 py-1 rounded-lg rotate-12 shadow-md text-[10px] font-black uppercase">
                        {tableName}
                    </div>
                </motion.div>
            </header>

            {/* Bouncy Categories */}
            <div className="px-4 py-4 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth">
                {[{ id: null, name: 'ALL' }, ...categories].map((cat) => (
                    <motion.button
                        key={cat.id || 'all'}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all border-4 shadow-[4px_4px_0px_currentColor] ${
                            selectedCategory === cat.id 
                            ? 'bg-[#E63946] text-white border-[#E63946]' 
                            : 'bg-white text-[#E63946] border-[#E63946] hover:bg-white/80'
                        }`}
                    >
                        {cat.name}
                    </motion.button>
                ))}
            </div>

            {/* Menu Popups */}
            <div className="p-6 space-y-8 max-w-lg mx-auto">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, index) => {
                        const qty = getCartQuantity(item.id);
                        return (
                            <motion.div
                                layout
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={{ scale: 1.02 }}
                                key={item.id}
                                className="bg-white border-4 border-[#E63946] rounded-[48px] p-6 flex gap-6 shadow-[10px_10px_0px_#E63946] relative group"
                            >
                                <div className="w-24 h-24 rounded-[32px] border-4 border-[#E63946] overflow-hidden shrink-0 shadow-inner bg-[#FFD700]/20">
                                    <img 
                                        src={item.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&auto=format&fit=crop'} 
                                        className="w-full h-full object-cover"
                                        alt={item.name}
                                    />
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <h4 className="text-xl font-black uppercase truncate leading-none mb-1">{item.name}</h4>
                                    <p className="text-[11px] text-[#E63946]/60 line-clamp-2 leading-tight mb-3">{item.description}</p>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-black italic">₹{item.price}</span>
                                        
                                        {item.is_available && isPremium && planTier !== 'starter' && (
                                            qty === 0 ? (
                                                <button 
                                                    onClick={() => addToCart(item)}
                                                    className="px-6 py-2 bg-[#E63946] text-white rounded-xl text-xs font-black uppercase shadow-md hover:translate-y-[-2px] transition-transform"
                                                >
                                                    Gimme!
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-3 bg-[#E63946] text-white rounded-xl px-2 py-1 shadow-md">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="text-lg">-</button>
                                                    <span className="font-black">{qty}</span>
                                                    <button onClick={() => addToCart(item)} className="text-lg">+</button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                                {/* Sticker Effect */}
                                {index % 3 === 0 && (
                                    <div className="absolute bottom-[-10px] right-[-5px] bg-[#4CAF50] text-white px-2 py-0.5 rounded shadow-md text-[8px] font-black uppercase rotate-[-5deg] pointer-events-none">
                                        BEST SELLER!
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Bouncy Cart Bar */}
            {cart.length > 0 && isPremium && planTier !== 'starter' && (
                <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-6 left-6 right-6 z-50"
                >
                    <button 
                        onClick={() => setCartOpen(true)}
                        className="w-full bg-[#E63946] text-white h-20 rounded-[32px] flex items-center justify-between px-8 shadow-[0_15px_30px_rgba(230,57,70,0.4)] border-4 border-white transition-all hover:scale-[1.05] active:scale-95"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
                                <Utensils className="w-6 h-6 text-[#E63946]" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Ready to eat?</p>
                                <p className="text-sm font-black uppercase">My Munchies ({cart.length})</p>
                            </div>
                        </div>
                        <span className="text-3xl font-black italic">₹{cart.reduce((s,c) => s+c.menuItem.price*c.quantity, 0)}</span>
                    </button>
                </motion.div>
            )}
        </div>
    );
}
