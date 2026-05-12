'use client';

import { MenuCategory, MenuItem, CartItem } from '@/lib/types';
import DefaultTemplate from './templates/DefaultTemplate';
import EmeraldLuxe from './templates/EmeraldLuxe';
import ArabicRoyal from './templates/ArabicRoyal';
import FlipBook from './templates/FlipBook';
import CyberpunkNeon from './templates/CyberpunkNeon';
import StreetFoodPop from './templates/StreetFoodPop';
import MinimalistZen from './templates/MinimalistZen';
import LuxuryGold from './templates/LuxuryGold';
import MosaicGrid from './templates/MosaicGrid';
import LayeredSlide from './templates/LayeredSlide';

interface MenuTemplateRendererProps {
    template: string;
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

export default function MenuTemplateRenderer(props: MenuTemplateRendererProps) {
    switch (props.template) {
        case 'emerald':
            return <EmeraldLuxe {...props} />;
        case 'arabic':
            return <ArabicRoyal {...props} />;
        case 'flipbook':
            return <FlipBook {...props} />;
        case 'cyberpunk':
            return <CyberpunkNeon {...props} />;
        case 'street':
            return <StreetFoodPop {...props} />;
        case 'minimalist':
            return <MinimalistZen {...props} />;
        case 'luxury':
            return <LuxuryGold {...props} />;
        case 'mosaic':
            return <MosaicGrid {...props} />;
        case 'slide':
            return <LayeredSlide {...props} />;
        default:
            return <DefaultTemplate {...props} />;
    }
}
