import { useMemo, useState } from 'react'
import { useLanguage } from '../i18n/LanguageProvider'
import { formatPeso } from '../utils/helpers'

export default function PriceList({ items, loading, error, onSaveItem, onDeleteItem, onReload }) {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [itemName, setItemName] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [formError, setFormError] = useState('')
  const [flash, setFlash] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

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

  function openAddForm() {
    setShowAddForm(true)
    setFormError('')
  }

  function closeAddForm() {
    setShowAddForm(false)
    setEditingId(null)
    setItemName('')
    setItemPrice('')
    setFormError('')
  }

  function toggleAddForm() {
    if (showAddForm) {
      closeAddForm()
    } else {
      setEditingId(null)
      setItemName('')
      setItemPrice('')
      setFormError('')
      setShowAddForm(true)
    }
  }

  function startEdit(item) {
    setEditingId(item.id)
    setItemName(item.name)
    setItemPrice(String(item.price))
    setFormError('')
    setShowAddForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)

    try {
      const saved = await onSaveItem(itemName, itemPrice)
      setItemName('')
      setItemPrice('')
      setEditingId(null)
      setSearch(saved.name)
      setShowAddForm(false)
      showFlash(
        t('prices.saved', { name: saved.name, price: formatPeso(saved.price) }),
      )
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item) {
    if (!confirm(t('prices.deleteConfirm', { name: item.name }))) return
    try {
      await onDeleteItem(item.id)
      if (editingId === item.id) closeAddForm()
      showFlash(t('prices.deleted', { name: item.name }))
    } catch (err) {
      setFormError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="loading-inline">
        <span className="loading-spinner" />
        <p>{t('loadingPrices')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="empty-state">
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={onReload}>
          {t('tryAgain')}
        </button>
      </div>
    )
  }

  return (
    <div className="page price-page">
      <section className="price-search-wrap">
        <div className="price-search-field">
          <span className="price-search-icon" aria-hidden>
            🔍
          </span>
          <input
            type="search"
            className="price-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('prices.searchPlaceholder')}
            aria-label={t('prices.searchPrice')}
          />
        </div>

        {lookupMatch && (
          <div className="price-match-card">
            <span className="price-match-name">{lookupMatch.name}</span>
            <span className="price-match-amount">{formatPeso(lookupMatch.price)}</span>
          </div>
        )}

        {search.trim() && !lookupMatch && filtered.length === 0 && (
          <p className="price-no-match">
            {t('prices.noRecord', { name: search.trim() })}
          </p>
        )}
      </section>

      <section className="price-add-section">
        <div className="price-add-toggle">
          <div className="price-add-toggle-text">
            <h2>{t('prices.recordPrice')}</h2>
            <p>{showAddForm ? t('prices.recordHint') : t('prices.tapToAdd')}</p>
          </div>
          <button
            type="button"
            className={`price-add-btn ${showAddForm ? 'is-open' : ''}`}
            onClick={toggleAddForm}
            aria-expanded={showAddForm}
            aria-label={showAddForm ? t('close') : t('prices.addItem')}
          >
            {showAddForm ? '✕' : '+'}
          </button>
        </div>

        {showAddForm && (
          <div className="price-add-panel">
            {flash && <p className="form-success">{flash}</p>}
            {formError && <p className="form-error">{formError}</p>}

            <form className="price-add-form" onSubmit={handleSave}>
              <label className="field">
                <span>{t('prices.item')} *</span>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder={t('prices.itemPlaceholder')}
                  disabled={saving}
                  autoFocus
                />
              </label>
              <label className="field">
                <span>{t('prices.price')} *</span>
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
              <div className="price-add-form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAddForm}
                  disabled={saving}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? t('saving') : t('prices.savePrice')}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {!showAddForm && flash && <p className="form-success price-flash">{flash}</p>}

      <section className="price-list-section">
        <div className="price-list-header">
          <h2>{t('prices.priceList')}</h2>
          <span className="price-count-badge" aria-label={t('prices.itemsCount', { n: items.length })}>
            {items.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="price-empty">
            <span className="price-empty-icon" aria-hidden>
              🏷️
            </span>
            <p className="price-empty-title">
              {search ? t('prices.noMatch') : t('prices.emptyTitle')}
            </p>
            <p className="price-empty-hint">
              {search ? t('prices.emptySearchHint') : t('prices.emptyHint')}
            </p>
            {!search && (
              <button type="button" className="btn btn-primary price-empty-cta" onClick={openAddForm}>
                + {t('prices.addItem')}
              </button>
            )}
          </div>
        ) : (
          <div className="price-grid">
            {filtered.map((item) => (
              <article key={item.id} className="price-grid-card">
                <h3 className="price-grid-name">{item.name}</h3>
                <p className="price-grid-amount">{formatPeso(item.price)}</p>
                <div className="price-grid-actions">
                  <button
                    type="button"
                    className="price-grid-btn price-grid-btn-edit"
                    onClick={() => startEdit(item)}
                    aria-label={`${t('prices.edit')}: ${item.name}`}
                    title={t('prices.edit')}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="price-grid-btn price-grid-btn-delete"
                    onClick={() => handleDelete(item)}
                    aria-label={`${t('prices.delete')}: ${item.name}`}
                    title={t('prices.delete')}
                  >
                    🗑️
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
