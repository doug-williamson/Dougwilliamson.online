import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SiteConfigService, type SiteConfig } from '@foliokit/cms-core';
import { take } from 'rxjs';

@Component({
  selector: 'app-site-config',
  imports: [FormsModule],
  template: `
    <div class="config-editor">
      <h1>Site Configuration</h1>

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }

      @if (config(); as c) {
        <div class="form">
          <label>
            Site Name
            <input [ngModel]="c.siteName" readonly />
          </label>
          <label>
            Site URL
            <input [ngModel]="c.siteUrl" readonly />
          </label>
          <label>
            Description
            <textarea rows="3" [ngModel]="c.description" readonly></textarea>
          </label>
          <label>
            Default Author ID
            <input [ngModel]="c.defaultAuthorId" readonly />
          </label>
        </div>
        <p class="hint">Site configuration is managed in Firestore at <code>/site-config/dougwilliamson</code>.</p>
      } @else if (!error()) {
        <p>Loading configuration...</p>
      }
    </div>
  `,
  styles: `
    .config-editor {
      max-width: 720px;
      margin: 0 auto;
      padding: 2rem;
    }

    h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 1.5rem; }

    .error {
      background: #fee;
      color: #c00;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .form { display: flex; flex-direction: column; gap: 1rem; }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-weight: 500;
      font-size: 0.875rem;
    }

    label input, label textarea {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 0.5rem;
      font-size: 0.9rem;
      background: #f9fafb;
    }

    .hint {
      margin-top: 1.5rem;
      color: #888;
      font-size: 0.875rem;
    }

    code {
      background: #f3f4f6;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
  `,
})
export class SiteConfigComponent implements OnInit {
  private readonly siteConfigService = inject(SiteConfigService);

  readonly config = signal<SiteConfig | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.siteConfigService.getSiteConfig('dougwilliamson').pipe(take(1)).subscribe({
      next: (config) => this.config.set(config),
      error: () => this.error.set('Failed to load site configuration.'),
    });
  }
}
