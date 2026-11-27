/* FRENCH translation of the three legal documents (Politique de confidentialité, Conditions générales, Mentions légales).

   FOR OWNER AND LEGAL REVIEW: faithful translation of the English documents in src/content/trustPages.js, clause for clause. Not certified, not independently validated, not legal advice.
   Structure (sections, paragraphs, list items, link targets, numbers and identifiers) is checked against the English source by scripts/legal-structure-check.mjs.
   Nothing is added, omitted or reconciled: no English-precedence clause, no new legal reference, no change to governing law, jurisdiction, liability or retention periods.
   French non-breaking spaces before « : ; ? ! » » are applied at render time (src/i18n/fr/typography.js): write ordinary spaces here. */

export default function LEGAL_FR(c) {
  const { operator: o, links: L } = c
  const mail = c.mail
  const FR_MONTHS = { January: 'janvier', February: 'février', March: 'mars', April: 'avril', May: 'mai', June: 'juin', July: 'juillet', August: 'août', September: 'septembre', October: 'octobre', November: 'novembre', December: 'décembre' }
  const frDate = (en) => en.replace(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/, (m, d, mo, y) => (FR_MONTHS[mo] ? `${d === '1' ? '1er' : d} ${FR_MONTHS[mo]} ${y}` : m))
  const dates = { privacy: frDate(c.englishDates.privacy), terms: frDate(c.englishDates.terms), legalNotice: frDate(c.englishDates.legalNotice) } // each document's own English date, preserved
  const structure = 'un travailleur indépendant (autónomo) enregistré en Espagne' // = "a self-employed professional (autónomo) registered in Spain"
  const address = o.address.replace(/, Spain$/, ', Espagne') // street and postal code unchanged; only the country name is written in French
  const TAX_STATEMENT = 'Tous les prix sont hors TVA. Les taxes applicables sont calculées selon la localisation et le statut fiscal de votre entreprise.' // the site's approved French wording of the English tax statement
  const operatorList = [
    `Nom commercial : ${o.tradingName}`,
    `Exploitant : ${o.name}, ${structure}`,
    `Numéro d’identification fiscale (NIF) : ${o.taxId}`,
    `Adresse postale : ${address}`,
    `E-mail : ${mail}`,
    `Autres moyens de nous joindre directement : [[formulaire de contact|${L.contact}]] et [[CONVRT Studio sur LinkedIn|${L.companyLinkedin}]]`,
  ]

  const privacy = {
    h1: 'Politique de confidentialité',
    intro: `Comment CONVRT Studio traite les informations personnelles sur www.convrt.studio. Dernière mise à jour : ${dates.privacy}.`,
    sections: [
      {
        heading: 'Qui est responsable de vos informations',
        body: [
          `Le site www.convrt.studio est exploité par ${o.name}, ${structure}, sous le nom commercial ${o.tradingName} (« CONVRT », « nous »). Nous décidons de la manière et des raisons pour lesquelles les informations décrites ci-dessous sont utilisées (nous sommes le « responsable de traitement »).`,
          { list: operatorList },
          `Pour toute question concernant cette politique ou vos informations, écrivez à ${mail}. Les informations complètes sur l’exploitant figurent dans nos [[Mentions légales|${L.legalNotice}]].`,
        ],
      },
      {
        heading: 'Ce que couvre cette politique',
        body: [
          'Les visiteurs et les personnes qui nous contactent via ce site. Elle est rédigée pour des contacts professionnels : nos services sont proposés aux entreprises, et non aux consommateurs. Les créateurs freelances qui soumettent des travaux via notre page d’intégration privée reçoivent une notice de confidentialité distincte à cette étape.',
        ],
      },
      {
        heading: 'Ce que nous collectons, pourquoi et sur quelle base',
        body: [
          'Chaque point ci-dessous indique ce que nous collectons, pourquoi, et la base juridique sur laquelle nous nous appuyons.',
          { list: [
            'Stratégie créative offerte. Vous répondez à cinq courtes questions dans votre navigateur pour vérifier l’adéquation. Vos réponses restent dans votre navigateur et ne servent qu’à cette vérification ; elles ne nous sont pas transmises. Si votre profil convient, vous pouvez réserver un appel sur Calendly (voir « Réserver un appel »).',
            'Hooks publicitaires offerts. Nous collectons votre adresse e-mail et le secteur que vous choisissez, et nous les utilisons pour vous envoyer les hooks que vous avez demandés. Base juridique : votre demande. Nous pouvons vous demander de confirmer d’abord votre adresse e-mail. Recevoir les hooks ne vous ajoute pas à notre liste marketing.',
            'Candidature à la vidéo offerte. Nous collectons votre nom, votre e-mail professionnel, le site web de votre entreprise, vos réponses concernant votre activité (type d’activité, fourchette de budget publicitaire mensuel, nombre de vidéos par mois, type de vidéo, calendrier, intérêt pour une production récurrente) et une description facultative, afin d’examiner la candidature et de vous contacter à ce sujet. Base juridique : les démarches que vous nous demandez d’effectuer avant la conclusion d’un contrat, et notre intérêt légitime à gérer l’offre. Nous recevons une alerte par e-mail pour chaque candidature via notre service d’envoi d’e-mails, Resend.',
            'Programme de parrainage. Nous collectons votre nom, votre e-mail, votre type de partenaire, votre choix de programme et, facultativement, le nom de votre entreprise ou agence ainsi que votre site web ou profil LinkedIn, afin d’examiner votre candidature et de vous contacter à ce sujet. Base juridique : comme pour la candidature à la vidéo offerte. Le formulaire comporte une case obligatoire confirmant que nous pouvons utiliser ces informations à cette fin.',
            'Formulaire de demande générale. Sur la page Contact, nous collectons votre nom, votre e-mail, le nom de votre marque ou entreprise, le service qui vous intéresse, votre message et votre confirmation d’avoir pris connaissance de cette politique, ainsi que, facultativement, votre site web ou profil de réseau social et une fourchette de budget estimée. Nous nous envoyons ces informations par e-mail et les utilisons pour vous répondre, pour décider si et comment nous pouvons vous aider, et pour préparer une proposition si vous en demandez une. Elles ne sont pas ajoutées à notre liste marketing. Base juridique : les démarches que vous nous demandez d’effectuer avant la conclusion d’un contrat, et notre intérêt légitime à répondre aux demandes professionnelles.',
            'Demande de projet. Lorsque vous demandez une formule, nous collectons votre nom, votre e-mail, le nom de votre marque ou entreprise, votre site web ou profil de réseau social, la formule sélectionnée, vos réponses concernant votre projet (une description et un objectif, votre budget publicitaire ou votre activité actuelle sur les réseaux sociaux, pour les projets sur mesure le type de production et un budget estimé, votre degré de préparation, la date de démarrage souhaitée et les langues de production) et votre confirmation d’avoir compris les conditions de la formule. Nous enregistrons également la langue de la page, la page d’où vous venez et, si vous êtes arrivé par un lien de campagne, ses informations de campagne (utm_source, utm_medium, utm_campaign, utm_content et utm_term) ainsi que, uniquement si vous avez accepté l’analyse d’audience, la première page de votre visite. Nous nous envoyons ces informations par e-mail afin d’examiner votre demande et de décider nous-mêmes de la suite à donner. Le prix affiché provient de nos propres tarifs, jamais de votre navigateur. La demande n’est pas un achat et n’autorise aucun paiement. Elles ne sont pas ajoutées à notre liste marketing. Base juridique : comme pour le formulaire de demande générale.',
            'E-mails et appels. Si vous nous écrivez ou réservez un appel, nous utilisons ce que vous nous envoyez pour vous répondre et travailler avec vous. Base juridique : votre demande, et notre intérêt légitime à répondre aux demandes professionnelles.',
            'Données techniques. Notre hébergeur, Vercel, traite votre adresse IP et les détails de votre requête pour servir le site et le sécuriser. Les vidéos du site sont diffusées via Cloudflare Stream. Base juridique : notre intérêt légitime à disposer d’un site sécurisé et fonctionnel.',
            'Formulaire créateurs. Le lien destiné aux créateurs freelances ouvre un Google Form ; ce que vous y saisissez est traité via Google Forms.',
            'Documents comptables et juridiques. Si vous devenez client, nous conservons les contrats, les factures et les documents que la loi exige. Base juridique : l’obligation légale et le contrat.',
          ] },
        ],
      },
      {
        heading: 'E-mails marketing (facultatifs, distincts de tout le reste)',
        body: [
          'Nous envoyons des e-mails promotionnels (conseils créatifs et offres) uniquement si vous cochez la case facultative qui apparaît à côté de certains de nos formulaires (pas le formulaire de demande générale ni la demande de projet). La case n’est jamais cochée à votre place, et vous pouvez envoyer chaque formulaire sans la cocher. Ne pas la cocher n’a jamais d’incidence sur votre candidature, sur la ressource demandée ni sur toute réponse de notre part.',
          `Le texte auquel vous consentez est le suivant (texte en anglais) : « ${c.marketingConsentText} » Nous séparons les candidatures et les demandes de notre liste marketing. Lorsque vous cochez la case, nous enregistrons que vous avez consenti, la date et l’heure, le formulaire utilisé et la version du texte que vous avez vu (actuellement ${c.marketingConsentVersion}), et nous ajoutons votre adresse à la liste marketing. Base juridique : votre consentement.`,
          'Les e-mails concernant votre candidature, la ressource que vous avez demandée, une réservation ou un projet que vous avez avec nous sont des messages de service, et non du marketing, et ne sont pas concernés par ce choix.',
          'Vous pouvez retirer votre consentement à tout moment, gratuitement : utilisez le lien de désabonnement présent dans tout e-mail marketing (chaque e-mail marketing en comporte un et indique qui nous sommes), ou écrivez-nous. Le désabonnement met fin aux e-mails promotionnels ; nous conservons une trace minimale de votre désabonnement afin de ne plus vous écrire. Il n’a aucune incidence sur les candidatures que vous avez déposées.',
        ],
      },
      {
        heading: 'Réserver un appel',
        body: [
          'Nous ne proposons pas de calendrier de réservation ouvert. Si nous vous invitons à réserver un appel (par exemple après que vous avez rempli notre Stratégie créative offerte et que votre profil convient, ou après notre réponse à votre demande), le calendrier de réservation est fourni par Calendly, une société distincte. Il ne s’affiche qu’après que vous l’avez demandé ; vous pouvez aussi ouvrir Calendly dans un nouvel onglet ou nous écrire à la place. Calendly collecte les informations que vous y saisissez (par exemple votre nom, votre e-mail et vos réponses) conformément à sa propre notice de confidentialité, et nous recevons les informations de réservation et les utilisons pour tenir l’appel et en assurer le suivi.',
          'Lorsque le calendrier se charge, Calendly et les services qu’il utilise (y compris ses prestataires de paiement et de supervision) peuvent déposer leurs propres cookies, et Calendly affiche sa propre notice relative aux cookies. Certains de ces cookies peuvent être déposés avant que vous ayez utilisé la notice de Calendly. Nous ne les contrôlons pas et n’avons pas évalué de manière indépendante lesquels sont strictement nécessaires. Si vous préférez ne pas charger le calendrier, utilisez le lien du nouvel onglet ou écrivez-nous.',
        ],
      },
      {
        heading: 'Cookies et stockage du navigateur',
        body: c.analyticsActive
          ? [
              'Choix relatifs aux cookies sur ce site : le stockage strictement nécessaire est toujours actif ; les cookies d’analyse d’audience et les cookies marketing (publicitaires) sont désactivés tant que vous ne les activez pas. Le bandeau de cookies vous permet de tout accepter, de tout refuser ou de choisir par catégorie, et vous pouvez modifier ou retirer votre choix à tout moment via le lien « Paramètres des cookies » en bas de page. Retirer votre choix arrête les événements d’analyse et supprime les cookies de Google de ce site. Le site ne dépose aucun cookie publicitaire aujourd’hui. Ces choix concernent uniquement les cookies ; les e-mails marketing relèvent d’un choix distinct dans nos formulaires.',
            ]
          : [
              'Actuellement, ce site ne dépose aucun cookie d’analyse d’audience ou publicitaire et n’affiche aucun bandeau de cookies : Google Analytics n’est pas actif (voir « Analyse d’audience »). Si nous l’activons, un bandeau de cookies apparaîtra d’abord, l’analyse d’audience ne fonctionnera que si vous l’acceptez, et vous pourrez modifier ou retirer votre choix à tout moment. Les choix relatifs aux cookies concernent uniquement les cookies ; les e-mails marketing relèvent d’un choix distinct dans nos formulaires.',
            ],
      },
      {
        heading: 'Stockage du navigateur que nous utilisons',
        body: [
          'Le stockage de votre navigateur sur ce site reste sur votre appareil :',
          { list: [
            'convrt_consent_v1 (conservé jusqu’à ce que vous le modifiiez ou que vous effaciez les données de votre navigateur ; utilisé seulement une fois le bandeau de cookies activé) : votre choix en matière de cookies.',
            'convrt_language (conservé jusqu’à ce que vous effaciez les données de votre navigateur) : la langue que vous avez choisie volontairement (anglais, espagnol, français ou arabe), ou le fait que vous avez fermé la suggestion de langue, afin que nous ne vous la proposions plus. Cette valeur ne nous est jamais transmise et ne modifie jamais ce qu’affiche une page. La suggestion elle-même n’apparaît qu’aux visiteurs dont la requête provient d’Espagne (espagnol), de France ou d’un autre pays francophone (français), ou d’un pays arabophone (arabe) : notre hébergeur (Vercel) indique à notre serveur le pays de la requête, notre serveur répond uniquement par oui ou par non et ne stocke rien, et la localisation de votre navigateur n’est jamais demandée.',
            'convrt_scale_attribution (cet onglet du navigateur uniquement) : les informations de campagne contenues dans le lien par lequel vous êtes arrivé (utm_source, utm_medium, utm_campaign, utm_content et utm_term), afin de pouvoir les transmettre à notre lien de réservation ou de les inclure dans une candidature que vous nous envoyez. Nous ne stockons pas les identifiants de clic publicitaire (tels que gclid ou fbclid).',
            'convrt_calendly_requested (cette session de navigation uniquement) : le fait que vous avez demandé à voir le calendrier de réservation.',
            'convrt_landing_page (cette session de navigation uniquement, et seulement si vous acceptez l’analyse d’audience) : la première page de votre visite, utilisée pour voir quelles pages mènent à des demandes.',
            'Cookies Google Analytics _ga et _ga_<container ID>, seulement si vous acceptez l’analyse d’audience : Google indique une durée de vie pouvant aller jusqu’à deux ans pour ces cookies.',
          ] },
          'Le calendrier de réservation et tout autre service tiers intégré déposent leurs propres cookies, conformément à leurs propres notices.',
        ],
      },
      {
        heading: 'Analyse d’audience',
        body: [
          c.analyticsActive
            ? 'Ce site utilise Google Analytics, via Google Tag Manager, pour voir quelles pages sont consultées et lesquelles mènent à des demandes, mais seulement si vous acceptez les cookies d’analyse d’audience.'
            : 'Google Analytics, via Google Tag Manager, n’est pas actif sur ce site aujourd’hui : rien n’est chargé depuis Google et aucun cookie d’analyse d’audience n’est déposé. Nous prévoyons de l’activer à l’avenir. Lorsque nous le ferons, il ne fonctionnera que si vous acceptez les cookies d’analyse d’audience, et les points ci-dessous en décrivent les modalités.',
          'Les événements d’analyse enregistrent les pages vues et des actions telles que le clic sur un appel à l’action ou l’envoi d’un formulaire. Ils n’incluent jamais votre nom, votre adresse e-mail ni rien de ce que vous saisissez dans un formulaire. Nos paramètres Google Analytics sont les suivants : signaux Google désactivés, collecte des données fournies par l’utilisateur désactivée, suivi automatique des interactions avec les formulaires désactivé, pages vues liées à l’historique du navigateur désactivées, et données d’événements et d’utilisateurs conservées pendant 14 mois, avec l’option « réinitialiser en cas de nouvelle activité » désactivée.',
        ],
      },
      {
        heading: 'Avec qui nous partageons les informations',
        body: [
          'Uniquement avec des prestataires de services qui les traitent pour notre compte, selon leurs propres conditions standard et notices de confidentialité : MailerLite (enregistrements des candidatures, des demandes et de la liste d’e-mails, et envoi de nos e-mails), Resend (alertes par e-mail qui nous sont adressées lorsque quelqu’un dépose une candidature ou envoie une demande), Calendly (réservations), Vercel (hébergement), Cloudflare (diffusion des vidéos) et, une fois l’analyse d’audience activée et seulement si vous l’acceptez, Google (analyse d’audience). Nous n’avons pas d’autre base de données clients ni de CRM. Nous ne vendons pas d’informations personnelles.',
        ],
      },
      {
        heading: 'Transferts en dehors de l’Espace économique européen',
        body: [
          'Certains de ces prestataires sont des sociétés américaines ou traitent des informations aux États-Unis. Selon leur propre documentation publiée, Resend stocke les données de ses clients aux États-Unis et est certifié au titre du cadre de protection des données UE–États-Unis (EU-US Data Privacy Framework) ; Calendly est situé aux États-Unis et s’appuie sur le cadre de protection des données UE–États-Unis, avec les clauses contractuelles types de l’UE comme solution de repli ; et les conditions de traitement des données de Cloudflare s’appuient sur le cadre de protection des données UE–États-Unis, avec les clauses contractuelles types comme solution de repli.',
          'Les fonctions de notre site s’exécutent à Francfort, en Allemagne, sur Vercel, une société américaine. Pour MailerLite, Vercel et Google, nous n’avons pas confirmé de manière indépendante tous les lieux où les informations sont stockées ni la garantie de transfert applicable. Vous pouvez nous demander, à l’adresse indiquée ci-dessus, ce que nous savons.',
        ],
      },
      {
        heading: 'Combien de temps nous les conservons',
        body: [
          'Voici nos durées de conservation. Nous les appliquons en examinant périodiquement nos enregistrements :',
          { list: [
            'Candidatures, demandes et demandes de projet (y compris les copies conservées dans notre boîte e-mail) qui n’aboutissent pas à un projet : 12 mois après notre dernier échange significatif avec vous.',
            'Enregistrements de réservation : 12 mois, sauf si une relation commerciale en cours justifie de les conserver plus longtemps.',
            'Liste d’e-mails marketing : jusqu’à ce que vous retiriez votre consentement ou que vous vous désabonniez, avec un examen périodique des adresses inactives.',
            'Contrats, factures et documents comptables : aussi longtemps que le droit espagnol l’exige.',
            'Données d’événements et d’utilisateurs de Google Analytics (une fois l’analyse d’audience activée) : 14 mois.',
          ] },
        ],
      },
      {
        heading: 'Vos droits et comment introduire une réclamation',
        body: [
          'Vous pouvez nous demander d’accéder à vos informations personnelles, de les rectifier ou de les supprimer, d’en limiter l’utilisation ou de vous y opposer, et d’en recevoir une copie dans un format portable. Lorsque nous nous appuyons sur le consentement, vous pouvez le retirer à tout moment, par exemple en vous désabonnant d’un e-mail ou en modifiant vos paramètres de cookies ; le retrait n’affecte pas ce que nous avons fait auparavant.',
          `Pour exercer ces droits, écrivez à ${mail}. Nous répondrons dans le délai que la loi autorise.`,
          'Vous pouvez introduire une réclamation auprès de l’autorité espagnole de protection des données, l’Agencia Española de Protección de Datos (AEPD), à l’adresse www.aepd.es, ou auprès de l’autorité du pays où vous vivez ou travaillez.',
        ],
      },
      {
        heading: 'Sécurité et enfants',
        body: ['Nous faisons appel à des prestataires réputés et limitons les personnes pouvant consulter les candidatures, mais aucun système n’est totalement sûr. Le site s’adresse à des utilisateurs professionnels et ne vise pas les enfants.'],
      },
      {
        heading: 'Modifications',
        body: [`Nous pouvons mettre à jour cette politique et modifierons la date lorsque nous le ferons. Voir aussi : nos [[Conditions générales|${L.terms}]] et nos [[Mentions légales|${L.legalNotice}]].`],
      },
    ],
  }

  const terms = {
    h1: 'Conditions générales',
    intro: `Les conditions d’utilisation du site de CONVRT Studio et de ses offres gratuites, ainsi que nos conditions commerciales générales applicables aux formules payantes. Dernière mise à jour : ${dates.terms}.`,
    sections: [
      {
        heading: 'À propos des présentes conditions',
        body: [
          `En utilisant www.convrt.studio, vous acceptez les présentes conditions. Le site est exploité par ${o.name}, sous le nom commercial ${o.tradingName} ; les informations complètes sur l’exploitant figurent dans les [[Mentions légales|${L.legalNotice}]]. Ces conditions s’adressent aux entreprises : nos services sont proposés uniquement aux entreprises, et le site n’est pas destiné aux consommateurs. Voir aussi notre [[Politique de confidentialité|${L.privacy}]].`,
        ],
      },
      {
        heading: 'Utilisation du site',
        body: [
          'Vous pouvez utiliser le site pour vous informer sur nos services, nous contacter ou candidater à nos offres. Ne l’utilisez pas de manière abusive : n’essayez pas de le perturber ni d’y accéder sans autorisation, n’envoyez pas d’informations fausses ou trompeuses via ses formulaires et ne l’utilisez pas pour nous adresser des communications commerciales non sollicitées.',
        ],
      },
      {
        heading: 'Demandes et candidatures',
        body: [
          `L’envoi d’une demande ou d’une candidature ne crée aucun contrat et n’oblige aucune des parties. Nous examinons nous-mêmes les candidatures, nous pouvons refuser ou ne pas répondre à l’une d’elles, et nous ne promettons aucun délai de réponse. Merci de fournir des informations exactes. Le dépôt d’une demande ou d’une candidature, ou la confirmation que vous avez lu les informations relatives à une formule, ne constitue pas un contrat d’achat ferme et n’autorise aucun paiement. La manière dont nous les utilisons est décrite dans la [[Politique de confidentialité|${L.privacy}]].`,
        ],
      },
      {
        heading: 'Offre de concepts créatifs gratuits',
        body: [
          'La stratégie créative offerte fournit cinq concepts publicitaires personnalisés, présentés lors d’un appel, aux entreprises dont le profil convient. Elle n’inclut pas la production des publicités, il n’y a aucune obligation de recourir à CONVRT, et les concepts sont fournis pour votre évaluation.',
        ],
      },
      {
        heading: 'Éligibilité à la production vidéo offerte',
        body: [
          'La production vidéo offerte se fait sur candidature et est limitée. Nous examinons chaque candidature et invitons les entreprises qui correspondent à un court appel avant toute mise en production. Les offres sont soumises à l’adéquation et aux conditions de production, et nous ne garantissons pas qu’une candidature sera acceptée. L’offre comprend une vidéo et deux variantes de hook en bonus ; le périmètre final est confirmé par écrit avec l’entreprise sélectionnée.',
        ],
      },
      {
        heading: 'Hooks publicitaires offerts et autres ressources gratuites',
        body: ['Les hooks publicitaires offerts sont envoyés par e-mail à l’adresse que vous indiquez. Ils constituent une inspiration créative générale et sont fournis en l’état.'],
      },
      {
        heading: 'Nos services et la manière dont ils sont convenus',
        body: [
          `Les formules et les tarifs présentés sur ce site décrivent notre manière de travailler habituelle. Une mission payante ne commence que lorsque nous avons convenu par écrit du périmètre, du prix et des conditions. ${TAX_STATEMENT}`,
          'Les projets sur mesure, y compris les démonstrations et vidéos explicatives pour SaaS et applications, sont cadrés au cas par cas.',
        ],
      },
      {
        heading: 'Paiement',
        body: [
          'Les formules de production ponctuelles sont payables intégralement à l’avance, sauf accord écrit contraire. Les formules mensuelles sont facturées mensuellement à l’avance. Les factures sont payables dans un délai de sept jours calendaires à compter de la date de la facture, sauf accord écrit contraire.',
          'La production ne démarre qu’une fois le paiement initial requis reçu. Si un paiement est en retard, nous pouvons suspendre la production et ajuster les délais de livraison. Rien dans les présentes conditions ne limite les droits dont nous disposons en vertu de la loi applicable en cas de retard de paiement.',
        ],
      },
      {
        heading: 'Engagements, résiliation et remboursements',
        body: [
          'Les formules mensuelles Creative Testing Sprint et Sprint Plus comportent un engagement initial de trois mois. Les formules Organic Light et Organic Growth comportent un engagement initial de six mois. Après l’engagement initial, les formules mensuelles se poursuivent mois par mois, sauf accord écrit contraire.',
          'La résiliation d’une formule mensuelle exige un préavis écrit d’au moins 30 jours calendaires avant la date de renouvellement applicable. La résiliation ne peut prendre effet avant que l’engagement initial ait été rempli, sauf accord écrit contraire, et ne supprime aucune obligation de paiement restant due.',
          'Les formules de production ponctuelles ne se renouvellent pas automatiquement. Si vous résiliez avant le début des travaux, nous vous rembourserons le montant payé, déduction faite des coûts non récupérables convenus déjà engagés. Si vous résiliez après le début des travaux, nous avons droit au paiement des travaux déjà réalisés et des coûts de production non récupérables convenus, y compris les réservations de créateurs et les autres dépenses engagées, et tout solde éligible restant sera remboursé.',
          'Les travaux réalisés et livrés ne sont pas remboursables du seul fait que vous changez d’avis ou que le contenu n’atteint pas les résultats marketing que vous souhaitiez. Ces dispositions ne limitent aucun droit ni recours légal impératif.',
        ],
      },
      {
        heading: 'Vos responsabilités, délais et retards',
        body: [
          'Il vous incombe de fournir les informations, les supports et les validations raisonnablement nécessaires à la réalisation de votre projet. Selon le projet, cela peut comprendre :',
          { list: [
            'des échantillons de produits et leur expédition en temps utile ;',
            'les chartes graphiques et les éléments de marque ;',
            'des informations exactes sur le produit ou le service ;',
            'les accès, autorisations et documents justificatifs pertinents ;',
            'vos retours et validations ;',
            'la confirmation que les supports que vous fournissez et vos allégations publicitaires peuvent être utilisés légalement.',
          ] },
          'Les délais de production des formules Creative Testing commencent une fois le paiement requis reçu, les supports et produits nécessaires disponibles et les concepts et scripts concernés validés. Les retards dans la réception des produits, des informations, des retours ou des validations peuvent allonger les délais de production et de livraison, et CONVRT n’est pas responsable des retards de livraison causés par le fait de ne pas fournir à temps les supports ou validations nécessaires.',
          'Tout coût supplémentaire résultant de modifications ou de retards importants demandés par le client vous sera communiqué et convenu avant d’être engagé.',
        ],
      },
      {
        heading: 'Révisions',
        body: [
          'Chaque formule Creative Testing comprend deux tours de révisions par concept, comme indiqué sur la page des tarifs. Les révisions incluses couvrent des ajustements raisonnables dans le cadre du brief initialement convenu. Des révisions supplémentaires sont possibles moyennant un coût additionnel, convenu avec vous avant le début des travaux supplémentaires.',
          'Les modifications apportées à des concepts ou à des scripts déjà validés, à la direction créative ou au périmètre du projet qui nécessitent une production supplémentaire importante ou de nouveaux tournages peuvent faire l’objet d’un devis distinct. Les corrections rendues nécessaires parce que CONVRT n’a pas respecté le brief convenu ne sont pas décomptées de vos révisions incluses.',
        ],
      },
      {
        heading: 'Creator Showcase',
        body: ['Les vidéos du Creator Showcase et des galeries des pages de services sont des exemples de créateurs indépendants. Elles sont présentées pour illustrer des styles et des approches et ne sont pas nécessairement des productions de CONVRT.'],
      },
      {
        heading: 'Droits d’utilisation',
        body: [
          `Lorsque des droits d’utilisation sont inclus dans une formule, ils concèdent une licence encadrant la manière dont vous pouvez utiliser les vidéos finalisées (par exemple ${c.usageMonths} mois d’utilisation dans le monde entier dans nos formules standard). Ils ne constituent pas un transfert de la propriété des droits d’auteur. Les conditions exactes figurent dans votre contrat.`,
        ],
      },
      {
        heading: 'Contenu du site et propriété intellectuelle',
        body: [
          'Les textes, le design, le logo, les marques et les médias originaux de ce site appartiennent à CONVRT ou aux personnes qui les ont réalisés et ne peuvent être copiés, réutilisés ou adaptés sans autorisation, sauf dans les limites permises par la loi. Les vidéos présentées sur le site restent la propriété de leurs titulaires et sont présentées avec leur autorisation. Les liens vers des services tiers sont fournis par commodité ; nous ne sommes pas responsables de leur contenu ni de leurs pratiques.',
        ],
      },
      {
        heading: 'Aucune garantie de résultats',
        body: ['Nous ne garantissons jamais de résultats commerciaux ou publicitaires spécifiques, tels que des ventes, des leads, un retour sur les dépenses publicitaires ou une croissance d’audience. Les performances dépendent de facteurs tels que votre offre, votre audience, votre budget et la plateforme. Les exemples et études de cas de ce site montrent ce qui s’est produit pour les entreprises concernées et ne constituent pas une promesse que vous obtiendrez les mêmes résultats.'],
      },
      {
        heading: 'Responsabilité',
        body: [
          'Le site et son contenu sont fournis en l’état. Dans la mesure permise par la loi, CONVRT n’est pas responsable des pertes indirectes ou consécutives, ni des pertes de bénéfices, de chiffre d’affaires ou de données, résultant de l’utilisation du site ou de la confiance accordée à son contenu, et sa responsabilité totale pour l’utilisation du site est limitée aux dommages directs. Aucune stipulation des présentes conditions ne limite une responsabilité qui ne peut être limitée par la loi.',
        ],
      },
      {
        heading: 'Droit applicable et litiges',
        body: ['Les présentes conditions sont régies par le droit espagnol. Les litiges entre CONVRT et un utilisateur professionnel sont soumis aux tribunaux espagnols compétents.'],
      },
      {
        heading: 'Conditions du site et contrats clients signés',
        body: [
          'Les présentes conditions couvrent l’utilisation du site et nos offres gratuites, et définissent notre cadre commercial général applicable aux formules payantes. Elles n’empêchent pas les arrangements négociés individuellement : un projet payant est régi par le contrat écrit, le bon de commande ou la proposition que les deux parties acceptent pour ce projet. En cas de conflit entre un contrat écrit convenu individuellement et les présentes conditions, celui-ci prévaut pour ce projet, sous réserve du droit impératif applicable.',
        ],
      },
      {
        heading: 'Modifications et contact',
        body: [`Nous pouvons mettre à jour les présentes conditions et modifierons la date lorsque nous le ferons. Questions : ${mail}.`],
      },
    ],
  }

  const legalNotice = {
    h1: 'Mentions légales',
    intro: `Les informations sur l’exploitant de www.convrt.studio que le droit espagnol (Ley 34/2002, de servicios de la sociedad de la información, art. 10) impose à un site commercial de mettre à disposition. Dernière mise à jour : ${dates.legalNotice}.`,
    sections: [
      {
        heading: 'Exploitant du site',
        body: [{ list: operatorList }],
      },
      {
        heading: 'Activité et public',
        body: [
          'CONVRT Studio est un studio créatif dirigé par son fondateur, qui produit pour les entreprises des vidéos UGC, des vidéos pour SaaS et applications, des vidéos Spokesperson et des vidéos organiques pour les réseaux sociaux. Ses services sont proposés uniquement aux entreprises, et non aux consommateurs.',
        ],
      },
      {
        heading: 'Prix et taxes',
        body: [`Les prix affichés sur ce site sont indiqués en dollars américains (USD) ou en euros (EUR), selon la page concernée. La devise applicable, les tarifs et les conditions de paiement seront confirmés dans le contrat de projet écrit. ${TAX_STATEMENT} Voir la [[page des tarifs|${L.pricing}]].`],
      },
      {
        heading: 'Propriété intellectuelle',
        body: [
          'Les textes, le design, le logo, les marques et les médias originaux de ce site appartiennent à CONVRT ou aux personnes qui les ont réalisés et ne peuvent être copiés, réutilisés ou adaptés sans autorisation, sauf dans les limites permises par la loi. Les vidéos présentées dans le Creator Showcase sont des exemples de créateurs indépendants et restent la propriété de leurs titulaires.',
        ],
      },
      {
        heading: 'Contenu et liens',
        body: [
          'Nous publions les informations de ce site de bonne foi et pouvons les modifier à tout moment. Elles ne garantissent aucun résultat. Les liens vers d’autres sites sont fournis par commodité ; nous ne sommes pas responsables de leur contenu.',
        ],
      },
      {
        heading: 'Données personnelles et cookies',
        body: [`La manière dont nous traitons les informations personnelles, les cookies et le stockage du navigateur est expliquée dans la [[Politique de confidentialité|${L.privacy}]].`],
      },
      {
        heading: 'Conditions, droit applicable et juridiction',
        body: [`L’utilisation du site et des offres gratuites est régie par nos [[Conditions générales|${L.terms}]]. Le droit espagnol s’applique, et les litiges entre CONVRT et un utilisateur professionnel sont soumis aux tribunaux espagnols compétents.`],
      },
    ],
  }

  return { privacy, terms, legalNotice }
}
