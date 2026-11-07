import { useId } from 'react'

/* ─────────────────────────────────────────────
   Shared application-form fields (Roadmap + Risk-Free Trial pages).
   Styling follows the site's dark surface / lime-accent system.
───────────────────────────────────────────── */

export function ErrorText({ id, children }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-[13px] font-medium leading-snug text-coral">
      <svg viewBox="0 0 16 16" className="mt-[2px] h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.7v3.6M8 10.8v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </p>
  )
}

/* Progress: one segment per answered question */
export function Progress({ label, answered, total }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <p className="font-semibold uppercase tracking-[0.16em] text-lime">{label}</p>
        <p className="text-ink-muted" aria-live="polite">{answered} of {total} answered</p>
      </div>
      <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }} aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`block h-1.5 rounded-full transition-colors duration-300 motion-reduce:transition-none ${i < answered ? 'bg-lime' : 'bg-surface-3'}`} />
        ))}
      </div>
    </div>
  )
}

export function RadioGroup({ name, legend, options, value, onChange, error, hint, columns = 2 }) {
  const uid = useId()
  const errId = `${uid}-error`
  const hintId = `${uid}-hint`
  const cols = columns === 1 ? '' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
  return (
    <fieldset
      aria-required="true"
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? errId : hint ? hintId : undefined}
      className="min-w-0"
    >
      <legend className="mb-2 text-sm font-semibold text-ink">{legend}</legend>
      <div className={`grid grid-cols-1 gap-2.5 ${cols}`}>
        {options.map((opt, i) => (
          <label
            key={opt}
            className={`group relative flex min-h-[48px] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-[15px] leading-snug transition-colors
              has-[:checked]:border-lime has-[:checked]:bg-lime/10 has-[:checked]:text-ink has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lime/70
              motion-reduce:transition-none ${error ? 'border-coral/60' : 'border-hairline-strong hover:border-ink-subtle/60'} text-ink-muted`}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              data-field={i === 0 ? name : undefined}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="h-[18px] w-[18px] shrink-0 rounded-full border border-ink-subtle transition-colors peer-checked:border-lime peer-checked:bg-lime peer-checked:shadow-[inset_0_0_0_4px_#0a0a0b] motion-reduce:transition-none"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {hint && !error && <p id={hintId} className="mt-2 text-xs text-ink-subtle">{hint}</p>}
      {error && <ErrorText id={errId}>{error}</ErrorText>}
    </fieldset>
  )
}

const inputClass = (error) =>
  `mt-2 w-full rounded-2xl border bg-canvas px-4 py-3 text-base text-ink placeholder:text-ink-subtle
   focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/70 read-only:opacity-70 ${
     error ? 'border-coral/70' : 'border-hairline-strong focus:border-lime/60'
   }`

/* Single-line input (or textarea when `multiline`). `name` doubles as the
   data-field used to focus the first invalid field. */
export function TextField({
  name, label, optional = false, multiline = false, value, onChange, error, hint, readOnly,
  type = 'text', ...rest
}) {
  const uid = useId()
  const id = `${uid}-${name}`
  const errId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = error ? errId : hint ? hintId : undefined
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}{' '}
        {optional
          ? <span className="font-normal text-ink-subtle">(Optional)</span>
          : <span className="text-lime" aria-hidden="true">*</span>}
      </label>
      <Tag
        id={id}
        name={name}
        data-field={name}
        type={multiline ? undefined : type}
        rows={multiline ? 4 : undefined}
        value={value}
        readOnly={readOnly}
        aria-required={optional ? undefined : 'true'}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass(error)} ${multiline ? 'min-h-[110px] resize-y' : 'min-h-[50px]'}`}
        {...rest}
      />
      {hint && !error && <p id={hintId} className="mt-2 text-xs text-ink-subtle">{hint}</p>}
      {error && <ErrorText id={errId}>{error}</ErrorText>}
    </div>
  )
}
