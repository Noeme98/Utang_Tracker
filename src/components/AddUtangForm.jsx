import { useState } from 'react'
import { todayISO } from '../utils/helpers'
import Modal from './Modal'

export default function AddUtangForm({ debtors, preselectedDebtorId, onClose, onSubmit }) {
  const [debtorId, setDebtorId] = useState(preselectedDebtorId || '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
    if (!description.trim()) {
      setError('Maglagay ng item description.')
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
    <Modal title="Bagong Utang" onClose={onClose}>
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
            {debtors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Amount (₱) *</span>
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
          <span>Items / Description *</span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Hal. bigas, shampoo"
          />
        </label>
        <label className="field">
          <span>Petsa</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? 'Sine-save...' : 'I-record ang Utang'}
        </button>
      </form>
    </Modal>
  )
}
