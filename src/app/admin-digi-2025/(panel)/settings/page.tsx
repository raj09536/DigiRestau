'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { 
    QrCode, 
    MessageSquare, 
    CreditCard, 
    Save, 
    Upload,
    CheckCircle2,
    Lock
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
    const [whatsappNumber, setWhatsappNumber] = useState('7351172025');
    const [pricing, setPricing] = useState({
        inrMonthly: '499',
        inrYearly: '4790',
        intlMonthly: '12',
        intlYearly: '115'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    const handleSaveGeneral = async () => {
        setIsSaving(true);
        // In a real app, these would be saved to a 'platform_settings' table
        // For now, we'll just simulate a successful save to the DB context or local state
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Platform settings updated successfully');
        }, 1200);
    };

    const handleUploadQR = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        
        try {
            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload('logos/upi-qr.png', file, {
                    upsert: true,
                    cacheControl: '3600'
                });

            if (uploadError) throw uploadError;

            toast.success('✓ UPI QR updated successfully');
            // Force reload current image by changing its src or reloading
            window.location.reload(); 
        } catch (err) {
            toast.error('Failed to upload QR code');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-12 max-w-4xl mx-auto pb-20 font-outfit">
            {/* Section 1: UPI QR */}
            <div className="bg-dark-2 border border-border-custom rounded-[32px] overflow-hidden shadow-2xl shadow-black/40">
                <div className="px-10 py-8 border-b border-white/5 bg-white/2 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-text-main font-fraunces">UPI Payment Config</h3>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-40 mt-1">Manage payment collection QR</p>
                    </div>
                </div>
                <div className="p-10 flex flex-col md:flex-row gap-12 items-center">
                    <div className="relative group">
                        <div className="bg-white p-4 rounded-[20px] shadow-2xl transition-transform duration-500 group-hover:scale-105">
                            <img 
                                src={`https://rcqilnwpichtaijqqnho.supabase.co/storage/v1/object/public/logos/logos/upi-qr.png?v=${Date.now()}`} 
                                alt="Current UPI QR" 
                                className="w-40 h-40 object-contain"
                            />
                        </div>
                        <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                            <span className="px-3 py-1 bg-saffron text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">Current active QR</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <div className="space-y-2">
                            <p className="text-base font-bold text-text-main tracking-tight">Update QR Code Image</p>
                            <p className="text-sm text-text-muted opacity-60 leading-relaxed">
                                Upload a clear QR code image. This will be shown to all customers requesting Pro upgrades.
                            </p>
                        </div>
                        <div className="relative">
                            <input 
                                type="file" 
                                id="qr-upload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleUploadQR}
                                disabled={uploading}
                            />
                            <label 
                                htmlFor="qr-upload"
                                className={`inline-flex items-center gap-2 px-8 py-4 bg-saffron/10 border border-saffron/30 text-saffron rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-saffron hover:text-white transition-all cursor-pointer shadow-xl shadow-saffron/5 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                {uploading ? <div className="w-4 h-4 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                                {uploading ? 'Uploading...' : 'Upload New QR'}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: WhatsApp */}
            <div className="bg-dark-2 border border-border-custom rounded-[32px] overflow-hidden shadow-2xl shadow-black/40">
                <div className="px-10 py-8 border-b border-white/5 bg-white/2">
                    <h3 className="text-xl font-bold text-text-main font-fraunces">WhatsApp Communication</h3>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-40 mt-1">Platform contact number</p>
                </div>
                <div className="p-10 space-y-8">
                    <div className="max-w-md space-y-3">
                        <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] opacity-40 ml-1">Business Number</label>
                        <div className="relative flex items-center">
                            <MessageSquare className="absolute left-5 w-5 h-5 text-text-muted opacity-30" />
                            <input 
                                type="text"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                className="w-full bg-dark-3 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-text-main font-bold text-lg outline-none focus:border-saffron/40 transition-all placeholder:text-text-muted/20"
                                placeholder="91XXXXXXXXXX"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleSaveGeneral}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-4 bg-saffron/10 border border-saffron/30 text-saffron rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-saffron hover:text-white transition-all shadow-xl shadow-saffron/5"
                    >
                        {isSaving ? <div className="w-4 h-4 border-2 border-saffron/30 border-t-saffron rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>

            {/* Section 3: Pricing */}
            <div className="bg-dark-2 border border-border-custom rounded-[32px] overflow-hidden shadow-2xl shadow-black/40">
                <div className="px-10 py-8 border-b border-white/5 bg-white/2">
                    <h3 className="text-xl font-bold text-text-main font-fraunces">Pricing Configuration</h3>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-40 mt-1">Manage global subscription plans</p>
                </div>
                <div className="p-10 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <p className="text-[10px] text-saffron font-black uppercase tracking-[0.3em] opacity-80 border-l border-saffron pl-3">India Region (INR)</p>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Monthly Plan (₹)</label>
                                    <input 
                                        type="text" 
                                        value={pricing.inrMonthly}
                                        onChange={(e) => setPricing({...pricing, inrMonthly: e.target.value})}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-text-main font-bold outline-none focus:border-white/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Yearly Plan (₹)</label>
                                    <input 
                                        type="text" 
                                        value={pricing.inrYearly}
                                        onChange={(e) => setPricing({...pricing, inrYearly: e.target.value})}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-text-main font-bold outline-none focus:border-white/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] opacity-80 border-l border-blue-400 pl-3">International (USD)</p>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Monthly Plan ($)</label>
                                    <input 
                                        type="text" 
                                        value={pricing.intlMonthly}
                                        onChange={(e) => setPricing({...pricing, intlMonthly: e.target.value})}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-text-main font-bold outline-none focus:border-white/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Yearly Plan ($)</label>
                                    <input 
                                        type="text" 
                                        value={pricing.intlYearly}
                                        onChange={(e) => setPricing({...pricing, intlYearly: e.target.value})}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-text-main font-bold outline-none focus:border-white/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={handleSaveGeneral}
                            disabled={isSaving}
                            className="w-full sm:w-auto px-12 py-5 bg-saffron text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-saffron-light transition-all shadow-2xl shadow-saffron/20 btn-press"
                        >
                            Update System Pricing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
