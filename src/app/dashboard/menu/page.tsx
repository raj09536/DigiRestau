'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { MenuCategory, MenuItem } from '@/lib/types';
import { useRestaurant } from '@/lib/restaurant-context';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    X,
    Check,
    ImageIcon,
    ToggleLeft,
    ToggleRight,
    Upload,
    Zap,
    UtensilsCrossed,
    Search,
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import UpgradeModal from '@/components/UpgradeModal';

export default function MenuPage() {
    const { t } = useTranslation();
    const { restaurant } = useRestaurant();
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const restaurantId = restaurant?.id || null;

    // Category modal
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [savingCategory, setSavingCategory] = useState(false);

    const CATEGORY_PRESETS = [
        { name: 'Starters', icon: '🍽️' },
        { name: 'Main Course', icon: '🍛' },
        { name: 'Breads', icon: '🍞' },
        { name: 'Rice & Biryani', icon: '🍚' },
        { name: 'Salads', icon: '🥗' },
        { name: 'Desserts', icon: '🍰' },
        { name: 'Cold Drinks', icon: '🥤' },
        { name: 'Hot Beverages', icon: '☕' },
        { name: 'Mocktails', icon: '🍹' },
        { name: 'Beverages', icon: '🍺' },
        { name: 'Snacks', icon: '🌮' },
        { name: 'Soups', icon: '🍜' },
    ];

    // Item modal
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [itemForm, setItemForm] = useState({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category_id: '',
        is_available: true,
    });
    const [savingItem, setSavingItem] = useState(false);
    const [imageOption, setImageOption] = useState<'url' | 'upload'>('url');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const supabase = createClient();

    const fetchData = useCallback(async (restId: string) => {
        try {
            const [catRes, itemRes] = await Promise.all([
                supabase.from('menu_categories').select('*').eq('restaurant_id', restId).order('position'),
                supabase.from('menu_items').select('*').eq('restaurant_id', restId).order('name'),
            ]);

            if (catRes.data) setCategories(catRes.data);
            if (itemRes.data) setItems(itemRes.data);
        } catch (error) {
            console.error('Error fetching menu data:', error);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        if (restaurantId) {
            fetchData(restaurantId);
        } else {
            setLoading(false);
        }
    }, [restaurantId, fetchData]);

    // Category CRUD
    const openCategoryModal = (category?: MenuCategory) => {
        setError(null);
        if (category) {
            setEditingCategory(category);
            setCategoryName(category.name);
            const isPreset = CATEGORY_PRESETS.some(p => p.name === category.name);
            setIsCustomCategory(!isPreset);
        } else {
            setEditingCategory(null);
            setCategoryName('');
            setIsCustomCategory(false);
        }
        setShowCategoryModal(true);
    };

    const handleAddCategory = async () => {
        if (!categoryName.trim()) return;
        if (!restaurantId) return;
        
        setSavingCategory(true);
        setError(null);
        try {
            if (editingCategory) {
                const { error } = await supabase
                    .from('menu_categories')
                    .update({ name: categoryName.trim() })
                    .eq('id', editingCategory.id);
                if (error) throw error;
                setSuccessMsg(t('saved'));
            } else {
                const { data, error } = await supabase
                    .from('menu_categories')
                    .insert({
                        restaurant_id: restaurantId,
                        name: categoryName.trim(),
                        position: categories.length
                    })
                    .select()
                    .single();
                if (error) throw error;
                setSuccessMsg(t('saved'));
                if (data) setCategories([...categories, data]);
            }
            setShowCategoryModal(false);
            setCategoryName('');
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            fetchData(restaurantId);
        } catch (error: any) {
            console.error('Error saving category:', error);
            setError(error.message || 'Error saving category');
        } finally {
            setSavingCategory(false);
        }
    };

    const deleteCategory = async (id: string) => {
        if (!restaurantId || !confirm('Delete this category? Items will remain but lose their category.')) return;
        try {
            const { error } = await supabase.from('menu_categories').delete().eq('id', id);
            if (error) throw error;
            await fetchData(restaurantId);
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    // Item CRUD
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !restaurantId) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('File size max 2MB!');
            return;
        }
        setUploadingImage(true);
        setUploadProgress(10);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${restaurantId}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;
            setUploadProgress(30);
            const { error: uploadError } = await supabase.storage
                .from('menu-images')
                .upload(filePath, file);
            if (uploadError) throw uploadError;
            setUploadProgress(80);
            const { data: { publicUrl } } = supabase.storage
                .from('menu-images')
                .getPublicUrl(filePath);
            setItemForm(prev => ({ ...prev, image_url: publicUrl }));
            setUploadProgress(100);
            setSuccessMsg(t('saved'));
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error: any) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setUploadingImage(false);
            setUploadProgress(0);
        }
    };

    const openItemModal = (item?: MenuItem) => {
        setImageOption('url');
        setUploadingImage(false);
        setUploadProgress(0);
        if (item) {
            setEditingItem(item);
            setItemForm({
                name: item.name,
                description: item.description || '',
                price: item.price.toString(),
                image_url: item.image_url || '',
                category_id: item.category_id,
                is_available: item.is_available,
            });
        } else {
            setEditingItem(null);
            setItemForm({
                name: '',
                description: '',
                price: '',
                image_url: '',
                category_id: selectedCategory || (categories[0]?.id ?? ''),
                is_available: true,
            });
        }
        setShowItemModal(true);
    };

    const saveItem = async () => {
        if (!restaurantId || !itemForm.name.trim() || !itemForm.price || !itemForm.category_id) return;
        setSavingItem(true);
        try {
            const payload = {
                restaurant_id: restaurantId,
                category_id: itemForm.category_id,
                name: itemForm.name.trim(),
                description: itemForm.description.trim() || null,
                price: parseFloat(itemForm.price),
                image_url: itemForm.image_url.trim() || null,
                is_available: itemForm.is_available,
            };
            if (editingItem) {
                const { error } = await supabase.from('menu_items').update(payload).eq('id', editingItem.id);
                if (error) throw error;
                setSuccessMsg(t('saved'));
            } else {
                const { error } = await supabase.from('menu_items').insert(payload);
                if (error) throw error;
                setSuccessMsg(t('saved'));
            }
            setShowItemModal(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            await fetchData(restaurantId);
        } catch (error) {
            console.error('Error saving item:', error);
        } finally {
            setSavingItem(false);
        }
    };

    const deleteItem = async (id: string) => {
        if (!restaurantId || !confirm('Delete this menu item?')) return;
        try {
            const { error } = await supabase.from('menu_items').delete().eq('id', id);
            if (error) throw error;
            await fetchData(restaurantId);
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const toggleItemAvailable = async (item: MenuItem) => {
        try {
            const { error } = await supabase
                .from('menu_items')
                .update({ is_available: !item.is_available })
                .eq('id', item.id);
            if (error) throw error;
            setItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, is_available: !i.is_available } : i))
            );
        } catch (error) {
            console.error('Error toggling item:', error);
        }
    };

    const filteredItems = items.filter((item) => {
        const matchesCategory = selectedCategory ? item.category_id === selectedCategory : true;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-saffron/20 border-t-saffron rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-24 right-8 z-100 animate-pop-in">
                    <div className="bg-green/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-bold text-sm">
                        <Check className="w-5 h-5" />
                        {successMsg}
                    </div>
                </div>
            )}

            <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-text-main font-fraunces">{t('menu')}</h2>
                    <p className="text-text-muted mt-1">Organize your dishes and categories.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => openItemModal()}
                        disabled={categories.length === 0}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-saffron text-white font-bold hover:bg-saffron-light transition-all shadow-lg shadow-saffron/20 btn-press disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5" />
                        {t('add_item')}
                    </button>
                </div>
            </div>

            <UpgradeModal 
                isOpen={showUpgradeModal} 
                onClose={() => setShowUpgradeModal(false)}
                restaurantId={restaurant?.id || ''}
                currentPlan={restaurant?.is_premium ? 'premium' : 'free'}
            />

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Categories Sidebar */}
                <div className="lg:w-72 shrink-0">
                    <div className="bg-dark-2 border border-white/10 rounded-[32px] p-6 shadow-2xl sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">{t('categories')}</h3>
                            <button
                                onClick={() => openCategoryModal()}
                                className="p-2 bg-white/5 rounded-lg text-text-muted hover:text-saffron hover:bg-saffron/10 transition-all border border-white/5"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                    !selectedCategory 
                                    ? 'bg-saffron text-white shadow-lg shadow-saffron/20' 
                                    : 'text-text-muted hover:bg-white/5'
                                }`}
                            >
                                <span>{t('all_items')}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${!selectedCategory ? 'bg-white/20' : 'bg-white/5'}`}>
                                    {items.length}
                                </span>
                            </button>

                            {categories.map((cat) => {
                                const count = items.filter((i) => i.category_id === cat.id).length;
                                const isActive = selectedCategory === cat.id;
                                return (
                                    <div key={cat.id} className="group flex items-center gap-1">
                                        <button
                                            onClick={() => setSelectedCategory(isActive ? null : cat.id)}
                                            className={`flex-1 flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                                isActive 
                                                ? 'bg-saffron text-white shadow-lg shadow-saffron/20' 
                                                : 'text-text-muted hover:bg-white/5'
                                            }`}
                                        >
                                            <span className="truncate">{cat.name}</span>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-white/5'}`}>
                                                {count}
                                            </span>
                                        </button>
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openCategoryModal(cat)} className="p-1.5 hover:text-saffron transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => deleteCategory(cat.id)} className="p-1.5 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {categories.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-xs text-text-muted opacity-40">No categories found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items Grid */}
                <div className="flex-1 space-y-6">
                    {!restaurant?.is_premium && (
                        <div className="inline-upgrade-hint">
                            <span>⚡ Support digiRestau – Unlock premium themes & icons</span>
                            <button onClick={() => setShowUpgradeModal(true)}>
                                Upgrade for Pro Themes →
                            </button>
                        </div>
                    )}

                    {/* Search & Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-saffron transition-colors" />
                            <input
                                type="text"
                                placeholder="Search dishes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-dark-2 border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-text-main focus:border-saffron/50 transition-all outline-none group-hover:border-white/20"
                            />
                        </div>
                    </div>

                    {filteredItems.length === 0 ? (
                        <div className="bg-dark-2 rounded-[40px] border border-white/5 p-20 text-center shadow-2xl">
                            <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-8">
                                <UtensilsCrossed className="w-12 h-12 text-text-muted opacity-20" />
                            </div>
                            <h3 className="text-2xl font-bold text-text-main font-fraunces mb-3">{t('no_items')}</h3>
                            <button 
                                onClick={() => openItemModal()}
                                className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 text-text-main rounded-xl font-bold transition-all border border-white/10"
                            >
                                {t('add_item')}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredItems.map((item) => {
                                const category = categories.find((c) => c.id === item.category_id);
                                return (
                                    <div
                                        key={item.id}
                                        className={`bg-dark-2 rounded-[32px] border border-white/10 overflow-hidden shadow-2xl group transition-all duration-500 hover:-translate-y-2 ${!item.is_available ? 'grayscale opacity-60' : ''}`}
                                    >
                                        <div className="relative aspect-square overflow-hidden bg-black/40">
                                            {item.image_url ? (
                                                <img 
                                                    src={item.image_url} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="w-12 h-12 text-text-muted opacity-10" />
                                                </div>
                                            )}
                                            
                                            {/* Price Badge */}
                                            <div className="absolute top-4 right-4 px-4 py-1.5 bg-saffron text-white rounded-full font-black shadow-xl">
                                                ₹{item.price}
                                            </div>

                                            {/* Action Overlay */}
                                            <div className="absolute bottom-4 left-4 right-4 flex gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                <button 
                                                    onClick={() => openItemModal(item)}
                                                    className="flex-1 py-2.5 bg-white/90 backdrop-blur-md text-dark font-bold rounded-xl text-xs hover:bg-white transition-all shadow-xl"
                                                >
                                                    {t('update')}
                                                </button>
                                                <button 
                                                    onClick={() => deleteItem(item.id)}
                                                    className="p-2.5 bg-red-500/90 backdrop-blur-md text-white rounded-xl hover:bg-red-500 transition-all shadow-xl"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-bold text-text-main text-lg font-fraunces leading-tight">{item.name}</h4>
                                                    {category && (
                                                        <span className="text-[10px] font-black text-saffron uppercase tracking-widest mt-1 inline-block opacity-70">
                                                            {category.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <button onClick={() => toggleItemAvailable(item)} className="shrink-0">
                                                    {item.is_available 
                                                        ? <ToggleRight className="w-8 h-8 text-green-400" /> 
                                                        : <ToggleLeft className="w-8 h-8 text-text-muted" />}
                                                </button>
                                            </div>
                                            
                                            {item.description && (
                                                <p className="text-xs text-text-muted/60 leading-relaxed line-clamp-2">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black/80 z-110 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-dark-2 border border-white/10 rounded-[40px] p-8 w-full max-w-md shadow-2xl animate-pop-in">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-text-main font-fraunces">
                                {editingCategory ? t('update') : t('add_category')}
                            </h3>
                            <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-text-muted" />
                            </button>
                        </div>
                        
                        <div className="space-y-8">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-sm font-bold">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 ml-1">Select Preset</label>
                                <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                    {CATEGORY_PRESETS.map((p) => (
                                        <button
                                            key={p.name}
                                            onClick={() => { setCategoryName(p.name); setIsCustomCategory(false); }}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-bold transition-all ${
                                                categoryName === p.name && !isCustomCategory
                                                ? 'bg-saffron/20 border-saffron text-saffron'
                                                : 'bg-white/5 border-white/5 text-text-muted hover:border-white/10'
                                            }`}
                                        >
                                            <span className="text-lg">{p.icon}</span>
                                            <span className="truncate">{p.name}</span>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => { if (!isCustomCategory) setCategoryName(''); setIsCustomCategory(true); }}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-bold transition-all ${
                                            isCustomCategory
                                            ? 'bg-saffron/20 border-saffron text-saffron'
                                            : 'bg-white/5 border-white/5 text-text-muted hover:border-white/10'
                                        }`}
                                    >
                                        <span className="text-lg">✏️</span>
                                        <span>Custom</span>
                                    </button>
                                </div>
                            </div>

                            {isCustomCategory && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">Custom Name</label>
                                    <input
                                        type="text" 
                                        value={categoryName} 
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        placeholder="e.g., Seasonal Specials"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-text-main focus:border-saffron/50 transition-all outline-none"
                                        autoFocus
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleAddCategory}
                                disabled={savingCategory || !categoryName.trim()}
                                className="w-full py-4 bg-saffron text-white rounded-2xl font-black shadow-xl shadow-saffron/20 hover:bg-saffron-light transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {savingCategory ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                {editingCategory ? t('update') : t('save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Item Modal */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black/80 z-110 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-dark-2 border border-white/10 rounded-[40px] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-pop-in custom-scrollbar">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-text-main font-fraunces">
                                {editingItem ? t('update') : t('add_item')}
                            </h3>
                            <button onClick={() => setShowItemModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-text-muted" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Col: Info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">{t('item_name')} *</label>
                                    <input 
                                        type="text"
                                        value={itemForm.name}
                                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-text-main focus:border-saffron/50 transition-all outline-none"
                                        placeholder="e.g., Crispy Spring Rolls"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">{t('category')} *</label>
                                    <select 
                                        value={itemForm.category_id} 
                                        onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-text-main focus:border-saffron/50 transition-all outline-none appearance-none"
                                    >
                                        <option value="" className="bg-dark-2">{t('select_category')}</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id} className="bg-dark-2">{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">{t('price')} (₹) *</label>
                                    <input 
                                        type="number"
                                        value={itemForm.price}
                                        onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-text-main focus:border-saffron/50 transition-all outline-none"
                                        placeholder="299"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">{t('description')}</label>
                                    <textarea 
                                        value={itemForm.description}
                                        onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-text-main focus:border-saffron/50 transition-all outline-none resize-none"
                                        placeholder={t('description_placeholder')}
                                    />
                                </div>
                            </div>

                            {/* Right Col: Media */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 ml-1">{t('image')}</label>
                                    
                                    <div className="flex bg-black/20 rounded-xl p-1 border border-white/5 mb-4">
                                        <button 
                                            onClick={() => setImageOption('url')}
                                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${imageOption === 'url' ? 'bg-white/10 text-text-main shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                                        >
                                            {t('url_paste')}
                                        </button>
                                        <button 
                                            onClick={() => setImageOption('upload')}
                                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${imageOption === 'upload' ? 'bg-white/10 text-text-main shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                                        >
                                            {t('device_upload')}
                                        </button>
                                    </div>

                                    <div className="relative aspect-video rounded-[24px] overflow-hidden bg-black/40 border border-white/5 mb-4 group/preview">
                                        {itemForm.image_url ? (
                                            <>
                                                <img src={itemForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                <button 
                                                    onClick={() => setItemForm(p => ({ ...p, image_url: '' }))}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover/preview:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-20">
                                                <ImageIcon className="w-10 h-10" />
                                                <span className="text-xs font-bold">No Image Selected</span>
                                            </div>
                                        )}
                                    </div>

                                    {imageOption === 'url' ? (
                                        <input 
                                            type="url"
                                            value={itemForm.image_url}
                                            onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-text-main text-sm focus:border-saffron/50 transition-all outline-none"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    ) : (
                                        <label className="block w-full cursor-pointer group">
                                            <div className="w-full py-5 px-5 bg-white/5 border border-white/10 border-dashed rounded-[24px] flex flex-col items-center justify-center gap-2 group-hover:bg-white/10 transition-all">
                                                <div className="p-3 bg-saffron/10 rounded-2xl">
                                                    <Upload className="w-5 h-5 text-saffron" />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest text-text-muted group-hover:text-text-main transition-colors">
                                                    {uploadingImage ? `${t('loading')} ${uploadProgress}%` : t('choose_image')}
                                                </span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                                            </div>
                                        </label>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-text-main">{t('available')}</span>
                                        <span className="text-[10px] text-text-muted opacity-50 uppercase tracking-widest font-black">Enable/Disable item</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setItemForm({ ...itemForm, is_available: !itemForm.is_available })}
                                    >
                                        {itemForm.is_available 
                                            ? <ToggleRight className="w-10 h-10 text-green-400" /> 
                                            : <ToggleLeft className="w-10 h-10 text-white/10" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex gap-4">
                            <button
                                onClick={() => setShowItemModal(false)}
                                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-text-muted font-black uppercase tracking-widest rounded-2xl transition-all border border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveItem}
                                disabled={savingItem || !itemForm.name.trim() || !itemForm.price || !itemForm.category_id}
                                className="flex-2 py-4 bg-saffron text-white rounded-2xl font-black shadow-xl shadow-saffron/20 hover:bg-saffron-light transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {savingItem ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                {editingItem ? t('update') : t('save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
