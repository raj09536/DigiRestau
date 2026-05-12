'use client';

import { useState, useMemo } from 'react';
import { MenuCategory, MenuItem, CartItem } from '@/lib/types';
import { Plus, Minus, ShoppingCart, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function FlipBook({
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
    const [page, setPage] = useState(0);
    const [direction, setDirection] = useState(0);

    // Group items by category for pagination
    const pages = useMemo(() => {
        const groups = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            items: items.filter(i => i.category_id === cat.id)
        }));
        // Add cover page
        return [{ id: 'cover', name: 'Menu', items: [] }, ...groups.filter(g => g.items.length > 0)];
    }, [categories, items]);

    const paginate = (newDirection: number) => {
        if (page + newDirection < 0 || page + newDirection >= pages.length) return;
        setDirection(newDirection);
        setPage(page + newDirection);
    };

    const cartTotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);

    const variants = {
        enter: (direction: number) => ({
            rotateY: direction > 0 ? 90 : -90,
            opacity: 0,
        }),
        center: {
            rotateY: 0,
            opacity: 1,
            zIndex: 1,
        },
        exit: (direction: number) => ({
            rotateY: direction < 0 ? 90 : -90,
            opacity: 0,
            zIndex: 0,
        })
    };

    return (
        <div className="min-h-screen bg-[#2C1810] flex items-center justify-center p-4 overflow-hidden font-fraunces">
            {/* Wooden Table Texture */}
            <div className="fixed inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />

            <div className="relative w-full max-w-md h-[85vh] perspective-1000">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            rotateY: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute inset-0 bg-[#F4EBD0] rounded-r-3xl rounded-l-md shadow-2xl overflow-hidden origin-left border-l-4 border-black/10"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        {/* Paper Texture */}
                        <div className="absolute inset-0 opacity-40 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

                        {page === 0 ? (
                            /* COVER PAGE */
                            <div className="h-full flex flex-col items-center justify-center p-10 text-center relative">
                                <div className="absolute inset-4 border-2 border-[#8B4513]/20 rounded-2xl pointer-events-none" />
                                <div className="w-32 h-32 rounded-full bg-[#8B4513]/10 flex items-center justify-center mb-8 border border-[#8B4513]/30">
                                     {restaurantLogo ? (
                                         <img src={restaurantLogo} className="w-full h-full object-contain p-4" alt="Logo" />
                                     ) : (
                                         <BookOpen className="w-16 h-16 text-[#8B4513]" />
                                     )}
                                </div>
                                <h1 className="text-4xl font-bold text-[#8B4513] mb-4">{restaurantName}</h1>
                                <p className="text-[#8B4513]/60 italic">Est. 2024</p>
                                <div className="mt-12 w-20 h-px bg-[#8B4513]/30" />
                                <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-[#8B4513]/40">Scan • Order • Enjoy</p>
                                
                                <button 
                                    onClick={() => paginate(1)}
                                    className="mt-12 px-10 py-3 bg-[#8B4513] text-[#F4EBD0] rounded-full text-sm font-bold shadow-lg"
                                >
                                    Open Menu
                                </button>
                            </div>
                        ) : (
                            /* MENU PAGE */
                            <div className="h-full flex flex-col p-8 relative">
                                <div className="flex items-center justify-between mb-8 border-b border-[#8B4513]/20 pb-4">
                                    <h2 className="text-2xl font-bold text-[#8B4513] truncate pr-4">{pages[page].name}</h2>
                                    <span className="text-[10px] font-bold text-[#8B4513]/40 uppercase tracking-widest">{page} / {pages.length - 1}</span>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-8 no-scrollbar pr-2">
                                    {pages[page].items.map((item) => {
                                        const qty = cart.find(c => c.menuItem.id === item.id)?.quantity || 0;
                                        return (
                                            <div key={item.id} className="relative group">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className="text-lg font-bold text-[#2C1810] flex-1">{item.name}</h3>
                                                    <div className="border-b border-dotted border-[#8B4513]/30 flex-1 mx-2" />
                                                    <p className="text-lg font-bold text-[#8B4513]">₹{item.price}</p>
                                                </div>
                                                <p className="text-xs text-[#8B4513]/70 font-outfit italic mb-3">{item.description}</p>
                                                
                                                {item.is_available && isPremium && planTier !== 'starter' && (
                                                    <div className="flex justify-end">
                                                        {qty === 0 ? (
                                                            <button 
                                                                onClick={() => addToCart(item)}
                                                                className="text-[10px] font-black uppercase tracking-widest text-[#8B4513] border border-[#8B4513]/30 px-4 py-1 rounded-full hover:bg-[#8B4513] hover:text-white transition-all"
                                                            >
                                                                Add
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-4 text-[#8B4513]">
                                                                <button onClick={() => updateQuantity(item.id, -1)} className="text-xl">-</button>
                                                                <span className="font-bold font-outfit">{qty}</span>
                                                                <button onClick={() => addToCart(item)} className="text-xl">+</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between mt-6 pt-4 border-t border-[#8B4513]/10">
                                    <button 
                                        onClick={() => paginate(-1)}
                                        className="p-2 rounded-full bg-[#8B4513]/5 text-[#8B4513]"
                                    >
                                        <ChevronLeft />
                                    </button>
                                    {page < pages.length - 1 && (
                                        <button 
                                            onClick={() => paginate(1)}
                                            className="p-2 rounded-full bg-[#8B4513]/5 text-[#8B4513]"
                                        >
                                            <ChevronRight />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Cart Badge */}
                {cart.length > 0 && isPremium && planTier !== 'starter' && (
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCartOpen(true)}
                        className="fixed bottom-10 right-10 w-16 h-16 bg-[#8B4513] rounded-full flex items-center justify-center text-[#F4EBD0] shadow-2xl z-50 border-4 border-[#F4EBD0]"
                    >
                        <ShoppingCart />
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-[10px] flex items-center justify-center border-2 border-[#F4EBD0]">{cart.length}</span>
                    </motion.button>
                )}
            </div>

            <style jsx>{`
                .perspective-1000 {
                    perspective: 1500px;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #8B451320;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
