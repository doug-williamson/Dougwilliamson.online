import { inject } from '@angular/core';
import { type ResolveFn } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { PageService, type AboutPage, type LinksPage } from '@foliokit/cms-core';

export const aboutPageResolver: ResolveFn<AboutPage | null> = () => {
  const pageService = inject(PageService);
  return pageService.getPageBySlug('about').pipe(
    map((page) => (page?.type === 'about' ? page : null)),
    catchError(() =>
      of<AboutPage>({
        id: 'about',
        type: 'about',
        slug: 'about',
        title: 'About',
        status: 'published',
        body: 'Welcome! This page is coming soon.',
        contentVersion: 1,
        embeddedMedia: {},
        seo: {},
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }),
    ),
  );
};

export const linksPageResolver: ResolveFn<LinksPage | null> = () => {
  const pageService = inject(PageService);
  return pageService.getPageBySlug('links').pipe(
    map((page) => (page?.type === 'links' ? page : null)),
    catchError(() =>
      of<LinksPage>({
        id: 'links',
        type: 'links',
        slug: 'links',
        title: 'Links',
        status: 'published',
        links: [],
        seo: {},
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }),
    ),
  );
};
