import { type FC } from 'react'
import { useNavigate, useParams } from 'react-router'

import { Select, SelectOption } from '@packages/ui'

import { useLanguage } from './i18n.provider'
import type { Language } from './i18n.types'

type Props = {
  languages: readonly Language[]
  languageLabels: Record<Language, string>
}

const LanguageSwitcher: FC<Props> = ({ languageLabels, languages }) => {
  const { language, setLanguage } = useLanguage()
  const navigate = useNavigate()
  const params = useParams()

  const handleLanguageChange = (newLang: string) => {
    const lang = newLang as Language
    if (lang !== language) {
      setLanguage(lang)
      const currentPath = params['*'] ?? ''
      void navigate(`/${lang}/${currentPath}`)
    }
  }

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      {languages.map((lang) => (
        <SelectOption key={lang} value={lang}>
          {languageLabels[lang] ?? lang}
        </SelectOption>
      ))}
    </Select>
  )
}

export { LanguageSwitcher }
