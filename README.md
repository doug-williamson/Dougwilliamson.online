# dougwilliamson.online

Personal website and blog built with [FolioKit](https://foliokitcms.com) — an Angular CMS framework powered by Firebase.

## Architecture

This monorepo contains two Angular 21 applications:

### `blog/` — Public Site (SSR)

The public-facing website at **dougwilliamson.online**, rendered server-side using Angular SSR with `RenderMode.Server` on all routes.

- **Home** — Professional hero landing page
- **Blog** — Post list and individual post pages
- **About** — Content managed via Firestore `/pages/about`
- **Links** — Content managed via Firestore `/pages/links`

Server-side rendering uses the Firebase Admin SDK via `GOOGLE_APPLICATION_CREDENTIALS` to fetch Firestore data on the server.

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
| default | dougwilliamson-dev |
| prod | dougwilliamson-prod |

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

```bash
# Deploy to dev
firebase deploy --only hosting

# Deploy to prod
firebase use prod
firebase deploy --only hosting
```

## SSR + Admin SDK Setup

The blog app uses Angular SSR with Firebase Admin SDK for server-side Firestore access. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to your service account key file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

This is required for the SSR server to authenticate with Firestore when rendering pages on the server.
