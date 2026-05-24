import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider'
import { formatPeso, getDebtorBalance, todayISO } from '../utils/helpers'
import Modal from './Modal'

export default function AddBayadForm({
  debtors,
  transactions,
  preselectedDebtorId,
  onClose,
  onSubmit,
}) {
  const { t } = useLanguage()
  const [debtorId, setDebtorId] = useState(preselectedDebtorId || '')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const balance =
    debtorId ? Math.max(0, getDebtorBalance(debtorId, transactions)) : 0

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
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(debtorId, num, date)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={t('bayad.recordBayad')} onClose={onClose}>
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
            {debtors.map((d) => {
              const bal = getDebtorBalance(d.id, transactions)
              return (
                <option key={d.id} value={d.id}>
                  {d.name} ({formatPeso(Math.max(0, bal))})
                </option>
              )
            })}
          </select>
        </label>
        {debtorId && balance > 0 && (
          <p className="balance-hint">
            {t('bayad.balance')}: {formatPeso(balance)}
          </p>
        )}
        <label className="field">
          <span>{t('bayad.amountPaid')} *</span>
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
          <span>{t('utang.date')}</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? t('saving') : t('bayad.saveBayad')}
        </button>
      </form>
    </Modal>
  )
}
