import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  // Mode Keystatic Cloud : les éditeurs se connectent avec un compte
  // keystatic.cloud (pas besoin de compte GitHub). Chaque modification crée
  // un commit sur le repo → redéploiement Vercel automatique (~2 min).
  storage: {
    kind: 'cloud',
  },
  cloud: {
    project: 'tsweb/asil-impro',
  },
  ui: {
    brand: { name: 'ASIL Impro' },
    navigation: {
      'Spectacles & stages': ['evenements', 'stages'],
      'Cours': ['ateliers'],
      'Réglages du site': ['siteSettings'],
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
          description: "Détermine dans quelle section de la page Ateliers l'atelier apparaît.",
          options: [
            { label: 'Enfants (5-11 ans)', value: 'enfants' },
            { label: 'Ados (12-18 ans)', value: 'ados' },
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
      },
    }),
  },
  singletons: {
    siteSettings: singleton({
      label: 'Paramètres du site',
      path: 'src/content/settings/site',
      schema: {
        telephone: fields.text({
          label: 'Numéro de téléphone',
          description: 'Affiché sur la page Contact et dans le pied de page. Laissez vide pour ne rien afficher.',
        }),
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
      },
    }),
  },
});
