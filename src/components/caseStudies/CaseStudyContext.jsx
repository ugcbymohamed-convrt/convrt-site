import { createContext, useContext } from 'react'

/* Lets any nested section (e.g. NextCaseStudy, an inline cross-link)
   trigger a switch without prop-drilling through every page component. */
export const CaseStudyContext = createContext({
  activeId: 'graspo',
  switchTo: () => {},
})

export function useCaseStudySwitcher() {
  return useContext(CaseStudyContext)
}
