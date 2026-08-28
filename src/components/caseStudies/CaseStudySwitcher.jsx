import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { CASE_STUDIES } from '../../caseStudies/registry.js'

/* ─────────────────────────────────────────────
   CASE STUDY NAVIGATOR
   Editorial project index, not a settings toggle:
   "01 Graspo — 02 Elyon Dubai" with a thin baseline
   rule and a short accent segment that glides beneath
   whichever project is active. No filled pills, no
   segmented-control chrome — text weight and a hairline
   indicator carry the whole interaction.
───────────────────────────────────────────── */
export default function CaseStudySwitcher({ activeId, onSwitch, sticky = false }) {
  const containerRef = useRef(null)
  const btnRefs = useRef({})
  const [indicator, setIndicator] = useState(null)
  const activeStudy = CASE_STUDIES.find((c) => c.id === activeId) ?? CASE_STUDIES[0]

  const measure = () => {
    const container = containerRef.current
    const btn = btnRefs.current[activeId]
    if (!container || !btn) return
    const cRect = container.getBoundingClientRect()
    const bRect = btn.getBoundingClientRect()
    setIndicator({ left: bRect.left - cRect.left, width: bRect.width })
  }

  useLayoutEffect(() => {
    measure()
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  function onKeyDown(e) {
    const idx = CASE_STUDIES.findIndex((c) => c.id === activeId)
    let nextIdx = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % CASE_STUDIES.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + CASE_STUDIES.length) % CASE_STUDIES.length
    else if (e.key === 'Home') nextIdx = 0
    else if (e.key === 'End') nextIdx = CASE_STUDIES.length - 1
    if (nextIdx === null) return
    e.preventDefault()
    const nextId = CASE_STUDIES[nextIdx].id
    onSwitch(nextId)
    focusVisibleVariant(nextId)
  }

  // Both the desktop and mobile nav rows exist in the DOM at once (CSS
  // toggles which is shown), so keyboard focus must land on whichever
  // variant is actually visible at the current breakpoint.
  function focusVisibleVariant(id) {
    const desktopBtn = btnRefs.current[id]
    const mobileBtn = btnRefs.current[`m-${id}`]
    const target = desktopBtn && desktopBtn.offsetParent !== null ? desktopBtn : mobileBtn
    target?.focus()
  }

  return (
    <div className={sticky ? 'sticky top-[72px] md:top-[96px] z-40' : 'relative'}>
      <div className="mx-auto w-full max-w-xl">
        {/* Eyebrow — frames this as portfolio navigation, not a control */}
        <div className="mb-4 flex items-center justify-center gap-3 md:mb-5">
          <span className="h-px w-6 bg-hairline-strong" aria-hidden="true" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            Featured Work
          </span>
          <span className="h-px w-6 bg-hairline-strong" aria-hidden="true" />
        </div>

        {/* ── Desktop / tablet: side-by-side numbered nav with sliding rule ── */}
        <div className="hidden sm:block">
          <div
            ref={containerRef}
            role="tablist"
            aria-label="Case studies"
            onKeyDown={onKeyDown}
            className="flex items-stretch justify-center"
          >
            {CASE_STUDIES.map((c, i) => (
              <Fragment key={c.id}>
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="mx-6 my-1 w-px shrink-0 bg-hairline md:mx-9"
                  />
                )}
                <NavItem
                  study={c}
                  index={i}
                  isActive={c.id === activeId}
                  onSwitch={onSwitch}
                  btnRef={(el) => { btnRefs.current[c.id] = el }}
                  variant="desktop"
                />
              </Fragment>
            ))}
          </div>

          {/* Baseline rule + sliding accent segment */}
          <div className="relative mt-4 h-px w-full bg-hairline">
            {indicator && (
              <div
                aria-hidden="true"
                className="absolute top-0 h-px rounded-full"
                style={{
                  left: indicator.left,
                  width: indicator.width,
                  background: activeStudy.accent,
                  boxShadow: `0 0 10px ${activeStudy.accent}80`,
                  transition:
                    'left 0.3s cubic-bezier(0.22,1,0.36,1), width 0.3s cubic-bezier(0.22,1,0.36,1), background 0.3s ease',
                }}
              />
            )}
          </div>
        </div>

        {/* ── Mobile: stacked rows, left accent bar marks the active project ── */}
        <div
          role="tablist"
          aria-label="Case studies"
          onKeyDown={onKeyDown}
          className="flex flex-col divide-y divide-hairline sm:hidden"
        >
          {CASE_STUDIES.map((c, i) => (
            <NavItem
              key={c.id}
              study={c}
              index={i}
              isActive={c.id === activeId}
              onSwitch={onSwitch}
              btnRef={(el) => { btnRefs.current[`m-${c.id}`] = el }}
              variant="mobile"
              mobile
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function NavItem({ study, index, isActive, onSwitch, btnRef, variant, mobile = false }) {
  const num = String(index + 1).padStart(2, '0')

  return (
    <button
      ref={btnRef}
      role="tab"
      id={`case-tab-${study.id}-${variant}`}
      aria-selected={isActive}
      aria-controls={`case-panel-${study.id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onSwitch(study.id)}
      className={[
        'group relative text-left transition-[opacity,transform] duration-300 ease-out',
        mobile ? 'flex items-start gap-4 py-4' : 'flex flex-col items-center px-1',
      ].join(' ')}
      style={{ opacity: isActive ? 1 : 0.64 }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.opacity = '0.88' }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.opacity = '0.64' }}
    >
      {mobile && (
        <span
          aria-hidden="true"
          className="mt-1.5 w-6 shrink-0 text-[11px] font-bold tabular-nums tracking-[0.08em] transition-colors duration-300"
          style={{ color: isActive ? study.accent : undefined }}
        >
          {num}
        </span>
      )}

      <div className={mobile ? 'min-w-0' : 'flex flex-col items-center'}>
        {!mobile && (
          <span
            aria-hidden="true"
            className="text-[10.5px] font-bold tabular-nums tracking-[0.1em] transition-colors duration-300"
            style={{ color: isActive ? study.accent : undefined }}
          >
            {num}
          </span>
        )}

        <span
          className={[
            'font-display font-bold leading-tight text-ink transition-transform duration-300',
            mobile ? 'text-lg' : 'mt-1 text-xl md:text-[22px] group-hover:-translate-y-0.5',
          ].join(' ')}
        >
          {study.label}
        </span>

        <span
          className={[
            'text-ink-subtle transition-colors duration-300',
            mobile ? 'mt-0.5 block text-[12px]' : 'mt-1 text-center text-[11.5px] whitespace-nowrap',
          ].join(' ')}
        >
          {study.category} &middot; {study.descriptor}
        </span>
      </div>
    </button>
  )
}
