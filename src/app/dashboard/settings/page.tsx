'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';
import { Loader2, Check, Store, ImageIcon, Upload, Palette, Volume2, Clock, Play, Smartphone, Heart } from 'lucide-react';
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

    const [activeTab, setActiveTab] = useState<'identity' | 'branding' | 'preferences' | 'feedback'>('identity');
    const [logoOption, setLogoOption] = useState<'url' | 'upload'>('url');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [themeColor, setThemeColor] = useState('#F4622A');
    const [selectedSound, setSelectedSound] = useState('ding');
    const [cancelLimit, setCancelLimit] = useState(2); // default 2 min
    const [thankYouMessage, setThankYouMessage] = useState('');

    // Platform Feedback State
    const [platformRating, setPlatformRating] = useState(5);
    const [featuresRequested, setFeaturesRequested] = useState('');
    const [platformComments, setPlatformComments] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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

    const handleSendPlatformFeedback = async () => {
        if (!restaurant) return;
        setSubmittingFeedback(true);
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    restaurant_id: restaurant.id,
                    rating: platformRating,
                    features: featuresRequested.trim(),
                    comments: platformComments.trim(),
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to submit feedback');
            }

            setFeedbackSubmitted(true);
        } catch (error: any) {
            console.error('Feedback submit error:', error);
            alert('Error: ' + error.message);
        } finally {
            setSubmittingFeedback(false);
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
        <div className="space-y-8 animate-fade-in max-w-6xl">
            {/* Header with quick Save action */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-text-main font-fraunces">Settings</h2>
                    <p className="text-text-muted mt-1 text-sm">Manage your restaurant identity, look & feel, and alert preferences.</p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                    {activeTab !== 'feedback' && (
                        <button
                            onClick={handleSave}
                            disabled={saving || !name.trim()}
                            className="px-6 py-3 rounded-xl bg-saffron text-white font-bold hover:bg-saffron-light transition-all shadow-lg shadow-saffron/20 disabled:opacity-50 flex items-center gap-2 text-sm"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : saved ? (
                                <Check className="w-4 h-4" />
                            ) : null}
                            {saved ? 'Changes Saved!' : saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Reorganized Settings Card */}
                <div className="lg:col-span-8 bg-dark-2 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row">
                    
                    {/* Vertical tabs sidebar */}
                    <div className="md:w-48 lg:w-60 border-b md:border-b-0 md:border-r border-white/10 p-4 sm:p-6 flex md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-x-visible">
                        {[
                            { id: 'identity', label: 'Identity & Slug', icon: <Store className="w-4 h-4" /> },
                            { id: 'branding', label: 'Look & Feel', icon: <Palette className="w-4 h-4" /> },
                            { id: 'preferences', label: 'Preferences & Sound', icon: <Volume2 className="w-4 h-4" /> },
                            { id: 'feedback', label: 'digiRestau Feedback', icon: <Heart className="w-4 h-4" /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap md:whitespace-normal ${activeTab === tab.id ? 'bg-saffron/10 text-saffron border border-saffron/20' : 'text-text-muted hover:text-text-main hover:bg-white/5 border border-transparent'}`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Active tab contents */}
                    <div className="flex-1 p-4 sm:p-8 min-h-[480px] flex flex-col justify-between">
                        <div>
                            {/* Tab 1: Identity & Slug */}
                            {activeTab === 'identity' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h3 className="text-xl font-bold text-text-main font-fraunces mb-1">Restaurant Identity</h3>
                                        <p className="text-xs text-text-muted">Set your restaurant's name and customer-facing URL slug.</p>
                                    </div>
                                    
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">Restaurant Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-text-main focus:border-saffron/50 focus:ring-4 focus:ring-saffron/10 transition-all outline-none text-sm font-medium"
                                                placeholder="e.g. Punjabi Tadka Cafe"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">URL Slug</label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs">/menu/</span>
                                                <input
                                                    type="text"
                                                    value={slug}
                                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-5 py-4 text-text-main font-mono focus:border-saffron/50 focus:ring-4 focus:ring-saffron/10 transition-all outline-none text-sm"
                                                    placeholder="punjabi-tadka"
                                                />
                                            </div>
                                            <p className="text-[10px] text-text-muted mt-2 ml-1 opacity-60">This unique URL is what customers scan to open your digital menu.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Look & Feel */}
                            {activeTab === 'branding' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h3 className="text-xl font-bold text-text-main font-fraunces mb-1">Look & Feel</h3>
                                        <p className="text-xs text-text-muted">Customize the style, brand color, and logo for your digital menu.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 ml-1">Theme Brand Color</label>
                                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                                                {themes.map((theme) => (
                                                    <button
                                                        key={theme.name}
                                                        type="button"
                                                        onClick={() => setThemeColor(theme.primary)}
                                                        className="group relative flex flex-col items-center gap-2"
                                                    >
                                                        <div
                                                            className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center border ${themeColor === theme.primary ? 'border-white scale-110 shadow-lg ring-4 ring-white/10' : 'border-white/10 hover:scale-105'}`}
                                                            style={{ backgroundColor: theme.primary }}
                                                        >
                                                            {themeColor === theme.primary && <Check className="w-5 h-5 text-white animate-fade-in" strokeWidth={3} />}
                                                        </div>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${themeColor === theme.primary ? 'text-saffron font-bold' : 'text-text-muted opacity-50'}`}>
                                                            {theme.name}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-white/5 pt-6">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 ml-1">Restaurant Logo</label>
                                            <div className="flex flex-col sm:flex-row gap-6 items-center">
                                                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                                    {logoUrl ? (
                                                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                                    ) : (
                                                        <ImageIcon className="w-6 h-6 text-text-muted opacity-20" />
                                                    )}
                                                </div>
                                                <div className="flex-1 w-full space-y-3">
                                                    <div className="flex bg-black/20 rounded-xl p-1 border border-white/5 w-fit">
                                                        <button
                                                            type="button"
                                                            onClick={() => setLogoOption('url')}
                                                            className={`py-1.5 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${logoOption === 'url' ? 'bg-white/10 text-text-main shadow' : 'text-text-muted hover:text-text-main'}`}
                                                        >
                                                            URL Link
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setLogoOption('upload')}
                                                            className={`py-1.5 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${logoOption === 'upload' ? 'bg-white/10 text-text-main shadow' : 'text-text-muted hover:text-text-main'}`}
                                                        >
                                                            Upload File
                                                        </button>
                                                    </div>

                                                    {logoOption === 'url' ? (
                                                        <input
                                                            type="url"
                                                            value={logoUrl}
                                                            onChange={(e) => setLogoUrl(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-text-main text-xs focus:border-saffron/50 transition-all outline-none"
                                                            placeholder="https://example.com/logo.png"
                                                        />
                                                    ) : (
                                                        <label className="block w-full cursor-pointer group">
                                                            <div className="w-full py-3 px-5 bg-white/5 border border-white/10 border-dashed rounded-2xl flex items-center justify-center gap-3 group-hover:bg-white/10 transition-all">
                                                                <Upload className="w-4 h-4 text-text-muted group-hover:text-saffron transition-colors" />
                                                                <span className="text-xs font-bold text-text-muted group-hover:text-text-main transition-colors">
                                                                    {uploading ? 'Uploading...' : 'Choose Image File'}
                                                                </span>
                                                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                                            </div>
                                                        </label>
                                                    )}
                                                    {uploadError && <p className="text-[10px] text-red-500 font-bold">{uploadError}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Preferences & Sound Alerts */}
                            {activeTab === 'preferences' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h3 className="text-xl font-bold text-text-main font-fraunces mb-1">Preferences & Sound Alerts</h3>
                                        <p className="text-xs text-text-muted">Manage cancel windows, custom checkout notes, and alert sounds.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Order Cancel Time Limit</label>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/10">
                                                    {cancelLimit === 0 ? 'Disabled' : `${cancelLimit} Minutes`}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                                {[1, 2, 3, 5, 10].map(min => (
                                                    <button
                                                        key={min}
                                                        type="button"
                                                        onClick={() => setCancelLimit(min)}
                                                        className={`py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${cancelLimit === min ? 'bg-saffron text-white border-saffron shadow' : 'bg-white/5 border-white/10 text-text-muted hover:border-white/20'}`}
                                                    >
                                                        {min} min
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => setCancelLimit(0)}
                                                    className={`py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${cancelLimit === 0 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 border-white/10 text-text-muted hover:border-white/20'}`}
                                                >
                                                    No Cancel
                                                </button>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/5 pt-6">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Customer Thank You Message</label>
                                                <span className="text-[9px] text-text-muted opacity-60">{thankYouMessage.length}/200</span>
                                            </div>
                                            <textarea
                                                value={thankYouMessage}
                                                onChange={(e) => setThankYouMessage(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-text-main text-xs focus:border-saffron/50 transition-all outline-none resize-none"
                                                rows={3}
                                                placeholder="Enjoyed the food? Visit us again! Please pay at the counter. 🙏"
                                                maxLength={200}
                                            />
                                            <p className="text-[9px] text-text-muted opacity-60 mt-1.5 ml-1">
                                                This note displays dynamically at checkout when the customer's order is ready.
                                            </p>
                                        </div>

                                        <div className="border-t border-white/5 pt-6">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 ml-1">Notification Sound</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {[
                                                    { id: 'ding', label: '🔔 Ding', desc: 'Simple single tone' },
                                                    { id: 'chime', label: '🎵 Chime', desc: 'Triple melody chime' },
                                                    { id: 'bell', label: '🛎️ Bell', desc: 'Restaurant desk bell' },
                                                    { id: 'alert', label: '⚡ Alert', desc: 'Urgent buzz alert' },
                                                ].map(sound => (
                                                    <div
                                                        key={sound.id}
                                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${selectedSound === sound.id ? 'bg-saffron/10 border-saffron/30 ring-2 ring-saffron/5' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                                        onClick={() => {
                                                            setSelectedSound(sound.id);
                                                            createSound(sound.id);
                                                            localStorage.setItem('digirestau_sound', sound.id);
                                                        }}
                                                    >
                                                        <div className="flex flex-col gap-1 pr-2">
                                                            <span className={`text-xs font-bold ${selectedSound === sound.id ? 'text-saffron' : 'text-text-main'}`}>{sound.label}</span>
                                                            <span className="text-[9px] text-text-muted opacity-60">{sound.desc}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                createSound(sound.id);
                                                            }}
                                                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-saffron font-bold text-[9px] flex items-center gap-1 shrink-0 transition-all"
                                                        >
                                                            <Play className="w-2.5 h-2.5 fill-current" /> Play
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 4: Platform Feedback */}
                            {activeTab === 'feedback' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h3 className="text-xl font-bold text-text-main font-fraunces mb-1">Feedback for digiRestau</h3>
                                        <p className="text-xs text-text-muted">Help us improve the platform by sharing your suggestions and rating your experience.</p>
                                    </div>

                                    {feedbackSubmitted ? (
                                        <div className="text-center py-10 bg-white/5 border border-dashed border-white/10 rounded-2xl p-8 space-y-4 animate-pop-in">
                                            <div className="w-16 h-16 bg-saffron/10 rounded-full flex items-center justify-center mx-auto">
                                                <Check className="w-8 h-8 text-saffron" />
                                            </div>
                                            <h4 className="text-lg font-bold text-text-main font-fraunces">Feedback Submitted!</h4>
                                            <p className="text-xs text-text-muted max-w-sm mx-auto">
                                                Thank you for your valuable feedback! We will use it to add more exciting features and make digiRestau even better for you.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFeedbackSubmitted(false);
                                                    setPlatformRating(5);
                                                    setFeaturesRequested('');
                                                    setPlatformComments('');
                                                }}
                                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-text-main hover:bg-white/10 transition-all"
                                            >
                                                Submit Another Feedback
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            {/* Rating Selection */}
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 ml-1">Overall Satisfaction Rating</label>
                                                <div className="flex gap-2 justify-start items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            className={`text-3xl focus:outline-none transition-all ${
                                                                platformRating >= star 
                                                                    ? 'text-saffron scale-110' 
                                                                    : 'text-white/10 hover:text-white/30'
                                                            }`}
                                                            onClick={() => setPlatformRating(star)}
                                                        >
                                                            ★
                                                        </button>
                                                    ))}
                                                    {platformRating > 0 && (
                                                        <span className="text-xs font-bold text-saffron ml-3 uppercase tracking-wider">
                                                            {platformRating === 1 && '😞 Poor'}
                                                            {platformRating === 2 && '😕 Fair'}
                                                            {platformRating === 3 && '😊 Good'}
                                                            {platformRating === 4 && '😄 Very Good'}
                                                            {platformRating === 5 && '🤩 Excellent!'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* What features would you like to see? */}
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">What features should we add to digiRestau?</label>
                                                <textarea
                                                    value={featuresRequested}
                                                    onChange={(e) => setFeaturesRequested(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-text-main text-xs focus:border-saffron/50 transition-all outline-none resize-none"
                                                    rows={3}
                                                    placeholder="e.g. Online payments directly to my bank, customer table reservation, monthly analytical reports..."
                                                />
                                            </div>

                                            {/* General feedback / comments */}
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 ml-1">Any other suggestions or feedback?</label>
                                                <textarea
                                                    value={platformComments}
                                                    onChange={(e) => setPlatformComments(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-text-main text-xs focus:border-saffron/50 transition-all outline-none resize-none"
                                                    rows={3}
                                                    placeholder="Tell us what you like or dislike about the platform..."
                                                />
                                            </div>

                                            {/* Submit button inside content */}
                                            <div className="pt-2">
                                                <button
                                                    type="button"
                                                    disabled={submittingFeedback || platformRating === 0}
                                                    onClick={handleSendPlatformFeedback}
                                                    className="w-full py-4 rounded-2xl bg-saffron text-white font-bold hover:bg-saffron-light transition-all shadow-lg shadow-saffron/20 disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                                                >
                                                    {submittingFeedback ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                                                        </>
                                                    ) : (
                                                        'Submit Feedback to digiRestau →'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Save Action Footer inside Tab card */}
                        {activeTab !== 'feedback' && (
                            <div className="mt-8 border-t border-white/5 pt-6 flex items-center justify-between">
                                <span className="text-[10px] text-text-muted opacity-60">Changes reflect immediately.</span>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !name.trim()}
                                    className="px-6 py-3 rounded-xl bg-saffron text-white font-bold hover:bg-saffron-light transition-all shadow-lg disabled:opacity-50 flex items-center gap-2 text-xs"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : saved ? (
                                        <Check className="w-4 h-4" />
                                    ) : null}
                                    {saved ? 'Settings Saved!' : saving ? 'Saving...' : 'Save Settings'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Interactive Phone Live Preview Panel */}
                <div className="lg:col-span-4 bg-dark-2 border border-white/10 rounded-[32px] p-6 shadow-2xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                        <Smartphone className="w-4 h-4 text-saffron" />
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-widest">Live Mobile Preview</h3>
                    </div>

                    {/* Smartphone container */}
                    <div className="relative mx-auto max-w-[260px] aspect-9/19 rounded-[36px] border-8 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col" style={{ backgroundColor: '#120D0A' }}>
                        
                        {/* Speaker notch */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20 flex items-center justify-center">
                          <div className="w-3.5 h-3.5 bg-white/10 rounded-full" />
                        </div>

                        {/* Mobile mock content */}
                        <div className="flex-1 overflow-y-auto pb-4 pt-8 text-center text-text-main relative select-none">
                            
                            {/* Color Header Banner */}
                            <div 
                                className="h-20 w-full relative transition-all duration-500 opacity-70" 
                                style={{
                                    background: `linear-gradient(to bottom, ${themeColor}dd, ${themeColor}11)`
                                }}
                            />

                            {/* Circle Logo */}
                            <div className="w-14 h-14 rounded-full bg-dark border-2 border-white/20 flex items-center justify-center mx-auto -mt-8 overflow-hidden z-10 relative shadow-md">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                                ) : (
                                    <Store className="w-6 h-6 text-white/30" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="px-4 mt-3">
                                <h4 className="text-xs font-bold truncate max-w-full font-fraunces text-white">
                                    {name.trim() || 'Restaurant Name'}
                                </h4>
                                <div className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-mono text-text-muted truncate max-w-[180px]">
                                    /menu/{slug || 'your-slug'}
                                </div>
                            </div>

                            <div className="px-4 mt-4">
                                <div className="w-full h-px bg-white/5" />
                            </div>

                            {/* Categories bar */}
                            <div className="px-4 mt-3 text-left">
                                <div className="flex gap-1 overflow-x-hidden text-[7px] font-bold uppercase tracking-wider">
                                    <span className="px-2 py-0.5 rounded text-white shrink-0" style={{ backgroundColor: themeColor }}>All Menu</span>
                                    <span className="px-2 py-0.5 rounded bg-white/5 text-text-muted shrink-0">Starters</span>
                                    <span className="px-2 py-0.5 rounded bg-white/5 text-text-muted shrink-0">Drinks</span>
                                </div>
                            </div>

                            {/* Dishes List */}
                            <div className="px-4 mt-3 text-left">
                                <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-2">
                                    <div className="space-y-0.5">
                                        <div className="text-[9px] font-bold text-white truncate max-w-[120px]">Dal Makhani Premium</div>
                                        <div className="text-[7px] font-mono text-text-muted">₹280</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="w-4 h-4 rounded flex items-center justify-center text-white text-[9px] font-black shrink-0"
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Order Confirmation Message preview */}
                            <div className="px-4 mt-4 text-left">
                                <div className="p-2.5 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center space-y-1">
                                    <div className="text-[7px] font-bold text-white/40 uppercase tracking-widest">Order Completed</div>
                                    <p className="text-[8px] leading-relaxed text-text-muted italic truncate-multi">
                                        "{thankYouMessage.trim() || 'Enjoyed the food? Visit us again! Please pay at the counter. 🙏'}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center text-[10px] text-text-muted opacity-60">
                        Theme accent: <span className="font-mono text-white/80">{themeColor}</span>
                    </div>
                </div>
            </div>

            {/* Custom font classes fallback & multi-line truncate style */}
            <style jsx global>{`
                h1, h2, h3, h4, h5, h6, .font-fraunces {
                    font-family: var(--font-fraunces), serif;
                }
                body, .font-outfit {
                    font-family: var(--font-outfit), sans-serif;
                }
                .truncate-multi {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;  
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}

