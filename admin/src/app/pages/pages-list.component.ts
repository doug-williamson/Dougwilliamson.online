import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pages-list',
  imports: [RouterLink],
  template: `
    <div class="pages-list">
      <h1>Pages</h1>
      <div class="page-cards">
        <a routerLink="/pages/about" class="page-card">
          <h2>About</h2>
          <p>Edit the About page content and hero image.</p>
        </a>
        <a routerLink="/pages/links" class="page-card">
          <h2>Links</h2>
          <p>Manage your links page with social and custom links.</p>
        </a>
      </div>
    </div>
  `,
  styles: `
    .pages-list {
      max-width: 720px;
      margin: 0 auto;
      padding: 2rem;
    }

    h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 2rem; }

    .page-cards { display: flex; flex-direction: column; gap: 1rem; }

    .page-card {
      display: block;
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s;
    }

    .page-card:hover { border-color: #0C2340; }

    h2 { font-size: 1.25rem; font-weight: 600; margin: 0 0 0.25rem; }

    p { color: #666; margin: 0; }
  `,
})
export class PagesListComponent {}
