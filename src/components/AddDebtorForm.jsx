import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider'
import Modal from './Modal'

export default function AddDebtorForm({ onClose, onSubmit }) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('debtors.nameRequired'))
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(name, contact)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={t('debtors.newDebtor')} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        <label className="field">
          <span>{t('debtors.name')} *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('debtors.namePlaceholder')}
            autoFocus
          />
        </label>
        <label className="field">
          <span>
            {t('debtors.contact')} ({t('optional')})
          </span>
          <input
            type="tel"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t('debtors.contactPlaceholder')}
          />
        </label>
        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? t('saving') : t('save')}
        </button>
      </form>
    </Modal>
  )
}
