import { useState, useEffect, useCallback } from 'react'
import { translations } from '@/lib/translations'

export const useTranslation = () => {
    const [lang, setLang] = useState('en')

    useEffect(() => {
        const saved = localStorage.getItem('digirestau_lang') || 'en'
        setLang(saved)
    }, [])

    const changeLang = useCallback((newLang: string) => {
        setLang(newLang)
        localStorage.setItem('digirestau_lang', newLang)
        // Dispatch a custom event to notify other components in the same tab
        window.dispatchEvent(new Event('languageChange'))
    }, [])

    // Listen for language changes in other components or logic
    useEffect(() => {
        const handleLangChange = () => {
            const saved = localStorage.getItem('digirestau_lang') || 'en'
            if (saved !== lang) {
                setLang(saved)
            }
        }
        window.addEventListener('languageChange', handleLangChange)
        return () => window.removeEventListener('languageChange', handleLangChange)
    }, [lang])

    const t = (key: string) => {
        return translations[lang]?.[key] || translations['en'][key] || key
    }

    return { t, lang, changeLang }
}
