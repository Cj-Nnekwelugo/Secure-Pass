import { getPasswordStrength } from '../utils/password.js'

const colors = {
  Weak: 'bg-rose-500',
  Fair: 'bg-amber-400',
  Good: 'bg-lime-500',
  Strong: 'bg-emerald-500',
}

function StrengthMeter({ length, options }) {
  const strength = getPasswordStrength(length, options)

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">Password strength</span>
        <span className="text-xs font-semibold text-slate-700">{strength.label}</span>
      </div>
      <div
        aria-label={`Password strength: ${strength.label}`}
        aria-valuemax="4"
        aria-valuemin="1"
        aria-valuenow={strength.score}
        className="flex gap-1.5"
        role="meter"
      >
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={`h-1.5 flex-1 rounded-full ${step <= strength.score ? colors[strength.label] : 'bg-slate-200'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default StrengthMeter
