import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import {
    baseTranslations,
    languageNames,
    SupportedLanguage,
    supportedLanguages,
    translateText,
    TranslationKey,
    Translations,
} from '@/services/translate';

// Re-export for backward compatibility
export type Language = SupportedLanguage;
export { languageNames, supportedLanguages };

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: TranslationKey) => string;
    languageName: string;
    isTranslating: boolean;
    supportedLanguages: typeof supportedLanguages;
    languageNames: typeof languageNames;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: async () => {},
    t: (key) => baseTranslations[key] || key,
    languageName: 'English',
    isTranslating: false,
    supportedLanguages,
    languageNames,
});

const LANGUAGE_KEY = 'kini_language';
const TRANSLATIONS_CACHE_KEY = 'kini_translations_cache';

// Cache structure: { [langCode]: { translations: Translations, timestamp: number } }
interface TranslationsCache {
    [lang: string]: {
        translations: Translations;
        timestamp: number;
    };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [translations, setTranslations] = useState<Translations>(baseTranslations);
    const [isTranslating, setIsTranslating] = useState(false);
    const [cache, setCache] = useState<TranslationsCache>({});

    // Load language and cached translations on mount
    useEffect(() => {
        loadInitialState();
    }, []);

    const loadInitialState = async () => {
        try {
            // Load cached translations
            const cachedData = await AsyncStorage.getItem(TRANSLATIONS_CACHE_KEY);
            if (cachedData) {
                const parsedCache: TranslationsCache = JSON.parse(cachedData);
                setCache(parsedCache);
            }

            // Load saved language preference
            const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
            if (storedLang && supportedLanguages.includes(storedLang as Language)) {
                const lang = storedLang as Language;
                setLanguageState(lang);
                
                // Apply cached translations if available
                if (cachedData) {
                    const parsedCache: TranslationsCache = JSON.parse(cachedData);
                    if (parsedCache[lang]) {
                        setTranslations(parsedCache[lang].translations);
                    } else if (lang !== 'en') {
                        // No cache for this language, translate
                        await translateAllTexts(lang, parsedCache);
                    }
                } else if (lang !== 'en') {
                    // No cache at all, translate
                    await translateAllTexts(lang, {});
                }
            }
        } catch (e) {
            console.error('Failed to load language state', e);
        }
    };

    const translateAllTexts = async (targetLang: Language, existingCache: TranslationsCache) => {
        // English is the base, no translation needed
        if (targetLang === 'en') {
            setTranslations(baseTranslations);
            return;
        }

        // Check if we have a recent cache (less than 7 days old)
        const cached = existingCache[targetLang];
        const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            setTranslations(cached.translations);
            return;
        }

        setIsTranslating(true);

        try {
            const keys = Object.keys(baseTranslations) as TranslationKey[];
            const values = Object.values(baseTranslations);
            
            // Translate all values
            const translatedValues: string[] = [];
            
            // Process in batches to avoid overwhelming the API
            const batchSize = 10;
            for (let i = 0; i < values.length; i += batchSize) {
                const batch = values.slice(i, i + batchSize);
                const batchResults = await Promise.all(
                    batch.map(text => translateText(text, targetLang, 'en'))
                );
                translatedValues.push(...batchResults);
                
                // Small delay between batches
                if (i + batchSize < values.length) {
                    await new Promise(resolve => setTimeout(resolve, 150));
                }
            }

            // Build translated object
            const newTranslations: Translations = {} as Translations;
            keys.forEach((key, index) => {
                newTranslations[key] = translatedValues[index] || baseTranslations[key];
            });

            setTranslations(newTranslations);

            // Update cache
            const newCache: TranslationsCache = {
                ...existingCache,
                [targetLang]: {
                    translations: newTranslations,
                    timestamp: Date.now(),
                },
            };
            setCache(newCache);
            await AsyncStorage.setItem(TRANSLATIONS_CACHE_KEY, JSON.stringify(newCache));

        } catch (error) {
            console.error('Translation failed, using English fallback:', error);
            setTranslations(baseTranslations);
        } finally {
            setIsTranslating(false);
        }
    };

    const setLanguage = useCallback(async (lang: Language) => {
        if (!supportedLanguages.includes(lang)) {
            console.error(`Unsupported language: ${lang}`);
            return;
        }

        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, lang);
            setLanguageState(lang);

            if (lang === 'en') {
                setTranslations(baseTranslations);
            } else {
                await translateAllTexts(lang, cache);
            }
        } catch (e) {
            console.error('Failed to save language', e);
        }
    }, [cache]);

    const t = useCallback((key: TranslationKey): string => {
        return translations[key] || baseTranslations[key] || key;
    }, [translations]);

    const languageName = languageNames[language]?.nativeName || 'English';

    return (
        <LanguageContext.Provider 
            value={{ 
                language, 
                setLanguage, 
                t, 
                languageName,
                isTranslating,
                supportedLanguages,
                languageNames,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);

// Export types for external use
export type { TranslationKey, Translations };

