// Run with: node --test tests/roadmap-qualification.test.mjs
// Covers the centralized Creative Growth Roadmap rules (src/lib/roadmapQualification.js)
// and the five-question validation (src/lib/roadmapQuestions.js). Pure functions — no browser.
import test from 'node:test'
import assert from 'node:assert/strict'
import { qualifyApplication, QUALIFYING_BUSINESS_TYPES, QUALIFYING_TIMELINES, QUALIFYING_INVESTMENT } from '../src/lib/roadmapQualification.js'
import {
  BUSINESS_TYPE_OPTIONS, SPEND_OPTIONS, CHALLENGE_OPTIONS, TIMELINE_OPTIONS, INVESTMENT_OPTIONS, validateAnswers,
} from '../src/lib/roadmapQuestions.js'

const YES = 'Yes, we’re actively looking for a production partner'
const MAYBE = 'Possibly, depending on the creative strategy'
const NOT_YET = 'Not yet, we’re only researching'

const answers = (over = {}) => ({
  businessType: 'SaaS / Software',
  adSpend: 'Not running paid ads yet',
  challenge: 'Finding fresh advertising angles',
  timeline: 'Immediately / This month',
  investment: YES,
  ...over,
})
const status = (over) => qualifyApplication(answers(over)).status

test('option labels match what the page promises', () => {
  assert.deepEqual(INVESTMENT_OPTIONS, [YES, MAYBE, NOT_YET])
  assert.deepEqual(BUSINESS_TYPE_OPTIONS, ['SaaS / Software', 'E-commerce / DTC', 'Marketing agency', 'Other'])
})

test('1. SaaS, $0 ad spend, immediately, actively looking → qualified (Calendly)', () => {
  assert.equal(status({ adSpend: 'Not running paid ads yet' }), 'qualified')
})

test('2. E-commerce, under $5K, within 1–3 months, possibly → qualified (Calendly)', () => {
  assert.equal(status({ businessType: 'E-commerce / DTC', adSpend: 'Under $5,000', timeline: 'Within 1–3 months', investment: MAYBE }), 'qualified')
})

test('3. SaaS, $20K+ spend, just exploring → not ready (Free Hooks)', () => {
  assert.equal(status({ adSpend: '$20,000+', timeline: 'Just exploring options' }), 'not_ready')
})

test('4. SaaS, ready immediately, but only researching → not ready (Free Hooks)', () => {
  assert.equal(status({ investment: NOT_YET }), 'not_ready')
})

test('5. Marketing agency, high ad spend, ready immediately → different business (Contact)', () => {
  assert.equal(status({ businessType: 'Marketing agency', adSpend: '$20,000+' }), 'different_business')
})

test('6. Other business type → different business (Contact)', () => {
  assert.equal(status({ businessType: 'Other' }), 'different_business')
})

test('7. incomplete answers → a validation error for every unanswered question', () => {
  const errs = validateAnswers({})
  assert.deepEqual(Object.keys(errs).sort(), ['adSpend', 'businessType', 'challenge', 'investment', 'timeline'])
  // Question 5 specifically is required.
  assert.ok(validateAnswers(answers({ investment: '' })).investment)
  assert.deepEqual(validateAnswers(answers()), {})
})

test('8. changing answers changes the outcome every time (no stale result)', () => {
  const a = answers()
  assert.equal(qualifyApplication(a).status, 'qualified')
  assert.equal(qualifyApplication({ ...a, investment: NOT_YET }).status, 'not_ready')
  assert.equal(qualifyApplication({ ...a, investment: NOT_YET, businessType: 'Other' }).status, 'different_business')
  assert.equal(qualifyApplication({ ...a, businessType: 'E-commerce / DTC' }).status, 'qualified')
  assert.equal(qualifyApplication({ ...a, timeline: 'Just exploring options' }).status, 'not_ready')
  assert.equal(qualifyApplication({ ...a, timeline: 'Within 1–3 months' }).status, 'qualified')
})

test('different business type wins when several conditions fail', () => {
  assert.equal(status({ businessType: 'Marketing agency', timeline: 'Just exploring options', investment: NOT_YET }), 'different_business')
  assert.equal(status({ businessType: 'Other', timeline: 'Just exploring options' }), 'different_business')
})

test('ad spend never affects the outcome — not even the highest or lowest', () => {
  for (const adSpend of SPEND_OPTIONS) assert.equal(status({ adSpend }), 'qualified', adSpend)
})

test('creative challenge never affects the outcome', () => {
  for (const challenge of CHALLENGE_OPTIONS) assert.equal(status({ challenge }), 'qualified', challenge)
  for (const challenge of CHALLENGE_OPTIONS) assert.equal(status({ challenge, businessType: 'Other' }), 'different_business', challenge)
})

test('exhaustive: every combination yields exactly the expected outcome', () => {
  let count = 0
  for (const businessType of BUSINESS_TYPE_OPTIONS)
    for (const timeline of TIMELINE_OPTIONS)
      for (const investment of INVESTMENT_OPTIONS) {
        const expected = !QUALIFYING_BUSINESS_TYPES.includes(businessType)
          ? 'different_business'
          : QUALIFYING_TIMELINES.includes(timeline) && QUALIFYING_INVESTMENT.includes(investment)
            ? 'qualified'
            : 'not_ready'
        assert.equal(status({ businessType, timeline, investment }), expected, `${businessType} | ${timeline} | ${investment}`)
        count++
      }
  assert.equal(count, 4 * 3 * 3)
})

test('every option of the rule-driving questions is classified (no answer can fall through)', () => {
  const qualifyingTimeline = TIMELINE_OPTIONS.filter((t) => QUALIFYING_TIMELINES.includes(t))
  assert.deepEqual(qualifyingTimeline, ['Immediately / This month', 'Within 1–3 months'])
  assert.deepEqual(TIMELINE_OPTIONS.filter((t) => !QUALIFYING_TIMELINES.includes(t)), ['Just exploring options'])
  assert.deepEqual(INVESTMENT_OPTIONS.filter((t) => !QUALIFYING_INVESTMENT.includes(t)), [NOT_YET])
})
