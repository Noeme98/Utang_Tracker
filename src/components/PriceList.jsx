import { useMemo, useState } from 'react'
import { formatPeso } from '../utils/helpers'

export default function PriceList({ items, loading, error, onSaveItem, onDeleteItem, onReload }) {
  const [search, setSearch] = useState('')
  const [itemName, setItemName] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [formError, setFormError] = useState('')
  const [flash, setFlash] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => item.name.toLowerCase().includes(q))
  }, [items, search])

  const lookupMatch = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return null
    return items.find((item) => item.name.toLowerCase() === q) ?? null
  }, [items, search])

  function showFlash(message) {
    setFlash(message)
    setTimeout(() => setFlash(''), 2500)
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)

    try {
      const saved = await onSaveItem(itemName, itemPrice)
      setItemName('')
      setItemPrice('')
      setSearch(saved.name)
      showFlash(`Na-save: ${saved.name} — ${formatPeso(saved.price)}`)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function fillForm(item) {
    setItemName(item.name)
    setItemPrice(String(item.price))
    setFormError('')
  }

  async function handleDelete(item) {
    if (!confirm(`Tanggalin ang "${item.name}"?`)) return
    try {
      await onDeleteItem(item.id)
      showFlash(`Tinanggal: ${item.name}`)
    } catch (err) {
      setFormError(err.message)
    }
  }

  if (loading) {
    return (
      <motion className="loading-inline">
        <span className="loading-spinner" />
        <p>Kinukuha ang presyo...</p>
      </motion>
    )
  }

  if (error) {
    return (
      <div className="empty-state">
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={onReload}>
          Subukan ulit
        </button>
      </div>
    )
  }

  return (
    <div className="page price-page">
      <section className="price-lookup">
        <label className="field">
          <span>Hanapin ang presyo</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hal. bigas, shampoo, kape..."
          />
        </label>

        {lookupMatch && (
          <div className="price-match-card">
            <span className="price-match-name">{lookupMatch.name}</span>
            <span className="price-match-amount">{formatPeso(lookupMatch.price)}</span>
          </div>
        )}

        {search.trim() && !lookupMatch && filtered.length === 0 && (
          <p className="price-no-match">
            Walang naka-record na &quot;{search.trim()}&quot; — i-add sa baba.
          </p>
        )}
      </section>

      <section className="price-add-card">
        <h2>I-record ang Presyo</h2>
        <p className="price-add-hint">Maglagay ng item at presyo — ma-save agad.</p>

        {flash && <p className="form-success">{flash}</p>}
        {formError && <p className="form-error">{formError}</p>}

        <form className="price-add-form" onSubmit={handleSave}>
          <label className="field">
            <span>Item *</span>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Hal. Lucky Me Pancit Canton"
              disabled={saving}
            />
          </label>
          <label className="field">
            <span>Presyo (₱) *</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              placeholder="0.00"
              disabled={saving}
            />
          </label>
          <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
            {saving ? 'Sine-save...' : 'I-save ang Presyo'}
          </button>
        </form>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Lista ng Presyo</h2>
          <span className="price-count">{items.length} items</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>{search ? 'Walang match.' : 'Walang items pa. Mag-add sa taas!'}</p>
          </div>
        ) : (
          <div className="card-list">
            {filtered.map((item) => (
              <motion key={item.id} className="list-card price-item-card">
                <button
                  type="button"
                  className="price-item-main"
                  onClick={() => fillForm(item)}
                >
                  <span className="list-card-title">{item.name}</span>
                  <span className="price-item-amount">{formatPeso(item.price)}</span>
                </button>
                <button
                  type="button"
                  className="btn-icon price-item-delete"
                  onClick={() => handleDelete(item)}
                  aria-label={`Delete ${item.name}`}
                >
                  ✕
                </button>
              </motion>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function motion({ className, children, ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}
