# dougwilliamson.online

Personal website and blog built with [FolioKit](https://foliokitcms.com) — an Angular CMS framework powered by Firebase.

## Architecture

This monorepo contains two Angular 21 applications:

### `blog/` — Public Site (SSR)

The public-facing website at **dougwilliamson.online**, using Angular SSR. Most routes use `RenderMode.Server`; the `/posts` routes use client rendering so Firestore reads stay in the browser (see `blog/src/app/app.routes.server.ts`).

- **Home** — Professional hero landing page
- **Blog** — Post list and individual post pages
- **About** — Content managed via Firestore `/pages/about`
- **Links** — Content managed via Firestore `/pages/links`

### `admin/` — Admin Dashboard (CSR)

The admin panel at **admin.dougwilliamson.online**, a client-side rendered app behind Firebase Auth (email/password).

- Post editor with Content, Media, Metadata, and SEO tabs
- Site configuration editor
- Pages editor (About, Links)

> **Note:** `@foliokit/cms-admin-ui` is currently at **0.1.0** (pre-release). The API may change in future versions.

## FolioKit Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@foliokit/cms-core` | 1.0.0 | Firebase services, models, and tokens |
| `@foliokit/cms-ui` | 1.0.0 | App shell, theme service, page components |
| `@foliokit/cms-markdown` | 1.0.0 | Markdown rendering with embedded media |
| `@foliokit/cms-admin-ui` | 0.1.0 | Admin UI components (pre-release) |

## Firestore Schema

Standard FolioKit collections:

```
/authors/{authorId}
/posts/{postId}
/pages/{pageId}
/tags/{tagId}
/site-config/dougwilliamson
```

## Firebase Projects

| Alias | Project ID |
|-------|-----------|
| default | `dougwilliamson-online` |

Use `firebase use` to select the active project before deploy commands.

## Getting Started

### Prerequisites

- Node 22.x
- npm 10.x

### Development

```bash
# Blog app
cd blog
npm install
npm start

# Admin app
cd admin
npm install
npm start
```

### Production Build

```bash
cd blog && npm run build
cd admin && npm run build
```

### Deploy

The **blog** and **admin** apps use different Firebase products:

| App | Product | How it ships |
|-----|---------|----------------|
| `blog/` | [Firebase App Hosting](https://firebase.google.com/docs/app-hosting/get-started) | Git-connected rollouts (recommended) or manual rollout from the App Hosting dashboard |
| `admin/` | [Firebase Hosting](https://firebase.google.com/docs/hosting) | CLI after a production build |

#### Blog (App Hosting)

1. Ensure the [Blaze](https://firebase.google.com/pricing) plan is enabled for project `dougwilliamson-online`.
2. In the [Firebase console](https://console.firebase.google.com/) → **Hosting & Serverless** → **App Hosting** → **Create backend** (or **Get started** if this is the first backend).
3. Connect your GitHub repository, set the **app root directory** to `blog`, choose the **live branch** (for example `master`), and pick a region (for example `us-central1`).
4. After the first rollout completes, [connect a custom domain](https://firebase.google.com/docs/app-hosting/custom-domain) if the public site should use `dougwilliamson.online` / `www` instead of the default `*.hosted.app` URL.

Optional CLI (requires Owner/App Hosting Admin on the project and the App Hosting API enabled):

```bash
firebase apphosting:backends:create --project dougwilliamson-online \
  --backend blog \
  --primary-region us-central1 \
  --root-dir blog
```

Configuration for the blog runtime lives in [`blog/apphosting.yaml`](blog/apphosting.yaml).

#### Admin (Hosting)

Build the admin app, then deploy only the `admin` Hosting target (site `dougwilliamson-online-admin`):

```bash
cd admin && npm ci && npm run build
cd .. && firebase deploy --only hosting:admin --project dougwilliamson-online
```

#### Rules, indexes, functions

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
# If you use Cloud Functions:
# firebase deploy --only functions
```

## Local SSR credentials (optional)

For local `ng serve` or running the SSR server with tooling that expects Application Default Credentials, you can point at a service account JSON file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

On App Hosting, Firebase injects `FIREBASE_CONFIG` and related variables so client SDKs can initialize without extra files; see [Firebase on App Hosting](https://firebase.google.com/docs/app-hosting/firebase-sdks).
