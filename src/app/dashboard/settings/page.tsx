'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';
import { Loader2, Check, Store, ImageIcon, Upload, Globe, Palette, Volume2, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { createSound } from '@/lib/sounds';

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
    const [selectedSound, setSelectedSound] = useState('ding');
    const [cancelLimit, setCancelLimit] = useState(2); // default 2 min
    const [thankYouMessage, setThankYouMessage] = useState('');

    useEffect(() => {
        const savedSound = localStorage.getItem('digirestau_sound');
        if (savedSound) setSelectedSound(savedSound);
    }, []);

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
            setCancelLimit(restaurant.cancel_time_limit ?? 2);
            setThankYouMessage(restaurant.thank_you_message || '');
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
                    language: lang,
                    cancel_time_limit: cancelLimit,
                    thank_you_message: thankYouMessage.trim() || null
                })
                .eq('id', restaurant.id);
            if (error) throw error;
            setRestaurant({
                ...restaurant,
                name: name.trim(),
                slug: finalSlug,
                logo_url: logoUrl.trim() || null,
                theme_color: themeColor,
                cancel_time_limit: cancelLimit,
                thank_you_message: thankYouMessage.trim() || null
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

                {/* Sidebar Settings Column */}
                <div className="space-y-8">
                    {/* Order Cancellation Time Panel */}
                    <div className="bg-dark-2 border border-white/10 rounded-[32px] p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-orange-500/10 rounded-xl">
                                <Clock className="w-5 h-5 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold text-text-main font-fraunces">Cancel Time Limit</h3>
                        </div>
                        <p className="text-text-muted text-sm ml-11 mb-8 opacity-60">How long can customers cancel after ordering?</p>

                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 5, 10].map(min => (
                                <button
                                    key={min}
                                    onClick={() => setCancelLimit(min)}
                                    className={`py-3 rounded-2xl border text-xs font-bold transition-all ${cancelLimit === min ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white/5 border-white/10 text-text-muted hover:border-white/20'}`}
                                >
                                    {min} min
                                </button>
                            ))}
                            <button
                                onClick={() => setCancelLimit(0)}
                                className={`py-3 rounded-2xl border text-xs font-bold transition-all ${cancelLimit === 0 ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-lg shadow-red-500/10' : 'bg-white/5 border-white/10 text-text-muted hover:border-white/20'}`}
                            >
                                🚫 No Cancel
                            </button>
                        </div>
                        
                        <p className="mt-8 ml-1 text-[10px] font-medium text-text-muted opacity-60 text-center">
                            {cancelLimit === 0 
                                ? 'Customers cannot cancel orders'
                                : `Customers can cancel within ${cancelLimit} min`
                            }
                        </p>
                    </div>
                    
                    {/* Thank You Message Panel */}
                    <div className="bg-dark-2 border border-white/10 rounded-[32px] p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-green-500/10 rounded-xl">
                                <Check className="w-5 h-5 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-text-main font-fraunces">Thank You Message</h3>
                        </div>
                        <p className="text-text-muted text-sm ml-11 mb-8 opacity-60">Yeh message customer ko order ready hone ke baad dikhega.</p>

                        <div className="space-y-4">
                            <textarea
                                value={thankYouMessage}
                                onChange={(e) => setThankYouMessage(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-text-main text-sm focus:border-saffron/50 transition-all outline-none resize-none"
                                rows={3}
                                placeholder="Khana enjoy kiya? Dobara aana! Aur payment counter par karein. 🙏"
                                maxLength={200}
                            />
                            <p className="text-[10px] text-text-muted opacity-60 ml-1">
                                Tip: Payment instruction bhi yahan likho — "Counter par payment karein"
                            </p>
                        </div>
                    </div>

                    {/* Notification Sound Panel */}
                    <div className="bg-dark-2 border border-white/10 rounded-[32px] p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-saffron/10 rounded-xl">
                                <Volume2 className="w-5 h-5 text-saffron" />
                            </div>
                            <h3 className="text-xl font-bold text-text-main font-fraunces">Notification Sound</h3>
                        </div>
                        <p className="text-text-muted text-sm ml-11 mb-8 opacity-60">Choose sound when new order arrives.</p>

                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'ding', label: '🔔 Ding', desc: 'Simple single ding' },
                                { id: 'chime', label: '🎵 Chime', desc: 'Triple chime melody' },
                                { id: 'bell', label: '🛎️ Bell', desc: 'Restaurant bell' },
                                { id: 'alert', label: '⚡ Alert', desc: 'Urgent alert' },
                            ].map(sound => (
                                <div 
                                    key={sound.id}
                                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer group ${selectedSound === sound.id ? 'bg-saffron/10 border-saffron/30 ring-4 ring-saffron/5' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                    onClick={() => {
                                        setSelectedSound(sound.id);
                                        createSound(sound.id); // preview
                                        localStorage.setItem('digirestau_sound', sound.id);
                                    }}
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-sm font-bold transition-colors ${selectedSound === sound.id ? 'text-saffron' : 'text-text-main'}`}>{sound.label}</span>
                                        <span className="text-[10px] text-text-muted opacity-60">{sound.desc}</span>
                                    </div>
                                    
                                    <div className="mt-3 flex items-center justify-between">
                                        <button className="text-[10px] font-black uppercase tracking-widest text-saffron opacity-80 group-hover:opacity-100 flex items-center gap-1">
                                            ▶ Preview
                                        </button>
                                        {selectedSound === sound.id && (
                                            <div className="w-5 h-5 bg-saffron rounded-full flex items-center justify-center shadow-lg shadow-saffron/20">
                                                <Check className="w-3 h-3 text-white" strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Preview & Save Panel */}
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
