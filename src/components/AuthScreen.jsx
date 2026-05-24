import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider'

export default function AuthScreen({ onSignup, onLogin }) {
  const { t } = useLanguage()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function switchMode(next) {
    setMode(next)
    setError('')
    setMessage('')
    if (next === 'signup') {
      setPassword('')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    try {
      const result =
        mode === 'signup'
          ? await onSignup(name, password)
          : await onLogin(name, password)

      if (!result.ok) {
        setError(result.error)
        return
      }

      if (result.message) {
        setMessage(result.message)
        setMode('login')
        setName(result.loginName || name)
        setPassword('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">🏪</span>
          <h1>{t('appName')}</h1>
          <p className="auth-tagline">{t('auth.tagline')}</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            {t('auth.login')}
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            {t('auth.signup')}
          </button>
        </div>

        <form className="form auth-form" onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}

          <label className="field">
            <span>{t('auth.yourName')} *</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.namePlaceholder')}
              autoComplete="username"
              autoFocus
              disabled={submitting}
            />
            <span className="field-hint">
              {mode === 'signup' ? t('auth.nameHint') : t('auth.loginHint')}
            </span>
          </label>

          <label className="field">
            <span>{t('auth.password')} *</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === 'signup'
                  ? t('auth.passwordPlaceholderSignup')
                  : t('auth.passwordPlaceholderLogin')
              }
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              disabled={submitting}
            />
          </label>

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting
              ? t('auth.pleaseWait')
              : mode === 'signup'
                ? t('auth.createAccount')
                : t('auth.login')}
          </button>
        </form>
      </div>
    </div>
  )
}
