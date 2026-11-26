import { useEffect, useRef, useState } from 'react'
import { GRASPO_FOLLOWING } from '../../lib/siteStats.js'
import { useTr } from '../../i18n/tr.js'
import { mix } from '../../i18n/ar/mix.jsx'
import { currentLocale } from '../../i18n/locale.js'
import { localizeStat } from '../../i18n/format.js'
import { GRASPO_IG_COUNTRIES as IG_COUNTRIES, GRASPO_FB_COUNTRIES as FB_COUNTRIES, GRASPO_DEMOGRAPHICS as DEMO } from '../../caseStudies/data.js'
import { esGraspoFollowing } from '../../i18n/es/casestudies.js'
import { stat, pct, isEnglish } from '../caseStudies/format.js'

/* ─────────────────────────────────────────────
   AUDIENCE / MENA REACH
   Country + age/gender data verified from Meta
   Business Suite demographics screenshots.
───────────────────────────────────────────── */

const ACCENT = '#d5ff40'

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

export default function GraspoAudience() {
  const tr = useTr()
  const locale = currentLocale()
  const ar = locale === 'ar'
  const fol = (k) => localizeStat(locale, GRASPO_FOLLOWING[k])
  const en = isEnglish()
  const [ref, visible] = useInView()
  const maxPct = 25

  return (
    <section className="relative py-16 md:py-24 border-y border-hairline bg-surface-1/20">
      <div ref={ref} className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl mx-auto mb-12 md:mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-6 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">{tr('Audience / MENA Reach')}</span>
          </div>
          <h2 className="font-display font-bold text-ink tracking-display leading-[1.05] text-3xl md:text-[44px]">
            {tr('Millions of views are useless')}
            <br />
            {mix(tr("if they're the wrong audience."))}
          </h2>
          <p className="mt-6 text-[15px] md:text-base text-ink-muted leading-relaxed">
            {tr("Graspo's content wasn't just watched at scale, it was watched in the exact markets where its print buyers, publishers and agencies actually operate. The same countries show up on both sides: in the analytics, and in the inbound leads.")}
          </p>
        </div>

        {/* Country rankings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <CountryPanel title={tr('Instagram, top countries')} countries={IG_COUNTRIES} visible={visible} maxPct={maxPct} delayBase={0} />
          <CountryPanel title={tr('Facebook, top countries')} countries={FB_COUNTRIES} visible={visible} maxPct={maxPct} delayBase={0.4} color="#3b82f6" />
        </div>

        {/* Age & gender */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          <DemoCard
            platform={ar ? tr('Instagram') : 'Instagram'}
            followers={GRASPO_FOLLOWING.instagram}
            genderSplit={tr(DEMO.instagram.genderSplit)}
            peakAge={DEMO.instagram.peakAge}
            color={ACCENT}
          />
          <DemoCard
            platform={ar ? tr('Facebook') : 'Facebook'}
            followers={GRASPO_FOLLOWING.facebook}
            genderSplit={tr(DEMO.facebook.genderSplit)}
            peakAge={DEMO.facebook.peakAge}
            color="#3b82f6"
          />
        </div>

        {ar ? (
        <p className="mt-6 text-[13px] text-ink-subtle leading-relaxed max-w-2xl mx-auto text-center">
          {tr('Working-age adults, overwhelmingly male, concentrated in the 25–44 range, the demographic most likely to hold purchasing or procurement decisions for a printing project, not a passive consumer audience. Both followings have kept growing since the report window, now')} {fol('facebook')} {tr('on Facebook,')} و{fol('instagram')} {tr('on Instagram and')} و{fol('tiktok')} {tr('on TikTok')} ({tr('more than')} {fol('combined').replace('+', '')} {tr('combined')}).
        </p>
        ) : en ? (
          <p className="mt-6 text-[13px] text-ink-subtle leading-relaxed max-w-2xl mx-auto text-center">
            Working-age adults, overwhelmingly male, concentrated in the 25–44 range, the
            demographic most likely to hold purchasing or procurement decisions for a printing
            project, not a passive consumer audience. Both followings have kept growing since the
            report window, now {GRASPO_FOLLOWING.facebook} on Facebook, {GRASPO_FOLLOWING.instagram} on Instagram and {GRASPO_FOLLOWING.tiktok} on TikTok ({GRASPO_FOLLOWING.combined} combined).
          </p>
        ) : (
          <p className="mt-6 text-[13px] text-ink-subtle leading-relaxed max-w-2xl mx-auto text-center">
            {tr('Working-age adults, overwhelmingly male, concentrated in the 25–44 range, the demographic most likely to hold purchasing or procurement decisions for a printing project, not a passive consumer audience.')} {esGraspoFollowing(GRASPO_FOLLOWING)}
          </p>
        )}
      </div>
    </section>
  )
}

function CountryPanel({ title, countries, visible, maxPct, delayBase = 0, color = ACCENT }) {
  const tr = useTr()
  return (
    <div className="rounded-3xl border border-hairline bg-surface-1/40 px-7 py-7 md:px-8 md:py-8">
      <p className="text-sm font-semibold text-ink mb-6">{title}</p>
      <div className="space-y-4">
        {countries.map((c, i) => (
          <div key={c.name}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[13px] text-ink-muted">{tr(c.name)}</span>
              <span className="text-[12px] font-semibold text-ink tabular-nums">{currentLocale() === 'ar' ? `${c.pct}%` : pct(c.pct)}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-3 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: visible ? `${(c.pct / maxPct) * 100}%` : '0%',
                  background: color,
                  transition: `width 0.85s cubic-bezier(0.22,1,0.36,1) ${delayBase + i * 0.07}s`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DemoCard({ platform, followers, genderSplit, peakAge, color }) {
  const tr = useTr()
  return (
    <div className="rounded-3xl border border-hairline bg-surface-1/40 px-7 py-6 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color }}>{platform}</p>
        <p className="mt-1.5 text-[13px] text-ink-muted">{genderSplit}</p>
        <p className="text-[13px] text-ink-muted">{tr('Peak age group:')} <span className="text-ink font-medium">{peakAge}</span></p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-display font-bold text-2xl text-ink tabular-nums">{stat(followers)}</p>
        <p className="text-[11px] text-ink-subtle">{tr('followers today')}</p>
      </div>
    </div>
  )
}
