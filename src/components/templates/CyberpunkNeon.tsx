'use client';

import { useState } from 'react';
import { MenuCategory, MenuItem, CartItem } from '@/lib/types';
import { Plus, Minus, ShoppingCart, Zap, Terminal } from 'lucide-react';
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

export default function CyberpunkNeon({
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
        <div className="min-h-screen bg-[#050505] font-mono text-cyan-400 pb-32 selection:bg-magenta-500/30 overflow-x-hidden">
            {/* Background Grid */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#00ffff15,transparent)] pointer-events-none" />

            {/* Scanline Effect */}
            <div className="fixed inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%]" />

            {/* Header */}
            <header className="relative z-10 px-8 py-12">
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-6"
                >
                    <div className="w-16 h-16 bg-black border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />
                        {restaurantLogo ? (
                            <img src={restaurantLogo} className="w-full h-full object-contain p-2 relative z-10" alt="Logo" />
                        ) : (
                            <Terminal className="w-8 h-8 text-cyan-500 relative z-10" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white animate-glitch" data-text={restaurantName}>
                            {restaurantName}
                        </h1>
                        <div className="flex gap-4 mt-2">
                            <span className="text-[10px] bg-cyan-500/10 px-2 py-0.5 border border-cyan-500/30">ID: {tableName}</span>
                            <span className="text-[10px] bg-magenta-500/10 px-2 py-0.5 border border-magenta-500/30 text-magenta-500 animate-pulse">STATUS: ACTIVE</span>
                        </div>
                    </div>
                </motion.div>
            </header>

            {/* Neon Categories */}
            <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md px-6 py-4 flex gap-4 overflow-x-auto no-scrollbar border-b border-cyan-900/50">
                {[{ id: null, name: 'ALL_MODULES' }, ...categories].map((cat) => (
                    <button
                        key={cat.id || 'all'}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                            selectedCategory === cat.id 
                            ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]' 
                            : 'border-cyan-900/50 text-cyan-900 hover:text-cyan-500 hover:border-cyan-500'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Menu Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, index) => {
                        const qty = getCartQuantity(item.id);
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                key={item.id}
                                className="relative group"
                            >
                                <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500 to-magenta-500 rounded-none blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                                <div className="relative bg-black border border-cyan-900/50 p-4 flex gap-4 overflow-hidden">
                                    <div className="w-20 h-20 border border-cyan-500/30 shrink-0 relative overflow-hidden">
                                        <img 
                                            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop'} 
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                            alt={item.name}
                                        />
                                        <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-cyan-400 transition-colors truncate">{item.name}</h4>
                                            <span className="text-xs font-bold text-magenta-500">#{item.price}</span>
                                        </div>
                                        <p className="text-[10px] text-cyan-900 line-clamp-2 uppercase leading-tight mb-3 font-bold group-hover:text-cyan-700">{item.description}</p>
                                        
                                        <div className="flex justify-end">
                                            {item.is_available && isPremium && planTier !== 'starter' && (
                                                qty === 0 ? (
                                                    <button 
                                                        onClick={() => addToCart(item)}
                                                        className="px-4 py-1 text-[8px] font-black uppercase border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all"
                                                    >
                                                        Initialize
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-3 text-cyan-500 text-[10px] font-black">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-magenta-500">-</button>
                                                        <span className="text-white">{qty}</span>
                                                        <button onClick={() => addToCart(item)} className="hover:text-magenta-500">+</button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    {/* Corner Accents */}
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-magenta-500/50" />
                                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500/50" />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Neon Cart */}
            {cart.length > 0 && isPremium && planTier !== 'starter' && (
                <div className="fixed bottom-6 left-6 right-6 z-50">
                    <button 
                        onClick={() => setCartOpen(true)}
                        className="w-full bg-cyan-500 text-black py-4 px-8 font-black uppercase text-xs tracking-[0.3em] flex items-center justify-between shadow-[0_0_30px_rgba(6,182,212,0.5)] border-2 border-cyan-400 group"
                    >
                        <span className="flex items-center gap-3">
                            <Zap className="w-4 h-4 fill-black" />
                            Execute Transaction
                        </span>
                        <div className="flex items-center gap-6">
                            <div className="w-px h-4 bg-black/20" />
                            <span className="text-lg">#{cart.reduce((s,c) => s + c.menuItem.price * c.quantity, 0)}</span>
                        </div>
                    </button>
                </div>
            )}

            <style jsx>{`
                .animate-glitch {
                    position: relative;
                }
                .animate-glitch::before,
                .animate-glitch::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: black;
                }
                .animate-glitch::before {
                    left: 2px;
                    text-shadow: -2px 0 #ff00ff;
                    clip: rect(44px, 450px, 56px, 0);
                    animation: glitch-anim 5s infinite linear alternate-reverse;
                }
                .animate-glitch::after {
                    left: -2px;
                    text-shadow: -2px 0 #00ffff;
                    clip: rect(44px, 450px, 56px, 0);
                    animation: glitch-anim2 5s infinite linear alternate-reverse;
                }
                @keyframes glitch-anim {
                    0% { clip: rect(31px, 9999px, 94px, 0); }
                    20% { clip: rect(62px, 9999px, 42px, 0); }
                    40% { clip: rect(16px, 9999px, 78px, 0); }
                    60% { clip: rect(89px, 9999px, 13px, 0); }
                    80% { clip: rect(45px, 9999px, 56px, 0); }
                    100% { clip: rect(27px, 9999px, 88px, 0); }
                }
                @keyframes glitch-anim2 {
                    0% { clip: rect(67px, 9999px, 34px, 0); }
                    20% { clip: rect(12px, 9999px, 91px, 0); }
                    40% { clip: rect(56px, 9999px, 23px, 0); }
                    60% { clip: rect(41px, 9999px, 76px, 0); }
                    80% { clip: rect(98px, 9999px, 12px, 0); }
                    100% { clip: rect(23px, 9999px, 54px, 0); }
                }
            `}</style>
        </div>
    );
}
