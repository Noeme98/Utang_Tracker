import { useCallback, useEffect, useState } from 'react'
import { getMessage } from '../i18n/LanguageProvider'
import {
  deleteStoreItem,
  getStoreItemsByUser,
  upsertStoreItem,
} from '../lib/localDb'
import { mapStoreItem } from '../lib/mappers'

const LANG_KEY = 'utang-tracker-lang'

function currentLang() {
  return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'fil'
}

export function useStoreItems(userId, enabled = true) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadItems = useCallback((uid) => {
    if (!uid) {
      setItems([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      setItems(getStoreItemsByUser(uid).map(mapStoreItem))
    } catch {
      setError(getMessage(currentLang(), 'errors.loadPrices'))
      setItems([])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    if (enabled && userId) {
      loadItems(userId)
    }
  }, [userId, enabled, loadItems])

  const saveItem = useCallback(
    async (name, price) => {
      const lang = currentLang()
      const trimmedName = name.trim()
      const numPrice = Number(price)

      if (!trimmedName) throw new Error(getMessage(lang, 'prices.itemRequired'))
      if (!numPrice || numPrice <= 0) throw new Error(getMessage(lang, 'prices.priceRequired'))

      const row = upsertStoreItem(userId, trimmedName, numPrice)
      const mapped = mapStoreItem(row)

      setItems((prev) => {
        const exists = prev.some((item) => item.id === mapped.id)
        const next = exists
          ? prev.map((item) => (item.id === mapped.id ? mapped : item))
          : [...prev, mapped]
        return next.sort((a, b) => a.name.localeCompare(b.name))
      })

      return mapped
    },
    [userId],
  )

  const deleteItem = useCallback(async (itemId) => {
    deleteStoreItem(itemId)
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }, [])

  return {
    items,
    loading,
    error,
    reload: () => loadItems(userId),
    saveItem,
    deleteItem,
  }
}
