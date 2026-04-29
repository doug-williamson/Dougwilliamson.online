import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { IBlogSeoService, buildPageTitle } from '@foliokit/cms-core';
import type { BlogPost, SiteConfig, AboutPageConfig, LinksPageConfig } from '@foliokit/cms-core';

@Injectable({ providedIn: 'root' })
export class SeoService implements IBlogSeoService {
  constructor(
    private meta: Meta,
    private title: Title,
  ) {}

  setDefaultMeta(config: SiteConfig, canonicalUrl?: string): void {
    this.title.setTitle(buildPageTitle(config.siteName ?? 'Doug Williamson'));
    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
    }
    if (canonicalUrl) {
      this.meta.updateTag({ rel: 'canonical', href: canonicalUrl });
    }
  }

  setHomeMeta(config: SiteConfig, baseUrl: string): void {
    const title = config.pages?.home?.seo?.title ?? config.siteName ?? 'Doug Williamson';
    this.title.setTitle(buildPageTitle(title));
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:url', content: baseUrl });
    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
    }
  }

  setBlogMeta(config: SiteConfig, baseUrl: string, tag?: string | null): void {
    const baseTitle = config.pages?.blog?.seo?.title ?? 'Blog';
    const title = tag ? `${baseTitle} #${tag}` : baseTitle;
    this.title.setTitle(buildPageTitle(title));
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:url', content: `${baseUrl}/posts${tag ? `?tag=${tag}` : ''}` });
    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
    }
  }

  setLinksMeta(config: LinksPageConfig, baseUrl: string): void {
    const title = config.title ?? 'Links';
    this.title.setTitle(buildPageTitle(title));
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:url', content: `${baseUrl}/links` });
  }

  setPostMeta(post: BlogPost, baseUrl: string, authorDisplayName?: string): void {
    this.title.setTitle(buildPageTitle(post.title));
    this.meta.updateTag({ property: 'og:title', content: post.title });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:url', content: `${baseUrl}/blog/${post.slug}` });
    if (post.excerpt) {
      this.meta.updateTag({ name: 'description', content: post.excerpt });
      this.meta.updateTag({ property: 'og:description', content: post.excerpt });
    }
    if (post.thumbnailUrl) {
      this.meta.updateTag({ property: 'og:image', content: post.thumbnailUrl });
    }
    if (authorDisplayName) {
      this.meta.updateTag({ name: 'author', content: authorDisplayName });
    }
  }

  setAboutMeta(config: AboutPageConfig, baseUrl: string): void {
    this.title.setTitle(buildPageTitle('About'));
    this.meta.updateTag({ property: 'og:title', content: 'About' });
    this.meta.updateTag({ property: 'og:url', content: `${baseUrl}/about` });
    if (config.bio) {
      this.meta.updateTag({ name: 'description', content: config.bio });
      this.meta.updateTag({ property: 'og:description', content: config.bio });
    }
  }
}
