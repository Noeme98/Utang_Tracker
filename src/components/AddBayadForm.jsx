import { useState } from 'react'
import { formatPeso, getDebtorBalance, todayISO } from '../utils/helpers'
import Modal from './Modal'

export default function AddBayadForm({
  debtors,
  transactions,
  preselectedDebtorId,
  onClose,
  onSubmit,
}) {
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
      setError('Pumili ng umutang.')
      return
    }
    const num = parseFloat(amount)
    if (!num || num <= 0) {
      setError('Maglagay ng valid na amount.')
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
    <Modal title="Record Bayad" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        <label className="field">
          <span>Umutang *</span>
          <select
            value={debtorId}
            onChange={(e) => setDebtorId(e.target.value)}
            disabled={!!preselectedDebtorId}
          >
            <option value="">— Pumili —</option>
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
          <p className="balance-hint">Balance: {formatPeso(balance)}</p>
        )}
        <label className="field">
          <span>Amount Paid (₱) *</span>
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
          <span>Petsa</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? 'Sine-save...' : 'I-record ang Bayad'}
        </button>
      </form>
    </Modal>
  )
}
