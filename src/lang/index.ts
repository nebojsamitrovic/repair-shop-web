import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './resources/en.json'
import sr from './resources/sr.json'

import 'dayjs/locale/sr'
import 'dayjs/locale/en-gb'

dayjs.extend(localizedFormat)

export const LANGUAGES = ['sr', 'en'] as const
export type Language = (typeof LANGUAGES)[number]

export const DEFAULT_LANGUAGE: Language = 'sr'
const STORAGE_KEY = 'repairshop.language'

/** Intl and dayjs want a region; i18next keys do not. This is the one place the two meet. */
const regions: Record<Language, { intl: string; dayjs: string }> = {
    sr: { intl: 'sr-RS', dayjs: 'sr' },
    en: { intl: 'en-GB', dayjs: 'en-gb' },
}

export const isLanguage = (value: string | null | undefined): value is Language => LANGUAGES.includes(value as Language)

const storedLanguage = (): Language => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (isLanguage(stored)) return stored
    } catch {
        /* Private windows and blocked site data both throw here; the default is the answer. */
    }
    const browser = navigator.language.slice(0, 2)
    return isLanguage(browser) ? browser : DEFAULT_LANGUAGE
}

export const currentLanguage = (): Language => (isLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE)

/** The locale tag `Intl` should format numbers, money and dates with right now. */
export const currentIntlLocale = (): string => regions[currentLanguage()].intl

export const setLanguage = (language: Language) => {
    void i18n.changeLanguage(language)
    dayjs.locale(regions[language].dayjs)
    try {
        localStorage.setItem(STORAGE_KEY, language)
    } catch {
        /* Remembering the choice is a convenience, not a requirement. */
    }
}

const initial = storedLanguage()

void i18n.use(initReactI18next).init({
    resources: {
        sr: { translation: sr },
        en: { translation: en },
    },
    lng: initial,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
})

dayjs.locale(regions[initial].dayjs)

export default i18n
