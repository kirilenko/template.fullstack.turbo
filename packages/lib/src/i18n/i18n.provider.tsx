import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react'
import { initReactI18next } from 'react-i18next'
import i18next from 'i18next'
import Backend from 'i18next-http-backend'

import type { I18nConfig, I18nContextType, Language } from './i18n.types'

const I18nContext = createContext<I18nContextType | undefined>(undefined)

let initialized = false

const initI18n = async (config: I18nConfig, language: Language): Promise<void> => {
  if (initialized) {
    if (i18next.language !== language) {
      await i18next.changeLanguage(language)
    }
    return
  }

  initialized = true

  await i18next
    .use(Backend)
    .use(initReactI18next)
    .init({
      backend: { loadPath: config.loadPath ?? '/locales/{{lng}}/{{ns}}.json' },
      defaultNS: 'common',
      fallbackLng: config.defaultLanguage,
      lng: language,
      ns: config.namespaces as string[],
      react: { useSuspense: false },
    })
}

type Props = PropsWithChildren<{
  config: I18nConfig
  initialLanguage?: Language
}>

const I18nProvider: FC<Props> = ({ children, config, initialLanguage }) => {
  const [language, setLanguageState] = useState<Language>(
    initialLanguage ?? config.defaultLanguage,
  )
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguageState(initialLanguage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLanguage])

  useEffect(() => {
    void initI18n(config, language).then(() => setReady(true))
  }, [config, language])

  if (!ready) {
    return <div>Loading...</div>
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage: setLanguageState }}>
      {children}
    </I18nContext.Provider>
  )
}

const useLanguage = (): I18nContextType => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useLanguage must be used within I18nProvider')
  }
  return context
}

export { I18nProvider, useLanguage }
