import { useId } from 'react'

/* Form fields of the project application. Same dark-surface / lime styling as src/components/forms/fields.jsx, but they take ALREADY-LOCALIZED text (the copy module,
   src/i18n/projectApplicationCopy.js) and stable option ids, so no label is ever looked up in a dictionary and an option's VALUE is its id, never a translated sentence. */

export function ErrorLine({ id, children }) {
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

const inputClass = (error) =>
  `mt-2 w-full rounded-2xl border bg-canvas px-4 py-3 text-base text-ink placeholder:text-ink-subtle
   focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/70 read-only:opacity-70 ${error ? 'border-coral/70' : 'border-hairline-strong focus:border-lime/60'}`

/* `name` is the data-field used to focus the first invalid field. `ltrValue` keeps e-mail and URL typing left-to-right on the Arabic page. */
export function TextInput({ name, label, optionalLabel, multiline = false, value, onChange, error, hint, readOnly, type = 'text', ltrValue = false, ...rest }) {
  const uid = useId()
  const id = `${uid}-${name}`
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}{' '}
        {optionalLabel ? <span className="font-normal text-ink-subtle">({optionalLabel})</span> : <span className="text-lime" aria-hidden="true">*</span>}
      </label>
      <Tag
        id={id}
        name={name}
        data-field={name}
        type={multiline ? undefined : type}
        rows={multiline ? 5 : undefined}
        value={value}
        readOnly={readOnly}
        aria-required={optionalLabel ? undefined : 'true'}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
        dir={ltrValue ? 'ltr' : undefined}
        className={`${inputClass(error)} ${multiline ? 'min-h-[120px] resize-y' : 'min-h-[50px]'}`}
        {...rest}
      />
      {hint && !error && <p id={`${id}-hint`} className="mt-2 text-xs text-ink-subtle">{hint}</p>}
      {error && <ErrorLine id={`${id}-error`}>{error}</ErrorLine>}
    </div>
  )
}

/* One group of options. `multiple` makes it a set of checkboxes (value = array of ids); otherwise radios (value = one id). */
export function ChoiceGroup({ name, legend, options, labels, value, onChange, error, hint, multiple = false, columns = 2 }) {
  const uid = useId()
  const cols = columns === 1 ? '' : 'sm:grid-cols-2'
  const selected = (id) => (multiple ? value.includes(id) : value === id)
  const toggle = (id) => {
    if (!multiple) return onChange(id)
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id])
  }
  return (
    <fieldset aria-required="true" aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${uid}-error` : hint ? `${uid}-hint` : undefined} className="min-w-0">
      <legend className="mb-2 text-sm font-semibold text-ink">{legend}</legend>
      <div className={`grid grid-cols-1 gap-2.5 ${cols}`}>
        {options.map((id, i) => (
          <label
            key={id}
            className={`relative flex min-h-[48px] cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-[15px] leading-snug text-ink-muted transition-colors
              has-[:checked]:border-lime has-[:checked]:bg-lime/10 has-[:checked]:text-ink has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lime/70
              motion-reduce:transition-none ${error ? 'border-coral/60' : 'border-hairline-strong hover:border-ink-subtle/60'}`}
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name}
              value={id}
              checked={selected(id)}
              onChange={() => toggle(id)}
              data-field={i === 0 ? name : undefined}
              className="peer sr-only"
            />
            {multiple ? (
              <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-ink-subtle text-transparent transition-colors peer-checked:border-lime peer-checked:bg-lime peer-checked:text-canvas motion-reduce:transition-none">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            ) : (
              <span aria-hidden="true" className="h-[18px] w-[18px] shrink-0 rounded-full border border-ink-subtle transition-colors peer-checked:border-lime peer-checked:bg-lime peer-checked:shadow-[inset_0_0_0_4px_#0a0a0b] motion-reduce:transition-none" />
            )}
            <span>{labels[id]}</span>
          </label>
        ))}
      </div>
      {hint && !error && <p id={`${uid}-hint`} className="mt-2 text-xs text-ink-subtle">{hint}</p>}
      {error && <ErrorLine id={`${uid}-error`}>{error}</ErrorLine>}
    </fieldset>
  )
}

export function CheckRow({ name, checked, onChange, error, children }) {
  const uid = useId()
  return (
    <div className="min-w-0">
      <label
        className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm leading-relaxed text-ink-muted transition-colors
          has-[:checked]:border-lime/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lime/70 motion-reduce:transition-none ${error ? 'border-coral/60' : 'border-hairline-strong hover:border-ink-subtle/60'}`}
      >
        <input
          type="checkbox"
          name={name}
          data-field={name}
          checked={checked}
          aria-required="true"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${uid}-error` : undefined}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-ink-subtle text-transparent transition-colors peer-checked:border-lime peer-checked:bg-lime peer-checked:text-canvas motion-reduce:transition-none">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <span>{children}</span>
      </label>
      {error && <ErrorLine id={`${uid}-error`}>{error}</ErrorLine>}
    </div>
  )
}
