import Icon from './Icon.jsx'

const tips = [
  {
    title: 'Make every password unique',
    detail: 'A separate password for each account helps keep one breach from putting your other accounts at risk.',
  },
  {
    title: 'Go longer when you can',
    detail: 'More characters create more possible combinations. Use the length control to make a longer password.',
  },
  {
    title: 'Store credentials safely',
    detail: 'Use a trusted password manager for important logins. This page is a generator, not an encrypted vault.',
  },
]

function TipsCard() {
  return (
    <section aria-labelledby="tips-title" className="mt-8 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm shadow-violet-100">
          <Icon name="sparkles" className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="tips-title" className="text-base font-bold text-slate-900">Build better password habits</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">A strong password is one part of keeping your accounts safer. These simple habits help, too.</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tips.map(({ title, detail }) => (
              <li key={title} className="rounded-2xl border border-violet-100/80 bg-white/75 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Icon name="check" className="h-4 w-4 shrink-0 text-emerald-600" />
                  {title}
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">{detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default TipsCard
