import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { IBlogSeoService, buildPageTitle } from '@foliokit/cms-core';
import type { BlogPost, SiteConfig, AboutPageConfig } from '@foliokit/cms-core';

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
