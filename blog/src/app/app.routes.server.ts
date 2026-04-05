import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * FolioKit reads posts via the browser Firestore SDK. On the server, FIRESTORE is null,
 * so SSR for `/posts` can throw when resolvers run. CSR keeps reloads stable; SEO for
 * post HTML can be added later with Admin SDK + TransferState if needed.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'posts', renderMode: RenderMode.Client },
  { path: 'posts/**', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
