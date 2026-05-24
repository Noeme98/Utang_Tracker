import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider'
import { todayISO } from '../utils/helpers'
import Modal from './Modal'

export default function AddUtangForm({ debtors, preselectedDebtorId, onClose, onSubmit }) {
  const { t } = useLanguage()
  const [debtorId, setDebtorId] = useState(preselectedDebtorId || '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!debtorId) {
      setError(t('utang.selectDebtor'))
      return
    }
    const num = parseFloat(amount)
    if (!num || num <= 0) {
      setError(t('utang.validAmount'))
      return
    }
    if (!description.trim()) {
      setError(t('utang.needDescription'))
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(debtorId, num, description, date)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={t('utang.newUtang')} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        <label className="field">
          <span>{t('utang.debtor')} *</span>
          <select
            value={debtorId}
            onChange={(e) => setDebtorId(e.target.value)}
            disabled={!!preselectedDebtorId}
          >
            <option value="">{t('utang.choose')}</option>
            {debtors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{t('utang.amount')} *</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <label className="field">
          <span>{t('utang.items')} *</span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('utang.itemsPlaceholder')}
          />
        </label>
        <label className="field">
          <span>{t('utang.date')}</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? t('saving') : t('utang.recordUtang')}
        </button>
      </form>
    </Modal>
  )
}
