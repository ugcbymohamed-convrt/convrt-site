/* ═════════════════════════════════════════════════════════════════════
   CREATIVE GROWTH ROADMAP — QUALIFICATION RULES
   ─────────────────────────────────────────────────────────────────────
   This is the ONE place that decides who sees the Calendly calendar
   straight away and who gets the polite "not right now" message. Edit the
   lists below to change the rules; nothing else needs to change.

   NOTE: this runs in the visitor's browser. It is a fit-check and a way to
   steer people, NOT a security boundary — the Calendly link is public and
   anyone determined could book without going through the form. That is an
   accepted trade-off of having no server or database in this flow.

   An applicant is QUALIFIED when ALL of these are true:
     1. Business type is one of QUALIFYING_BUSINESS_TYPES.
     2. Timeline is one of QUALIFYING_TIMELINES.
   (All questions must be answered; contact details are collected by
   Calendly when they book.)

   Everything else is NOT QUALIFIED (shown a polite message, no calendar).

   Deliberately NOT a rule: monthly ad spend. Low or zero spend never
   disqualifies an applicant on its own. To add a spend rule later, add a
   check below and a reason code.

   Values must match the option labels in src/lib/roadmapQuestions.js
   exactly (they are the radio-button labels).

   Bump RULES_VERSION whenever you change a rule.
═════════════════════════════════════════════════════════════════════ */

export const RULES_VERSION = '2026-11-05.1'

export const QUALIFYING_BUSINESS_TYPES = ['SaaS / Software', 'E-commerce / DTC']

export const QUALIFYING_TIMELINES = ['Immediately / This month', 'Within 1–3 months']

/* @param {{ businessType: string, timeline: string }} answers  complete, validated answers
   @returns {{ status: 'qualified' | 'manual_review', reasons: string[], rulesVersion: string }}
   `reasons` lists why the visitor wasn't qualified (empty when qualified).
   The status name 'manual_review' is kept for continuity with existing analytics events. */
export function qualifyApplication(answers) {
  const reasons = []
  if (!QUALIFYING_BUSINESS_TYPES.includes(answers.businessType)) reasons.push('business_type_not_targeted')
  if (!QUALIFYING_TIMELINES.includes(answers.timeline)) reasons.push('timeline_not_near_term')
  return {
    status: reasons.length === 0 ? 'qualified' : 'manual_review',
    reasons,
    rulesVersion: RULES_VERSION,
  }
}
