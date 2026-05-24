import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { authErrorMessage, mapStoreItem } from '../lib/mappers'

export function useStoreItems(userId, enabled = true) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadItems = useCallback(async (uid) => {
    if (!uid) {
      setItems([])
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('store_items')
      .select('*')
      .eq('user_id', uid)
      .order('name', { ascending: true })

    if (fetchError) {
      setError(authErrorMessage(fetchError))
      setItems([])
    } else {
      setItems((data ?? []).map(mapStoreItem))
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
      const trimmedName = name.trim()
      const numPrice = Number(price)

      if (!trimmedName) throw new Error('Maglagay ng pangalan ng item.')
      if (!numPrice || numPrice <= 0) throw new Error('Maglagay ng valid na presyo.')

      const existing = items.find(
        (item) => item.name.toLowerCase() === trimmedName.toLowerCase(),
      )

      if (existing) {
        const { data, error: updateError } = await supabase
          .from('store_items')
          .update({ price: numPrice, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single()

        if (updateError) throw new Error(authErrorMessage(updateError))

        const updated = mapStoreItem(data)
        setItems((prev) =>
          prev
            .map((item) => (item.id === updated.id ? updated : item))
            .sort((a, b) => a.name.localeCompare(b.name)),
        )
        return updated
      }

      const { data, error: insertError } = await supabase
        .from('store_items')
        .insert({
          user_id: userId,
          name: trimmedName,
          price: numPrice,
        })
        .select()
        .single()

      if (insertError) throw new Error(authErrorMessage(insertError))

      const created = mapStoreItem(data)
      setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      return created
    },
    [userId, items],
  )

  const deleteItem = useCallback(async (itemId) => {
    const { error: deleteError } = await supabase.from('store_items').delete().eq('id', itemId)
    if (deleteError) throw new Error(authErrorMessage(deleteError))
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
