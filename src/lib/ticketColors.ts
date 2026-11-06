// Couleurs proposées pour les tickets de spectacle (accueil + programme).
// Partagé entre la configuration Keystatic et le rendu du site.

export const TICKET_COULEURS = [
  { value: 'rouge', label: '🔴 Rouge ASIL', hex: '#bd1722' },
  { value: 'bordeaux', label: '🍷 Bordeaux', hex: '#7a1430' },
  { value: 'rose', label: '🌸 Fuchsia', hex: '#b0186b' },
  { value: 'orange', label: '🟠 Orange', hex: '#c2410c' },
  { value: 'or', label: '🟡 Or', hex: '#9a6a00' },
  { value: 'vert', label: '🟢 Vert', hex: '#1f7a3d' },
  { value: 'canard', label: '🦚 Bleu canard', hex: '#0f6e78' },
  { value: 'bleu', label: '🔵 Bleu', hex: '#1d4fa8' },
  { value: 'nuit', label: '🌙 Bleu nuit', hex: '#1b2a5c' },
  { value: 'violet', label: '🟣 Violet', hex: '#6a2c9e' },
  { value: 'noir', label: '⚫ Noir', hex: '#2b2727' },
] as const;

export type TicketCouleurPreset = (typeof TICKET_COULEURS)[number]['value'];

export const TICKET_COULEUR_DEFAUT: TicketCouleurPreset = 'rouge';
export const HEX_REGEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Choix stocké par Keystatic (champ conditionnel). */
export type ChoixCouleur = { discriminant: string; value?: unknown } | null | undefined;

function normaliserHex(hex: string): string | null {
  const m = hex.trim().match(HEX_REGEX);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return `#${h.toLowerCase()}`;
}

function luminance([r, g, b]: number[]): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Fonce la couleur jusqu'à obtenir un contraste suffisant (≥ 4,5:1) avec le
 * texte blanc du ticket : une couleur trop claire reste ainsi lisible.
 */
export function couleurLisible(hex: string): string {
  const n = normaliserHex(hex);
  if (!n) return TICKET_COULEURS[0].hex;
  let rgb = [1, 3, 5].map((i) => parseInt(n.slice(i, i + 2), 16));
  for (let i = 0; i < 40 && 1.05 / (luminance(rgb) + 0.05) < 4.5; i++) {
    rgb = rgb.map((c) => Math.round(c * 0.93));
  }
  return `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** Résout un choix Keystatic en code couleur ; `null` si « par défaut » ou invalide. */
export function resoudreChoix(choix: ChoixCouleur): string | null {
  if (!choix?.discriminant || choix.discriminant === 'defaut') return null;
  if (choix.discriminant === 'perso') {
    return typeof choix.value === 'string' && normaliserHex(choix.value) ? couleurLisible(choix.value) : null;
  }
  const preset = TICKET_COULEURS.find((c) => c.value === choix.discriminant);
  return preset ? preset.hex : null;
}

/** Couleur finale d'un ticket : celle du spectacle, sinon celle par défaut, sinon le rouge ASIL. */
export function couleurTicket(choixSpectacle: ChoixCouleur, choixDefaut: ChoixCouleur): string {
  return resoudreChoix(choixSpectacle) ?? resoudreChoix(choixDefaut) ?? TICKET_COULEURS[0].hex;
}
