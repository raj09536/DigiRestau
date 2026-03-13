'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';
import { Loader2, Check, Store, ImageIcon, Upload, Globe, Palette } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function SettingsPage() {
    const { t, lang } = useTranslation();
    const { restaurant, setRestaurant } = useRestaurant();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [logoOption, setLogoOption] = useState<'url' | 'upload'>('url');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [themeColor, setThemeColor] = useState('#f97316');

    const themes = [
        { name: 'Saffron', primary: '#F4622A', secondary: '#FF8C5A' },
        { name: 'Red', primary: '#FF5757', secondary: '#ff7a7a' },
        { name: 'Green', primary: '#4CAF7D', secondary: '#66c08f' },
        { name: 'Gold', primary: '#E8B84B', secondary: '#f0c975' },
        { name: 'Blue', primary: '#3b82f6', secondary: '#60a5fa' },
        { name: 'Purple', primary: '#a855f7', secondary: '#c084fc' },
        { name: 'Pink', primary: '#ec4899', secondary: '#f472b6' },
        { name: 'Teal', primary: '#14b8a6', secondary: '#2dd4bf' },
    ];

    const supabase = createClient();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !restaurant) return;
        setUploading(true);
        setUploadError(null);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${restaurant.id}-${Math.random()}.${fileExt}`;
            const filePath = `logos/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath);
            setLogoUrl(publicUrl);
        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadError(error.message || 'Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (restaurant) {
            setName(restaurant.name);
            setSlug(restaurant.slug);
            setThemeColor(restaurant.theme_color || '#F4622A');
            setLogoUrl(restaurant.logo_url || '');
        }
    }, [restaurant]);

    const handleSave = async () => {
        if (!restaurant) return;
        setSaving(true);
        setSaved(false);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Session not found, please login again.');
            const finalSlug = slug.trim() || name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            const { error } = await supabase
                .from('restaurants')
                .update({
                    name: name.trim(),
                    slug: finalSlug,
                    logo_url: logoUrl.trim() || null,
                    theme_color: themeColor,
                    language: lang
                })
                .eq('id', restaurant.id);
            if (error) throw error;
            setRestaurant({
                ...restaurant,
                name: name.trim(),
                slug: finalSlug,
                logo_url: logoUrl.trim() || null,
                theme_color: themeColor,
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error: any) {
            console.error('Save error:', error);
            alert('Error: ' + (error.message || 'Update failed'));
        } finally {
            setSaving(false);
        }
    };

    if (!restaurant) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-saffron/20 border-t-saffron rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-text-main font-fraunces">Settings</h2>
                <p className="text-text-muted mt-1">Manage your restaurant identity and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings Panel */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-dark-2 border border-white/10 rounded-[32px] p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-saffron/10 rounded-xl">
                                <Store className="w-5 h-5 text-saffron" />
                            </div>
                            <h3 className="text-xl font-bold text-text-main font-fraunces">Restaurant Identity</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2 ml-1">Restaurant Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-text-main focus:border-saffron/50 focus:ring-4 focus:ring-saffron/10 transition-all outline-none"
                                    placeholder="Enter restaurant name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2 ml-1">URL Slug</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs">/menu/</span>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-5 py-4 text-text-main font-mono focus:border-saffron/50 focus:ring-4 focus:ring-saffron/10 transition-all outline-none"
                                            placeholder="restaurant-name"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-text-muted mt-2 ml-1 opacity-60">This will be part of your customers' menu URL.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-dark-2 border border-white/10 rounded-[32px] p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-gold/10 rounded-xl">
                                <Palette className="w-5 h-5 text-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-text-main font-fraunces">Look & Feel</h3>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-4 ml-1">Theme Brand Color</label>
                                <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
                                    {themes.map((theme) => (
                                        <button
                                            key={theme.name}
                                            onClick={() => setThemeColor(theme.primary)}
                                            className="group relative flex flex-col items-center gap-3"
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-2xl transition-all flex items-center justify-center border-2 ${themeColor === theme.primary ? 'border-white scale-110 shadow-xl' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: theme.primary }}
                                            >
                                                {themeColor === theme.primary && <Check className="w-6 h-6 text-white" strokeWidth={3} />}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${themeColor === theme.primary ? 'text-text-main' : 'text-text-muted opacity-50'}`}>
                                                {theme.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-4 ml-1">Restaurant Logo</label>
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-text-muted opacity-20" />
                                        )}
                                    </div>
                                    <div className="flex-1 w-full space-y-4">
                                        <div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
                                            <button 
                                                onClick={() => setLogoOption('url')}
                                                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${logoOption === 'url' ? 'bg-white/10 text-text-main shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                                            >
                                                URL Link
                                            </button>
                                            <button 
                                                onClick={() => setLogoOption('upload')}
                                                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${logoOption === 'upload' ? 'bg-white/10 text-text-main shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                                            >
                                                Upload File
                                            </button>
                                        </div>

                                        {logoOption === 'url' ? (
                                            <input
                                                type="url"
                                                value={logoUrl}
                                                onChange={(e) => setLogoUrl(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-text-main text-sm focus:border-saffron/50 transition-all outline-none"
                                                placeholder="https://example.com/logo.png"
                                            />
                                        ) : (
                                            <label className="block w-full cursor-pointer group">
                                                <div className="w-full py-4 px-5 bg-white/5 border border-white/10 border-dashed rounded-2xl flex items-center justify-center gap-3 group-hover:bg-white/10 transition-all">
                                                    <Upload className="w-5 h-5 text-text-muted group-hover:text-saffron transition-colors" />
                                                    <span className="text-sm font-bold text-text-muted group-hover:text-text-main transition-colors">
                                                        {uploading ? 'Uploading...' : 'Choose Image File'}
                                                    </span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                                </div>
                                            </label>
                                        )}
                                        {uploadError && <p className="text-xs text-red-500 font-bold">{uploadError}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-8">

                    <div className="bg-saffron/5 border border-saffron/20 rounded-[32px] p-8">
                        <h4 className="text-lg font-bold text-text-main font-fraunces mb-4">Preview & Save</h4>
                        <p className="text-xs text-text-muted mb-6 leading-relaxed">
                            Changes saved here will reflect immediately on your public menu page. Make sure your logo looks good on your brand color.
                        </p>
                        
                        <button
                            onClick={handleSave}
                            disabled={saving || !name.trim()}
                            className="w-full py-4 rounded-2xl bg-saffron text-white font-bold hover:bg-saffron-light transition-all shadow-xl shadow-saffron/20 btn-press disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : saved ? (
                                <Check className="w-5 h-5" />
                            ) : null}
                            {saved ? 'Changes Saved' : saving ? 'Saving...' : 'Save All Settings'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
