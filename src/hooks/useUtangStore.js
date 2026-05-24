import { useCallback, useEffect, useState } from 'react'
import { getMessage } from '../i18n/LanguageProvider'
import {
  getDebtorsByUser,
  getTransactionsByUser,
  insertDebtor,
  insertTransaction,
} from '../lib/localDb'
import { mapDebtor, mapTransaction } from '../lib/mappers'

const emptyState = { debtors: [], transactions: [] }

const LANG_KEY = 'utang-tracker-lang'

function currentLang() {
  return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'fil'
}

export function useUtangStore(userId) {
  const [state, setState] = useState(emptyState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = useCallback((uid) => {
    if (!uid) {
      setState(emptyState)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      setState({
        debtors: getDebtorsByUser(uid).map(mapDebtor),
        transactions: getTransactionsByUser(uid).map(mapTransaction),
      })
    } catch {
      setError(getMessage(currentLang(), 'errors.loadData'))
      setState(emptyState)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData(userId)
  }, [userId, loadData])

  const addDebtor = useCallback(
    async (name, contact) => {
      const row = insertDebtor(userId, name, contact)
      const debtor = mapDebtor(row)
      setState((prev) => ({ ...prev, debtors: [...prev.debtors, debtor] }))
      return debtor.id
    },
    [userId],
  )

  const addUtang = useCallback(
    async (debtorId, amount, description, date) => {
      const row = insertTransaction(userId, debtorId, 'utang', amount, description, date)
      const transaction = mapTransaction(row)
      setState((prev) => ({
        ...prev,
        transactions: [transaction, ...prev.transactions],
      }))
    },
    [userId],
  )

  const addBayad = useCallback(
    async (debtorId, amount, date) => {
      const row = insertTransaction(userId, debtorId, 'bayad', amount, '', date)
      const transaction = mapTransaction(row)
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
