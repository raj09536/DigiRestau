'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';
import { QRCodeSVG } from 'qrcode.react';
import UpgradeModal from '@/components/UpgradeModal';
import {
    Plus,
    Download,
    Trash2,
    QrCode,
    Zap,
    Search,
} from 'lucide-react';
import type { Table } from '@/lib/types';

export default function TablesPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const supabase = createClient();
    const { restaurant } = useRestaurant();

    const fetchTables = async () => {
        if (!restaurant) return;
        const { data } = await supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('table_number');
        if (data) setTables(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchTables();
    }, [restaurant]);

    const addTable = async () => {
        if (!restaurant) return;

        // No more free plan limit

        setAdding(true);
        const nextNumber = tables.length > 0
            ? Math.max(...tables.map(t => t.table_number)) + 1
            : 1;

        await supabase.from('tables').insert({
            restaurant_id: restaurant.id,
            table_number: nextNumber,
        });
        await fetchTables();
        setAdding(false);
    };

    const deleteTable = async (id: string) => {
        if (!confirm('Delete this table?')) return;
        await supabase.from('tables').delete().eq('id', id);
        await fetchTables();
    };

    const downloadQR = (tableId: string, tableNumber: number) => {
        const svgEl = document.getElementById(`qr-${tableId}`)?.querySelector('svg');
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
                
                // Add some branding
                ctx.fillStyle = '#120D0A';
                ctx.font = 'bold 40px Outfit';
                ctx.textAlign = 'center';
                ctx.fillText(restaurant?.name || 'digiRestau', 512, 100);
                
                ctx.fillStyle = '#F4622A';
                ctx.font = 'bold 60px Fraunces';
                ctx.fillText(`TABLE ${tableNumber}`, 512, 950);
                
                ctx.drawImage(img, 128, 128, 768, 768);
            }
            const link = document.createElement('a');
            link.download = `${restaurant?.name || 'digirestau'}-table-${tableNumber}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    const getMenuUrl = (tableId: string) => {
        if (typeof window === 'undefined') return '';
        return `${window.location.origin}/menu/${restaurant?.slug}/${tableId}`;
    };

    const filteredTables = tables.filter(t => 
        t.table_number.toString().includes(searchQuery)
    );

    return (
        <div className="space-y-8">
            <UpgradeModal 
                isOpen={showUpgradeModal} 
                onClose={() => setShowUpgradeModal(false)}
                restaurantId={restaurant?.id || ''}
                currentPlan={restaurant?.is_premium ? 'premium' : 'free'}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-text-main font-fraunces">Tables & QR Codes</h2>
                    <p className="text-text-muted mt-1">{tables.length} tables active in your restaurant</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-saffron transition-colors" />
                        <input
                            type="text"
                            placeholder="Search table number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-dark-2 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-text-main focus:border-saffron/50 transition-all outline-none group-hover:border-white/20"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {!restaurant?.is_premium && (
                            <div className="inline-upgrade-hint">
                                <span>⚡ Support digiRestau – Unlock premium themes</span>
                                <button onClick={() => setShowUpgradeModal(true)}>
                                    Upgrade to Pro →
                                </button>
                            </div>
                        )}
                        
                        <button
                            onClick={addTable}
                            disabled={adding}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-saffron text-white font-bold hover:bg-saffron-light transition-all shadow-lg shadow-saffron/20 btn-press disabled:opacity-50"
                        >
                            {adding ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Plus className="w-5 h-5" />
                            )}
                            Add Table
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton h-80 rounded-3xl" />
                    ))}
                </div>
            ) : tables.length === 0 ? (
                <div className="bg-dark-2 rounded-[32px] p-24 text-center border border-white/5 shadow-2xl">
                    <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/5">
                        <QrCode className="w-12 h-12 text-text-muted" />
                    </div>
                    <h3 className="text-2xl font-bold text-text-main mb-3 font-fraunces">No tables created yet</h3>
                    <p className="text-text-muted max-w-sm mx-auto">Click the button above to add your first table and generate a unique QR code for it.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTables.map((table) => (
                        <div key={table.id} className="table-card group flex flex-col">
                            {/* QR Section */}
                            <div className="relative p-8 mb-6 bg-white rounded-2xl flex items-center justify-center transition-transform group-hover:scale-[1.02]" id={`qr-${table.id}`}>
                                <QRCodeSVG
                                    value={getMenuUrl(table.id)}
                                    size={160}
                                    level="H"
                                    bgColor="transparent"
                                    fgColor="#120D0A"
                                />
                                {/* Hidden overlay that shows on card hover handled by CSS or just absolute button */}
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 text-left">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-text-main font-fraunces leading-tight">
                                            Table {table.table_number}
                                        </h4>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-green-400 flex items-center gap-1.5 mt-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Live & Ready
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => downloadQR(table.id, table.table_number)}
                                            className="p-3 bg-white/5 rounded-xl text-text-muted hover:text-saffron hover:bg-saffron/10 transition-all border border-white/5"
                                            title="Download QR Code"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => deleteTable(table.id)}
                                            className="p-3 bg-white/5 rounded-xl text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all border border-white/5"
                                            title="Delete Table"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                                    Customers can scan this code to browse the menu and place orders directly to Table {table.table_number}.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
