'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Restaurant } from '@/lib/types';
import { createClient } from '@/lib/supabase';

interface RestaurantContextType {
    restaurant: Restaurant | null;
    setRestaurant: React.Dispatch<React.SetStateAction<Restaurant | null>>;
    loading: boolean;
    refreshRestaurant: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchRestaurant = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data: restaurants, error } = await supabase
                .from('restaurants')
                .select('*')
                .eq('owner_id', user.id)
                .limit(1);

            if (error) {
                console.error('Error fetching restaurant in context:', error.message);
                return;
            }

            const existing = restaurants && restaurants.length > 0 ? restaurants[0] : null;

            if (existing) {
                setRestaurant(existing);
            } else {
                // Create restaurant automatically
                console.log('No restaurant found, creating default...');
                const slugBase = user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-') || 'my-restaurant';
                const slug = `${slugBase}-${Date.now()}`;

                const { data: newRestaurant, error: insertError } = await supabase
                    .from('restaurants')
                    .insert({
                        owner_id: user.id,
                        name: 'My Restaurant',
                        slug: slug,
                        is_active: true
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error creating default restaurant:', insertError.message);
                } else if (newRestaurant) {
                    setRestaurant(newRestaurant);
                }
            }
        } catch (error) {
            console.error('Error in RestaurantProvider:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurant();
    }, []);

    return (
        <RestaurantContext.Provider value={{ restaurant, setRestaurant, loading, refreshRestaurant: fetchRestaurant }}>
            {children}
        </RestaurantContext.Provider>
    );
}

export function useRestaurant() {
    const context = useContext(RestaurantContext);
    if (context === undefined) {
        throw new Error('useRestaurant must be used within a RestaurantProvider');
    }
    return context;
}
