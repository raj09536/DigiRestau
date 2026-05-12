'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRestaurant } from '@/lib/restaurant-context';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const { restaurant } = useRestaurant();
    const supabase = createClient();

    useEffect(() => {
        const savedTheme = (localStorage.getItem('digirestau_theme') as 'light' | 'dark') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('digirestau_theme', newTheme);

        // Update database if user is logged in
        if (restaurant) {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase
                        .from('restaurants')
                        .update({ ui_theme: newTheme })
                        .eq('owner_id', user.id);
                }
            } catch (error) {
                console.error('Error updating theme in database:', error);
            }
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
            ) : (
                <Sun className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
            )}
        </button>
    );
}
