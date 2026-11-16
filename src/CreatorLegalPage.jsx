import CreatorShell from './components/creator/CreatorShell.jsx'
import LegalDocument from './components/creator/LegalDocument.jsx'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { privateHead } from './seo/privateSeo.js'
import { PRIVATE_PATHS } from './routes.js'
import { AGREEMENT, PRIVACY, AGREEMENT_VERSION, PRIVACY_VERSION } from './content/creatorLegal.js'

/* /creator-onboarding/agreement and /creator-onboarding/privacy: the full documents, readable on their own
   (the onboarding form links here in a new tab so nothing a creator typed is lost). Private + noindex, like the form. */
export default function CreatorLegalPage() {
  const path = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : PRIVATE_PATHS.creatorAgreement
  const isPrivacy = path === PRIVATE_PATHS.creatorPrivacy
  useDocumentHead(privateHead(isPrivacy ? PRIVATE_PATHS.creatorPrivacy : PRIVATE_PATHS.creatorAgreement))
  return (
    <CreatorShell>
      <article className="py-10 md:py-14">
        <LegalDocument doc={isPrivacy ? PRIVACY : AGREEMENT} headingLevel={1} version={isPrivacy ? PRIVACY_VERSION : AGREEMENT_VERSION} />
        <p className="mt-10 text-sm text-ink-subtle">
          <a className="text-lime underline underline-offset-2" href={isPrivacy ? PRIVATE_PATHS.creatorAgreement : PRIVATE_PATHS.creatorPrivacy}>
            {isPrivacy ? 'Read the Creator Portfolio Agreement' : 'Read the Creator Privacy Notice'}
          </a>
        </p>
      </article>
    </CreatorShell>
  )
}
