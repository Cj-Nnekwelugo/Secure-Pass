import { useState } from 'react'
import Header from './components/Header.jsx'
import PasswordGenerator from './components/PasswordGenerator.jsx'
import SavedPasswords from './components/SavedPasswords.jsx'
import TipsCard from './components/TipsCard.jsx'
import useSavedPasswords from './hooks/useSavedPasswords.js'
import { generatePassword } from './utils/password.js'

const initialOptions = {
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
}

function createInitialPassword() {
  try {
    return { password: generatePassword(16, initialOptions), error: '' }
  } catch (error) {
    return { password: '', error: error.message }
  }
}

function App() {
  const [initialPassword] = useState(createInitialPassword)
  const [password, setPassword] = useState(initialPassword.password)
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState(initialOptions)
  const [generationError, setGenerationError] = useState(initialPassword.error)
  const [notice, setNotice] = useState('')
  const savedPasswords = useSavedPasswords()

  function regenerate() {
    try {
      setPassword(generatePassword(length, options))
      setGenerationError('')
      setNotice('A new password is ready.')
    } catch (error) {
      setGenerationError(error.message)
      setNotice('')
    }
  }

  async function copyPassword(value) {
    try {
      await navigator.clipboard.writeText(value)
      setNotice('Password copied to clipboard.')
      setGenerationError('')
    } catch {
      setNotice('')
      setGenerationError('Clipboard access is unavailable. You can select and copy the password instead.')
    }
  }

  function savePassword(label) {
    const result = savedPasswords.addPassword(label, password)
    if (result) {
      setNotice(`“${label}” was saved on this device.`)
      setGenerationError('')
    } else {
      setGenerationError(savedPasswords.error || 'This password could not be saved.')
    }
    return result
  }

  async function copySavedPassword(value) {
    await copyPassword(value)
  }

  return (
    <div className="relative isolate min-h-screen min-w-80 overflow-x-clip bg-[#f7f8fc] font-sans text-slate-900 antialiased">
      <div className="pointer-events-none absolute -left-32 top-56 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-36 top-[34rem] h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 pb-12 sm:px-8 lg:px-10">
        <Header />
        <main className="mx-auto max-w-4xl">
          <div className="mb-8 text-center sm:mb-11">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-violet-700 shadow-sm shadow-violet-100/60 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              PRIVATE BY DESIGN
            </p>
            <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Better passwords, <span className="text-violet-600">made easy.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
              Create a strong, one-of-a-kind password in seconds. Everything happens right here in your browser.
            </p>
            <ul aria-label="SecurePass benefits" className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2 text-[11px] font-medium text-slate-600 sm:gap-3 sm:text-xs">
              <li className="rounded-full border border-slate-200/80 bg-white/75 px-3 py-1.5">Generated with your browser&apos;s secure randomness</li>
              <li className="rounded-full border border-slate-200/80 bg-white/75 px-3 py-1.5">No account or upload required</li>
            </ul>
          </div>

          <PasswordGenerator
            password={password}
            length={length}
            options={options}
            onLengthChange={setLength}
            onOptionsChange={setOptions}
            onGenerate={regenerate}
            onCopy={copyPassword}
            onSave={savePassword}
            error={generationError}
          />

          {notice && (
            <p aria-live="polite" role="status" className="mt-4 text-center text-sm font-medium text-emerald-700">
              {notice}
            </p>
          )}
          <SavedPasswords
            passwords={savedPasswords.passwords}
            error={savedPasswords.error}
            onDelete={savedPasswords.deletePassword}
            onCopy={copySavedPassword}
          />
          <TipsCard />
          <footer className="mt-10 border-t border-slate-200/80 pt-5 text-center text-xs text-slate-400">
            Made for your peace of mind <span aria-hidden="true">·</span> No accounts, no servers, no tracking
          </footer>
        </main>
      </div>
    </div>
  )
}

export default App
