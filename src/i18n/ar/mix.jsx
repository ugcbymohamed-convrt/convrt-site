/* Arabic headlines in two colours (owner, 2026-11-25): a translation written «أبيض |ليموني» is drawn as white text followed by a lime-green span. The English string never contains the marker, so English
   (and every other language) passes through unchanged. A leading marker («|…») makes the whole line lime. */
export function mix(text) {
  if (typeof text !== 'string' || !text.includes('|')) return text
  const [a, ...rest] = text.split('|')
  return (
    <>
      {a}
      <span className="text-lime">{rest.join('|')}</span>
    </>
  )
}
