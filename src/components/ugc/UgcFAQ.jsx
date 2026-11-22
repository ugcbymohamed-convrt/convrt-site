import { useState, useCallback } from 'react'
import { UGC_FAQ } from '../../seo/ugcFaq.js'
import { trackEvent } from '../../lib/analytics.js'
import { Section, Head, Reveal, TextLink } from './shared.jsx'
import { tr, T } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { localizeFaq } from '../../i18n/content.js'
import { ES_FAQ_TITLES, ES_SECTION_INTROS } from '../../i18n/es/labels.js'

/* SECTION 5: FAQ (14 questions). EVERY question and answer is always in the DOM (and so in the prerendered HTML). Collapsed answers stay in
   the document but are visibility:hidden, so they are out of the tab order and accessibility tree. The same UGC_FAQ array feeds
   the FAQPage JSON-LD, so the markup can never differ from this text. Accordion pattern as on /pricing. */

function Item({ item, open, onToggle, prefix, track }) {
  const btnId = `${prefix}-faq-q-${item.id}`
  const panelId = `${prefix}-faq-a-${item.id}`
  return (
    <div className="relative" style={{ borderLeft: open ? '2px solid #d5ff40' : '2px solid transparent', transition: 'border-color 0.35s ease' }}>
      <h3>
        <button
          id={btnId}
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-start gap-5 rounded-sm py-4 pl-5 pr-3 text-left transition-colors hover:bg-white/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 md:pl-6"
        >
          <span className="flex-1 font-semibold leading-snug transition-colors" style={{ fontSize: 'clamp(0.97rem, 1.9vw, 1.075rem)', color: open ? '#fafafa' : 'rgba(250,250,250,0.78)' }}>
            {item.q}
          </span>
          <span
            aria-hidden="true"
            className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center motion-reduce:transition-none"
            style={{ transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
              <path d="M8 2v12M2 8h12" stroke={open ? '#d5ff40' : 'rgba(255,255,255,0.4)'} strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        className="grid motion-reduce:transition-none"
        style={{
          gridTemplateRows: open ? '1fr' : '0fr',
          visibility: open ? 'visible' : 'hidden',
          transition: `grid-template-rows 0.4s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear ${open ? '0s' : '0.4s'}`,
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-3 pb-5 pl-5 pr-6 md:pl-6">
            {item.a.map((para, i) => (
              <p key={i} className="text-[15px] leading-[1.7] text-ink-muted">{para}</p>
            ))}
            {item.links?.map((l) => (
              <p key={l.href} className="text-[15px]">
                <TextLink href={l.href} external={l.external} onClick={() => trackEvent(`${track}_faq_link_click`, { question: item.id, href: l.href })}>{l.label} <span aria-hidden="true">→</span></TextLink>
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="ml-5 h-px bg-white/[0.06] md:ml-6" />
    </div>
  )
}

/* Configuration-driven: UGC_FAQ_CONFIG is this page's content and the default. The Spokesperson page passes its own list (the same list feeds its
   FAQPage JSON-LD), heading and id/analytics prefix. */
export const UGC_FAQ_CONFIG = {
  items: UGC_FAQ,
  prefix: 'ugc',
  title: <><T>UGC video production,</T>{' '}<span className="text-lime"><T>answered.</T></span></>,
}

export default function UgcFAQ({ config = UGC_FAQ_CONFIG }) {
  const { prefix, title: titleEn } = config
  // Spanish: the approved editorial heading ("Todo lo que necesitas saber ... ."), split so the last words keep the lime accent. English keeps its own title.
  const esTitle = currentLocale() === 'es' ? ES_FAQ_TITLES[prefix] : null
  const title = esTitle ? <>{esTitle[0]}{' '}<span className="text-lime">{esTitle[1]}</span></> : titleEn
  // Questions and answers go through the page language's dictionary (identity in English); order, ids and links are the English ones.
  const items = localizeFaq(config.items, currentLocale())
  const [openId, setOpenId] = useState(null)
  const toggle = useCallback((id) => {
    setOpenId((prev) => {
      if (prev !== id) trackEvent(`${prefix}_faq_open`, { question: id })
      return prev === id ? null : id
    })
  }, [prefix])
  return (
    <Section id={`${prefix}-faq`} label={`${prefix}-faq-heading`}>
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <Head id={`${prefix}-faq-heading`} eyebrow={tr('FAQ')} title={title} intro={currentLocale() === 'es' ? ES_SECTION_INTROS[`${prefix}-faq`] : undefined} />
        </Reveal>
        <div className="mt-8 h-px bg-white/[0.06]" />
        {items.map((item) => (
          <Item key={item.id} item={item} open={openId === item.id} onToggle={() => toggle(item.id)} prefix={prefix} track={prefix} />
        ))}
      </div>
    </Section>
  )
}
