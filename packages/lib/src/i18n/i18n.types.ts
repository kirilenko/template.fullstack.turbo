export type Language = string

export type I18nConfig = {
  defaultLanguage: Language
  languages: readonly Language[]
  namespaces: readonly string[]
  loadPath?: string
}

export type I18nContextType = {
  language: Language
  setLanguage: (language: Language) => void
}
