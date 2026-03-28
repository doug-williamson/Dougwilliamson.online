import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { PostService } from '@foliokit/cms-core';
import { MarkdownComponent } from '@foliokit/cms-markdown';

@Component({
  selector: 'app-blog-post',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MarkdownComponent],
  template: `
    @if (post(); as post) {
      <article class="post-detail">
        <header>
          <h1>{{ post.title }}</h1>
          @if (post.subtitle) {
            <p class="subtitle">{{ post.subtitle }}</p>
          }
          <div class="meta">
            <time>{{ post.publishedAt | date:'mediumDate' }}</time>
            @if (post.readingTimeMinutes) {
              <span>&middot; {{ post.readingTimeMinutes }} min read</span>
            }
          </div>
        </header>
        <folio-markdown
          [content]="post.content"
          [embeddedMedia]="post.embeddedMedia"
        />
      </article>
    } @else {
      <div class="loading">
        <p>Loading...</p>
      </div>
    }
  `,
  styles: `
    .post-detail {
      max-width: 720px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
      color: var(--btn-primary-bg, #0C2340);
    }

    .subtitle {
      font-size: 1.1rem;
      color: #666;
      margin: 0 0 1rem;
    }

    .meta {
      font-size: 0.875rem;
      color: #888;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .loading {
      text-align: center;
      padding: 4rem 1rem;
      color: #888;
    }
  `,
})
export class BlogPostComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly postService = inject(PostService);

  readonly post = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => this.postService.getPostBySlug(params.get('slug')!)),
    ),
  );
}
