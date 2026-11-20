import Icon from './Icon.jsx'

function Header() {
  return (
    <header className="flex items-center justify-between py-6 sm:py-8">
      <a href="/" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200">
          <Icon name="shield" className="h-5 w-5" />
        </span>
        <span className="text-[17px] font-bold tracking-tight text-slate-900">secure<span className="text-violet-600">pass</span></span>
      </a>
      <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 sm:px-3 sm:text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="sm:hidden">On-device</span>
        <span className="hidden sm:inline">Generated on your device</span>
      </div>
    </header>
  )
}

export default Header