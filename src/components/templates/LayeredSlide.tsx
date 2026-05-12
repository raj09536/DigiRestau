'use client';

import { useState } from 'react';
import { MenuCategory, MenuItem, CartItem } from '@/lib/types';
import { Plus, Minus, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
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

export default function LayeredSlide({
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
    const [catIndex, setCatIndex] = useState(0);
    
    const activeCategory = categories[catIndex] || null;
    const filteredItems = activeCategory
        ? items.filter((i) => i.category_id === activeCategory.id)
        : items;

    const cartTotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);

    return (
        <div className="min-h-screen bg-white font-outfit text-[#1F2937] overflow-hidden flex flex-col">
            {/* Native Style Header */}
            <header className="px-6 pt-12 pb-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{tableName}</p>
                        <h1 className="text-2xl font-bold tracking-tight">{restaurantName}</h1>
                    </div>
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden">
                        {restaurantLogo ? (
                            <img src={restaurantLogo} className="w-full h-full object-contain p-2" alt="Logo" />
                        ) : (
                            "🍽️"
                        )}
                    </div>
                </div>
            </header>

            {/* Horizontal Category Nav */}
            <div className="px-6 py-8 overflow-x-auto no-scrollbar border-b border-gray-50">
                <div className="flex gap-8 whitespace-nowrap">
                    {categories.map((cat, idx) => (
                        <button
                            key={cat.id}
                            onClick={() => setCatIndex(idx)}
                            className={`text-sm font-bold transition-all relative ${
                                catIndex === idx ? 'text-saffron' : 'text-gray-300 hover:text-gray-600'
                            }`}
                        >
                            {cat.name}
                            {catIndex === idx && (
                                <motion.div 
                                    layoutId="slideUnderline"
                                    className="absolute -bottom-2 left-0 right-0 h-1 bg-saffron rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sliding Content Area */}
            <div className="flex-1 relative overflow-hidden bg-gray-50/50">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={catIndex}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-0 p-6 overflow-y-auto no-scrollbar"
                    >
                        <div className="space-y-6 max-w-lg mx-auto">
                            {filteredItems.map((item) => {
                                const qty = cart.find(c => c.menuItem.id === item.id)?.quantity || 0;
                                return (
                                    <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm flex items-center gap-4 group">
                                        <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                                            <img 
                                                src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop'} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                alt={item.name}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-bold text-gray-900 mb-1">{item.name}</h4>
                                            <p className="text-xs text-gray-400 line-clamp-1 mb-2">{item.description}</p>
                                            <p className="text-lg font-bold text-gray-900">₹{item.price}</p>
                                        </div>
                                        
                                        {item.is_available && isPremium && planTier !== 'starter' && (
                                            <div className="flex flex-col items-end gap-2">
                                                {qty === 0 ? (
                                                    <button 
                                                        onClick={() => addToCart(item)}
                                                        className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-saffron transition-colors"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 bg-gray-100 rounded-2xl p-1">
                                                        <button onClick={() => addToCart(item)} className="p-1 hover:text-saffron"><Plus className="w-4 h-4" /></button>
                                                        <span className="text-xs font-black px-2">{qty}</span>
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-saffron"><Minus className="w-4 h-4" /></button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Floating Navigation Controls */}
            <div className="fixed bottom-32 left-0 right-0 flex justify-center gap-4 pointer-events-none">
                {catIndex > 0 && (
                    <button 
                        onClick={() => setCatIndex(catIndex - 1)}
                        className="p-4 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-100 text-gray-400 pointer-events-auto hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                {catIndex < categories.length - 1 && (
                    <button 
                        onClick={() => setCatIndex(catIndex + 1)}
                        className="p-4 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-100 text-gray-400 pointer-events-auto hover:text-gray-900 transition-colors"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Slide Cart Bar */}
            {cart.length > 0 && isPremium && planTier !== 'starter' && (
                <div className="p-6 bg-white border-t border-gray-100 z-50">
                    <button 
                        onClick={() => setCartOpen(true)}
                        className="w-full bg-[#1F2937] text-white h-16 rounded-[20px] flex items-center justify-between px-8 shadow-xl transition-all hover:bg-black active:scale-95"
                    >
                        <span className="font-bold text-sm">{cart.length} Selected</span>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-500 font-medium">|</span>
                            <span className="text-xl font-bold">₹{cartTotal}</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}
