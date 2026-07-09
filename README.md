# ASIL Impro — Site web

Refonte du site [asil-impro.fr](https://asil-impro.fr) pour l'ASIL (Ateliers stéphanois d'improvisation loufoque). Projet réalisé par [TS WEB Lab](https://tsweb.fr).

## Stack

- **[Astro 6](https://astro.build)** — pages statiques pré-rendues + SSR ciblé (adapter Vercel)
- **[Keystatic](https://keystatic.com)** — CMS Git-based, admin sur `/keystatic`
- **[Tailwind CSS 4](https://tailwindcss.com)** — via le plugin Vite `@tailwindcss/vite`
- **[AstroAnimate](https://www.npmjs.com/package/@astroanimate/core)** — animations CSS-first (FadeInText, ScaleIn, CountUp, AnimatedButton)
- **View Transitions** — `<ClientRouter />` natif d'Astro, navbar persistante

## Démarrer

```bash
npm install
npm run dev        # http://localhost:4321 — admin : http://localhost:4321/keystatic
npm run build      # build de production (sortie .vercel/output)
npm run preview    # prévisualiser le build
```

## Gestion du contenu (Keystatic)

Tout le contenu éditable vit dans `src/content/` (fichiers YAML versionnés) :

| Collection | Fichiers | Utilisé par |
|---|---|---|
| Événements | `src/content/evenements/` | Accueil (carrousel) + Programme |
| Stages | `src/content/stages/` | Page Stages |
| Ateliers | `src/content/ateliers/` | Page Ateliers |
| Paramètres | `src/content/settings/site.yaml` | Hero, email, téléphone, réseaux |

- Un événement coché **« Mettre en avant »** apparaît dans le carrousel de l'accueil.
- Seuls les événements/stages **à venir** sont affichés (filtrage par date au build).
- ⚠️ Le contenu étant lu **au build**, un changement de contenu nécessite un re-déploiement (automatique en mode GitHub : chaque commit Keystatic redéclenche un build Vercel).

### Passage en production (mode GitHub)

`keystatic.config.ts` est en `storage: { kind: 'local' }` pour le dev.
Pour la prod, passer en mode GitHub ([doc](https://keystatic.com/docs/github-mode)) :

```ts
storage: {
  kind: 'github',
  repo: 'ts-web-lab/asil-impro',
},
```

puis créer l'app GitHub associée (`npx keystatic github setup` ou via la doc) et renseigner les variables d'environnement Keystatic sur Vercel.

## Formulaire de contact

`src/pages/api/contact.ts` (SSR) : validation serveur + honeypot anti-spam, envoi via l'API [Resend](https://resend.com).

Variables d'environnement (voir `.env.example`) :

- `RESEND_API_KEY` — sans elle, le message est seulement loggé (mode dev)
- `CONTACT_TO_EMAIL` — destinataire (défaut : `admin@asil-impro.fr`)
- `CONTACT_FROM_EMAIL` — expéditeur (domaine à vérifier dans Resend)

## Déploiement Vercel

1. Pousser le repo sur GitHub et l'importer dans Vercel (framework auto-détecté : Astro).
2. Renseigner les variables d'environnement ci-dessus.
3. Le domaine `asil-impro.fr` se configure dans Vercel → Settings → Domains.

## Notes techniques

- `output: 'static'` remplace l'ancien mode `hybrid` (fusionné dans `static` depuis Astro 5) : les routes Keystatic et `/api/contact` sont en SSR via `prerender = false`, tout le reste est pré-rendu.
- **Vite est pinné en 7.x** dans `devDependencies` : Astro 6 utilise Vite 7, et sans ce pin npm résout Vite 8 (rolldown) pour `@tailwindcss/vite`, ce qui casse le build (`Missing field tsconfigPaths`). Ne pas retirer ce pin sans passer à Astro 7.
- Les images éditoriales sont dans `src/assets/` (optimisées par `<Image />` d'Astro : WebP + srcset). Les images uploadées via Keystatic vont dans `public/images/`.
- Le site actuel (clone statique de référence) est dans le dossier parent `../`.
