import { useState } from 'react'
import Icon from './Icon.jsx'

function SavedPasswords({ passwords, error, onDelete, onCopy }) {
  const [revealed, setRevealed] = useState({})

  return (
    <section aria-labelledby="saved-title" className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="saved-title" className="text-lg font-bold tracking-tight text-slate-900">Saved passwords</h2>
          <p className="mt-1 text-sm text-slate-500">Your saved entries stay in this browser.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
          {passwords.length} {passwords.length === 1 ? 'password' : 'passwords'}
        </span>
      </div>

      <div role="note" className="mb-5 flex gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <Icon name="shield" className="h-4 w-4" />
        </span>
        <p className="text-xs leading-5 text-amber-900/80">
          <strong className="font-semibold text-amber-950">Storage note:</strong> Saved passwords are kept in your browser&apos;s local storage. It is not encrypted, so this is not a secure password vault. Don&apos;t save sensitive passwords on a shared device.
        </p>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-rose-700">{error}</p>}

      {passwords.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center">
          <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-600">
            <Icon name="copy" className="h-[18px] w-[18px]" />
          </span>
          <p className="text-sm font-semibold text-slate-700">Nothing saved just yet</p>
          <p className="mt-1 text-xs text-slate-400">Give a password a label to keep it here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {passwords.map((item) => {
            const isRevealed = Boolean(revealed[item.id])
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-3 py-3.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{item.label}</p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-500">
                    {isRevealed ? item.password : '•'.repeat(Math.min(item.password.length, 24))}
                    {!isRevealed && item.password.length > 24 && <span className="sr-only">, hidden password</span>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setRevealed((current) => ({ ...current, [item.id]: !current[item.id] }))}
                    aria-label={`${isRevealed ? 'Hide' : 'Reveal'} password for ${item.label}`}
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-500"
                  >
                    <Icon name={isRevealed ? 'eyeOff' : 'eye'} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onCopy(item.password)}
                    aria-label={`Copy password for ${item.label}`}
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-500"
                  >
                    <Icon name="copy" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    aria-label={`Delete saved password for ${item.label}`}
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose-500"
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default SavedPasswords
