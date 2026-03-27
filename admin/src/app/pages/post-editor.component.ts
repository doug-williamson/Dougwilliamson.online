import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { PostEditorStore, PostEditorCoverImageComponent, PostEditorMediaTabComponent } from '@foliokit/cms-admin-ui';

@Component({
  selector: 'app-post-editor',
  imports: [
    MatTabsModule,
    MatButtonModule,
    FormsModule,
    PostEditorCoverImageComponent,
    PostEditorMediaTabComponent,
  ],
  providers: [PostEditorStore],
  template: `
    <div class="editor">
      <div class="toolbar">
        <h1>{{ store.isNew() ? 'New Post' : 'Edit Post' }}</h1>
        <div class="actions">
          @if (store.isDirty()) {
            <button mat-flat-button (click)="store.save()">
              {{ store.isSaving() ? 'Saving...' : 'Save' }}
            </button>
          }
          @if (store.canPublish()) {
            <button mat-flat-button color="primary" (click)="store.publish()">Publish</button>
          }
        </div>
      </div>

      @if (store.saveError()) {
        <div class="error">{{ store.saveError() }}</div>
      }

      <mat-tab-group>
        <mat-tab label="Content">
          <div class="tab-content">
            <input
              class="title-input"
              placeholder="Post title"
              [ngModel]="store.post()?.title ?? ''"
              (ngModelChange)="store.updateField('title', $event)"
            />
            <textarea
              class="content-input"
              placeholder="Write your post content in Markdown..."
              [ngModel]="store.post()?.content ?? ''"
              (ngModelChange)="store.updateField('content', $event)"
            ></textarea>
          </div>
        </mat-tab>
        <mat-tab label="Media">
          <div class="tab-content">
            <folio-post-editor-cover-image />
            <folio-post-editor-media-tab />
          </div>
        </mat-tab>
        <mat-tab label="Metadata">
          <div class="tab-content">
            <label>
              Slug
              <input
                [ngModel]="store.post()?.slug ?? ''"
                (ngModelChange)="store.updateField('slug', $event)"
              />
            </label>
            <label>
              Subtitle
              <input
                [ngModel]="store.post()?.subtitle ?? ''"
                (ngModelChange)="store.updateField('subtitle', $event)"
              />
            </label>
            <label>
              Excerpt
              <textarea
                rows="3"
                [ngModel]="store.post()?.excerpt ?? ''"
                (ngModelChange)="store.updateField('excerpt', $event)"
              ></textarea>
            </label>
          </div>
        </mat-tab>
        <mat-tab label="SEO">
          <div class="tab-content">
            <label>
              SEO Title
              <input
                [ngModel]="store.post()?.seo?.title ?? ''"
                (ngModelChange)="store.updateField('seo', { ...store.post()?.seo, title: $event })"
              />
            </label>
            <label>
              SEO Description
              <textarea
                rows="3"
                [ngModel]="store.post()?.seo?.description ?? ''"
                (ngModelChange)="store.updateField('seo', { ...store.post()?.seo, description: $event })"
              ></textarea>
            </label>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: `
    .editor {
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

    .error {
      background: #fee;
      color: #c00;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .tab-content {
      padding: 1.5rem 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .title-input {
      font-size: 1.5rem;
      font-weight: 600;
      border: none;
      border-bottom: 2px solid #e5e7eb;
      padding: 0.5rem 0;
      outline: none;
      width: 100%;
    }

    .content-input {
      min-height: 400px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 1rem;
      font-family: monospace;
      font-size: 0.9rem;
      resize: vertical;
      width: 100%;
    }

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
    }
  `,
})
export class PostEditorComponent implements OnInit {
  readonly store = inject(PostEditorStore);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.loadPost(id);
    } else {
      this.store.initNew();
    }
  }
}
