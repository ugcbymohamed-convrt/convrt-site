/* Spanish sentences of the case studies that are built from data (figures), so they cannot be plain dictionary keys. Same approach as src/i18n/es/cases.js:
   the figure comes from the data module, only the notation changes (localizeStat). */
import { localizeStat } from '../format.js'
import { formatMoneyEs } from './money.js'

const es = (s) => localizeStat('es', s)
const moreThan = (stat) => (stat.endsWith('+') ? `más de ${es(stat.slice(0, -1))}` : es(stat))

/* Graspo's audience note: the current following (src/lib/siteStats.js GRASPO_FOLLOWING). */
export const esGraspoFollowing = (f) =>
  `Ambas comunidades han seguido creciendo desde el periodo analizado: hoy suman ${es(f.facebook)} seguidores en Facebook, ${es(f.instagram)} en Instagram y ${es(f.tiktok)} en TikTok (${moreThan(f.combined)} en total).`

/* Graspo's "100% organic on Instagram" note. The "$0" is the client's reported spend, written in the same notation as every other client USD figure (never typed in a dictionary). */
export const esGraspoOrganicProof = (igShort) =>
  `Las ${es(igShort)} de visualizaciones de Instagram procedieron del alcance orgánico, con ${formatMoneyEs({ amount: 0, currency: 'USD' })} invertidos en promoción de pago para esa distribución.`
