import { useTranslation } from 'react-i18next'
import { Check, Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '#/components/ui/dropdown-menu'
import { setLocale } from '#/i18n'
import type { SupportedLang } from '#/i18n'

const LANGS: { code: SupportedLang; labelKey: string; label: string }[] = [
  { code: 'en', labelKey: 'language.english', label: 'English' },
  { code: 'ar', labelKey: 'language.arabic', label: 'العربية' },
]

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const active = i18n.language === 'ar' ? 'ar' : 'en'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="p-1.5 rounded-lg transition-all cursor-pointer text-neutral-500 hover:text-neutral-900"
        aria-label={t('language.menu', { defaultValue: 'Language' })}
      >
        <Globe className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {LANGS.map(({ code, labelKey, label }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => void setLocale(code)}
            className="flex items-center justify-between"
          >
            <span>{t(labelKey, { defaultValue: label })}</span>
            {active === code && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
