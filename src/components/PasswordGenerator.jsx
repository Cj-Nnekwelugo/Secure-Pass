import { useState } from 'react'
import Icon from './Icon.jsx'
import StrengthMeter from './StrengthMeter.jsx'

const characterOptions = [
  { key: 'lowercase', label: 'Lowercase', example: 'abc' },
  { key: 'uppercase', label: 'Uppercase', example: 'ABC' },
  { key: 'numbers', label: 'Numbers', example: '123' },
  { key: 'symbols', label: 'Symbols', example: '#$&' },
]

function PasswordGenerator({
  password,
  length,
  options,
  onLengthChange,
  onOptionsChange,
  onGenerate,
  onCopy,
  onSave,
  error,
}) {
  const [label, setLabel] = useState('')

  function handleSave(event) {
    event.preventDefault()
    if (onSave(label)) setLabel('')
  }

  function toggleOption(key) {
    onOptionsChange({ ...options, [key]: !options[key] })
  }

  return (
    <section aria-labelledby="generator-title" className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
      <div className="relative overflow-hidden bg-slate-950 px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
        <div className="pointer-events-none absolute -right-10 -top-32 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-8rem] left-1/3 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Password studio</p>
              <h2 id="generator-title" className="text-lg font-semibold text-white sm:text-xl">Your new password</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300">Private &amp; local</span>
          </div>

          <div className="flex min-h-[4.25rem] items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] p-2.5 pl-3 sm:min-h-[4.75rem] sm:gap-3 sm:p-3 sm:pl-5">
            <output
              aria-label="Generated password"
              className="min-w-0 flex-1 break-all font-mono text-lg font-medium tracking-wide text-white sm:text-[22px]"
            >
              {password || <span className="text-sm font-normal text-slate-400">Choose at least one character type</span>}
            </output>
            <button
              type="button"
              onClick={() => password && onCopy(password)}
              disabled={!password}
              aria-label="Copy generated password"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="copy" className="h-[18px] w-[18px]" />
            </button>
          </div>

          <StrengthMeter length={length} options={options} />
          <button
            type="button"
            onClick={onGenerate}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-950/25 transition hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[.99]"
          >
            <Icon name="refresh" className="h-[17px] w-[17px]" />
            Generate password
          </button>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-7">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="password-length" className="text-sm font-semibold text-slate-800">Password length</label>
          <output htmlFor="password-length" className="rounded-lg bg-violet-50 px-2.5 py-1 font-mono text-sm font-bold text-violet-700">
            {length} <span className="font-sans text-xs font-medium">chars</span>
          </output>
        </div>
        <input
          id="password-length"
          type="range"
          min="8"
          max="40"
          step="1"
          value={length}
          onChange={(event) => onLengthChange(Number(event.target.value))}
          className="mt-3 h-3 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-violet-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500 sm:mt-4"
          aria-label="Password length"
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>8 characters</span>
          <span>40 characters</span>
        </div>

        <fieldset className="mt-6">
          <legend className="mb-3 text-sm font-semibold text-slate-800">Character types</legend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {characterOptions.map(({ key, label: optionLabel, example }) => (
              <label
                key={key}
                className={`flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border px-3 transition focus-within:ring-2 focus-within:ring-violet-400 focus-within:ring-offset-1 ${
                  options[key] ? 'border-violet-200 bg-violet-50/60' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={() => toggleOption(key)}
                  className="h-4 w-4 rounded border-slate-300 text-violet-600 accent-violet-600 focus:ring-violet-500"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-slate-700">{optionLabel}</span>
                  <span className="block font-mono text-[10px] text-slate-400">{example}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <form onSubmit={handleSave} className="mt-6 border-t border-slate-100 pt-5">
          <label htmlFor="password-label" className="mb-2 block text-sm font-semibold text-slate-800">Save this password</label>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              id="password-label"
              type="text"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={60}
              placeholder="Add a label, e.g. Email account"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
            <button
              type="submit"
              disabled={!password || !label.trim()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Icon name="plus" className="h-4 w-4" />
              Save password
            </button>
          </div>
        </form>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-xs leading-5 text-rose-700">
            {error}
          </p>
        )}
      </div>
    </section>
  )
}

export default PasswordGenerator
