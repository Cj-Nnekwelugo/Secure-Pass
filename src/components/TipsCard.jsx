import Icon from './Icon.jsx'

const tips = [
  'Use a different password for every account.',
  'Longer passwords are harder to guess.',
  'Use a trusted password manager for sensitive logins.',
]

function TipsCard() {
  return (
    <section aria-labelledby="tips-title" className="mt-8 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm shadow-violet-100">
          <Icon name="sparkles" className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="tips-title" className="text-base font-bold text-slate-900">A few safety tips</h2>
          <p className="mt-1 text-sm text-slate-500">Small habits make a big difference.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default TipsCard
