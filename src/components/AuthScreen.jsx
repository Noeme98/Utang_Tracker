import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider'

export default function AuthScreen({ onSignup, onLogin }) {
  const { t } = useLanguage()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function switchMode(next) {
    setMode(next)
    setError('')
    setMessage('')
    if (next === 'signup') {
      setName('')
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
          ? await onSignup(name, email, password)
          : await onLogin(email, password)

      if (!result.ok) {
        setError(result.error)
        return
      }

      if (result.message) {
        setMessage(result.message)
        setMode('login')
        setEmail(result.email || email)
        setPassword('')
        setName('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <motion className="auth-brand">
          <span className="auth-logo">🏪</span>
          <h1>{t('appName')}</h1>
          <p className="auth-tagline">{t('auth.tagline')}</p>
        </motion>

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

          {mode === 'signup' && (
            <label className="field">
              <span>{t('auth.yourName')} *</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Hal. Maria Santos"
                autoFocus
                disabled={submitting}
              />
              <span className="field-hint">{t('auth.nameHint')}</span>
            </label>
          )}

          <label className="field">
            <span>{t('auth.email')} *</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              autoFocus={mode === 'login'}
              disabled={submitting}
            />
          </label>

          <label className="field">
            <span>{t('auth.password')} *</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
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

function motion({ className, children }) {
  return <div className={className}>{children}</div>
}
