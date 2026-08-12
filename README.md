# ASIL Impro — Site web

Refonte du site [asil-impro.fr](https://asil-impro.fr) pour l'ASIL (Ateliers stéphanois d'improvisation loufoque). Projet réalisé par [TS WEB Lab](https://tsweb.fr).

## Stack

- **[Astro 7](https://astro.build)** — pages statiques pré-rendues + SSR ciblé (adapter Vercel)
- **[Keystatic](https://keystatic.com)** — CMS Git-based, admin sur `/keystatic`
- **[Tailwind CSS 4](https://tailwindcss.com)** — via le plugin Vite `@tailwindcss/vite`
- **Animations CSS natives** — apparitions, compteurs et bandeaux sans dépendance d’animation externe
- **Polices locales** — Inter et Playfair Display sont intégrées au projet, sans appel à Google Fonts
- **View Transitions** — `<ClientRouter />` natif d'Astro, navbar persistante

## Démarrer

```bash
npm install
npm run dev        # http://localhost:4321 — admin : http://localhost:4321/keystatic
npm run build      # build de production (sortie .vercel/output)
npm run check      # vérification complète Astro et TypeScript
npm run preview    # prévisualiser le build
```

## Gestion du contenu (Keystatic)

Tout le contenu éditable vit dans `src/content/` (fichiers YAML versionnés) :

| Collection | Fichiers | Utilisé par |
|---|---|---|
| Événements | `src/content/evenements/` | Accueil (carrousel) + Programme |
| Stages | `src/content/stages/` | Page Stages |
| Ateliers | `src/content/ateliers/` | Page Ateliers |
| Intervenant·es | `src/content/intervenants/` | Page Ateliers |
| Textes des pages | `src/content/pages/` | Toutes les pages publiques |
| Paramètres | `src/content/settings/site.yaml` | Navigation, pied de page, coordonnées, réseaux et photos principales |

- Un événement coché **« Mettre en avant »** apparaît dans le carrousel de l'accueil.
- La galerie de l'accueil accepte des photos ajoutables, supprimables et réorganisables depuis Keystatic.
- Chaque photo de contenu propose un choix de cadrage : remplir le cadre ou afficher l’image entière.
- Les mois du Programme peuvent être ajoutés, masqués et réorganisés ; le site les trie automatiquement.
- Chaque page dispose de blocs libres permettant d'ajouter des sections texte + photo.
- Seuls les événements/stages **à venir** sont affichés (filtrage par date au build).
- ⚠️ Le contenu étant lu **au build**, un changement de contenu nécessite un re-déploiement (automatique en mode GitHub : chaque commit Keystatic redéclenche un build Vercel).

En développement (`npm run dev`), Keystatic utilise directement les fichiers locaux :
les essais restent sur la machine et ne déclenchent aucun déploiement. En production,
le projet utilise Keystatic Cloud (`tsweb/asil-impro`). Les éditeurs se connectent
avec leur compte Keystatic Cloud ; chaque publication crée un commit puis déclenche
automatiquement un nouveau déploiement Vercel.

## Formulaire de contact

`src/pages/api/contact.ts` (SSR) : validation serveur + honeypot anti-spam, envoi via l'API [Resend](https://resend.com).

Variables d'environnement (voir `.env.example`) :

- `RESEND_API_KEY` — sans elle, le message est seulement loggé (mode dev)
- `CONTACT_TO_EMAIL` — destinataire (défaut : `admin@asil-impro.fr`)
- `CONTACT_FROM_EMAIL` — expéditeur (domaine à vérifier dans Resend)

## Déploiement Vercel

1. Pousser le repo sur GitHub et l'importer dans Vercel (framework auto-détecté : Astro).
2. Renseigner les variables d'environnement ci-dessus.
3. Raccorder le futur domaine dans Vercel → Settings → Domains, puis remplacer l’URL provisoire dans `astro.config.mjs`.

Tant que le domaine définitif n’est pas raccordé, le site demande aux moteurs de recherche de ne pas l’indexer (`robots.txt`, balises robots et en-tête Vercel).

## Notes techniques

- `output: 'static'` remplace l'ancien mode `hybrid` (fusionné dans `static` depuis Astro 5) : les routes Keystatic et `/api/contact` sont en SSR via `prerender = false`, tout le reste est pré-rendu.
- Le projet demande Node.js 22.12 ou plus récent et utilise Vite 8 avec Astro 7.
- Les images éditoriales sont dans `src/assets/` (optimisées par `<Image />` d'Astro : WebP + srcset). Les images uploadées via Keystatic vont dans `public/images/`.
