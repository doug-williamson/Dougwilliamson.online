import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  template: `
    <section class="hero">
      <div class="hero-content">
        <h1>Doug Williamson</h1>
        <p class="tagline">Software Engineer &amp; Builder</p>
        <p class="intro">
          Exploring ideas through code, writing, and open-source projects.
        </p>
        <div class="cta">
          <a href="/blog" class="btn-primary">Read the Blog</a>
          <a href="/about" class="btn-secondary">About Me</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 70vh;
      padding: 2rem;
      text-align: center;
    }

    .hero-content {
      max-width: 640px;
    }

    h1 {
      font-size: 3rem;
      font-weight: 700;
      color: var(--btn-primary-bg, #0C2340);
      margin: 0 0 0.5rem;
    }

    .tagline {
      font-size: 1.25rem;
      color: var(--text-accent, #006d31);
      margin: 0 0 1.5rem;
      font-weight: 500;
    }

    .intro {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #555;
      margin: 0 0 2rem;
    }

    .cta {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-primary {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: var(--btn-primary-bg, #0C2340);
      color: #fff;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.2s;
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    .btn-secondary {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border: 2px solid var(--border-accent, #006d31);
      color: var(--text-accent, #006d31);
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.2s, color 0.2s;
    }

    .btn-secondary:hover {
      background: var(--border-accent, #006d31);
      color: #fff;
    }
  `,
})
export class HomePageComponent {}
