import { type FC } from 'react'
import { useNavigate, useParams } from 'react-router'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@packages/ui'

import { useLanguage } from './i18n.provider'
import type { Language } from './i18n.types'

type Props = {
  languages: readonly Language[]
  languageLabels: Record<Language, string>
}

const LanguageSwitcher: FC<Props> = ({ languages, languageLabels }) => {
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
      <SelectTrigger>
        <SelectValue aria-label={language}>
          {languageLabels[language] ?? language}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {languages.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {languageLabels[lang] ?? lang}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export { LanguageSwitcher }
