import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { interpolate, translations } from './translations'

const LANG_KEY = 'utang-tracker-lang'
const LanguageContext = createContext(null)

function loadLang() {
  const saved = localStorage.getItem(LANG_KEY)
  return saved === 'en' ? 'en' : 'fil'
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(loadLang)

  const setLang = useCallback((next) => {
    setLangState(next)
    localStorage.setItem(LANG_KEY, next)
  }, [])

  const t = useCallback(
    (key, vars) => {
      const parts = key.split('.')
      let value = translations[lang]
      for (const part of parts) {
        value = value?.[part]
      }
      if (typeof value !== 'string') return key
      return vars ? interpolate(value, vars) : value
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

export function getMessage(lang, key, vars) {
  const parts = key.split('.')
  let value = translations[lang === 'en' ? 'en' : 'fil']
  for (const part of parts) {
    value = value?.[part]
  }
  if (typeof value !== 'string') return key
  return vars ? interpolate(value, vars) : value
}
