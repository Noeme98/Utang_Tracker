import { useCallback, useEffect, useState } from 'react'
import { getMessage } from '../i18n/LanguageProvider'
import { authErrorMessage } from '../lib/mappers'
import {
  clearSession,
  createUser,
  findUserById,
  getCurrentUserId,
  setActiveSession,
  toProfile,
  updateUserProfile,
  verifyLogin,
} from '../lib/localDb'

const LANG_KEY = 'utang-tracker-lang'

function currentLang() {
  return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'fil'
}

function loadSessionUser() {
  const userId = getCurrentUserId()
  if (!userId) return null
  const user = findUserById(userId)
  return user ? toProfile(user) : null
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(loadSessionUser())
    setLoading(false)
  }, [])

  const signup = useCallback(async (displayName, password) => {
    const lang = currentLang()
    const trimmedName = displayName.trim()

    if (!trimmedName || !password) {
      return { ok: false, error: getMessage(lang, 'auth.fillAllFields') }
    }
    if (password.length < 6) {
      return { ok: false, error: getMessage(lang, 'auth.passwordMin') }
    }

    const result = createUser(trimmedName, password)
    if (result.error) {
      return { ok: false, error: authErrorMessage(result.error) }
    }

    clearSession()
    setUser(null)

    return {
      ok: true,
      message: getMessage(lang, 'auth.signupSuccess'),
      loginName: trimmedName,
    }
  }, [])

  const login = useCallback(async (displayName, password) => {
    const lang = currentLang()
    const trimmedName = displayName.trim()

    if (!trimmedName || !password) {
      return { ok: false, error: getMessage(lang, 'auth.fillNamePassword') }
    }

    const result = verifyLogin(trimmedName, password)
    if (result.error) {
      return { ok: false, error: authErrorMessage(result.error) }
    }

    setActiveSession(result.user.id)
    setUser(toProfile(result.user))
    return { ok: true }
  }, [])

  const logout = useCallback(async () => {
    clearSession()
    setUser(null)
  }, [])

  const updateProfile = useCallback(
    async (name) => {
      if (!user) return
      const lang = currentLang()
      const trimmedName = name.trim()

      if (!trimmedName) {
        throw new Error(getMessage(lang, 'auth.nameRequired'))
      }

      const result = updateUserProfile(user.id, trimmedName)
      if (result.error) throw new Error(authErrorMessage(result.error))

      setUser((prev) =>
        prev
          ? { ...prev, name: trimmedName, username: result.user.username }
          : prev,
      )
    },
    [user],
  )

  return {
    user,
    loading,
    signup,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  }
}
