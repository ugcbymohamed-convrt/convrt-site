import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CaseStudySwitcher from './components/caseStudies/CaseStudySwitcher.jsx'
import SectionDivider from './components/SectionDivider.jsx'
import { CaseStudyContext } from './components/caseStudies/CaseStudyContext.jsx'
import { usePrefersReducedMotion } from './components/caseStudies/shared/usePrefersReducedMotion.js'
import { CASE_STUDIES, DEFAULT_CASE_STUDY_ID, isValidCaseStudyId } from './caseStudies/registry.js'
import GraspoCaseStudyPage from './GraspoCaseStudyPage.jsx'
import ElyonCaseStudyPage from './ElyonCaseStudyPage.jsx'

const PAGES = {
  graspo: GraspoCaseStudyPage,
  elyon: ElyonCaseStudyPage,
}

const OUT_MS = 140
const IN_MS = 260

/* Resolve the initial case study from, in order: /case-studies/<id> path,
   ?case=<id> query param, #<id> hash, then the registry default. */
function resolveInitialId() {
  if (typeof window === 'undefined') return DEFAULT_CASE_STUDY_ID
  const pathMatch = window.location.pathname.match(/\/case-studies\/([a-z0-9-]+)/i)
  if (pathMatch && isValidCaseStudyId(pathMatch[1])) return pathMatch[1]

  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('case')
  if (fromQuery && isValidCaseStudyId(fromQuery)) return fromQuery

  const fromHash = window.location.hash.replace('#', '')
  if (fromHash && isValidCaseStudyId(fromHash)) return fromHash

  return DEFAULT_CASE_STUDY_ID
}

export default function CaseStudiesPage() {
  const [activeId, setActiveId] = useState(resolveInitialId)
  const [renderedId, setRenderedId] = useState(activeId)
  const [phase, setPhase] = useState('idle') // 'idle' | 'out' | 'in'
  const prefersReducedMotion = usePrefersReducedMotion()
  const contentRef = useRef(null)
  const isFirstRender = useRef(true)
  const transitionTimers = useRef([])

  const switchTo = useCallback((id, { pushHistory = true } = {}) => {
    if (!isValidCaseStudyId(id) || id === activeId) return

    if (pushHistory) {
      const url = `${window.location.pathname.replace(/\/case-studies\/[a-z0-9-]+/i, '/case-studies')}?case=${id}`
      window.history.pushState({ caseStudy: id }, '', url)
    }

    setActiveId(id)

    transitionTimers.current.forEach(clearTimeout)
    transitionTimers.current = []

    if (prefersReducedMotion) {
      setRenderedId(id)
      setPhase('idle')
      return
    }

    setPhase('out')
    const t1 = window.setTimeout(() => {
      setRenderedId(id)
      setPhase('in')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase('idle'))
      })
    }, OUT_MS)
    transitionTimers.current.push(t1)
  }, [activeId, prefersReducedMotion])

  // Sync with browser back/forward navigation.
  useEffect(() => {
    const onPopState = () => {
      const id = resolveInitialId()
      setActiveId(id)
      setRenderedId(id)
      setPhase('idle')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => () => transitionTimers.current.forEach(clearTimeout), [])

  // Scroll the case study content into view on switch, not on first load.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (phase !== 'in') return
    contentRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [phase, prefersReducedMotion])

  const contextValue = useMemo(() => ({ activeId, switchTo }), [activeId, switchTo])

  const ActivePage = PAGES[renderedId] ?? PAGES[DEFAULT_CASE_STUDY_ID]

  const contentStyle = prefersReducedMotion
    ? undefined
    : {
        opacity: phase === 'idle' ? 1 : 0,
        transform:
          phase === 'out' ? 'translateY(-10px)' : phase === 'in' ? 'translateY(14px)' : 'translateY(0)',
        transition:
          phase === 'out'
            ? `opacity ${OUT_MS}ms cubic-bezier(0.22,1,0.36,1), transform ${OUT_MS}ms cubic-bezier(0.22,1,0.36,1)`
            : phase === 'idle'
              ? `opacity ${IN_MS}ms cubic-bezier(0.22,1,0.36,1), transform ${IN_MS}ms cubic-bezier(0.22,1,0.36,1)`
              : 'none',
      }

  return (
    <CaseStudyContext.Provider value={contextValue}>
      <div className="relative pt-10 md:pt-14">
        {/* Page-level intro — establishes "where am I" before the project switcher */}
        <div className="mx-auto max-w-2xl px-5 pb-7 text-center md:px-8 md:pb-9">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3 py-1.5 text-xs font-medium text-ink-muted backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            Our Work
          </div>
          <h1 className="font-display font-bold text-ink tracking-display leading-[1.05] text-4xl md:text-[52px]">
            Case Studies
          </h1>
        </div>

        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <CaseStudySwitcher activeId={activeId} onSwitch={switchTo} />
        </div>
        <div className="mt-8 md:mt-10">
          <SectionDivider />
        </div>

        <div
          ref={contentRef}
          id={`case-panel-${renderedId}`}
          role="tabpanel"
          aria-labelledby={`case-tab-${renderedId}-desktop case-tab-${renderedId}-mobile`}
          style={{ ...contentStyle, scrollMarginTop: '160px' }}
        >
          <ActivePage />
        </div>
      </div>
    </CaseStudyContext.Provider>
  )
}

export { CASE_STUDIES }
