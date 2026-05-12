'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
    variant?: 'minimal' | 'full' | 'dashboard';
}

export default function LanguageSelector({ variant = 'minimal' }: LanguageSelectorProps) {
    const { lang, changeLang } = useTranslation();

    const langs = [
        { code: 'en', label: 'EN', flag: '🇬🇧', full: 'English' },
        { code: 'hi', label: 'HI', flag: '🇮🇳', full: 'हिंदी' },
        { code: 'hl', label: 'HIN', flag: '😎', full: 'Hinglish' },
    ];

    if (variant === 'dashboard') {
        return (
            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
                {langs.map((l) => (
                    <button
                        key={l.code}
                        onClick={() => changeLang(l.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${lang === l.code
                                ? 'bg-saffron text-white shadow-lg'
                                : 'text-text-muted hover:text-text-main'
                            }`}
                    >
                        {l.label}
                    </button>
                ))}
            </div>
        );
    }

    if (variant === 'full') {
        return (
            <div className="flex flex-wrap gap-2">
                {langs.map((l) => (
                    <button
                        key={l.code}
                        onClick={() => changeLang(l.code)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${lang === l.code
                                ? 'border-saffron bg-saffron/5 text-saffron'
                                : 'border-white/10 bg-dark-2 text-text-muted hover:border-white/20'
                            }`}
                    >
                        <span>{l.flag}</span>
                        <span className="font-bold">{l.full}</span>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-xs font-black bg-white/5 backdrop-blur-md px-3 py-2 rounded-full border border-white/10">
            <Globe className="w-3.5 h-3.5 text-text-muted" />
            <div className="flex items-center">
                {langs.map((l, index) => (
                    <div key={l.code} className="flex items-center">
                        <button
                            onClick={() => changeLang(l.code)}
                            className={`hover:text-saffron transition-colors px-1 ${lang === l.code ? 'text-saffron' : 'text-text-muted'
                                }`}
                        >
                            {l.label}
                        </button>
                        {index < langs.length - 1 && (
                            <span className="mx-1 text-white/10 text-[10px]">|</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
