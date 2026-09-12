import { useEffect } from 'react'
import i18n, { applyLocale, detectInitialLang } from '#/i18n'
import type { SupportedLang } from '#/i18n'

/**
 * Client-only locale bootstrap. Runs once on mount: resolves the stored
 * choice (or the browser language for first-time visitors), switches
 * i18next, and keeps <html> dir/lang in sync on every change.
 * Effects never run during SSR, so the server render stays English/LTR.
 */
export function LocaleSync() {
  useEffect(() => {
    const initial = detectInitialLang()
    if (i18n.language !== initial) {
      void i18n.changeLanguage(initial)
    }
    const current: SupportedLang = i18n.language === 'ar' ? 'ar' : 'en'
    applyLocale(current)

    const onChange = (lang: string) => {
      applyLocale(lang === 'ar' ? 'ar' : 'en')
    }
    i18n.on('languageChanged', onChange)
    return () => {
      i18n.off('languageChanged', onChange)
    }
  }, [])

  return null
}
