import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '@foliokit/cms-core';

@Component({
  selector: 'app-blog-list',
  imports: [AsyncPipe, DatePipe, RouterLink],
  template: `
    <div class="blog-list">
      <h1>Blog</h1>
      @if (posts$ | async; as posts) {
        @if (posts.length === 0) {
          <p class="empty">No posts yet. Check back soon!</p>
        }
        @for (post of posts; track post.id) {
          <article class="post-card">
            <a [routerLink]="['/blog', post.slug]">
              <h2>{{ post.title }}</h2>
              @if (post.subtitle) {
                <p class="subtitle">{{ post.subtitle }}</p>
              }
              <div class="meta">
                <time>{{ post.publishedAt | date:'mediumDate' }}</time>
                @if (post.readingTimeMinutes) {
                  <span>&middot; {{ post.readingTimeMinutes }} min read</span>
                }
              </div>
              @if (post.excerpt) {
                <p class="excerpt">{{ post.excerpt }}</p>
              }
            </a>
          </article>
        }
      } @else {
        <p>Loading...</p>
      }
    </div>
  `,
  styles: `
    .blog-list {
      max-width: 720px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 2rem;
      color: var(--btn-primary-bg, #0C2340);
    }

    .post-card {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .post-card a {
      text-decoration: none;
      color: inherit;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.25rem;
    }

    .subtitle {
      color: #666;
      margin: 0 0 0.5rem;
    }

    .meta {
      font-size: 0.875rem;
      color: #888;
      margin-bottom: 0.75rem;
    }

    .excerpt {
      color: #555;
      line-height: 1.6;
    }

    .empty {
      color: #888;
    }
  `,
})
export class BlogListComponent {
  private readonly postService = inject(PostService);
  readonly posts$ = this.postService.getPublishedPosts();
}
