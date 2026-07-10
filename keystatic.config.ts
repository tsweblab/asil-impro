import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  // Mode Keystatic Cloud : les éditeurs se connectent avec un compte
  // keystatic.cloud (pas besoin de compte GitHub). Chaque modification crée
  // un commit sur le repo → redéploiement Vercel automatique.
  storage: {
    kind: 'cloud',
  },
  cloud: {
    project: 'tsweb/asil-impro',
  },
  ui: {
    brand: { name: 'ASIL Impro' },
  },
  collections: {
    evenements: collection({
      label: 'Événements / Programme',
      slugField: 'titre',
      path: 'src/content/evenements/*',
      schema: {
        titre: fields.slug({ name: { label: 'Titre' } }),
        date: fields.datetime({ label: 'Date et heure', validation: { isRequired: true } }),
        lieu: fields.text({ label: 'Lieu' }),
        adresse: fields.text({ label: 'Adresse complète' }),
        lienReservation: fields.url({ label: 'Lien de réservation (optionnel)' }),
        description: fields.text({ label: 'Description courte', multiline: true }),
        misEnAvant: fields.checkbox({
          label: "Mettre en avant sur l'accueil (carrousel)",
          defaultValue: false,
        }),
      },
    }),
    stages: collection({
      label: 'Stages',
      slugField: 'titre',
      path: 'src/content/stages/*',
      schema: {
        titre: fields.slug({ name: { label: 'Titre du stage' } }),
        dateDebut: fields.date({ label: 'Date de début', validation: { isRequired: true } }),
        dateFin: fields.date({ label: 'Date de fin (optionnel)' }),
        horaires: fields.text({ label: 'Horaires' }),
        lieu: fields.text({ label: 'Lieu' }),
        tarif: fields.text({ label: 'Tarif' }),
        intervenant: fields.text({ label: 'Intervenant·e' }),
        description: fields.text({ label: 'Description', multiline: true }),
        lienInscription: fields.url({ label: "Lien d'inscription" }),
        image: fields.image({
          label: 'Image du stage',
          directory: 'public/images/stages',
          publicPath: '/images/stages/',
        }),
      },
    }),
    ateliers: collection({
      label: 'Ateliers',
      slugField: 'titre',
      path: 'src/content/ateliers/*',
      schema: {
        titre: fields.slug({ name: { label: 'Titre (ex: Adultes Débutants)' } }),
        categorie: fields.select({
          label: 'Catégorie',
          options: [
            { label: 'Enfants (5-11 ans)', value: 'enfants' },
            { label: 'Ados (12-18 ans)', value: 'ados' },
            { label: 'Adultes', value: 'adultes' },
          ],
          defaultValue: 'adultes',
        }),
        creneaux: fields.text({ label: 'Créneaux (jours et heures)', multiline: true }),
        lieu: fields.text({ label: 'Lieu' }),
        tarif: fields.text({ label: 'Tarif annuel' }),
        description: fields.text({ label: 'Infos pratiques', multiline: true }),
        ordre: fields.integer({ label: "Ordre d'affichage", defaultValue: 0 }),
      },
    }),
  },
  singletons: {
    siteSettings: singleton({
      label: 'Paramètres du site',
      path: 'src/content/settings/site',
      schema: {
        telephone: fields.text({ label: 'Numéro de téléphone' }),
        email: fields.text({ label: 'Email de contact', defaultValue: 'admin@asil-impro.fr' }),
        facebook: fields.url({ label: 'Lien Facebook' }),
        instagram: fields.url({ label: 'Lien Instagram' }),
        heroTitre: fields.text({ label: 'Titre du Hero (accueil)' }),
        heroSousTitre: fields.text({ label: 'Sous-titre du Hero' }),
        heroImage: fields.image({
          label: 'Image de fond Hero',
          directory: 'public/images',
          publicPath: '/images/',
        }),
      },
    }),
  },
});
