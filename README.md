# Podcast Studio

Monorepo npm workspaces : **Next.js** (front) + **Sanity Studio** (back).

## Structure

```
podcast-studio/
├── front/          # Site Next.js (vitrine, podcasts, blog)
├── back/           # Sanity Studio (CMS)
└── package.json    # Workspaces npm
```

## Prérequis

- Node.js 20+
- Un projet Sanity ([sanity.io/manage](https://www.sanity.io/manage))

## Installation

```bash
npm install
```

Copiez les fichiers d'environnement :

```bash
cp back/.env.example back/.env
cp front/.env.example front/.env.local
```

Renseignez le même `projectId` Sanity dans les deux fichiers.

## Développement

```bash
# Front uniquement (port 3000)
npm run dev:front

# Studio Sanity (port 3333)
npm run dev:back
```

Lancez les deux dans des terminaux séparés pendant le développement.

## Contenu

Le studio Sanity expose deux types de documents :

- **Podcast** — épisodes avec slug, description, image, audio, notes
- **Article** — billets de blog avec extrait, auteur, contenu riche

## Routes front

| Route | Description |
|-------|-------------|
| `/` | Page vitrine |
| `/podcasts` | Listing des épisodes |
| `/podcasts/[slug]` | Détail d'un épisode |
| `/blog` | Listing des articles |
| `/blog/[slug]` | Détail d'un article |

## Déploiement Vercel

### Front (site public)

1. Créez un projet Vercel lié au repo
2. **Root Directory** : `front`
3. Variables d'environnement :
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `NEXT_PUBLIC_SANITY_API_VERSION`
   - `NEXT_PUBLIC_SITE_URL` (URL canonique du site)
   - `SANITY_REVALIDATE_SECRET` (secret du webhook Sanity, ex. `openssl rand -hex 32`)

### Revalidation Sanity → Next.js

Les pages sont mises en cache (ISR). Pour que les publications Sanity apparaissent tout de suite en prod, utilise un **webhook signé** (HMAC) :

1. Génère un secret : `openssl rand -hex 32`
2. Ajoute-le sur **Vercel** comme `SANITY_REVALIDATE_SECRET`
3. Dans [sanity.io/manage](https://www.sanity.io/manage) → projet → **API** → **Webhooks** → Create webhook :
   - **URL** : `https://VOTRE-DOMAINE/api/revalidate` *(sans secret dans l’URL)*
   - **Secret** : le **même** secret que sur Vercel (Sanity signe chaque requête)
   - **Dataset** : `production` (ou celui utilisé)
   - **Trigger on** : Create, Update, Delete
   - **Filter** (optionnel) : `_type in ["podcast", "post", "page", "guestAppearance", "podcastCategory", "postCategory", "siteSettings"]`
   - **Projection** (recommandé) :
     ```
     {_type, "slug": slug.current}
     ```
4. Publie un document de test : la réponse doit être `{"revalidated":true,...}`  
   Une signature invalide renvoie `401`.

L’endpoint vérifie l’en-tête `sanity-webhook-signature` via `@sanity/webhook` — seuls les appels réellement émis par Sanity (avec le bon secret) sont acceptés.

Sans webhook, le contenu se rafraîchit quand même au plus tard toutes les **1 h** (filet ISR).

### Back (Sanity Studio)

Option A — hébergement Sanity (recommandé) :

```bash
cd back
npm run deploy
```

Option B — second projet Vercel avec **Root Directory** : `back`, build `npm run build`, output `dist`.

## Scripts

| Commande | Action |
|----------|--------|
| `npm run dev:front` | Dev Next.js |
| `npm run dev:back` | Dev Sanity Studio |
| `npm run build:front` | Build production Next.js |
| `npm run build:back` | Build Sanity Studio |
