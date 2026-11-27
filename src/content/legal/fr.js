/* FRENCH version of the three legal documents (Politique de confidentialité, Conditions générales, Mentions légales).

   SOURCE (owner decision, 27 Nov 2026): the professionally localized copy supplied by the owner (CONVRT-FR.md), implemented VERBATIM. It replaces the earlier translation. It is NOT a legal certification and
   does not change the approved commercial policies. Where the supplied text had no link markup the links of the English source were added to the same words (see the review report); the operator identity,
   NIF, address, e-mail, dates, version number and usage months come from the context object (src/content/legal/context.js), never retyped.
   Structure (sections, paragraphs, list items, link targets, numbers and identifiers) is checked against the English source by scripts/legal-structure-check.mjs.
   Apostrophes are written exactly as supplied (straight). French non-breaking spaces before « : ; ? ! » » are applied at render time (src/i18n/fr/typography.js): write ordinary spaces here.
   The privacy cookie/analytics paragraphs exist in two variants (analytics active or not) like the English text: the supplied copy is the ACTIVE variant; the inactive variant is the earlier French text, kept. */

export default function LEGAL_FR(c) {
  const { operator: o, links: L } = c
  const mail = c.mail
  const FR_MONTHS = { January: 'janvier', February: 'février', March: 'mars', April: 'avril', May: 'mai', June: 'juin', July: 'juillet', August: 'août', September: 'septembre', October: 'octobre', November: 'novembre', December: 'décembre' }
  const frDate = (en) => en.replace(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/, (m, d, mo, y) => (FR_MONTHS[mo] ? `${d === '1' ? '1er' : d} ${FR_MONTHS[mo]} ${y}` : m))
  const dates = { privacy: frDate(c.englishDates.privacy), terms: frDate(c.englishDates.terms), legalNotice: frDate(c.englishDates.legalNotice) } // each document's own English date, preserved
  const address = o.address.replace(/, Spain$/, ', Espagne') // street and postal code unchanged; only the country name is written in French
  // The supplied Privacy Policy writes the operator line without "(autónomo)", the supplied Legal Notice with it: kept exactly as supplied (reported).
  const operatorListPrivacy = [
    `Nom commercial : ${o.tradingName}`,
    `Exploitant : ${o.name}, professionnel indépendant immatriculé en Espagne`,
    `Numéro d'identification fiscale (NIF) : ${o.taxId}`,
    `Adresse postale : ${address}`,
    `E-mail : ${mail}`,
    `Autres moyens de nous contacter directement : [[formulaire de contact|${L.contact}]] et [[CONVRT Studio sur LinkedIn|${L.companyLinkedin}]]`,
  ]
  const operatorListNotice = [
    `Nom commercial : ${o.tradingName}`,
    `Exploitant : ${o.name}, professionnel indépendant (autónomo) immatriculé en Espagne`,
    `Numéro d'identification fiscale (NIF) : ${o.taxId}`,
    `Adresse postale : ${address}`,
    `E-mail : ${mail}`,
    `Autres moyens de nous contacter directement : [[formulaire de contact|${L.contact}]] et [[CONVRT Studio sur LinkedIn|${L.companyLinkedin}]]`,
  ]

  const privacy = {
    h1: 'Politique de confidentialité',
    intro: `Comment CONVRT Studio traite les données personnelles sur www.convrt.studio. Dernière mise à jour : ${dates.privacy}.`,
    sections: [
      {
        heading: 'Responsable du traitement de vos données',
        body: [
          `Le site www.convrt.studio est exploité par ${o.name}, professionnel indépendant (autónomo) immatriculé en Espagne, exerçant sous le nom commercial ${o.tradingName} (« CONVRT », « nous »). Nous déterminons les finalités et les modalités d'utilisation des données décrites ci-dessous : nous sommes le responsable du traitement.`,
          { list: operatorListPrivacy },
          `Pour toute question concernant cette politique ou vos données, écrivez à ${mail}. Les coordonnées complètes de l'exploitant figurent dans nos [[Mentions légales|${L.legalNotice}]].`,
        ],
      },
      {
        heading: "Champ d'application de cette politique",
        body: [
          "Cette politique concerne les visiteurs du site et les personnes qui nous adressent des demandes. Elle s'adresse aux contacts professionnels : nos services sont proposés aux entreprises, non aux consommateurs. Les créateurs indépendants qui transmettent leurs réalisations via notre page privée d'intégration reçoivent une information de confidentialité distincte à cette étape.",
        ],
      },
      {
        heading: 'Données collectées, finalités et bases juridiques',
        body: [
          'Chaque rubrique précise les données collectées, leur finalité et la base juridique du traitement.',
          { list: [
            "Stratégie créative offerte (Creative Growth Roadmap). Vous répondez à cinq questions courtes dans votre navigateur pour vérifier si l'offre vous correspond. Vos réponses restent dans votre navigateur et servent uniquement à cette vérification ; elles ne nous sont pas transmises. Si vous correspondez aux critères, vous pouvez réserver un appel sur Calendly (voir « Réserver un appel »).",
            "Hooks publicitaires offerts. Nous collectons votre adresse e-mail et le secteur que vous sélectionnez afin de vous envoyer les hooks demandés. Base : votre demande. Nous pouvons vous demander de confirmer votre adresse au préalable. La réception des hooks ne vous inscrit pas à notre liste marketing.",
            "Demande de production vidéo offerte. Nous collectons votre nom, votre e-mail professionnel, le site de votre entreprise, vos réponses concernant votre activité (type d'entreprise, tranche de dépenses publicitaires mensuelles, nombre de vidéos par mois, type de vidéo, délais, intérêt pour une production régulière) et une description facultative, afin d'étudier votre demande et de vous contacter à ce sujet. Base : mesures précontractuelles prises à votre demande et notre intérêt légitime à gérer cette offre. Nous recevons une notification par e-mail pour chaque demande via Resend, notre prestataire d'envoi d'e-mails.",
            "Programme de partenaires apporteurs d'affaires. Nous collectons votre nom, votre e-mail, votre type de partenaire, le programme choisi et, facultativement, le nom de votre entreprise ou agence ainsi que son site ou votre profil LinkedIn, afin d'étudier votre candidature et de vous contacter. Base : identique à celle de la demande de vidéo offerte. Le formulaire comprend une case obligatoire confirmant que nous pouvons utiliser ces données à cette fin.",
            "Formulaire de contact général. Sur la page Contact, nous collectons votre nom, votre e-mail, le nom de votre marque ou entreprise, la prestation qui vous intéresse, votre message et la confirmation de lecture de cette politique, ainsi que, facultativement, votre site ou profil sur les réseaux sociaux et une estimation de votre budget sous forme de tranche. Nous nous transmettons ces données par e-mail pour vous répondre, déterminer si et comment nous pouvons vous accompagner, et préparer une proposition si vous le demandez. Elles ne sont pas ajoutées à notre liste marketing. Base : mesures précontractuelles prises à votre demande et notre intérêt légitime à répondre aux demandes professionnelles.",
            "Demande de projet. Lorsque vous demandez une offre, nous collectons votre nom, votre e-mail, le nom de votre marque ou entreprise, votre site ou profil social, l'offre choisie, vos réponses concernant le projet (description et objectif, dépenses publicitaires ou activité actuelle sur les réseaux sociaux, type de production et budget estimé pour les projets sur mesure, délai avant d'être prêt à démarrer, date de début souhaitée et langues de production) et votre prise de connaissance des conditions de l'offre. Nous enregistrons également la langue de la page, la page d'origine et, si vous arrivez par un lien de campagne, ses paramètres (utm_source, utm_medium, utm_campaign, utm_content et utm_term) ainsi que, uniquement si vous avez accepté la mesure d'audience, la première page de votre visite. Nous nous transmettons ces données par e-mail afin d'examiner personnellement votre demande et de décider de la suite. Le prix affiché provient de nos propres tarifs, jamais de votre navigateur. La demande ne constitue pas un achat et n'autorise aucun paiement. Ces données ne sont pas ajoutées à notre liste marketing. Base : identique à celle du formulaire de contact général.",
            "E-mails et appels. Si vous nous écrivez ou réservez un appel, nous utilisons les informations transmises pour vous répondre et travailler avec vous. Base : votre demande et notre intérêt légitime à répondre aux demandes professionnelles.",
            "Données techniques. Notre hébergeur, Vercel, traite votre adresse IP et les détails de vos requêtes afin de fournir le site et d'en assurer la sécurité. Les vidéos sont diffusées via Cloudflare Stream. Base : notre intérêt légitime à disposer d'un site fonctionnel et sécurisé.",
            "Formulaire pour les créateurs. Le lien destiné aux créateurs indépendants ouvre un formulaire Google ; les données que vous y saisissez sont traitées via Google Forms.",
            "Documents comptables et juridiques. Si vous devenez client, nous conservons les contrats, factures et documents exigés par la loi. Base : obligation légale et contrat.",
          ] },
        ],
      },
      {
        heading: 'E-mails marketing (facultatifs et indépendants)',
        body: [
          "Nous envoyons des e-mails promotionnels (conseils créatifs et offres) uniquement si vous cochez la case facultative présente à côté de certains formulaires (pas sur le formulaire de contact général ni sur la demande de projet). Cette case n'est jamais précochée et tous les formulaires peuvent être envoyés sans la cocher. Votre choix n'affecte ni votre demande, ni la ressource demandée, ni notre réponse.",
          // The quoted consent wording is the SUPPLIED French sentence; the version number comes from the context. The forms themselves show the ENGLISH v2 text and only on English pages (reported, not changed).
          `Le texte auquel vous consentez est : « Envoyez-moi également, de temps en temps, des conseils créatifs et des offres de CONVRT par e-mail. Vous pouvez vous désinscrire à tout moment. (Facultatif) » Nous séparons les demandes et candidatures de notre liste marketing. Lorsque vous cochez la case, nous enregistrons votre consentement, la date et l'heure, le formulaire utilisé et la version du texte présenté (actuellement ${c.marketingConsentVersion}), puis ajoutons votre adresse à notre liste marketing. Base : votre consentement.`,
          "Les e-mails concernant votre demande, la ressource sollicitée, une réservation ou un projet avec nous sont des communications de service, non des communications marketing, et ne relèvent pas de ce choix.",
          "Vous pouvez retirer votre consentement gratuitement à tout moment : utilisez le lien de désinscription de tout e-mail marketing (chacun contient un tel lien et identifie l'expéditeur) ou écrivez-nous. La désinscription met fin aux e-mails promotionnels ; nous conservons une trace minimale de votre désinscription pour ne plus vous en adresser. Cela n'affecte aucune de vos demandes.",
        ],
      },
      {
        heading: 'Réserver un appel',
        body: [
          "Nous ne proposons pas de calendrier de réservation ouvert à tous. Si nous vous invitons à réserver un appel (par exemple après avoir complété notre stratégie créative offerte et satisfait aux critères, ou après notre réponse à votre demande), le calendrier est fourni par Calendly, une société indépendante. Le lien ouvre Calendly dans un nouvel onglet ; vous pouvez aussi nous écrire par e-mail. Calendly collecte les informations que vous y saisissez (nom, e-mail et réponses, par exemple) conformément à sa propre politique de confidentialité. Nous recevons les informations de réservation et les utilisons pour tenir l'appel et en assurer le suivi.",
          "Nous ne chargeons pas Calendly sur ce site : aucun contenu Calendly n'est chargé sur nos pages. Lorsque vous ouvrez le lien, vous accédez au site de Calendly, où Calendly et les services auxquels il recourt (dont ses prestataires de paiement et de supervision technique) peuvent déposer leurs propres cookies conformément à son information sur les cookies. Nous ne les contrôlons pas. Vous pouvez, si vous préférez, nous écrire par e-mail.",
        ],
      },
      {
        heading: 'Cookies et stockage dans le navigateur',
        body: c.analyticsActive
          ? [
              "Sur ce site, le stockage strictement nécessaire est toujours actif ; les cookies de mesure d'audience et de marketing (publicité) sont désactivés tant que vous ne les autorisez pas. Le bandeau de cookies vous permet de tout accepter, tout refuser ou choisir les catégories. Vous pouvez modifier ou retirer votre choix à tout moment via le lien « Paramètres des cookies » dans le pied de page. Le retrait arrête les événements de mesure d'audience et supprime les cookies Google de ce site. Le site ne dépose actuellement aucun cookie publicitaire. Ces choix concernent uniquement les cookies ; les e-mails marketing font l'objet d'un choix distinct dans nos formulaires.",
            ]
          : [
              // inactive variant: the earlier French text, kept (the supplied copy is the active variant). Only the cross-reference to the renamed analytics heading was updated.
              'Actuellement, ce site ne dépose aucun cookie d’analyse d’audience ou publicitaire et n’affiche aucun bandeau de cookies : Google Analytics n’est pas actif (voir « Mesure d\'audience »). Si nous l’activons, un bandeau de cookies apparaîtra d’abord, l’analyse d’audience ne fonctionnera que si vous l’acceptez, et vous pourrez modifier ou retirer votre choix à tout moment. Les choix relatifs aux cookies concernent uniquement les cookies ; les e-mails marketing relèvent d’un choix distinct dans nos formulaires.',
            ],
      },
      {
        heading: 'Stockage utilisé dans le navigateur',
        body: [
          'Les données stockées par ce site dans votre navigateur restent sur votre appareil :',
          { list: [
            "convrt_consent_v1 (jusqu'à modification de votre choix ou effacement des données du navigateur) : votre choix relatif aux cookies.",
            "convrt_language (jusqu'à effacement des données du navigateur) : la langue que vous avez explicitement choisie (anglais, espagnol, français ou arabe), ou le fait que vous avez fermé la suggestion de langue, pour ne pas vous la reproposer. Cette information ne nous est jamais transmise et ne modifie jamais le contenu affiché sur une page. La suggestion apparaît uniquement aux visiteurs dont la requête provient d'Espagne (espagnol), de France ou d'un autre pays francophone (français), ou d'un pays arabophone (arabe) : notre hébergeur, Vercel, indique à notre serveur le pays d'origine de la requête ; notre serveur répond uniquement oui ou non et ne stocke rien. La géolocalisation de votre navigateur n'est jamais demandée.",
            "convrt_scale_attribution (dans cet onglet uniquement) : les paramètres de campagne du lien par lequel vous êtes arrivé (utm_source, utm_medium, utm_campaign, utm_content et utm_term), pour les transmettre au lien de réservation ou les inclure dans une demande que vous nous envoyez. Nous ne stockons pas les identifiants de clic publicitaire, tels que gclid ou fbclid.",
            "convrt_landing_page (pendant cette session uniquement, et seulement si vous acceptez la mesure d'audience) : la première page de votre visite, pour identifier celles qui génèrent des demandes.",
            "Cookies Google Analytics _ga et _ga_<container ID>, uniquement si vous acceptez la mesure d'audience : Google indique une durée de vie pouvant atteindre deux ans.",
          ] },
          'Les services tiers intégrés, comme le lecteur vidéo, peuvent déposer leurs propres cookies conformément à leurs informations respectives.',
        ],
      },
      {
        heading: "Mesure d'audience",
        body: [
          c.analyticsActive
            ? "Ce site utilise Google Analytics, via Google Tag Manager, pour connaître les pages consultées et celles qui génèrent des demandes, uniquement si vous acceptez les cookies de mesure d'audience."
            : 'Google Analytics, via Google Tag Manager, n’est pas actif sur ce site aujourd’hui : rien n’est chargé depuis Google et aucun cookie d’analyse d’audience n’est déposé. Nous prévoyons de l’activer à l’avenir. Lorsque nous le ferons, il ne fonctionnera que si vous acceptez les cookies d’analyse d’audience, et les points ci-dessous en décrivent les modalités.',
          "Les événements de mesure d'audience enregistrent les pages vues et des actions comme le clic sur un appel à l'action ou l'envoi d'un formulaire. Ils ne contiennent jamais votre nom, votre adresse e-mail ou ce que vous saisissez dans un formulaire. Notre configuration Google Analytics est la suivante : signaux Google désactivés, collecte des données fournies par les utilisateurs désactivée, suivi automatique des interactions avec les formulaires désactivé, pages vues fondées sur les modifications de l'historique du navigateur désactivées et conservation des données d'événements et d'utilisateurs pendant 14 mois, sans réinitialisation lors d'une nouvelle activité.",
        ],
      },
      {
        heading: 'Destinataires des données',
        body: [
          "Nous partageons les données uniquement avec des prestataires qui les traitent pour notre compte, conformément à leurs conditions et politiques de confidentialité : MailerLite (enregistrement des candidatures, demandes et listes d'e-mails, et envoi de nos e-mails), Resend (notifications par e-mail lors d'une candidature ou d'une demande), Calendly (réservations, uniquement si nous vous invitons à réserver), Vercel (hébergement), Cloudflare (diffusion vidéo) et Google (messagerie professionnelle, formulaire Google pour les créateurs indépendants et, lorsque la mesure d'audience est activée et uniquement si vous l'acceptez, analyse d'audience). Nous ne disposons d'aucune autre base de données clients ni d'aucun CRM. Nous ne vendons pas de données personnelles.",
        ],
      },
      {
        heading: "Transferts hors de l'Espace économique européen",
        body: [
          "Certains de ces prestataires sont des sociétés américaines ou traitent des données aux États-Unis. Selon leur propre documentation publiée, Resend conserve les données de ses clients aux États-Unis, quelle que soit la région d'envoi choisie, et est certifié au titre du cadre de protection des données UE–États-Unis (EU-US Data Privacy Framework) ; Calendly est situé aux États-Unis et s'appuie sur ce cadre, avec les clauses contractuelles types de l'UE comme mécanisme de substitution ; les conditions de traitement de Cloudflare s'appuient sur ce cadre, avec les clauses contractuelles types comme mécanisme de substitution.",
          "Les fonctions de notre site s'exécutent à Francfort, en Allemagne, chez Vercel, une société américaine ; les pages et fichiers du site sont diffusés via le réseau mondial de Vercel. Selon leur propre documentation publiée, Vercel et Google s'appuient sur le cadre de protection des données UE–États-Unis et les clauses contractuelles types. Pour MailerLite, nous n'avons pas encore confirmé l'ensemble des lieux de stockage ni la garantie applicable aux transferts. Vous pouvez nous écrire à l'adresse indiquée pour connaître les informations dont nous disposons.",
        ],
      },
      {
        heading: 'Durées de conservation',
        body: [
          "Nous appliquons les durées suivantes en examinant périodiquement nos dossiers :",
          { list: [
            "Candidatures, demandes de renseignements et demandes de projet (y compris les copies conservées dans notre boîte e-mail) qui ne débouchent pas sur un projet : 12 mois après notre dernier contact significatif avec vous.",
            "Données de réservation : 12 mois, sauf si une relation commerciale en cours justifie une conservation plus longue.",
            "Liste d'e-mails marketing : jusqu'au retrait de votre consentement ou à votre désinscription, avec un examen périodique des adresses inactives.",
            "Contrats, factures et documents comptables : pendant la durée exigée par la législation espagnole.",
            "Données d'événements et d'utilisateurs Google Analytics (lorsque la mesure d'audience est activée) : 14 mois.",
          ] },
        ],
      },
      {
        heading: 'Vos droits et les voies de réclamation',
        body: [
          "Vous pouvez demander l'accès à vos données personnelles, leur rectification ou leur effacement, la limitation du traitement, vous opposer à leur utilisation et demander une copie dans un format portable. Lorsque nous nous appuyons sur votre consentement, vous pouvez le retirer à tout moment, par exemple en vous désinscrivant des e-mails ou en modifiant vos paramètres de cookies. Le retrait n'affecte pas les traitements effectués auparavant.",
          `Pour exercer ces droits, écrivez à ${mail}. Nous répondrons dans le délai prévu par la loi.`,
          "Vous pouvez déposer une réclamation auprès de l'autorité espagnole de protection des données, l'Agencia Española de Protección de Datos (AEPD), sur www.aepd.es, ou auprès de l'autorité du pays où vous résidez ou travaillez.",
        ],
      },
      {
        heading: 'Sécurité et mineurs',
        body: ["Nous utilisons des prestataires réputés et limitons l'accès aux demandes, mais aucun système n'est totalement sécurisé. Le site est destiné aux professionnels et ne s'adresse pas aux enfants."],
      },
      {
        heading: 'Modifications',
        body: [`Nous pouvons mettre à jour cette politique et modifierons la date le cas échéant. Voir également nos [[Conditions générales|${L.terms}]] et nos [[Mentions légales|${L.legalNotice}]].`],
      },
    ],
  }

  const terms = {
    h1: 'Conditions générales',
    intro: `Conditions d'utilisation du site CONVRT Studio et de ses offres gratuites, ainsi que conditions commerciales générales applicables à nos offres payantes. Dernière mise à jour : ${dates.terms}.`,
    sections: [
      {
        heading: 'À propos de ces conditions',
        body: [
          `En utilisant www.convrt.studio, vous acceptez ces conditions. Le site est exploité par ${o.name}, exerçant sous le nom commercial ${o.tradingName} ; les coordonnées complètes figurent dans les [[Mentions légales|${L.legalNotice}]]. Ces conditions s'adressent aux entreprises : nos services sont réservés aux entreprises et le site n'est pas destiné aux consommateurs. Consultez également notre [[Politique de confidentialité|${L.privacy}]].`,
        ],
      },
      {
        heading: 'Utilisation du site',
        body: [
          "Vous pouvez utiliser le site pour découvrir nos services, nous contacter ou demander à bénéficier de nos offres. N'en faites pas un usage abusif : ne tentez pas d'en perturber le fonctionnement ou d'y accéder sans autorisation, de transmettre des informations fausses ou trompeuses via ses formulaires, ni de l'utiliser pour nous adresser des communications commerciales non sollicitées.",
        ],
      },
      {
        heading: 'Demandes et candidatures',
        body: [
          `L'envoi d'une demande ou d'une candidature ne crée aucun contrat et n'engage aucune des parties. Nous examinons nous-mêmes les demandes, pouvons les refuser ou ne pas y répondre et ne garantissons aucun délai de réponse. Veuillez fournir des informations exactes. L'envoi d'une demande ou la confirmation de lecture des informations relatives à une offre ne constitue pas un engagement d'achat contraignant et n'autorise aucun paiement. L'utilisation de ces données est décrite dans la [[Politique de confidentialité|${L.privacy}]].`,
        ],
      },
      {
        heading: 'Offre de concepts créatifs gratuits',
        body: [
          "La stratégie créative offerte (Creative Growth Roadmap) propose cinq concepts publicitaires personnalisés, présentés lors d'un appel, aux entreprises qui correspondent aux critères de l'offre. Elle ne comprend pas la production des publicités, n'entraîne aucune obligation de faire appel à CONVRT et les concepts vous sont remis pour évaluation.",
        ],
      },
      {
        heading: "Conditions d'accès à la production vidéo offerte",
        body: [
          "La production vidéo offerte est limitée et accessible sur candidature. Nous examinons chaque demande et invitons les entreprises correspondant aux critères à un court appel avant tout lancement de production. Les offres sont soumises à des critères d'adéquation et aux conditions de production ; nous ne garantissons pas l'acceptation d'une demande. L'offre comprend une vidéo et deux variantes de hook supplémentaires ; le périmètre définitif est confirmé par écrit avec l'entreprise sélectionnée.",
        ],
      },
      {
        heading: 'Hooks publicitaires et autres ressources gratuites',
        body: ["Les hooks offerts sont envoyés à l'adresse e-mail que vous fournissez. Ils constituent une source générale d'inspiration créative et sont fournis en l'état."],
      },
      {
        heading: 'Nos prestations et leurs modalités de commande',
        body: [
          "Les offres et tarifs du site décrivent nos modalités habituelles de travail. Une prestation payante ne débute qu'après accord écrit sur le périmètre, le prix et les conditions. Tous les prix sont hors TVA. Les taxes applicables seront calculées en fonction du lieu d'établissement et du statut fiscal de votre entreprise.",
          'Les projets sur mesure, notamment les démonstrations et vidéos explicatives pour les SaaS et applications, font l\'objet d\'un cadrage individuel.',
        ],
      },
      {
        heading: 'Paiement',
        body: [
          "Les offres de production ponctuelle sont payables intégralement à l'avance, sauf accord écrit contraire. Les offres mensuelles sont facturées chaque mois à l'avance. Les factures sont payables dans les sept jours calendaires suivant leur date d'émission, sauf accord écrit contraire.",
          "La production ne commence qu'après réception du paiement initial requis. En cas de retard de paiement, nous pouvons suspendre la production et ajuster les délais de livraison. Rien dans ces conditions ne limite les droits dont nous disposons en vertu de la législation applicable en matière de retard de paiement.",
        ],
      },
      {
        heading: 'Engagements, résiliation, annulation et remboursements',
        body: [
          "Les offres mensuelles Creative Testing Sprint et Sprint Plus comportent un engagement initial de trois mois. Les offres Organic Light et Organic Growth comportent un engagement initial de six mois. À l'issue de cet engagement initial, les offres mensuelles se poursuivent de mois en mois, sauf accord écrit contraire.",
          "La résiliation d'une offre mensuelle nécessite un préavis écrit d'au moins 30 jours calendaires avant la date de renouvellement applicable. Elle ne peut prendre effet avant que l'engagement initial ait été intégralement respecté, sauf accord écrit contraire, et ne dispense pas du règlement des sommes restant dues.",
          "Les offres de production ponctuelle ne se renouvellent pas automatiquement. Si vous annulez avant le début des travaux, nous vous rembourserons le montant versé, déduction faite des frais non récupérables convenus et déjà engagés. Si vous annulez après le début des travaux, nous avons droit au paiement des travaux déjà réalisés et des frais de production non récupérables convenus, notamment les réservations de créateurs et autres dépenses engagées. Tout solde restant ouvrant droit à remboursement sera remboursé.",
          "Les travaux achevés et livrés ne sont pas remboursables au seul motif que vous changez d'avis ou que le contenu n'obtient pas les résultats marketing souhaités. Ces dispositions ne limitent aucun droit ni recours impératif prévu par la loi.",
        ],
      },
      {
        heading: 'Vos responsabilités, délais et retards',
        body: [
          "Vous êtes responsable de la fourniture des informations, éléments et validations raisonnablement nécessaires à la réalisation de votre projet. Selon le projet, il peut s'agir de :",
          { list: [
            'échantillons de produits et expédition des produits dans les délais ;',
            'charte graphique et éléments de marque ;',
            'informations exactes sur les produits ou services ;',
            'accès, autorisations et documents utiles ;',
            'retours et validations ;',
            'confirmation que les éléments fournis et les allégations publicitaires peuvent être utilisés légalement.',
          ] },
          "Les délais de production des offres Creative Testing commencent lorsque le paiement requis a été reçu, que les éléments et produits nécessaires sont disponibles et que les concepts et scripts concernés ont été validés. Les retards de réception des produits, informations, retours ou validations peuvent prolonger les délais de production et de livraison. CONVRT n'est pas responsable des retards de livraison résultant de l'absence de transmission dans les délais des éléments ou validations nécessaires.",
          "Les coûts supplémentaires résultant de modifications importantes demandées par le client ou de retards vous seront communiqués et feront l'objet d'un accord avant d'être engagés.",
        ],
      },
      {
        heading: 'Retouches et révisions',
        body: [
          "Chaque offre Creative Testing comprend deux séries de révisions par concept, comme indiqué sur la page Tarifs. Les révisions incluses couvrent les ajustements raisonnables dans le cadre du brief initialement convenu. Des révisions supplémentaires sont possibles moyennant un coût additionnel convenu avec vous avant le début des travaux supplémentaires.",
          "Les modifications de concepts, scripts, direction créative ou périmètre déjà validés qui nécessitent une production supplémentaire importante ou un nouveau tournage peuvent faire l'objet d'un devis distinct. Les corrections nécessaires parce que CONVRT n'a pas respecté le brief convenu ne sont pas décomptées des révisions incluses.",
        ],
      },
      {
        heading: 'Portfolio de créateurs',
        body: ["Les vidéos du portfolio de créateurs et des galeries de nos pages de services sont des exemples de réalisations de créateurs indépendants. Elles illustrent des styles et approches et ne sont pas nécessairement des productions de CONVRT."],
      },
      {
        heading: "Droits d'utilisation",
        body: [
          // "six mois" in the supplied text: written as the context number so the structure check (numbers must match the English "6") passes; it renders "6 mois" (reported).
          `Lorsqu'une offre inclut des droits d'utilisation, ceux-ci constituent une licence définissant les modalités d'exploitation des vidéos finalisées (par exemple, ${c.usageMonths} mois d'utilisation dans le monde entier pour nos offres standard). Ils ne constituent pas une cession de la titularité des droits d'auteur. Les conditions exactes sont précisées dans votre accord.`,
        ],
      },
      {
        heading: 'Contenu du site et propriété intellectuelle',
        body: [
          "Les textes, le design, le logo, les marques et les contenus originaux de ce site appartiennent à CONVRT ou à leurs créateurs et ne peuvent être copiés, réutilisés ou adaptés sans autorisation, sauf dans les cas prévus par la loi. Les vidéos présentées restent la propriété de leurs titulaires et sont diffusées avec leur autorisation. Les liens vers des services tiers sont fournis par commodité ; nous ne sommes pas responsables de leurs contenus ni de leurs pratiques.",
        ],
      },
      {
        heading: 'Absence de garantie de résultats',
        body: ["Nous ne garantissons aucun résultat commercial ou publicitaire précis, comme les ventes, les leads, le retour sur les dépenses publicitaires ou la croissance d'audience. Les performances dépendent notamment de votre offre, de votre audience, de votre budget et de la plateforme. Les exemples et études de cas présentés illustrent les résultats obtenus par les entreprises concernées et ne constituent pas une promesse de résultats identiques."],
      },
      {
        heading: 'Responsabilité',
        body: [
          "Le site et son contenu sont fournis en l'état. Dans les limites autorisées par la loi, CONVRT n'est pas responsable des préjudices indirects ou consécutifs, ni des pertes de bénéfices, de revenus ou de données résultant de l'utilisation du site ou de la confiance accordée à son contenu. Sa responsabilité totale au titre de l'utilisation du site est limitée aux dommages directs. Rien dans ces conditions ne limite une responsabilité qui ne peut légalement être limitée.",
        ],
      },
      {
        heading: 'Droit applicable et litiges',
        body: ["Ces conditions sont régies par le droit espagnol. Les litiges entre CONVRT et un utilisateur professionnel sont soumis aux juridictions espagnoles compétentes."],
      },
      {
        heading: 'Conditions du site et accords conclus avec les clients',
        body: [
          "Ces conditions régissent l'utilisation du site et de nos offres gratuites et définissent le cadre commercial général de nos offres payantes. Elles n'excluent pas les accords négociés individuellement : chaque projet payant est régi par l'accord, la commande ou la proposition écrite acceptée par les deux parties. En cas de contradiction entre un accord écrit négocié individuellement et ces conditions, cet accord prévaut pour le projet concerné, sous réserve des dispositions impératives applicables.",
        ],
      },
      {
        heading: 'Modifications et contact',
        body: [`Nous pouvons mettre à jour ces conditions et modifierons la date le cas échéant. Questions : ${mail}.`],
      },
    ],
  }

  const legalNotice = {
    h1: 'Mentions légales',
    intro: `Informations relatives à l'exploitant de www.convrt.studio que la législation espagnole (Ley 34/2002, de servicios de la sociedad de la información, art. 10) impose de rendre accessibles sur un site commercial. Dernière mise à jour : ${dates.legalNotice}.`,
    sections: [
      {
        heading: 'Exploitant du site',
        body: [{ list: operatorListNotice }],
      },
      {
        heading: 'Activité et public concerné',
        body: [
          "CONVRT Studio est un studio créatif dirigé par son fondateur qui produit des vidéos UGC, des vidéos pour les SaaS et les applications, des vidéos spokesperson et du contenu vidéo organique pour les réseaux sociaux des entreprises. Ses prestations sont réservées aux entreprises et ne sont pas proposées aux consommateurs.",
        ],
      },
      {
        heading: 'Prix et taxes',
        body: [`Les prix affichés sur ce site sont exprimés en dollars américains (USD) ou en euros (EUR), selon les indications figurant sur la page concernée. La devise applicable, le prix et les modalités de paiement seront confirmés dans l'accord écrit relatif au projet. Tous les prix sont hors TVA. Les taxes applicables seront calculées en fonction du lieu d'établissement et du statut fiscal de votre entreprise. Consultez la [[page Tarifs|${L.pricing}]].`],
      },
      {
        heading: 'Propriété intellectuelle',
        body: [
          "Les textes, le design, le logo, les marques et les contenus originaux de ce site appartiennent à CONVRT ou à leurs créateurs et ne peuvent être copiés, réutilisés ou adaptés sans autorisation, sauf dans les cas prévus par la loi. Les vidéos du portfolio de créateurs sont des exemples de réalisations de créateurs indépendants et restent la propriété de leurs titulaires.",
        ],
      },
      {
        heading: 'Contenu et liens',
        body: [
          "Nous publions les informations du site de bonne foi et pouvons les modifier à tout moment. Ces informations ne garantissent aucun résultat. Les liens vers d'autres sites sont fournis par commodité ; nous ne sommes pas responsables de leurs contenus.",
        ],
      },
      {
        heading: 'Données personnelles et cookies',
        body: [`Le traitement des données personnelles, les cookies et le stockage dans le navigateur sont décrits dans notre [[Politique de confidentialité|${L.privacy}]].`],
      },
      {
        heading: 'Conditions, droit applicable et juridiction',
        body: [`L'utilisation du site et des offres gratuites est régie par nos [[Conditions générales|${L.terms}]]. Le droit espagnol s'applique et les litiges entre CONVRT et un utilisateur professionnel sont soumis aux juridictions espagnoles compétentes.`],
      },
    ],
  }

  return { privacy, terms, legalNotice }
}
