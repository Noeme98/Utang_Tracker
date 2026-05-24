import { useState } from 'react'
import Modal from './Modal'

export default function AddDebtorForm({ onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Kailangan ang pangalan.')
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
    <Modal title="Bagong Umutang" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        <label className="field">
          <span>Pangalan *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Hal. Juan Dela Cruz"
            autoFocus
          />
        </label>
        <label className="field">
          <span>Contact (optional)</span>
          <input
            type="tel"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="09XX XXX XXXX"
          />
        </label>
        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? 'Sine-save...' : 'I-save'}
        </button>
      </form>
    </Modal>
  )
}
