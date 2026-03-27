import { Component, inject, OnInit } from '@angular/core';
import { AboutEditorFormComponent, PageEditorStore } from '@foliokit/cms-admin-ui';

@Component({
  selector: 'app-about-editor',
  imports: [AboutEditorFormComponent],
  providers: [PageEditorStore],
  template: `
    <div class="page-editor">
      <div class="toolbar">
        <h1>Edit About Page</h1>
        <div class="actions">
          @if (store.isDirty()) {
            <button class="btn-save" (click)="store.save()">
              {{ store.isSaving() ? 'Saving...' : 'Save' }}
            </button>
          }
        </div>
      </div>
      @if (store.saveError()) {
        <div class="error">{{ store.saveError() }}</div>
      }
      <admin-about-editor-form />
    </div>
  `,
  styles: `
    .page-editor {
      max-width: 960px;
      margin: 0 auto;
      padding: 2rem;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    h1 { font-size: 1.5rem; font-weight: 700; margin: 0; }

    .actions { display: flex; gap: 0.5rem; }

    .btn-save {
      padding: 0.5rem 1rem;
      background: #0C2340;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .error {
      background: #fee;
      color: #c00;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
  `,
})
export class AboutEditorComponent implements OnInit {
  readonly store = inject(PageEditorStore);

  ngOnInit(): void {
    this.store.loadPage('about');
  }
}
