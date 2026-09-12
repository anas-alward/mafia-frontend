import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enCommon from './locales/en/common.json'
import arCommon from './locales/ar/common.json'
import enLanding from './locales/en/landing.json'
import arLanding from './locales/ar/landing.json'
import enAuth from './locales/en/auth.json'
import arAuth from './locales/ar/auth.json'
import enGame from './locales/en/game.json'
import arGame from './locales/ar/game.json'
import enRoom from './locales/en/room.json'
import arRoom from './locales/ar/room.json'

export const SUPPORTED_LANGS = ['en', 'ar'] as const
export type SupportedLang = (typeof SUPPORTED_LANGS)[number]

const STORAGE_KEY = 'mafia-locale'

type Dict = Record<string, unknown>

function deepMerge(target: Dict, ...sources: Dict[]): Dict {
  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (
        value != null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        typeof target[key] === 'object' &&
        target[key] != null &&
        !Array.isArray(target[key])
      ) {
        deepMerge(target[key] as Dict, value as Dict)
      } else {
        target[key] = value
      }
    }
  }
  return target
}

export function isRtl(lang: string): boolean {
  return lang.startsWith('ar')
}

/** Persist + apply a locale to <html> (dir + lang). Safe on the server. */
export function applyLocale(lang: SupportedLang): void {
  if (typeof document !== 'undefined') {
    document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // storage unavailable (SSR / private mode) — locale just won't persist
  }
}

function storedLang(): SupportedLang | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'ar') return saved
  } catch {
    // ignore — fall through to browser detection
  }
  return null
}

/** Stored choice wins; otherwise Arabic browsers get Arabic. */
export function detectInitialLang(): SupportedLang {
  const saved = typeof window === 'undefined' ? null : storedLang()
  if (saved) return saved
  if (
    typeof navigator !== 'undefined' &&
    navigator.language.toLowerCase().startsWith('ar')
  ) {
    return 'ar'
  }
  return 'en'
}

export async function setLocale(lang: SupportedLang): Promise<void> {
  await i18n.changeLanguage(lang)
  applyLocale(lang)
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: {
        translation: deepMerge({}, enCommon, enLanding, enAuth, enGame, enRoom),
      },
      ar: {
        translation: deepMerge({}, arCommon, arLanding, arAuth, arGame, arRoom),
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
}

export default i18n
