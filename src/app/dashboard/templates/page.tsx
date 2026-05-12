'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Layout, Eye, Palette, X, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import MenuTemplateRenderer from '@/components/MenuTemplateRenderer';

const TEMPLATES = [
    { id: 'default', name: 'Modern Saffron', description: 'Clean and professional dark theme.', color: '#F4622A', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400' },
    { id: 'emerald', name: 'Emerald Luxe', description: 'Deep green luxury for fine dining.', color: '#0A2E28', image: 'https://images.unsplash.com/photo-1550966842-2849a2249821?q=80&w=400' },
    { id: 'arabic', name: 'Arabic Royal', description: 'Ornate traditional design with arches.', color: '#4A2C2A', image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=400' },
    { id: 'flipbook', name: 'FlipBook', description: 'Interactive 3D book experience.', color: '#8B4513', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400' },
    { id: 'cyberpunk', name: 'Cyber Neon', description: 'Futuristic tech-style menu.', color: '#00ffff', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400' },
    { id: 'street', name: 'Street Food', description: 'Fun and vibrant pop culture theme.', color: '#E63946', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400' },
    { id: 'minimalist', name: 'Zen Minimal', description: 'High-end simplicity and whitespace.', color: '#2D3436', image: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=400' },
    { id: 'luxury', name: 'Black Gold', description: 'Ultra-premium dark and gold theme.', color: '#C5A059', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400' },
    { id: 'mosaic', name: 'Mosaic Grid', description: 'Artistic dynamic grid layout.', color: '#F4622A', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400' },
    { id: 'slide', name: 'Layered Slide', description: 'Native app-like navigation.', color: '#1F2937', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=400' },
];

const DUMMY_CATEGORIES = [
    { id: '1', name: 'Starters', position: 1, restaurant_id: '1' },
    { id: '2', name: 'Main Course', position: 2, restaurant_id: '1' },
    { id: '3', name: 'Desserts', position: 3, restaurant_id: '1' },
];

const DUMMY_ITEMS = [
    { id: '1', name: 'Truffle Pasta', description: 'Homemade tagliatelle with fresh black truffle and parmesan.', price: 450, category_id: '2', is_available: true, restaurant_id: '1', image_url: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=200' },
    { id: '2', name: 'Wagyu Burger', description: 'Premium wagyu beef with caramelized onions and blue cheese.', price: 890, category_id: '2', is_available: true, restaurant_id: '1', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200' },
    { id: '3', name: 'Garden Salad', description: 'Fresh seasonal greens with lemon vinaigrette.', price: 220, category_id: '1', is_available: true, restaurant_id: '1', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200' },
    { id: '4', name: 'Chocolate Fondant', description: 'Warm melting chocolate cake with vanilla bean ice cream.', price: 350, category_id: '3', is_available: true, restaurant_id: '1', image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=200' },
];

export default function TemplatesPage() {
    const { restaurant, setRestaurant } = useRestaurant();
    const [selected, setSelected] = useState(restaurant?.menu_template || 'default');
    const [previewing, setPreviewing] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (restaurant?.menu_template) {
            setSelected(restaurant.menu_template);
        }
    }, [restaurant?.menu_template]);

    const handleSave = async (id: string) => {
        if (!restaurant) return;
        setSaving(true);
        setSelected(id);

        try {
            const { error } = await supabase
                .from('restaurants')
                .update({ menu_template: id })
                .eq('id', restaurant.id);

            if (error) throw error;
            
            setRestaurant({ ...restaurant, menu_template: id });
            toast.success('Menu template updated successfully!');
            setPreviewing(null);
        } catch (err) {
            console.error('Error updating template:', err);
            toast.error('Failed to update template');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-fraunces font-bold text-white mb-2">Menu Designs</h1>
                    <p className="text-text-muted">Choose a design that matches your restaurant's vibe.</p>
                </div>
                <div className="bg-saffron/10 border border-saffron/20 rounded-2xl px-6 py-3 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-saffron" />
                    <span className="text-sm font-bold text-white">Premium Collection</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TEMPLATES.map((tmpl) => (
                    <motion.div 
                        key={tmpl.id}
                        whileHover={{ y: -5 }}
                        className={`group relative bg-dark-2 border border-white/10 rounded-[40px] overflow-hidden transition-all duration-500 ${
                            selected === tmpl.id ? 'border-saffron shadow-[0_0_30px_rgba(244,98,42,0.2)]' : 'hover:border-white/20'
                        }`}
                    >
                        {/* Preview Image */}
                        <div className="aspect-video relative overflow-hidden">
                            <img src={tmpl.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={tmpl.name} />
                            <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/40 to-black/80" />
                            
                            {selected === tmpl.id && (
                                <div className="absolute top-4 right-4 bg-saffron text-white p-2 rounded-full shadow-lg animate-pop-in">
                                    <Check className="w-5 h-5" />
                                </div>
                            )}

                            <button 
                                onClick={() => setPreviewing(tmpl.id)}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black"
                            >
                                <Eye className="w-6 h-6" />
                            </button>

                            <div className="absolute bottom-6 left-6 right-6">
                                <span className="text-xs font-black uppercase tracking-widest text-white/60">Style</span>
                                <h3 className="text-xl font-bold text-white tracking-tight">{tmpl.name}</h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-sm text-text-muted mb-6 h-10 line-clamp-2 leading-relaxed">
                                {tmpl.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                                <button 
                                    onClick={() => setPreviewing(tmpl.id)}
                                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    Preview
                                </button>
                                
                                <button 
                                    onClick={() => handleSave(tmpl.id)}
                                    disabled={saving || selected === tmpl.id}
                                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        selected === tmpl.id 
                                        ? 'bg-saffron/10 text-saffron border border-saffron/20' 
                                        : 'bg-white text-black hover:bg-saffron hover:text-white shadow-lg'
                                    }`}
                                >
                                    {selected === tmpl.id ? 'Active' : 'Select'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Live Preview Modal */}
            <AnimatePresence>
                {previewing && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-9999 bg-black/98 backdrop-blur-2xl flex flex-col"
                    >
                        {/* BOTTOM CONTROLS - Safer from Header/Sidebar interference */}
                        <div className="fixed bottom-10 left-0 right-0 z-10000 flex justify-center items-center gap-6 px-8">
                            <button 
                                onClick={() => setPreviewing(null)}
                                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-[24px] border border-white/10 transition-all group active:scale-95 shadow-2xl"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-black uppercase tracking-widest">Back to Gallery</span>
                            </button>

                            <button 
                                onClick={() => handleSave(previewing)}
                                className="px-10 py-4 bg-saffron text-white rounded-[24px] text-sm font-black uppercase tracking-widest hover:bg-saffron-light transition-all shadow-2xl shadow-saffron/40 active:scale-95"
                            >
                                Apply This Design
                            </button>
                        </div>

                        {/* Preview Content Area - Mobile Frame Style */}
                        <div className="flex-1 flex flex-col items-center justify-start p-6 pt-48 bg-[radial-gradient(circle_at_center,rgba(244,98,42,0.08)_0%,transparent_100%)] overflow-y-auto no-scrollbar">
                            <div className="mb-12 text-center">
                                <h3 className="text-4xl font-fraunces font-bold text-white mb-2">{TEMPLATES.find(t => t.id === previewing)?.name}</h3>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-2 h-2 bg-saffron rounded-full animate-pulse" />
                                    <p className="text-xs text-text-muted uppercase tracking-[0.3em] font-black">Live Interactive Simulation</p>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-12 pb-32">
                                <motion.div 
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="relative w-[375px] h-[750px] bg-black rounded-[60px] shadow-[0_0_120px_rgba(0,0,0,0.8)] border-8 border-[#1a1a1a] overflow-hidden shrink-0"
                                >
                                    {/* Mobile Notch */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#1a1a1a] rounded-b-3xl z-60" />
                                    
                                    <div className="h-full overflow-y-auto no-scrollbar">
                                        <MenuTemplateRenderer
                                            template={previewing}
                                            categories={DUMMY_CATEGORIES}
                                            items={DUMMY_ITEMS}
                                            cart={[]}
                                            addToCart={() => {}}
                                            updateQuantity={() => {}}
                                            restaurantName={restaurant?.name || 'Your Restaurant'}
                                            restaurantLogo={restaurant?.logo_url || null}
                                            tableName="Table 01"
                                            isPremium={true}
                                            planTier="pro"
                                            setCartOpen={() => {}}
                                        />
                                    </div>
                                </motion.div>
                                
                                {/* Preview Info */}
                                <div className="max-w-xs space-y-6">
                                    <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-md">
                                        <div className="w-12 h-12 bg-saffron/20 rounded-2xl flex items-center justify-center mb-6">
                                            <Palette className="w-6 h-6 text-saffron" />
                                        </div>
                                        <h4 className="text-xl font-bold text-white mb-3 font-fraunces">Interactive Experience</h4>
                                        <p className="text-sm text-text-muted leading-relaxed">
                                            Try scrolling, clicking categories, and adding items. This is exactly how your menu will behave on a customer's phone.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-saffron bg-saffron/10 px-8 py-4 rounded-[20px] border border-saffron/20">
                                        <Check className="w-5 h-5" />
                                        Pixel Perfect Design
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
