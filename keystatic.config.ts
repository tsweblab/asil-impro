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
      'Spectacles & stages': ['evenements', 'stages'],
      'Cours': ['ateliers', 'intervenants'],
      'Textes des pages': ['homePage', 'programmePage', 'ateliersPage', 'stagesPage', 'contactPage', 'mentionsPage'],
      'Réglages généraux': ['siteSettings'],
    },
  },
  collections: {
    evenements: collection({
      label: 'Programme (spectacles)',
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
      label: 'Stages',
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
        image: fields.image({
          label: 'Photo du stage (optionnel)',
          description: 'Format paysage conseillé. Sans photo, un visuel rouge ASIL est affiché à la place.',
          directory: 'public/images/stages',
          publicPath: '/images/stages/',
        }),
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
      label: 'Paramètres du site',
      path: 'src/content/settings/site',
      schema: {
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
        evenementBouton: fields.text({ label: 'Événements — Bouton de réservation', defaultValue: 'Réserver' }),
        atelierLieuLabel: fields.text({ label: 'Ateliers — Libellé lieu', defaultValue: 'Lieu :' }),
        atelierTarifLabel: fields.text({ label: 'Ateliers — Libellé tarif', defaultValue: 'Tarif annuel :' }),
        stageHorairesLabel: fields.text({ label: 'Stages — Libellé horaires', defaultValue: 'Horaires :' }),
        stageLieuLabel: fields.text({ label: 'Stages — Libellé lieu', defaultValue: 'Lieu :' }),
        stageIntervenantLabel: fields.text({ label: 'Stages — Libellé intervenant·e', defaultValue: 'Intervenant·e :' }),
        stageTarifLabel: fields.text({ label: 'Stages — Libellé tarif', defaultValue: 'Tarif :' }),
        stageBouton: fields.text({ label: "Stages — Bouton d'inscription", defaultValue: "S'inscrire" }),
        footerDescription: fields.text({
          label: 'Pied de page — Présentation',
          multiline: true,
          defaultValue: "Ateliers stéphanois d'improvisation loufoque — l'asso qui improvise à Saint-Étienne depuis 2002.",
        }),
        footerLiensTitre: fields.text({ label: 'Pied de page — Titre des liens', defaultValue: 'Liens rapides' }),
        footerContactTitre: fields.text({ label: 'Pied de page — Titre du contact', defaultValue: 'Gardons le contact !' }),
        footerCopyright: fields.text({ label: 'Pied de page — Copyright', defaultValue: 'ASIL Impro — Tous droits réservés.' }),
        footerCredit: fields.text({ label: 'Pied de page — Crédit', defaultValue: 'Site réalisé par' }),
        heroTitre: fields.text({
          label: "Grand titre de la page d'accueil",
          description: 'Ex : L\'asso stéphanoise qui improvise depuis 22 ans !',
        }),
        heroSousTitre: fields.text({
          label: 'Phrase au-dessus du grand titre',
          description: 'Ex : Ateliers stéphanois d\'improvisation loufoque',
        }),
        heroImage: fields.image({
          label: "Photo de fond de l'accueil (optionnel)",
          description: 'Grande photo de spectacle, format paysage (idéalement 1920px de large). Sans photo, l\'image par défaut est utilisée.',
          directory: 'public/images',
          publicPath: '/images/',
        }),
        photoRejoindre: fields.image({
          label: 'Photo — Accueil, section « Devenez improvisateur·rice »',
          description: 'Format portrait ou carré conseillé. Sans photo, l\'image par défaut est utilisée.',
          directory: 'public/images/site',
          publicPath: '/images/site/',
        }),
        photoAsil: fields.image({
          label: 'Photo — Accueil, section « L\'ASIL, c\'est quoi ? »',
          description: 'Format paysage conseillé. Sans photo, l\'image par défaut est utilisée.',
          directory: 'public/images/site',
          publicPath: '/images/site/',
        }),
        photoAteliers: fields.image({
          label: 'Photo — Page Ateliers',
          description: 'Format portrait conseillé. Sans photo, l\'image par défaut est utilisée.',
          directory: 'public/images/site',
          publicPath: '/images/site/',
        }),
        photoStages: fields.image({
          label: 'Photo — Page Stages',
          description: 'Format portrait conseillé. Sans photo, l\'image par défaut est utilisée.',
          directory: 'public/images/site',
          publicPath: '/images/site/',
        }),
        photoContact: fields.image({
          label: 'Photo — Page Contact',
          description: 'Format paysage conseillé. Sans photo, l\'image par défaut est utilisée.',
          directory: 'public/images/site',
          publicPath: '/images/site/',
        }),
      },
    }),
    homePage: singleton({
      label: "Page d’accueil",
      path: 'src/content/pages/accueil',
      schema: {
        seoTitre: fields.text({ label: 'Titre affiché dans Google' }),
        seoDescription: fields.text({ label: 'Description affichée dans Google', multiline: true }),
        heroDescription: fields.text({ label: 'Accueil — Texte sous le grand titre', multiline: true }),
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
        ctaTitre: fields.text({ label: 'Bandeau final — Titre' }),
        ctaTexte: fields.text({ label: 'Bandeau final — Texte', multiline: true }),
        ctaBouton: fields.text({ label: 'Bandeau final — Bouton' }),
        ctaBoutonLien: fields.text({ label: 'Bandeau final — Lien du bouton' }),
        blocsLibres: blocsLibres('public/images/blocs/accueil', '/images/blocs/accueil/'),
      },
    }),
    programmePage: singleton({
      label: 'Page Programme',
      path: 'src/content/pages/programme',
      schema: {
        seoTitre: fields.text({ label: 'Titre affiché dans Google' }),
        seoDescription: fields.text({ label: 'Description affichée dans Google', multiline: true }),
        surtitre: fields.text({ label: 'Petit titre' }),
        titre: fields.text({ label: 'Grand titre' }),
        introduction: fields.text({ label: 'Texte de présentation', multiline: true }),
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
      label: 'Page Ateliers',
      path: 'src/content/pages/ateliers',
      schema: {
        seoTitre: fields.text({ label: 'Titre affiché dans Google' }),
        seoDescription: fields.text({ label: 'Description affichée dans Google', multiline: true }),
        surtitre: fields.text({ label: 'Petit titre' }),
        titre: fields.text({ label: 'Grand titre' }),
        citation: fields.text({ label: 'Citation' }),
        introduction: fields.text({ label: 'Présentation', multiline: true }),
        lieuTexte: fields.text({ label: 'Informations sur le lieu', multiline: true }),
        boutonTexte: fields.text({ label: 'Bouton de contact' }),
        boutonLien: fields.text({ label: 'Lien du bouton' }),
        adultesTitre: fields.text({ label: 'Section adultes — Titre' }),
        adultesIntroduction: fields.text({ label: 'Section adultes — Présentation', multiline: true }),
        aucunAtelierTexte: fields.text({ label: 'Message si aucun atelier', multiline: true }),
        intervenantsSurtitre: fields.text({ label: 'Intervenant·es — Petit titre' }),
        intervenantsTitre: fields.text({ label: 'Intervenant·es — Titre' }),
        blocsLibres: blocsLibres('public/images/blocs/ateliers', '/images/blocs/ateliers/'),
      },
    }),
    stagesPage: singleton({
      label: 'Page Stages',
      path: 'src/content/pages/stages',
      schema: {
        seoTitre: fields.text({ label: 'Titre affiché dans Google' }),
        seoDescription: fields.text({ label: 'Description affichée dans Google', multiline: true }),
        surtitre: fields.text({ label: 'Petit titre' }),
        titre: fields.text({ label: 'Grand titre' }),
        citation: fields.text({ label: 'Citation' }),
        introduction: fields.text({ label: 'Présentation', multiline: true }),
        conseil: fields.text({ label: 'Conseil pratique', multiline: true }),
        listeTitre: fields.text({ label: 'Titre de la liste des stages' }),
        videTitre: fields.text({ label: 'Aucun stage — Titre' }),
        videTexte: fields.text({ label: 'Aucun stage — Texte', multiline: true }),
        blocsLibres: blocsLibres('public/images/blocs/stages', '/images/blocs/stages/'),
      },
    }),
    contactPage: singleton({
      label: 'Page Contact',
      path: 'src/content/pages/contact',
      schema: {
        seoTitre: fields.text({ label: 'Titre affiché dans Google' }),
        seoDescription: fields.text({ label: 'Description affichée dans Google', multiline: true }),
        surtitre: fields.text({ label: 'Petit titre' }),
        titre: fields.text({ label: 'Grand titre' }),
        introduction: fields.text({ label: 'Présentation', multiline: true }),
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
      label: 'Page Mentions légales',
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
