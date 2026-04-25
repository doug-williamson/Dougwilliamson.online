/**
 * Server-side implementations of FolioKit's Firestore-reading services.
 * Mirrors the shape of the client services in @foliokit/cms-core against
 * firebase-admin so SSR resolvers work without the firebase-js-sdk.
 */
import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import type { IBlogPostService } from '@foliokit/cms-core';
import type { IAuthorService } from '@foliokit/cms-core';
import type { ISiteConfigService } from '@foliokit/cms-core';
import type {
  Author,
  BlogPost,
  SeriesNavItem,
  SeoMeta,
  Series,
  SiteConfig,
  AboutPageConfig,
  SocialLink,
  LinksLink,
} from '@foliokit/cms-core';
import { getAdminFirestore, collectionPath, siteConfigDocPath } from './server-firestore';

function normalizeTimestamp(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (typeof (v as { toMillis?: () => number }).toMillis === 'function') {
      return (v as { toMillis: () => number }).toMillis();
    }
    if (typeof (v as { toDate?: () => Date }).toDate === 'function') {
      return (v as { toDate: () => Date }).toDate().getTime();
    }
    if (typeof v['_seconds'] === 'number') {
      return (v['_seconds'] as number) * 1000 + Math.floor(((v['_nanoseconds'] as number) ?? 0) / 1e6);
    }
    if (typeof v['seconds'] === 'number') {
      return (v['seconds'] as number) * 1000 + Math.floor(((v['nanoseconds'] as number) ?? 0) / 1e6);
    }
  }
  return 0;
}

function normalizePost(raw: Record<string, unknown>): BlogPost {
  return {
    id: (raw['id'] as string) ?? '',
    slug: (raw['slug'] as string) ?? '',
    title: (raw['title'] as string) ?? '',
    subtitle: raw['subtitle'] as string | undefined,
    status: raw['status'] as BlogPost['status'],
    content: (raw['content'] as string) ?? '',
    excerpt: raw['excerpt'] as string | undefined,
    thumbnailUrl: raw['thumbnailUrl'] as string | undefined,
    thumbnailAlt: raw['thumbnailAlt'] as string | undefined,
    tags: (raw['tags'] as string[]) ?? [],
    authorId: raw['authorId'] as string | undefined,
    seriesId: raw['seriesId'] as string | undefined,
    seriesOrder: raw['seriesOrder'] as number | undefined,
    readingTimeMinutes: raw['readingTimeMinutes'] as number | undefined,
    embeddedMedia: (raw['embeddedMedia'] as BlogPost['embeddedMedia']) ?? {},
    seo: (raw['seo'] as SeoMeta) ?? {},
    publishedAt: normalizeTimestamp(raw['publishedAt']),
    scheduledPublishAt: raw['scheduledPublishAt'] != null ? normalizeTimestamp(raw['scheduledPublishAt']) : undefined,
    updatedAt: normalizeTimestamp(raw['updatedAt']),
    createdAt: normalizeTimestamp(raw['createdAt']),
  };
}

function normalizeSocialLinks(raw: unknown): SocialLink[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw.map((item: Record<string, unknown>) => ({
    platform: item['platform'] as SocialLink['platform'],
    url: (item['url'] as string) ?? '',
    label: item['label'] as string | undefined,
    icon: item['icon'] as string | undefined,
  }));
}

function normalizeAuthor(raw: Record<string, unknown>): Author {
  const displayName = ((raw['displayName'] as string) || (raw['name'] as string) || '').trim();
  return {
    id: (raw['id'] as string) ?? '',
    displayName,
    bio: raw['bio'] as string | undefined,
    photoUrl: (raw['photoUrl'] as string) || (raw['avatarUrl'] as string),
    photoUrlDark: raw['photoUrlDark'] as string | undefined,
    socialLinks: normalizeSocialLinks(raw['socialLinks']),
    email: raw['email'] as string | undefined,
    createdAt: normalizeTimestamp(raw['createdAt']),
    updatedAt: normalizeTimestamp(raw['updatedAt']),
  };
}

function normalizeSeries(raw: Record<string, unknown>): Series {
  return {
    id: (raw['id'] as string) ?? '',
    slug: (raw['slug'] as string) ?? '',
    name: (raw['name'] as string) ?? '',
    title: raw['title'] as string | undefined,
    description: raw['description'] as string | undefined,
    tenantId: raw['tenantId'] as string | undefined,
    postCount: typeof raw['postCount'] === 'number' ? (raw['postCount'] as number) : 0,
    isActive: raw['isActive'] === true,
    createdAt: normalizeTimestamp(raw['createdAt']),
    updatedAt: normalizeTimestamp(raw['updatedAt']),
  };
}

function normalizeSeoMeta(raw: unknown): SeoMeta | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  return {
    title: r['title'] as string | undefined,
    description: r['description'] as string | undefined,
    keywords: Array.isArray(r['keywords']) ? (r['keywords'] as string[]) : undefined,
    ogImage: r['ogImage'] as string | undefined,
    canonicalUrl: r['canonicalUrl'] as string | undefined,
    noIndex: r['noIndex'] as boolean | undefined,
  };
}

function normalizeLinksLinks(raw: unknown): LinksLink[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: Record<string, unknown>) => ({
    id: (item['id'] as string) ?? '',
    label: (item['label'] as string) ?? '',
    url: (item['url'] as string) ?? '',
    icon: item['icon'] as string | undefined,
    platform: item['platform'] as LinksLink['platform'],
    highlighted: item['highlighted'] as boolean | undefined,
    order: (item['order'] as number) ?? 0,
  }));
}

function normalizeSiteConfig(raw: Record<string, unknown>): SiteConfig {
  const pages = (raw['pages'] as Record<string, Record<string, unknown> | undefined>) ?? {};
  const home = pages['home'];
  const blog = pages['blog'];
  const about = pages['about'];
  const links = pages['links'];
  const normalizedPages = {
    home: home
      ? {
          enabled: (home['enabled'] as boolean) ?? false,
          heroHeadline: (home['heroHeadline'] as string) ?? '',
          heroSubheadline: home['heroSubheadline'] as string | undefined,
          ctaLabel: home['ctaLabel'] as string | undefined,
          ctaUrl: home['ctaUrl'] as string | undefined,
          showRecentPosts: home['showRecentPosts'] as boolean | undefined,
          seo: normalizeSeoMeta(home['seo']),
        }
      : undefined,
    blog: blog
      ? { enabled: (blog['enabled'] as boolean) ?? false, seo: normalizeSeoMeta(blog['seo']) }
      : undefined,
    about: {
      enabled: (about?.['enabled'] as boolean) ?? false,
      headline: (about?.['headline'] as string) ?? '',
      subheadline: about?.['subheadline'] as string | undefined,
      bio: (about?.['bio'] as string) ?? '',
      photoUrl: about?.['photoUrl'] as string | undefined,
      photoUrlDark: about?.['photoUrlDark'] as string | undefined,
      photoAlt: about?.['photoAlt'] as string | undefined,
      socialLinks: Array.isArray(about?.['socialLinks']) ? normalizeSocialLinks(about?.['socialLinks']) : undefined,
      seo: normalizeSeoMeta(about?.['seo']),
    } as AboutPageConfig,
    links: {
      enabled: (links?.['enabled'] as boolean) ?? false,
      links: normalizeLinksLinks(links?.['links']),
      title: links?.['title'] as string | undefined,
      avatarUrl: links?.['avatarUrl'] as string | undefined,
      avatarUrlDark: links?.['avatarUrlDark'] as string | undefined,
      avatarAlt: links?.['avatarAlt'] as string | undefined,
      headline: links?.['headline'] as string | undefined,
      bio: links?.['bio'] as string | undefined,
      seo: normalizeSeoMeta(links?.['seo']),
    },
  };
  const profile = raw['profile'] as Record<string, unknown> | undefined;
  const onboardingComplete =
    raw['onboardingComplete'] === true ||
    (normalizedPages.home?.enabled === true &&
      normalizedPages.blog?.enabled === true &&
      normalizedPages.about?.enabled === true &&
      normalizedPages.links?.enabled === true);
  return {
    id: (raw['id'] as string) ?? '',
    siteName: (raw['siteName'] as string) ?? '',
    siteUrl: (raw['siteUrl'] as string) ?? '',
    description: raw['description'] as string | undefined,
    logo: raw['logo'] as string | undefined,
    favicon: raw['favicon'] as string | undefined,
    defaultAuthorId: raw['defaultAuthorId'] as string | undefined,
    defaultSeo: normalizeSeoMeta(raw['defaultSeo']),
    profile: profile
      ? {
          displayName: (profile['displayName'] as string | null) ?? null,
          photoUrl: (profile['photoUrl'] as string | null) ?? null,
          photoUrlDark: (profile['photoUrlDark'] as string | null) ?? null,
          photoAlt: (profile['photoAlt'] as string | null) ?? null,
          socialLinks: Array.isArray(profile['socialLinks']) ? normalizeSocialLinks(profile['socialLinks']) : undefined,
        }
      : undefined,
    pages: normalizedPages,
    onboardingComplete,
    updatedAt: normalizeTimestamp(raw['updatedAt']),
  };
}

@Injectable()
export class ServerBlogPostService implements IBlogPostService {
  getPublishedPosts(): Observable<BlogPost[]> {
    const fs = getAdminFirestore();
    return from(
      fs
        .collection(collectionPath('posts'))
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .get()
    ).pipe(
      map((snap) => snap.docs.map((d) => normalizePost({ id: d.id, ...d.data() }))),
      catchError((err) => {
        console.error('[ServerBlogPostService.getPublishedPosts]', err);
        return of([] as BlogPost[]);
      })
    );
  }

  getPostBySlug(slug: string): Observable<BlogPost | null> {
    const fs = getAdminFirestore();
    return from(
      fs
        .collection(collectionPath('posts'))
        .where('status', '==', 'published')
        .where('slug', '==', slug)
        .limit(1)
        .get()
    ).pipe(
      map((snap) => {
        if (snap.empty) return null;
        const d = snap.docs[0];
        return normalizePost({ id: d.id, ...d.data() });
      }),
      catchError((err) => {
        console.error('[ServerBlogPostService.getPostBySlug]', err);
        return of(null);
      })
    );
  }

  getPublishedPostsBySeriesId(seriesId: string): Observable<SeriesNavItem[]> {
    const fs = getAdminFirestore();
    return from(
      fs
        .collection(collectionPath('posts'))
        .where('seriesId', '==', seriesId)
        .where('status', '==', 'published')
        .orderBy('seriesOrder', 'asc')
        .get()
    ).pipe(
      map((snap) =>
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            slug: data['slug'] as string,
            title: data['title'] as string,
            seriesOrder: (data['seriesOrder'] as number) ?? 0,
          };
        })
      ),
      catchError((err) => {
        console.error('[ServerBlogPostService.getPublishedPostsBySeriesId]', err);
        return of([] as SeriesNavItem[]);
      })
    );
  }
}

@Injectable()
export class ServerAuthorService implements IAuthorService {
  getById(id: string): Observable<Author | null> {
    const fs = getAdminFirestore();
    return from(fs.doc(`${collectionPath('authors')}/${id}`).get()).pipe(
      map((snap) => {
        if (!snap.exists) return null;
        return normalizeAuthor({ id: snap.id, ...snap.data() });
      }),
      catchError((err) => {
        console.error('[ServerAuthorService.getById]', err);
        return of(null);
      })
    );
  }
}

@Injectable()
export class ServerSiteConfigService implements ISiteConfigService {
  getDefaultSiteConfig(): Observable<SiteConfig | null> {
    const fs = getAdminFirestore();
    return from(fs.doc(siteConfigDocPath()).get()).pipe(
      map((snap) => {
        if (!snap.exists) return null;
        return normalizeSiteConfig({ id: snap.id, ...snap.data() });
      }),
      catchError((err) => {
        console.error('[ServerSiteConfigService.getDefaultSiteConfig]', err);
        return of(null);
      })
    );
  }

  getConfig(): Observable<SiteConfig> {
    return this.getDefaultSiteConfig().pipe(filter((c): c is SiteConfig => c !== null));
  }

  getAboutConfig(): Observable<AboutPageConfig | null> {
    return this.getConfig().pipe(map((c) => c.pages?.about ?? null));
  }
}

@Injectable()
export class ServerSeriesService {
  getAll(): Observable<Series[]> {
    const fs = getAdminFirestore();
    return from(fs.collection(collectionPath('series')).orderBy('name', 'asc').get()).pipe(
      map((snap) => snap.docs.map((d) => normalizeSeries({ id: d.id, ...d.data() }))),
      catchError((err) => {
        console.error('[ServerSeriesService.getAll]', err);
        return of([] as Series[]);
      })
    );
  }

  getById(id: string): Observable<Series | null> {
    const fs = getAdminFirestore();
    return from(fs.doc(`${collectionPath('series')}/${id}`).get()).pipe(
      map((snap) => {
        if (!snap.exists) return null;
        return normalizeSeries({ id: snap.id, ...snap.data() });
      }),
      catchError((err) => {
        console.error('[ServerSeriesService.getById]', err);
        return of(null);
      })
    );
  }
}
