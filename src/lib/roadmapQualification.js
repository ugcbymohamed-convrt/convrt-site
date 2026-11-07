/* ═════════════════════════════════════════════════════════════════════
   CREATIVE GROWTH ROADMAP — QUALIFICATION RULES
   ─────────────────────────────────────────────────────────────────────
   This is the ONE place that decides what a visitor sees after the five
   questions. Edit the lists below to change the rules; nothing else needs
   to change.

   NOTE: this runs in the visitor's browser. It is a fit-check and a way to
   steer people, NOT a security boundary — the Calendly link is public and
   anyone determined could book without going through the form. That is an
   accepted trade-off of having no server or database in this flow.

   THREE OUTCOMES (checked in this order — the first that applies wins):

     1. 'different_business'  Business type is NOT in QUALIFYING_BUSINESS_TYPES
                              (Marketing agency, Other) → "Looking for a
                              Different Kind of Collaboration?" + contact CTA.
                              Takes priority over everything else.

     2. 'not_ready'           Business type is fine, but EITHER the timeline is
                              not in QUALIFYING_TIMELINES ("Just exploring
                              options") OR the investment answer is not in
                              QUALIFYING_INVESTMENT ("Not yet, we're only
                              researching") → "Not Quite Ready for a Roadmap?"
                              + Free Hooks CTA.

     3. 'qualified'           Everything passes → Calendly booking calendar,
                              straight away, no manual approval.

   Deliberately NOT rules:
     • Monthly ad spend — $0 spend never disqualifies anyone.
     • Biggest creative challenge — informational only.

   Values must match the option labels in src/lib/roadmapQuestions.js
   exactly (they are the radio-button labels). Because every option of each
   question is in exactly one of "qualifying" / "not", the three outcomes
   cover every complete set of answers.

   Bump RULES_VERSION whenever you change a rule.
═════════════════════════════════════════════════════════════════════ */

export const RULES_VERSION = '2026-11-07.1'

export const QUALIFYING_BUSINESS_TYPES = ['SaaS / Software', 'E-commerce / DTC']

export const QUALIFYING_TIMELINES = ['Immediately / This month', 'Within 1–3 months']

export const QUALIFYING_INVESTMENT = [
  'Yes, we’re actively looking for a production partner',
  'Possibly, depending on the creative strategy',
]

/* @param {{ businessType: string, timeline: string, investment: string }} answers  complete, validated answers
   @returns {{ status: 'qualified' | 'not_ready' | 'different_business', reasons: string[], rulesVersion: string }}
   `reasons` lists every rule that failed (empty when qualified); `status` is
   chosen by the priority order described above. */
export function qualifyApplication(answers) {
  const reasons = []
  if (!QUALIFYING_BUSINESS_TYPES.includes(answers.businessType)) reasons.push('business_type_not_targeted')
  if (!QUALIFYING_TIMELINES.includes(answers.timeline)) reasons.push('timeline_not_near_term')
  if (!QUALIFYING_INVESTMENT.includes(answers.investment)) reasons.push('not_ready_to_invest')

  let status = 'qualified'
  if (reasons.includes('business_type_not_targeted')) status = 'different_business'
  else if (reasons.length > 0) status = 'not_ready'

  return { status, reasons, rulesVersion: RULES_VERSION }
}
