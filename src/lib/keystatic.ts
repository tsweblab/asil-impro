import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

// Reader API Keystatic : lit le contenu (fichiers YAML) au build.
// Toutes les pages publiques étant pré-rendues, aucune lecture disque en prod.
export const reader = createReader(process.cwd(), keystaticConfig);

export type Evenement = NonNullable<
  Awaited<ReturnType<typeof reader.collections.evenements.read>>
> & { slug: string };

export type Stage = NonNullable<
  Awaited<ReturnType<typeof reader.collections.stages.read>>
> & { slug: string };

export type Atelier = NonNullable<
  Awaited<ReturnType<typeof reader.collections.ateliers.read>>
> & { slug: string };

export type Intervenant = NonNullable<
  Awaited<ReturnType<typeof reader.collections.intervenants.read>>
> & { slug: string };

export type BlocLibre = {
  actif?: boolean;
  surtitre?: string;
  titre: string;
  texte?: string;
  image?: string | null;
  imageAlt?: string;
  imagePosition?: 'gauche' | 'droite';
  boutonTexte?: string;
  boutonLien?: string;
};

export async function getSettings() {
  const settings = await reader.singletons.siteSettings.read();
  return {
    siteNom: settings?.siteNom ?? 'ASIL Impro',
    logo: settings?.logo ?? '/images/logo-asil-blanc.png',
    logoAlt: settings?.logoAlt ?? 'ASIL Impro',
    imagePartage: settings?.imagePartage ?? '/images/og-asil.jpg',
    favicon: settings?.favicon ?? '/images/logo-asil_small.png',
    telephones: (settings?.telephones ?? []).filter((t) => t.numero),
    email: settings?.email ?? 'admin@asil-impro.fr',
    facebook: settings?.facebook ?? 'https://www.facebook.com/profile.php?id=100063601480001',
    instagram: settings?.instagram ?? 'https://www.instagram.com/asil_impro/',
    navAccueil: settings?.navAccueil ?? 'Accueil',
    navProgramme: settings?.navProgramme ?? 'Programme',
    navStages: settings?.navStages ?? 'Stages',
    navAteliers: settings?.navAteliers ?? 'Ateliers',
    navContact: settings?.navContact ?? 'Contact',
    navMentions: settings?.navMentions ?? 'Mentions légales',
    footerDescription: settings?.footerDescription ?? "Ateliers stéphanois d'improvisation loufoque — l'asso qui improvise à Saint-Étienne depuis 2002.",
    footerLiensTitre: settings?.footerLiensTitre ?? 'Liens rapides',
    footerContactTitre: settings?.footerContactTitre ?? 'Gardons le contact !',
    footerCopyright: settings?.footerCopyright ?? 'ASIL Impro — Tous droits réservés.',
    footerCredit: settings?.footerCredit ?? 'Site réalisé par',
    footerCreditNom: settings?.footerCreditNom ?? 'TS WEB Lab',
    footerCreditLien: settings?.footerCreditLien ?? 'https://tsweb.fr',
  };
}

export type Telephone = Awaited<ReturnType<typeof getSettings>>['telephones'][number];

export async function getEvenements(): Promise<Evenement[]> {
  const all = await reader.collections.evenements.all();
  return all
    .map(({ slug, entry }) => ({ ...entry, slug }))
    .filter((e) => e.date && e.actif !== false)
    .sort((a, b) => (a.date! < b.date! ? -1 : 1));
}

/** Événements à venir (date >= aujourd'hui), triés chronologiquement. */
export async function getEvenementsAVenir(): Promise<Evenement[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (await getEvenements()).filter((e) => new Date(e.date!) >= today);
}

export async function getStages(): Promise<Stage[]> {
  const all = await reader.collections.stages.all();
  return all
    .map(({ slug, entry }) => ({ ...entry, slug }))
    .filter((s) => s.actif !== false)
    .sort((a, b) => ((a.dateDebut ?? '') < (b.dateDebut ?? '') ? -1 : 1));
}

export async function getAteliers(): Promise<Atelier[]> {
  const all = await reader.collections.ateliers.all();
  return all
    .map(({ slug, entry }) => ({ ...entry, slug }))
    .filter((a) => a.actif !== false)
    .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
}

export async function getIntervenants(): Promise<Intervenant[]> {
  const all = await reader.collections.intervenants.all();
  return all
    .map(({ slug, entry }) => ({ ...entry, slug }))
    .filter((personne) => personne.actif !== false)
    .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
}

export async function getHomePage() {
  const page = await reader.singletons.homePage.read();
  return {
    seoTitre: page?.seoTitre ?? "ASIL Impro — L'asso stéphanoise d'improvisation théâtrale",
    seoDescription: page?.seoDescription ?? "Ateliers stéphanois d'improvisation loufoque : cours d'impro, spectacles et stages à Saint-Étienne.",
    heroTitre: page?.heroTitre ?? "L'asso stéphanoise qui improvise depuis 22 ans !",
    heroSousTitre: page?.heroSousTitre ?? "Ateliers stéphanois d'improvisation loufoque",
    heroDescription: page?.heroDescription ?? "Théâtre d'improvisation à Saint-Étienne — sans texte, sans décor, sans filet.",
    heroImage: page?.heroImage ?? null,
    heroImageAlt: page?.heroImageAlt ?? '',
    heroBoutonPrincipal: page?.heroBoutonPrincipal ?? 'Découvrir nos ateliers',
    heroBoutonPrincipalLien: page?.heroBoutonPrincipalLien ?? '/ateliers',
    heroBoutonSecondaire: page?.heroBoutonSecondaire ?? 'Voir le programme',
    heroBoutonSecondaireLien: page?.heroBoutonSecondaireLien ?? '/programme',
    marqueeMots: page?.marqueeMots ?? [],
    agendaSurtitre: page?.agendaSurtitre ?? "L'agenda",
    agendaTitre: page?.agendaTitre ?? 'Prochainement',
    agendaLienTexte: page?.agendaLienTexte ?? 'Tout le programme',
    galerieSurtitre: page?.galerieSurtitre ?? 'En images',
    galerieTitre: page?.galerieTitre ?? 'Nos derniers événements',
    galerieDescription: page?.galerieDescription ?? '',
    galeriePlaceholderTexte: page?.galeriePlaceholderTexte ?? 'Photo à ajouter depuis Keystatic',
    galerieLienTitre: page?.galerieLienTitre ?? 'Voir sur {reseau}',
    galerieLienTexte: page?.galerieLienTexte ?? "L’aperçu n’est pas disponible, mais la publication reste accessible.",
    galeriePhotos: (page?.galeriePhotos ?? []).filter((photo) => photo.actif !== false),
    pourquoiSurtitre: page?.pourquoiSurtitre ?? 'La troupe',
    pourquoiTitre: page?.pourquoiTitre ?? "Pourquoi rejoindre l'ASIL ?",
    raisons: page?.raisons ?? [],
    rejoindreSurtitre: page?.rejoindreSurtitre ?? 'Les ateliers',
    rejoindreTitre: page?.rejoindreTitre ?? 'Devenez improvisateur·rice',
    rejoindreTexte: page?.rejoindreTexte ?? '',
    rejoindreBouton: page?.rejoindreBouton ?? 'Inscrivez-vous',
    rejoindreBoutonLien: page?.rejoindreBoutonLien ?? '/ateliers',
    photoRejoindre: page?.photoRejoindre ?? null,
    photoRejoindreAlt: page?.photoRejoindreAlt ?? "Improvisatrice de l'ASIL sur scène",
    chiffres: page?.chiffres ?? [],
    presentationSurtitre: page?.presentationSurtitre ?? 'Depuis 2002',
    presentationTitre: page?.presentationTitre ?? "L'ASIL, c'est quoi ?",
    presentationTexte: page?.presentationTexte ?? '',
    presentationCitation: page?.presentationCitation ?? '',
    photoAsil: page?.photoAsil ?? null,
    photoAsilAlt: page?.photoAsilAlt ?? "Comédiens de l'ASIL en spectacle d'improvisation",
    ctaTitre: page?.ctaTitre ?? "Rejoignez l'aventure",
    ctaTexte: page?.ctaTexte ?? '',
    ctaBouton: page?.ctaBouton ?? 'Contactez-nous',
    ctaBoutonLien: page?.ctaBoutonLien ?? '/contact',
    blocsLibres: (page?.blocsLibres ?? []).filter((bloc) => bloc.actif !== false) as BlocLibre[],
  };
}

export async function getProgrammePage() {
  const page = await reader.singletons.programmePage.read();
  return {
    seoTitre: page?.seoTitre ?? 'Programme des spectacles — ASIL Impro',
    seoDescription: page?.seoDescription ?? "L'agenda des spectacles d'improvisation de l'ASIL à Saint-Étienne.",
    surtitre: page?.surtitre ?? 'Saison en cours',
    titre: page?.titre ?? 'Le programme',
    introduction: page?.introduction ?? '',
    evenementBouton: page?.evenementBouton ?? 'Réserver',
    mois: (page?.mois ?? []).filter((m) => m.actif !== false).sort((a, b) => (a.annee ?? 0) - (b.annee ?? 0) || Number(a.mois) - Number(b.mois)),
    moisVideTitre: page?.moisVideTitre ?? 'Aucun spectacle prévu pour le moment',
    moisVideTexte: page?.moisVideTexte ?? 'De nouvelles dates pourront être ajoutées prochainement.',
    aucunEvenementTitre: page?.aucunEvenementTitre ?? 'La prochaine saison se prépare…',
    aucunEvenementTexte: page?.aucunEvenementTexte ?? 'Les dates arrivent bientôt. Suivez-nous sur les réseaux pour ne rien manquer !',
    blocsLibres: (page?.blocsLibres ?? []).filter((bloc) => bloc.actif !== false) as BlocLibre[],
  };
}

async function readSimplePage<K extends 'ateliersPage' | 'stagesPage' | 'contactPage' | 'mentionsPage'>(key: K) {
  return reader.singletons[key].read();
}

export const getAteliersPage = () => readSimplePage('ateliersPage');
export const getStagesPage = () => readSimplePage('stagesPage');
export const getContactPage = () => readSimplePage('contactPage');
export const getMentionsPage = () => readSimplePage('mentionsPage');

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export function formatDateLongue(iso: string): string {
  const d = new Date(iso);
  return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
}

export function formatHeure(iso: string): string {
  const d = new Date(iso);
  if (d.getHours() === 0 && d.getMinutes() === 0) return '';
  return `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`;
}

export function moisAnnee(iso: string): string {
  const d = new Date(iso);
  return `${MOIS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Groupe les événements par mois (clé "Mois Année"), dans l'ordre chronologique. */
export function grouperParMois(evenements: Evenement[]): Map<string, Evenement[]> {
  const groupes = new Map<string, Evenement[]>();
  for (const e of evenements) {
    const cle = moisAnnee(e.date!);
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle)!.push(e);
  }
  return groupes;
}
