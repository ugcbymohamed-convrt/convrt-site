/* ─────────────────────────────────────────────
   WHO OPERATES THE WEBSITE: the one record of the operator's legal identity.

   Owner-confirmed facts (Nov 2026): trading name CONVRT Studio; legal operator Mohamed Doukkali Azizi; a self-employed professional (autónomo)
   registered in Spain; exclusively B2B; public title "Founder".

   Spanish law (Ley 34/2002, "LSSI", art. 10) requires a commercial website's operator to make available, permanently, easily and free of charge:
   name or business name; domicile (or the address of a permanent establishment in Spain); email address and another means of direct and
   effective communication; registry data where registered; and the tax identification number (NIF). `taxId` and `address` below are
   those details, already on file for the creator agreements. They are NOT shown on the public pages until the owner approves
   (LEGAL_NOTICE_DETAILS_APPROVED in src/config.js); tests/trust-pages.test.mjs blocks publishing the trust pages while that is false,
   because the pages would then be missing legally required information.
   Kept in its own small module so the public pages do not have to import the creator-agreement text.
───────────────────────────────────────────── */

export const OPERATOR = {
  tradingName: 'CONVRT Studio',
  name: 'Mohamed Doukkali Azizi',
  structure: 'a self-employed professional (autónomo) registered in Spain',
  taxId: 'Y6755743J',
  address: 'Calle Gibraltar Español 9, 04007 Almería, Spain',
}
