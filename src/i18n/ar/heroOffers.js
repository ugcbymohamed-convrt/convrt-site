/* The two secondary free offers of the Arabic homepage hero (same cards as the English hero, src/components/Hero.jsx SECONDARY_OFFERS). Text only: the card styling, icons, destinations and events
   come from the English definition. The free-video offer is the Arabic application (/ar/risk-free-trial). The 10 free hooks library does NOT exist in Arabic yet (src/i18n/cta.js: hooks false), so its card
   renders as a "قريبًا" tile, never as a link or a download; the moment LOCALIZED_FLOWS.ar.hooks is switched on and the page translated, it becomes a normal card. */
import { createElement as h, Fragment } from 'react'

const accent = (cls, text) => h('span', { className: cls }, text)

export const AR_HERO_OFFERS = {
  video: {
    title: h(Fragment, null, 'إنتاج فيديو إعلاني ', accent('text-lime', 'مجاني')),
    description: 'جرّب إنتاجنا دون مخاطرة.',
    cta: 'اعرف إن كنت مؤهلًا',
  },
  hooks: {
    title: h(Fragment, null, '10 هوكات ', accent('text-[#F472B6]', 'مجانية')),
    description: 'مكتبة هوكات لإعلاناتك القادمة',
    cta: 'قريبًا',
  },
}
