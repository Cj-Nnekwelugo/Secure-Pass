import { useState } from 'react'

const STORAGE_KEY = 'secure-pass.saved-passwords.v1'

function readPasswords() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return { passwords: [], error: '' }

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) throw new Error('Saved passwords have an invalid format.')
    return {
      passwords: parsed.filter((item) => (
        item
        && typeof item.id === 'string'
        && typeof item.label === 'string'
        && typeof item.password === 'string'
        && typeof item.createdAt === 'string'
      )),
      error: '',
    }
  } catch {
    return {
      passwords: [],
      error: 'Saved passwords could not be read from this browser. Check your storage settings.',
    }
  }
}

function useSavedPasswords() {
  const [storedState, setStoredState] = useState(readPasswords)

  function persist(nextPasswords) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPasswords))
      setStoredState({ passwords: nextPasswords, error: '' })
      return true
    } catch {
      setStoredState((current) => ({
        ...current,
        error: 'Changes could not be saved. Check your browser storage settings and available space.',
      }))
      return false
    }
  }

  function addPassword(label, password) {
    const cleanLabel = label.trim()
    if (!cleanLabel || !password) {
      setStoredState((current) => ({
        ...current,
        error: 'Add a label and generate a password before saving.',
      }))
      return false
    }

    const nextPasswords = [
      {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        label: cleanLabel,
        password,
        createdAt: new Date().toISOString(),
      },
      ...storedState.passwords,
    ]
    return persist(nextPasswords)
  }

  function deletePassword(id) {
    return persist(storedState.passwords.filter((item) => item.id !== id))
  }

  return {
    passwords: storedState.passwords,
    error: storedState.error,
    addPassword,
    deletePassword,
  }
}

export default useSavedPasswords
