import { Fragment } from 'react'

/* Renders the AST from lib/blog/markdown.js as semantic React elements with the blog's
   reading typography. Article text can't inject markup: everything is an element or text node,
   and link/media URLs were already restricted by `safeUrl`. */

const isExternal = (href) => /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?convrt\.studio(\/|$)/i.test(href)

function Inline({ nodes }) {
  return nodes.map((n, i) => {
    switch (n.t) {
      case 'text':
        return <Fragment key={i}>{n.v}</Fragment>
      case 'strong':
        return <strong key={i} className="font-semibold text-ink"><Inline nodes={n.c} /></strong>
      case 'em':
        return <em key={i}><Inline nodes={n.c} /></em>
      case 'code':
        return <code key={i} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em] text-lime">{n.v}</code>
      case 'link':
        if (!n.href) return <Inline key={i} nodes={n.c} />
        return (
          <a
            key={i}
            href={n.href}
            title={n.title}
            {...(isExternal(n.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="font-medium text-lime underline decoration-lime/40 underline-offset-[5px] transition-colors hover:decoration-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
          >
            <Inline nodes={n.c} />
          </a>
        )
      default:
        return null
    }
  })
}

const body = 'text-[17px] leading-[1.75] text-zinc-300 md:text-[18px]'

function Block({ b }) {
  switch (b.type) {
    case 'heading': {
      const H = b.level === 2 ? 'h2' : 'h3'
      const cls =
        b.level === 2
          ? 'mb-4 mt-14 scroll-mt-28 font-display text-[1.65rem] font-bold leading-[1.15] tracking-display text-ink first:mt-0 md:scroll-mt-32 md:text-[2rem]'
          : 'mb-3 mt-9 scroll-mt-28 font-display text-xl font-bold leading-snug tracking-snug text-ink md:scroll-mt-32 md:text-2xl'
      return <H id={b.id} className={cls}><Inline nodes={b.inline} /></H>
    }
    case 'paragraph':
      return <p className={`my-5 ${body}`}><Inline nodes={b.inline} /></p>
    case 'list': {
      const L = b.ordered ? 'ol' : 'ul'
      return (
        <L className={`my-5 space-y-2.5 pl-6 marker:text-lime ${b.ordered ? 'list-decimal' : 'list-disc'} ${body}`}>
          {b.items.map((it, i) => <li key={i} className="pl-1"><Inline nodes={it} /></li>)}
        </L>
      )
    }
    case 'blockquote':
      return (
        <blockquote className="my-8 border-l-2 border-lime pl-5 italic text-zinc-200">
          <Blocks blocks={b.children} />
        </blockquote>
      )
    case 'code':
      return (
        <pre className="my-6 overflow-x-auto rounded-2xl border border-hairline bg-surface-1 p-5 text-sm leading-relaxed text-zinc-200" tabIndex={0}>
          <code>{b.text}</code>
        </pre>
      )
    case 'hr':
      return <hr className="my-12 border-hairline" />
    case 'image':
      return (
        <figure className="my-9">
          <img
            src={b.src}
            alt={b.alt}
            width={b.width}
            height={b.height}
            loading="lazy"
            decoding="async"
            style={b.width && b.height ? { aspectRatio: `${b.width} / ${b.height}` } : undefined}
            className="h-auto w-full rounded-2xl border border-hairline"
          />
          {b.caption && <figcaption className="mt-3 text-sm leading-relaxed text-ink-muted">{b.caption}</figcaption>}
        </figure>
      )
    case 'video':
      return (
        <figure className="my-9">
          <video
            controls
            playsInline
            preload="metadata"
            poster={b.poster || undefined}
            aria-label={b.title}
            className="aspect-video w-full rounded-2xl border border-hairline bg-black"
          >
            <source src={b.src} />
          </video>
          {b.caption && <figcaption className="mt-3 text-sm leading-relaxed text-ink-muted">{b.caption}</figcaption>}
        </figure>
      )
    case 'youtube':
      return (
        <figure className="my-9">
          <div className="aspect-video overflow-hidden rounded-2xl border border-hairline bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${b.id}`}
              title={b.title}
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full"
            />
          </div>
          {b.caption && <figcaption className="mt-3 text-sm leading-relaxed text-ink-muted">{b.caption}</figcaption>}
        </figure>
      )
    case 'callout':
      return (
        <aside className="my-9 rounded-2xl border border-lime/30 bg-lime/[0.06] p-5 md:p-6" role="note" aria-label={b.title || 'Note'}>
          {b.title && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-lime">{b.title}</p>}
          <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <Blocks blocks={b.children} />
          </div>
        </aside>
      )
    case 'table':
      return (
        <div className="my-8 overflow-x-auto rounded-2xl border border-hairline" tabIndex={0} role="region" aria-label="Table">
          <table className="w-full min-w-[32rem] border-collapse text-left text-[15px] leading-snug">
            <thead className="bg-surface-2 text-ink">
              <tr>
                {b.header.map((h, i) => (
                  <th key={i} scope="col" style={{ textAlign: b.aligns[i] }} className="px-4 py-3 font-semibold">
                    <Inline nodes={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {b.rows.map((r, ri) => (
                <tr key={ri} className="border-t border-hairline">
                  {r.map((c, ci) => (
                    <td key={ci} style={{ textAlign: b.aligns[ci] }} className="px-4 py-3 align-top">
                      <Inline nodes={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    default:
      return null
  }
}

export function Blocks({ blocks }) {
  return blocks.map((b, i) => <Block key={i} b={b} />)
}

export default function ArticleBody({ blocks }) {
  return (
    <div className="max-w-[44rem]">
      <Blocks blocks={blocks} />
    </div>
  )
}
