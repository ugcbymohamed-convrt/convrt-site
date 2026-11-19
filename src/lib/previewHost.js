import { useEffect, useState } from 'react'

/* True only on Vercel preview deployments and localhost, never on the production domain and never during prerender or the first
   client render (so the server HTML and hydration are identical everywhere). It lets the owner review layouts that depend on
   videos that have not been supplied yet (the UGC gallery and the hero phones) with stand-in portraits, WITHOUT any stand-in ever
   reaching the live site. */
export function usePreviewHost() {
  const [preview, setPreview] = useState(false)
  useEffect(() => {
    const h = window.location.hostname
    setPreview(h === 'localhost' || h === '127.0.0.1' || h.endsWith('.vercel.app'))
  }, [])
  return preview
}
