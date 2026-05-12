'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';
import { QRCodeSVG } from 'qrcode.react';
import UpgradeModal from '@/components/UpgradeModal';
import {
    Download,
    QrCode,
    Smartphone,
    Share2,
    Copy,
    ExternalLink,
    Palette,
} from 'lucide-react';
import { toast } from 'sonner';

export default function QRPage() {
    const { restaurant } = useRestaurant();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [baseUrl, setBaseUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin);
        }
    }, []);

    const menuUrl = restaurant ? `${baseUrl}/menu/${restaurant.slug}` : '';

    const downloadQR = (id: string, name: string) => {
        const svgEl = document.getElementById(id)?.querySelector('svg');
        if (!svgEl) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const img = new Image();
        img.onload = () => {
            canvas.width = 1024;
            canvas.height = 1024;
            if (ctx) {
                // Background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, 1024, 1024);
                
                // Branding
                ctx.fillStyle = '#120D0A';
                ctx.font = 'bold 40px Outfit';
                ctx.textAlign = 'center';
                ctx.fillText(restaurant?.name || 'digiRestau', 512, 100);
                
                ctx.fillStyle = '#F4622A';
                ctx.font = 'bold 60px Fraunces';
                ctx.fillText('SCAN FOR MENU', 512, 950);
                
                ctx.drawImage(img, 128, 128, 768, 768);
            }
            const link = document.createElement('a');
            link.download = `${restaurant?.name || 'digirestau'}-qr-code.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('QR Code downloaded successfully!');
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Link copied to clipboard!');
    };

    return (
        <div className="space-y-8 pb-12">
            <UpgradeModal 
                isOpen={showUpgradeModal} 
                onClose={() => setShowUpgradeModal(false)}
            />

            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-text-main font-fraunces">QR Code Management</h2>
                <p className="text-text-muted mt-1">Get your restaurant's digital menu QR code and share it with customers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main QR Card */}
                <div className="lg:col-span-1">
                    <div className="bg-dark-2 rounded-[32px] p-8 border border-white/5 shadow-2xl sticky top-28">
                        <div className="aspect-square bg-white rounded-3xl p-8 flex items-center justify-center mb-8 shadow-inner shadow-black/10" id="main-qr">
                            <QRCodeSVG
                                value={menuUrl}
                                size={256}
                                level="H"
                                bgColor="transparent"
                                fgColor="#120D0A"
                                className="w-full h-full"
                            />
                        </div>
                        
                        <div className="space-y-4">
                            <button
                                onClick={() => downloadQR('main-qr', 'Main Menu')}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-saffron text-white font-bold hover:bg-saffron-light transition-all shadow-lg shadow-saffron/20 btn-press"
                            >
                                <Download className="w-5 h-5" />
                                Download PNG
                            </button>
                            
                            <button
                                onClick={() => copyToClipboard(menuUrl)}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 text-text-main font-bold hover:bg-white/10 transition-all border border-white/10"
                            >
                                <Copy className="w-5 h-5" />
                                Copy Menu Link
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info & Options */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Public Link Card */}
                    <div className="bg-dark-2 rounded-3xl p-8 border border-white/5 shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-saffron/10 rounded-xl">
                                <Smartphone className="w-6 h-6 text-saffron" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-main font-fraunces">Direct Menu Link</h3>
                                <p className="text-sm text-text-muted">Use this link for social media bios or website.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-black/20 rounded-2xl border border-white/5">
                            <div className="flex-1 truncate font-mono text-sm text-saffron opacity-80">
                                {menuUrl}
                            </div>
                            <button 
                                onClick={() => window.open(menuUrl, '_blank')}
                                className="p-2 hover:bg-white/5 rounded-lg text-text-muted transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* How to use */}
                    <div className="bg-dark-2 rounded-3xl p-8 border border-white/5 shadow-xl">
                        <h3 className="text-xl font-bold text-text-main mb-6 font-fraunces">How to use your QR code?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-saffron border border-white/5">1</div>
                                <h4 className="font-bold text-text-main">Print for Tables</h4>
                                <p className="text-sm text-text-muted leading-relaxed">Place printed QR codes on every table so customers can browse without waiting for a physical menu.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-saffron border border-white/5">2</div>
                                <h4 className="font-bold text-text-main">Entry Point Display</h4>
                                <p className="text-sm text-text-muted leading-relaxed">Display a large QR code at the entrance for people to see the menu while waiting for a table.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-saffron border border-white/5">3</div>
                                <h4 className="font-bold text-text-main">Social Media</h4>
                                <p className="text-sm text-text-muted leading-relaxed">Add your menu link to your Instagram bio and share it on Facebook to attract more customers.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-saffron border border-white/5">4</div>
                                <h4 className="font-bold text-text-main">Table Management</h4>
                                <p className="text-sm text-text-muted leading-relaxed">Upgrade to <strong>Pro Plan</strong> to generate unique QR codes for every table and accept live orders.</p>
                            </div>
                        </div>
                        
                        {restaurant?.plan_tier === 'starter' && (
                            <div className="mt-10 p-6 bg-linear-to-br from-saffron/20 to-gold/10 rounded-2xl border border-saffron/20 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-xl">
                                        <Palette className="w-6 h-6 text-saffron" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-main">Want per-table QR codes?</h4>
                                        <p className="text-sm text-text-muted">Generate unique codes for each table and enable live ordering.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowUpgradeModal(true)}
                                    className="px-6 py-3 bg-saffron text-white rounded-xl font-bold text-sm shadow-lg shadow-saffron/20 hover:scale-105 transition-all"
                                >
                                    Upgrade to Pro
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
