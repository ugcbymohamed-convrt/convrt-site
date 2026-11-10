/* Emits sitemap.xml at build time from src/lib/seo/sitemap.js (see that file for the rules). */
import { buildSitemap } from './src/lib/seo/sitemap.js'

export default function sitemap() {
  return {
    name: 'convrt-sitemap',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap() })
    },
  }
}
