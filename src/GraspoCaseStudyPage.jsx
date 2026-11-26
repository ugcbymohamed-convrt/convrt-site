import SectionDivider from './components/SectionDivider.jsx'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { caseStudyHead } from './caseStudies/head.js'
import FinalCTA from './components/FinalCTA.jsx'
import NextCaseStudy from './components/caseStudies/NextCaseStudy.jsx'
import RelatedService from './components/caseStudies/RelatedService.jsx'
import GraspoHero from './components/graspo/GraspoHero.jsx'
import GraspoMetrics from './components/graspo/GraspoMetrics.jsx'
import GraspoChallenge from './components/graspo/GraspoChallenge.jsx'
import GraspoStrategy from './components/graspo/GraspoStrategy.jsx'
import GraspoShowcase from './components/graspo/GraspoShowcase.jsx'
import GraspoDistribution from './components/graspo/GraspoDistribution.jsx'
import GraspoAudience from './components/graspo/GraspoAudience.jsx'
import GraspoFunnel from './components/graspo/GraspoFunnel.jsx'
import GraspoLeadExamples from './components/graspo/GraspoLeadExamples.jsx'
import GraspoLeadComposition from './components/graspo/GraspoLeadComposition.jsx'
import GraspoResult from './components/graspo/GraspoResult.jsx'
import { TextLink } from './components/ugc/shared.jsx'
import { currentLocale } from './i18n/locale.js'
import { hrefFor } from './i18n/tr.js'
import { PATHS } from './routes.js'

/* Arabic: the same page, the same components. Two English-only parts are swapped: the "next case study" card (the Elyon study has no Arabic page) and the related-service line, which links the Arabic pages. */
function RelatedServiceAr() {
  return (
    <section aria-label="الخدمة المرتبطة" className="relative pt-10 md:pt-14">
      <div className="mx-auto max-w-2xl px-5 text-center md:px-8">
        <p className="text-[15px] leading-relaxed text-ink-muted">
          تعكس تجربة غراسبو كيف نساعد الشركات على توسيع حضورها الرقمي وتوليد فرص تجارية من خلال <TextLink href={hrefFor(PATHS.socialMediaVideoProduction)}>إنتاج محتوى منصات التواصل الاجتماعي وإدارته</TextLink>.
        </p>
        <p className="mt-2 text-[15px]">
          <TextLink href={hrefFor('/pricing#organic')}>باقات المحتوى العضوي <span aria-hidden="true">←</span></TextLink>
        </p>
      </div>
    </section>
  )
}

export default function GraspoCaseStudyPage() {
  useDocumentHead(caseStudyHead('/case-studies/graspo'))
  const ar = currentLocale() === 'ar'

  return (
    <>
      <GraspoHero />
      <GraspoMetrics />
      <SectionDivider />
      <GraspoChallenge />
      <SectionDivider />
      <GraspoStrategy />
      <SectionDivider />
      <GraspoShowcase />
      <SectionDivider />
      <GraspoDistribution />
      <SectionDivider />
      <GraspoAudience />
      <SectionDivider />
      <GraspoFunnel />
      <SectionDivider />
      <GraspoLeadExamples />
      <SectionDivider />
      <GraspoLeadComposition />
      <SectionDivider />
      <GraspoResult />
      {ar ? <RelatedServiceAr /> : <RelatedService currentId="graspo" />}
      {!ar && <NextCaseStudy currentId="graspo" />}
      <SectionDivider />
      <FinalCTA />
    </>
  )
}
