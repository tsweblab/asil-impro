import { config, fields, collection, singleton } from '@keystatic/core';

const moisOptions = [
  ['1', 'Janvier'], ['2', 'Février'], ['3', 'Mars'], ['4', 'Avril'],
  ['5', 'Mai'], ['6', 'Juin'], ['7', 'Juillet'], ['8', 'Août'],
  ['9', 'Septembre'], ['10', 'Octobre'], ['11', 'Novembre'], ['12', 'Décembre'],
].map(([value, label]) => ({ value, label }));

const blocsLibres = (directory: string, publicPath: string) =>
  fields.array(
    fields.object({
      actif: fields.checkbox({ label: 'Afficher ce bloc', defaultValue: true }),
      surtitre: fields.text({ label: 'Petit titre (optionnel)' }),
      titre: fields.text({ label: 'Titre', validation: { isRequired: true } }),
      texte: fields.text({ label: 'Texte', multiline: true }),
      image: fields.image({
        label: 'Photo (optionnelle)',
        directory,
        publicPath,
      }),
      imageAlt: fields.text({ label: "Description de la photo (accessibilité)" }),
      imagePosition: fields.select({
        label: 'Position de la photo',
        options: [
          { label: 'À droite', value: 'droite' },
          { label: 'À gauche', value: 'gauche' },
        ],
        defaultValue: 'droite',
      }),
      boutonTexte: fields.text({ label: 'Texte du bouton (optionnel)' }),
      boutonLien: fields.text({ label: 'Lien du bouton (optionnel)' }),
    }),
    {
      label: 'Blocs libres photo + texte',
      description: 'Ajoutez, retirez et réorganisez librement des sections composées de texte et, si souhaité, d’une photo.',
      itemLabel: (props) => props.fields.titre.value || 'Nouveau bloc',
    },
  );

const galeriePhotos = (directory: string, publicPath: string, label = 'Galerie photos') =>
  fields.array(
    fields.object({
      actif: fields.checkbox({ label: 'Afficher cette photo', defaultValue: true }),
      image: fields.image({
        label: 'Photo',
        directory,
        publicPath,
      }),
      alt: fields.text({
        label: 'Description de la photo (accessibilité)',
        validation: { isRequired: true },
      }),
      legende: fields.text({ label: 'Légende (optionnelle)' }),
    }),
    {
      label,
      description: 'Ajoutez, supprimez et réorganisez librement les photos.',
      itemLabel: (props) => props.fields.legende.value || props.fields.alt.value || 'Nouvelle photo',
    },
  );

const blocsTexte = (label = 'Blocs de texte supplémentaires') =>
  fields.array(
    fields.object({
      actif: fields.checkbox({ label: 'Afficher ce bloc', defaultValue: true }),
      titre: fields.text({ label: 'Titre (optionnel)' }),
      texte: fields.text({ label: 'Texte', multiline: true, validation: { isRequired: true } }),
    }),
    {
      label,
      description: 'Ajoutez, supprimez et réorganisez des informations complémentaires.',
      itemLabel: (props) => props.fields.titre.value || 'Nouveau texte',
    },
  );

const isLocalDevelopment = process.env.NODE_ENV === 'development';

export default config({
  // En développement, Keystatic lit et écrit directement les fichiers locaux :
  // les contenus peuvent ainsi être testés sans créer de commit ni déployer.
  // Sur Vercel, Keystatic Cloud reste utilisé pour les éditeurs du site.
  storage: isLocalDevelopment
    ? { kind: 'local' }
    : { kind: 'cloud' },
  cloud: {
    project: 'tsweb/asil-impro',
  },
  ui: {
    brand: { name: 'ASIL Impro' },
    navigation: {
      'PAGE D’ACCUEIL': ['homePage'],
      'PAGE PROGRAMME': ['programmePage', 'evenements'],
      'PAGE STAGES': ['stagesPage', 'stages'],
      'PAGE ATELIERS': ['ateliersPage', 'ateliers', 'intervenants'],
      'PAGE CONTACT': ['contactPage'],
      'RÉGLAGES GÉNÉRAUX': ['siteSettings', 'mentionsPage'],
    },
  },
  collections: {
    evenements: collection({
      label: 'Spectacles du programme',
      slugField: 'titre',
      path: 'src/content/evenements/*',
      columns: ['date', 'lieu'],
      schema: {
        titre: fields.slug({
          name: {
            label: 'Titre du spectacle',
            description: "Tel qu'affiché sur le site, ex : Catch d'impro — Finale",
            validation: { isRequired: true },
          },
          slug: {
            label: 'Identifiant technique',
            description: 'Généré automatiquement à partir du titre — inutile d\'y toucher.',
          },
        }),
        date: fields.datetime({
          label: 'Date et heure',
          description: 'Le programme est trié et regroupé par mois grâce à cette date.',
          validation: { isRequired: true },
        }),
        lieu: fields.text({
          label: 'Lieu',
          description: 'Nom de la salle ou du bar, ex : La Bodega',
        }),
        adresse: fields.text({
          label: 'Adresse complète',
          description: 'Ex : 27 rue du Onze Novembre, 42100 Saint-Étienne',
        }),
        lienReservation: fields.url({
          label: 'Lien de réservation (optionnel)',
          description: 'Si renseigné, un bouton « Réserver » apparaît sur la carte de l\'événement. Ex : lien HelloAsso.',
        }),
        description: fields.text({
          label: 'Description courte',
          description: 'Une ou deux phrases affichées sur la page Programme.',
          multiline: true,
        }),
        image: fields.image({
          label: 'Affiche ou photo principale (optionnelle)',
          description: "Affichée sur la carte du spectacle, y compris sur la page d'accueil lorsqu'il est mis en avant.",
          directory: 'public/images/evenements',
          publicPath: '/images/evenements/',
        }),
        imageAlt: fields.text({ label: 'Description de la photo principale (accessibilité)' }),
        galeriePhotos: galeriePhotos('public/images/evenements', '/images/evenements/', 'Photos supplémentaires'),
        blocsTexte: blocsTexte(),
        actif: fields.checkbox({
          label: 'Afficher cet événement',
          description: 'Décochez pour masquer cet événement sans le supprimer.',
          defaultValue: true,
        }),
        misEnAvant: fields.checkbox({
          label: "Mettre en avant sur la page d'accueil",
          description: 'Cochez pour afficher ce spectacle dans le carrousel « Prochainement » de l\'accueil (les dates passées sont masquées automatiquement).',
          defaultValue: false,
        }),
      },
    }),
    stages: collection({
      label: 'Liste des stages',
      slugField: 'titre',
      path: 'src/content/stages/*',
      columns: ['dateDebut', 'intervenant'],
      schema: {
        titre: fields.slug({
          name: {
            label: 'Titre du stage',
            description: 'Ex : Stage Drame, Stage de janvier…',
            validation: { isRequired: true },
          },
          slug: {
            label: 'Identifiant technique',
            description: 'Généré automatiquement à partir du titre — inutile d\'y toucher.',
          },
        }),
        image: fields.image({
          label: 'Photo principale du stage (optionnelle)',
          description: 'Cliquez ici pour ajouter ou remplacer la grande photo de ce stage. Sans photo, le visuel rouge ASIL est utilisé.',
          directory: 'public/images/stages',
          publicPath: '/images/stages/',
        }),
        imageAlt: fields.text({ label: 'Description de la photo principale (accessibilité)' }),
        dateDebut: fields.date({
          label: 'Date',
          description: 'Les stages dont la date est passée disparaissent automatiquement du site.',
          validation: { isRequired: true },
        }),
        dateFin: fields.date({
          label: 'Date de fin (optionnel)',
          description: 'À remplir uniquement si le stage dure plusieurs jours.',
        }),
        horaires: fields.text({
          label: 'Horaires',
          description: 'Ex : 10h – 17h (pause repas d\'une heure)',
        }),
        lieu: fields.text({
          label: 'Lieu',
          description: 'Ex : 70 rue Bergson, 42000 Saint-Étienne',
        }),
        tarif: fields.text({
          label: 'Tarif',
          description: 'Ex : 45 € la journée — ou « Voir le lien d\'inscription »',
        }),
        intervenant: fields.text({
          label: 'Intervenant·e',
          description: 'Ex : Katarzyna Perdek',
        }),
        description: fields.text({
          label: 'Description',
          description: 'Thème du stage, à qui il s\'adresse, quoi prévoir…',
          multiline: true,
        }),
        lienInscription: fields.url({
          label: "Lien d'inscription",
          description: 'Si renseigné, un bouton « S\'inscrire » apparaît. Ex : lien HelloAsso.',
        }),
        galeriePhotos: galeriePhotos('public/images/stages', '/images/stages/', 'Galerie du stage'),
        blocsTexte: blocsTexte('Informations supplémentaires du stage'),
        actif: fields.checkbox({
          label: 'Afficher ce stage',
          description: 'Décochez pour masquer ce stage sans le supprimer.',
          defaultValue: true,
        }),
      },
    }),
    ateliers: collection({
      label: 'Ateliers hebdomadaires',
      slugField: 'titre',
      path: 'src/content/ateliers/*',
      columns: ['categorie', 'ordre'],
      schema: {
        titre: fields.slug({
          name: {
            label: "Nom de l'atelier",
            description: 'Ex : Adultes Débutants, Adultes Perfectionnement…',
            validation: { isRequired: true },
          },
          slug: {
            label: 'Identifiant technique',
            description: 'Généré automatiquement à partir du nom — inutile d\'y toucher.',
          },
        }),
        categorie: fields.select({
          label: "Catégorie d'âge",
          description: "Les ateliers affichés sur le site sont destinés aux adultes.",
          options: [
            { label: 'Adultes', value: 'adultes' },
          ],
          defaultValue: 'adultes',
        }),
        creneaux: fields.text({
          label: 'Créneaux (jours et heures)',
          description: 'Un créneau par ligne. Ex :\nMardi : 18h30 – 20h30\nou Mardi : 20h30 – 22h30',
          multiline: true,
        }),
        lieu: fields.text({
          label: 'Lieu',
          description: 'Ex : Amicale Laïque Michelet, 26 rue Coraly-Royet, 42100 Saint-Étienne',
        }),
        tarif: fields.text({
          label: 'Tarif annuel',
          description: 'Ex : 265 € / an',
        }),
        description: fields.text({
          label: 'Infos pratiques',
          description: 'Une ou deux phrases : à qui s\'adresse l\'atelier, ce qu\'on y fait…',
          multiline: true,
        }),
        image: fields.image({
          label: "Photo principale de l'atelier (optionnelle)",
          directory: 'public/images/ateliers',
          publicPath: '/images/ateliers/',
        }),
        imageAlt: fields.text({ label: 'Description de la photo principale (accessibilité)' }),
        galeriePhotos: galeriePhotos('public/images/ateliers', '/images/ateliers/', "Galerie de l'atelier"),
        blocsTexte: blocsTexte("Informations supplémentaires de l'atelier"),
        ordre: fields.integer({
          label: "Ordre d'affichage",
          description: 'Les ateliers sont affichés du plus petit numéro au plus grand.',
          defaultValue: 0,
        }),
        actif: fields.checkbox({
          label: 'Afficher cet atelier',
          description: 'Décochez pour masquer cet atelier sans le supprimer.',
          defaultValue: true,
        }),
      },
    }),
    intervenants: collection({
      label: 'Intervenant·es',
      slugField: 'nom',
      path: 'src/content/intervenants/*',
      columns: ['role', 'ordre'],
      schema: {
        nom: fields.slug({
          name: {
            label: 'Nom affiché',
            validation: { isRequired: true },
          },
          slug: {
            label: 'Identifiant technique',
            description: 'Généré automatiquement à partir du nom.',
          },
        }),
        role: fields.text({ label: 'Rôle ou spécialité (optionnel)' }),
        biographie: fields.text({
          label: 'Présentation',
          multiline: true,
          validation: { isRequired: true },
        }),
        image: fields.image({
          label: 'Portrait',
          directory: 'public/images/intervenants',
          publicPath: '/images/intervenants/',
        }),
        imageAlt: fields.text({ label: "Description de l’image (accessibilité)" }),
        ordre: fields.integer({ label: "Ordre d’affichage", defaultValue: 0 }),
        actif: fields.checkbox({ label: 'Afficher cette personne', defaultValue: true }),
      },
    }),
  },
  singletons: {
    siteSettings: singleton({
      label: 'Identité, navigation, pied de page et réseaux',
      path: 'src/content/settings/site',
      schema: {
        siteNom: fields.text({ label: 'Nom du site', defaultValue: 'ASIL Impro' }),
        logo: fields.image({
          label: 'Logo du site',
          description: 'Utilisé dans le menu et le pied de page.',
          directory: 'public/images/branding',
          publicPath: '/images/branding/',
        }),
        logoAlt: fields.text({ label: 'Description du logo', defaultValue: 'ASIL Impro' }),
        imagePartage: fields.image({
          label: 'Image de partage du site',
          description: 'Image affichée lors du partage du site sur les réseaux sociaux.',
          directory: 'public/images/branding',
          publicPath: '/images/branding/',
        }),
        favicon: fields.image({
          label: 'Icône du site',
          description: "Petite image affichée dans l'onglet du navigateur.",
          directory: 'public/images/branding',
          publicPath: '/images/branding/',
        }),
        telephones: fields.array(
          fields.object({
            libelle: fields.text({
              label: 'Libellé',
              description: 'Ex : Présidente, Inscriptions, Bureau…',
            }),
            numero: fields.text({
              label: 'Numéro',
              description: 'Ex : 06 12 34 56 78',
            }),
          }),
          {
            label: 'Numéros de téléphone',
            description: 'Affichés sur la page Contact et dans le pied de page (cliquables sur mobile). Ajoutez-en autant que nécessaire.',
            itemLabel: (props) =>
              [props.fields.libelle.value, props.fields.numero.value].filter(Boolean).join(' — ') ||
              'Nouveau numéro',
          },
        ),
        email: fields.text({
          label: 'Email de contact',
          description: 'Affiché sur le site (lien cliquable) — page Contact et pied de page.',
          defaultValue: 'admin@asil-impro.fr',
        }),
        facebook: fields.url({
          label: 'Page Facebook',
          description: 'Adresse complète, ex : https://www.facebook.com/…',
        }),
        instagram: fields.url({
          label: 'Compte Instagram',
          description: 'Adresse complète, ex : https://www.instagram.com/asil_impro/',
        }),
        navAccueil: fields.text({ label: 'Menu — Accueil', defaultValue: 'Accueil' }),
        navProgramme: fields.text({ label: 'Menu — Programme', defaultValue: 'Programme' }),
        navStages: fields.text({ label: 'Menu — Stages', defaultValue: 'Stages' }),
        navAteliers: fields.text({ label: 'Menu — Ateliers', defaultValue: 'Ateliers' }),
        navContact: fields.text({ label: 'Menu — Contact', defaultValue: 'Contact' }),
        navMentions: fields.text({ label: 'Pied de page — Mentions légales', defaultValue: 'Mentions légales' }),
        footerDescription: fields.text({
          label: 'Pied de page — Présentation',
          multiline: true,
          defaultValue: "Ateliers stéphanois d'improvisation loufoque — l'asso qui improvise à Saint-Étienne depuis 2002.",
        }),
        footerLiensTitre: fields.text({ label: 'Pied de page — Titre des liens', defaultValue: 'Liens rapides' }),
        footerContactTitre: fields.text({ label: 'Pied de page — Titre du contact', defaultValue: 'Gardons le contact !' }),
        footerCopyright: fields.text({ label: 'Pied de page — Copyright', defaultValue: 'ASIL Impro — Tous droits réservés.' }),
        footerCredit: fields.text({ label: 'Pied de page — Crédit', defaultValue: 'Site réalisé par' }),
        footerCreditNom: fields.text({ label: 'Pied de page — Nom du créateur', defaultValue: 'TS WEB Lab' }),
        footerCreditLien: fields.url({ label: 'Pied de page — Lien du créateur' }),
      },
    }),
    homePage: singleton({
      label: "Modifier la page d’accueil",
      path: 'src/content/pages/accueil',
      schema: {
        seoTitre: fields.text({ label: 'Titre affiché dans Google' }),
        seoDescription: fields.text({ label: 'Description affichée dans Google', multiline: true }),
        heroSousTitre: fields.text({ label: 'Bandeau principal — Petit titre' }),
        heroTitre: fields.text({ label: 'Bandeau principal — Grand titre' }),
        heroDescription: fields.text({ label: 'Accueil — Texte sous le grand titre', multiline: true }),
        heroImage: fields.image({
          label: "Bandeau principal — Photo de fond",
          description: 'Grande photo de spectacle, format paysage conseillé.',
          directory: 'public/images/site',
          publicPath: '/images/site/',
        }),
        heroImageAlt: fields.text({ label: 'Bandeau principal — Description de la photo (laisser vide si décorative)' }),
        heroBoutonPrincipal: fields.text({ label: 'Accueil — Bouton principal' }),
        heroBoutonPrincipalLien: fields.text({ label: 'Accueil — Lien du bouton principal' }),
        heroBoutonSecondaire: fields.text({ label: 'Accueil — Bouton secondaire' }),
        heroBoutonSecondaireLien: fields.text({ label: 'Accueil — Lien du bouton secondaire' }),
        marqueeMots: fields.array(fields.text({ label: 'Texte' }), {
          label: 'Bandeau de mots défilants',
          itemLabel: (props) => props.value || 'Nouveau texte',
        }),
        agendaSurtitre: fields.text({ label: 'Agenda — Petit titre' }),
        agendaTitre: fields.text({ label: 'Agenda — Titre' }),
        agendaLienTexte: fields.text({ label: 'Agenda — Texte du lien vers le programme' }),
        galerieSurtitre: fields.text({ label: 'Galerie — Petit titre' }),
        galerieTitre: fields.text({ label: 'Galerie — Titre' }),
        galerieDescription: fields.text({ label: 'Galerie — Présentation', multiline: true }),
        galeriePlaceholderTexte: fields.text({ label: 'Galerie — Texte lorsqu’une photo est vide' }),
        galerieLienTitre: fields.text({
          label: 'Galerie — Titre si un aperçu social est indisponible',
          description: 'Utilisez {reseau} pour insérer le nom du réseau social.',
        }),
        galerieLienTexte: fields.text({ label: 'Galerie — Explication si un aperçu social est indisponible', multiline: true }),
        galeriePhotos: fields.array(
          fields.object({
            actif: fields.checkbox({ label: 'Afficher cet élément', defaultValue: true }),
            typeContenu: fields.select({
              label: 'Type de contenu',
              description: 'Choisissez une photo importée ou l’aperçu d’une publication publique.',
              options: [
                { label: 'Photo importée', value: 'photo' },
                { label: 'Publication d’un réseau social', value: 'publication' },
              ],
              defaultValue: 'photo',
            }),
            image: fields.image({
              label: 'Photo à importer (mode Photo)',
              description: 'Utilisée lorsque le type « Photo importée » est choisi.',
              directory: 'public/images/galerie-accueil',
              publicPath: '/images/galerie-accueil/',
            }),
            alt: fields.text({ label: "Description de l’image ou de la publication", validation: { isRequired: true } }),
            legende: fields.text({ label: 'Légende (optionnelle)' }),
            lien: fields.url({
              label: 'Lien public de la publication (mode Réseau social)',
              description: 'Collez l’adresse complète d’une publication Instagram, Facebook, TikTok ou YouTube. Pour une photo, ce lien reste facultatif.',
            }),
          }),
          {
            label: 'Photos et publications récentes',
            description: 'Ajoutez, supprimez et réorganisez les éléments du carrousel. Chaque élément peut être une image ou l’aperçu d’une publication publique.',
            itemLabel: (props) => props.fields.legende.value || props.fields.alt.value || 'Nouvel élément',
          },
        ),
        pourquoiSurtitre: fields.text({ label: 'Pourquoi nous rejoindre — Petit titre' }),
        pourquoiTitre: fields.text({ label: 'Pourquoi nous rejoindre — Titre' }),
        raisons: fields.array(
          fields.object({
            titre: fields.text({ label: 'Titre', validation: { isRequired: true } }),
            texte: fields.text({ label: 'Texte', multiline: true }),
          }),
          { label: 'Arguments', itemLabel: (props) => props.fields.titre.value || 'Nouvel argument' },
        ),
        rejoindreSurtitre: fields.text({ label: 'Rejoindre — Petit titre' }),
        rejoindreTitre: fields.text({ label: 'Rejoindre — Titre' }),
        rejoindreTexte: fields.text({ label: 'Rejoindre — Texte', multiline: true }),
        rejoindreBouton: fields.text({ label: 'Rejoindre — Bouton' }),
        rejoindreBoutonLien: fields.text({ label: 'Rejoindre — Lien du bouton' }),
        photoRejoindre: fields.image({
          label: 'Rejoindre — Photo',
          directory: 'public/images/site',
          publicPath: '/images/site/',
        }),
        photoRejoindreAlt: fields.text({ label: 'Rejoindre — Description de la photo' }),
        chiffres: fields.array(
          fields.object({
            valeur: fields.text({ label: 'Valeur', validation: { isRequired: true } }),
            libelle: fields.text({ label: 'Libellé', validation: { isRequired: true } }),
          }),
          { label: 'Chiffres clés', itemLabel: (props) => `${props.fields.valeur.value || '—'} ${props.fields.libelle.value || ''}` },
        ),
        presentationSurtitre: fields.text({ label: "Présentation de l’ASIL — Petit titre" }),
        presentationTitre: fields.text({ label: "Présentation de l’ASIL — Titre" }),
        presentationTexte: fields.text({ label: "Présentation de l’ASIL — Texte", multiline: true }),
        presentationCitation: fields.text({ label: "Présentation de l’ASIL — Citation" }),
        photoAsil: fields.image({
          label: "Présentation de l’ASIL — Photo",
          directory: 'public/images/site',
          publicPath: '/images/site/',
        }),
        photoAsilAlt: fields.text({ label: "Présentation de l’ASIL — Description de la photo" }),
        ctaTitre: fields.text({ label: 'Bandeau final — Titre' }),
        ctaTexte: fields.text({ label: 'Bandeau final — Texte', multiline: true }),
        ctaBouton: fields.text({ label: 'Bandeau final — Bouton' }),
        ctaBoutonLien: fields.text({ label: 'Bandeau final — Lien du bouton' }),
        blocsLibres: blocsLibres('public/images/blocs/accueil', '/images/blocs/accueil/'),
      },
    }),
    programmePage: singleton({
      label: 'Présentation et mois affichés',
      path: 'src/content/pages/programme',
      schema: {
        seoTitre: fields.text({ label: 'Titre affiché dans Google' }),
        seoDescription: fields.text({ label: 'Description affichée dans Google', multiline: true }),
        surtitre: fields.text({ label: 'Petit titre' }),
        titre: fields.text({ label: 'Grand titre' }),
        introduction: fields.text({ label: 'Texte de présentation', multiline: true }),
        evenementBouton: fields.text({ label: 'Spectacles — Texte du bouton de réservation', defaultValue: 'Réserver' }),
        mois: fields.array(
          fields.object({
            annee: fields.integer({ label: 'Année', validation: { isRequired: true } }),
            mois: fields.select({ label: 'Mois', options: moisOptions, defaultValue: '1' }),
            actif: fields.checkbox({ label: 'Afficher ce mois', defaultValue: true }),
          }),
          {
            label: 'Mois affichés',
            description: 'Ajoutez les mois souhaités. Le site les remet automatiquement dans l’ordre chronologique.',
            itemLabel: (props) => `${moisOptions.find((m) => m.value === props.fields.mois.value)?.label || 'Mois'} ${props.fields.annee.value || ''}`,
          },
        ),
        moisVideTitre: fields.text({ label: 'Mois sans événement — Titre' }),
        moisVideTexte: fields.text({ label: 'Mois sans événement — Texte', multiline: true }),
        aucunEvenementTitre: fields.text({ label: 'Aucun événement — Titre' }),
        aucunEvenementTexte: fields.text({ label: 'Aucun événement — Texte', multiline: true }),
        blocsLibres: blocsLibres('public/images/blocs/programme', '/images/blocs/programme/'),
      },
    }),
    ateliersPage: singleton({
      label: 'Présentation de la page',
      path: 'src/content/pages/ateliers',
      schema: {
        seoTitre: fields.text({ label: 'Titre affiché dans Google' }),
        seoDescription: fields.text({ label: 'Description affichée dans Google', multiline: true }),
        surtitre: fields.text({ label: 'Petit titre' }),
        titre: fields.text({ label: 'Grand titre' }),
        citation: fields.text({ label: 'Citation' }),
        introduction: fields.text({ label: 'Présentation', multiline: true }),
        photoAteliers: fields.image({
          label: "En-tête — Photo de la page",
          directory: 'public/images/site',
          publicPath: '/images/site/',
        }),
        photoAteliersAlt: fields.text({ label: "En-tête — Description de la photo" }),
        lieuTexte: fields.text({ label: 'Informations sur le lieu', multiline: true }),
        boutonTexte: fields.text({ label: 'Bouton de contact' }),
        boutonLien: fields.text({ label: 'Lien du bouton' }),
        adultesTitre: fields.text({ label: 'Section adultes — Titre' }),
        adultesIntroduction: fields.text({ label: 'Section adultes — Présentation', multiline: true }),
        atelierLieuLabel: fields.text({ label: 'Fiches ateliers — Libellé du lieu', defaultValue: 'Lieu :' }),
        atelierTarifLabel: fields.text({ label: 'Fiches ateliers — Libellé du tarif', defaultValue: 'Tarif annuel :' }),
        aucunAtelierTexte: fields.text({ label: 'Message si aucun atelier', multiline: true }),
        intervenantsSurtitre: fields.text({ label: 'Intervenant·es — Petit titre' }),
        intervenantsTitre: fields.text({ label: 'Intervenant·es — Titre' }),
        blocsLibres: blocsLibres('public/images/blocs/ateliers', '/images/blocs/ateliers/'),
      },
    }),
    stagesPage: singleton({
      label: 'Présentation de la page',
      path: 'src/content/pages/stages',
      schema: {
        seoTitre: fields.text({ label: 'Titre affiché dans Google' }),
        seoDescription: fields.text({ label: 'Description affichée dans Google', multiline: true }),
        surtitre: fields.text({ label: 'Petit titre' }),
        titre: fields.text({ label: 'Grand titre' }),
        citation: fields.text({ label: 'Citation' }),
        introduction: fields.text({ label: 'Présentation', multiline: true }),
        photoStages: fields.image({
          label: "En-tête — Photo de la page",
          directory: 'public/images/site',
          publicPath: '/images/site/',
        }),
        photoStagesAlt: fields.text({ label: "En-tête — Description de la photo" }),
        conseil: fields.text({ label: 'Conseil pratique', multiline: true }),
        listeTitre: fields.text({ label: 'Titre de la liste des stages' }),
        stageHorairesLabel: fields.text({ label: 'Fiches stages — Libellé des horaires', defaultValue: 'Horaires :' }),
        stageLieuLabel: fields.text({ label: 'Fiches stages — Libellé du lieu', defaultValue: 'Lieu :' }),
        stageIntervenantLabel: fields.text({ label: 'Fiches stages — Libellé de l’intervenant·e', defaultValue: 'Intervenant·e :' }),
        stageTarifLabel: fields.text({ label: 'Fiches stages — Libellé du tarif', defaultValue: 'Tarif :' }),
        stageBouton: fields.text({ label: "Fiches stages — Bouton d'inscription", defaultValue: "S'inscrire" }),
        stageDuLabel: fields.text({ label: 'Fiches stages — Début de période', defaultValue: 'Du' }),
        stageAuLabel: fields.text({ label: 'Fiches stages — Liaison de période', defaultValue: 'au' }),
        stageImageFallback: fields.text({ label: 'Fiches stages — Texte du visuel sans photo', defaultValue: 'ASIL' }),
        videTitre: fields.text({ label: 'Aucun stage — Titre' }),
        videTexte: fields.text({ label: 'Aucun stage — Texte', multiline: true }),
        blocsLibres: blocsLibres('public/images/blocs/stages', '/images/blocs/stages/'),
      },
    }),
    contactPage: singleton({
      label: 'Modifier la page Contact',
      path: 'src/content/pages/contact',
      schema: {
        seoTitre: fields.text({ label: 'Titre affiché dans Google' }),
        seoDescription: fields.text({ label: 'Description affichée dans Google', multiline: true }),
        surtitre: fields.text({ label: 'Petit titre' }),
        titre: fields.text({ label: 'Grand titre' }),
        introduction: fields.text({ label: 'Présentation', multiline: true }),
        photoContact: fields.image({
          label: "En-tête — Photo de la page",
          directory: 'public/images/site',
          publicPath: '/images/site/',
        }),
        photoContactAlt: fields.text({ label: "En-tête — Description de la photo" }),
        formulaireTitre: fields.text({ label: 'Titre du formulaire' }),
        nomLabel: fields.text({ label: 'Champ nom — Libellé' }),
        nomPlaceholder: fields.text({ label: 'Champ nom — Exemple' }),
        emailLabel: fields.text({ label: 'Champ email — Libellé' }),
        emailPlaceholder: fields.text({ label: 'Champ email — Exemple' }),
        sujetLabel: fields.text({ label: 'Champ sujet — Libellé' }),
        sujetPlaceholder: fields.text({ label: 'Champ sujet — Exemple' }),
        messageLabel: fields.text({ label: 'Champ message — Libellé' }),
        messagePlaceholder: fields.text({ label: 'Champ message — Exemple' }),
        boutonEnvoyer: fields.text({ label: 'Bouton Envoyer' }),
        boutonEnvoi: fields.text({ label: 'Bouton pendant l’envoi' }),
        succesMessage: fields.text({ label: 'Message de réussite', multiline: true }),
        erreurMessage: fields.text({ label: 'Message d’erreur', multiline: true }),
        coordonneesTitre: fields.text({ label: 'Coordonnées — Titre' }),
        emailTitre: fields.text({ label: 'Coordonnées — Libellé email' }),
        telephoneTitre: fields.text({ label: 'Coordonnées — Libellé téléphone' }),
        ateliersTitre: fields.text({ label: 'Coordonnées — Libellé adresse' }),
        ateliersAdresse: fields.text({ label: 'Coordonnées — Adresse', multiline: true }),
        reseauxTitre: fields.text({ label: 'Coordonnées — Libellé réseaux sociaux' }),
        blocsLibres: blocsLibres('public/images/blocs/contact', '/images/blocs/contact/'),
      },
    }),
    mentionsPage: singleton({
      label: 'Mentions légales',
      path: 'src/content/pages/mentions-legales',
      schema: {
        seoTitre: fields.text({ label: 'Titre affiché dans Google' }),
        seoDescription: fields.text({ label: 'Description affichée dans Google', multiline: true }),
        titre: fields.text({ label: 'Grand titre' }),
        sections: fields.array(
          fields.object({
            titre: fields.text({ label: 'Titre', validation: { isRequired: true } }),
            texte: fields.text({ label: 'Texte', multiline: true, validation: { isRequired: true } }),
            lienTexte: fields.text({ label: 'Texte du lien (optionnel)' }),
            lienUrl: fields.text({ label: 'Adresse du lien (optionnelle)' }),
          }),
          { label: 'Sections', itemLabel: (props) => props.fields.titre.value || 'Nouvelle section' },
        ),
      },
    }),
  },
});
