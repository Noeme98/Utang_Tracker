import { useCallback, useEffect, useState } from 'react'
import { getMessage } from '../i18n/LanguageProvider'
import { supabase } from '../lib/supabase'
import { authErrorMessage } from '../lib/mappers'

const LANG_KEY = 'utang-tracker-lang'

function currentLang() {
  return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'fil'
}

async function loadUserProfile(authUser) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', authUser.id)
    .maybeSingle()

  return {
    id: authUser.id,
    name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
    email: profile?.email || authUser.email || '',
  }
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function initSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!active) return

      if (session?.user) {
        const profile = await loadUserProfile(session.user)
        if (active) setUser(profile)
      }

      if (active) setLoading(false)
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          const profile = await loadUserProfile(session.user)
          setUser(profile)
        } else {
          setUser(null)
        }
        setLoading(false)
      },
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const lang = currentLang()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedName || !trimmedEmail || !password) {
      return { ok: false, error: getMessage(lang, 'auth.fillAllFields') }
    }
    if (password.length < 6) {
      return { ok: false, error: getMessage(lang, 'auth.passwordMin') }
    }

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: { data: { name: trimmedName } },
    })

    if (error) {
      return { ok: false, error: authErrorMessage(error) }
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: trimmedName,
        email: trimmedEmail,
      })
    }

    // Always sign out after signup — user must log in manually
    await supabase.auth.signOut()
    setUser(null)

    return {
      ok: true,
      message: getMessage(lang, 'auth.signupSuccess'),
      email: trimmedEmail,
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const lang = currentLang()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail || !password) {
      return { ok: false, error: getMessage(lang, 'auth.fillEmailPassword') }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    if (error) {
      return { ok: false, error: authErrorMessage(error) }
    }

    return { ok: true }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (name) => {
    if (!user) return
    const trimmedName = name.trim()
    const lang = currentLang()

    if (!trimmedName) {
      throw new Error(getMessage(lang, 'auth.nameRequired'))
    }

    const { error } = await supabase
      .from('profiles')
      .update({ name: trimmedName })
      .eq('id', user.id)

    if (error) throw new Error(authErrorMessage(error))

    setUser((prev) => (prev ? { ...prev, name: trimmedName } : prev))
  }, [user])

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
