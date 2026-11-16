/* Creator portfolio onboarding: constants shared by the page (src/) and the serverless API (api/).
   One definition, so what the form promises and what the server enforces cannot drift apart. */

export const LANGUAGES = ['English', 'Spanish', 'French', 'Arabic', 'Other']

export const SPECIALIZATIONS = [
  'UGC videos',
  'Spokesperson videos',
  'SaaS and app demonstrations',
  'Product demonstrations',
  'Lifestyle content',
  'Other',
]

export const VIDEO_SLOTS = [1, 2, 3]

/* Video limits. The size cap is Cloudflare Stream's limit for a basic (single-request) direct creator
   upload: 200 MB. Larger files would need the resumable tus protocol, which this first version does not use.
   The duration cap is enforced by Cloudflare itself at upload time (maxDurationSeconds) AND re-checked by our
   server before a submission is accepted. */
export const VIDEO_MAX_BYTES = 200 * 1024 * 1024
export const VIDEO_MAX_SECONDS = 180
export const VIDEO_EXTENSIONS = ['mp4', 'mov']
export const VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime']

/* Profile photo: the browser resizes it (max 1200 px, JPEG) before upload, so it is always small. It is stored
   alongside the submission record, which is why the cap is low. */
export const PHOTO_MAX_BYTES = 500 * 1024
export const PHOTO_MIME_TYPES = ['image/jpeg', 'image/png']

/* Total video upload authorisations an invitation may ever be given: 3 videos + replacements. */
export const MAX_UPLOAD_AUTHORIZATIONS = 9

export const LIMITS = {
  videoMaxBytes: VIDEO_MAX_BYTES,
  videoMaxSeconds: VIDEO_MAX_SECONDS,
  photoMaxBytes: PHOTO_MAX_BYTES,
}

export const INVITE_SOURCES = ['fiverr', 'direct']
export const INVITE_DEFAULT_DAYS = 7
export const INVITE_MAX_DAYS = 30
/* After a submission is completed, the same link can still download that creator's own signed agreement. */
export const RECEIPT_ACCESS_DAYS = 30

export const SUBMISSION_STATUSES = ['pending_review', 'approved', 'rejected', 'withdrawn']

export const STATUS_LABELS = {
  pending_review: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

/* The four separate acceptance statements, exactly as shown next to the checkboxes and as recorded. */
export const ACCEPTANCES = [
  { key: 'rights', text: 'I confirm that I have the necessary rights and permissions to submit these videos and any profile image.' },
  { key: 'agreement', text: 'I have read and accept the Creator Portfolio Agreement.' },
  {
    key: 'display',
    text: 'I authorize CONVRT Studio to display my approved portfolio materials and agreed profile information on its website for the limited purpose described in the agreement.',
  },
  { key: 'privacy', text: 'I acknowledge that I have read the Creator Privacy Notice.' },
]

export const FIVERR_STATEMENT = "We'll keep you updated through Fiverr."

export const humanBytes = (n) => (n >= 1024 * 1024 ? `${Math.round(n / (1024 * 1024))} MB` : `${Math.round(n / 1024)} KB`)

/* Retention policy (owner decision, Nov 2026). Enforced daily by api/creator-cron.js; the privacy notice states the same numbers. */
export const RETENTION = {
  mediaAfterDecisionDays: 90, // media of a rejected or withdrawn submission
  abandonedAfterExpiryDays: 14, // uploads/drafts of an invitation that was never submitted, counted from its expiry
  recordYears: 6, // the signed agreement record of a rejected or withdrawn submission
}
