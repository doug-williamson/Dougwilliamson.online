import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="hero-content">
        <p class="pill"># Doug Williamson</p>
        <h1 class="hero-title">Angular development, shipped with confidence.</h1>
        <p class="lead">
          Real-world guides on Angular SSR, Firebase, and the FolioKit CMS toolkit.
        </p>
        <div class="cta">
          <a routerLink="/posts" class="btn-primary">Read Posts</a>
          <a routerLink="/about" class="btn-secondary">About</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: min(72vh, 640px);
      padding: 2.5rem 1.5rem 3rem;
      text-align: center;
    }

    .hero-content {
      max-width: 42rem;
      margin: 0 auto;
    }

    .pill {
      display: inline-block;
      margin: 0 0 1.25rem;
      padding: 0.35rem 0.9rem;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-radius: 9999px;
      background: var(--hero-pill-bg);
      color: var(--hero-pill-text);
    }

    .hero-title {
      margin: 0 0 1rem;
      font-family: var(--font-hero-serif, 'Fraunces', Georgia, 'Times New Roman', serif);
      font-size: clamp(2rem, 4.5vw, 3.15rem);
      font-weight: 700;
      font-variation-settings: 'SOFT' 50, 'WONK' 1;
      line-height: 1.12;
      color: var(--hero-title);
    }

    .lead {
      margin: 0 0 2rem;
      font-size: 1.0625rem;
      line-height: 1.65;
      color: var(--hero-lead);
    }

    .cta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
    }

    .btn-primary {
      display: inline-block;
      padding: 0.7rem 1.35rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.9375rem;
      text-decoration: none;
      color: #fff;
      background: var(--btn-primary-bg);
      transition: opacity 0.2s, transform 0.15s;
    }

    .btn-primary:hover {
      opacity: 0.92;
    }

    .btn-secondary {
      display: inline-block;
      padding: 0.7rem 1.35rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.9375rem;
      text-decoration: none;
      color: var(--hero-secondary-cta);
      background: var(--hero-secondary-bg);
      border: 1px solid var(--hero-secondary-border);
      transition:
        background 0.2s,
        color 0.2s,
        border-color 0.2s;
    }

    .btn-secondary:hover {
      background: var(--hero-secondary-hover-bg);
      color: var(--hero-secondary-hover-fg);
      border-color: var(--hero-secondary-hover-border);
    }
  `,
})
export class HomePageComponent {}
