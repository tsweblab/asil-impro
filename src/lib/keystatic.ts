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

export async function getSettings() {
  const settings = await reader.singletons.siteSettings.read();
  return {
    telephone: settings?.telephone ?? '',
    email: settings?.email ?? 'admin@asil-impro.fr',
    facebook: settings?.facebook ?? 'https://www.facebook.com/profile.php?id=100063601480001',
    instagram: settings?.instagram ?? 'https://www.instagram.com/asil_impro/',
    heroTitre: settings?.heroTitre ?? "L'asso stéphanoise qui improvise depuis 22 ans !",
    heroSousTitre: settings?.heroSousTitre ?? "Ateliers stéphanois d'improvisation loufoque",
    heroImage: settings?.heroImage ?? null,
  };
}

export async function getEvenements(): Promise<Evenement[]> {
  const all = await reader.collections.evenements.all();
  return all
    .map(({ slug, entry }) => ({ ...entry, slug }))
    .filter((e) => e.date)
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
    .sort((a, b) => ((a.dateDebut ?? '') < (b.dateDebut ?? '') ? -1 : 1));
}

export async function getAteliers(): Promise<Atelier[]> {
  const all = await reader.collections.ateliers.all();
  return all
    .map(({ slug, entry }) => ({ ...entry, slug }))
    .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
}

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
