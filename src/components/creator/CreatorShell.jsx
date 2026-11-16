import Logo from '../Logo.jsx'

/* Standalone chrome for the private creator pages: logo on the left, "CREATOR NETWORK" on the right.
   Deliberately no site navigation, no footer and no sales CTA. */
export default function CreatorShell({ children, label = 'Creator network' }) {
  return (
    <div className="min-h-screen bg-canvas text-ink antialiased">
      <div className="mx-auto w-full max-w-[760px] px-5 md:px-8">
        <header className="flex items-center justify-between border-b border-hairline py-4">
          <Logo size="h-9 md:h-10" />
          <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-lime">{label}</p>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
