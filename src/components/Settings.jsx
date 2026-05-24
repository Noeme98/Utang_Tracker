import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider'
import { exportStoreData } from '../utils/exportData'

export default function Settings({
  user,
  debtors,
  transactions,
  items,
  onUpdateName,
  onLogout,
}) {
  const { lang, setLang, t } = useLanguage()
  const [name, setName] = useState(user.name)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleUpdateName(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await onUpdateName(name)
      setMessage(t('settings.nameUpdated'))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleExport() {
    exportStoreData({ debtors, transactions, items, storeName: user.name })
    setMessage(t('settings.exportSuccess'))
    setError('')
  }

  function handleLogout() {
    if (confirm(t('settings.logoutConfirm'))) {
      onLogout()
    }
  }

  return (
    <div className="page settings-page">
      <section className="settings-section">
        <h2>{t('settings.language')}</h2>
        <div className="lang-toggle">
          <button
            type="button"
            className={`lang-btn ${lang === 'fil' ? 'active' : ''}`}
            onClick={() => setLang('fil')}
          >
            🇵🇭 {t('settings.filipino')}
          </button>
          <button
            type="button"
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            🇺🇸 {t('settings.english')}
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2>{t('settings.profile')}</h2>
        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error">{error}</p>}
        <form className="form" onSubmit={handleUpdateName}>
          <label className="field">
            <span>{t('settings.storeName')}</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
          </label>
          <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
            {saving ? t('saving') : t('settings.updateName')}
          </button>
        </form>
      </section>

      <section className="settings-section">
        <h2>{t('settings.export')}</h2>
        <p className="settings-hint">{t('settings.exportHint')}</p>
        <button type="button" className="btn btn-secondary btn-full" onClick={handleExport}>
          📥 {t('settings.export')}
        </button>
      </section>

      <section className="settings-section">
        <button type="button" className="btn btn-danger btn-full" onClick={handleLogout}>
          {t('settings.logout')}
        </button>
        <p className="settings-version">{t('settings.version')}</p>
      </section>
    </div>
  )
}
