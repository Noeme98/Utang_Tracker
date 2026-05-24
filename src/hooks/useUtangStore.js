import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { authErrorMessage, mapDebtor, mapTransaction } from '../lib/mappers'

const emptyState = { debtors: [], transactions: [] }

export function useUtangStore(userId) {
  const [state, setState] = useState(emptyState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = useCallback(async (uid) => {
    if (!uid) {
      setState(emptyState)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const [debtorsRes, transactionsRes] = await Promise.all([
      supabase
        .from('debtors')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: true }),
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', uid)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false }),
    ])

    if (debtorsRes.error || transactionsRes.error) {
      const err = debtorsRes.error || transactionsRes.error
      setError(authErrorMessage(err))
      setState(emptyState)
      setLoading(false)
      return
    }

    setState({
      debtors: (debtorsRes.data ?? []).map(mapDebtor),
      transactions: (transactionsRes.data ?? []).map(mapTransaction),
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData(userId)
  }, [userId, loadData])

  const addDebtor = useCallback(
    async (name, contact) => {
      const { data, error } = await supabase
        .from('debtors')
        .insert({
          user_id: userId,
          name: name.trim(),
          contact: contact?.trim() || '',
        })
        .select()
        .single()

      if (error) throw new Error(authErrorMessage(error))

      const debtor = mapDebtor(data)
      setState((prev) => ({ ...prev, debtors: [...prev.debtors, debtor] }))
      return debtor.id
    },
    [userId],
  )

  const addUtang = useCallback(
    async (debtorId, amount, description, date) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          debtor_id: debtorId,
          type: 'utang',
          amount: Number(amount),
          description: description.trim(),
          date,
        })
        .select()
        .single()

      if (error) throw new Error(authErrorMessage(error))

      const transaction = mapTransaction(data)
      setState((prev) => ({
        ...prev,
        transactions: [transaction, ...prev.transactions],
      }))
    },
    [userId],
  )

  const addBayad = useCallback(
    async (debtorId, amount, date) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          debtor_id: debtorId,
          type: 'bayad',
          amount: Number(amount),
          description: '',
          date,
        })
        .select()
        .single()

      if (error) throw new Error(authErrorMessage(error))

      const transaction = mapTransaction(data)
      setState((prev) => ({
        ...prev,
        transactions: [transaction, ...prev.transactions],
      }))
    },
    [userId],
  )

  return {
    debtors: state.debtors,
    transactions: state.transactions,
    loading,
    error,
    reload: () => loadData(userId),
    addDebtor,
    addUtang,
    addBayad,
  }
}
