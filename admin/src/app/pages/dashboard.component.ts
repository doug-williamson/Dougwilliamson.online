import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PostsBoardComponent } from '@foliokit/cms-admin-ui';

@Component({
  selector: 'app-dashboard',
  imports: [PostsBoardComponent],
  template: `
    <div class="dashboard">
      <div class="header">
        <h1>Posts</h1>
        <button class="btn-new" (click)="newPost()">+ New Post</button>
      </div>
      <folio-posts-board (postSelected)="editPost($event)" />
    </div>
  `,
  styles: `
    .dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
    }

    .btn-new {
      padding: 0.5rem 1rem;
      background: #0C2340;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .btn-new:hover {
      opacity: 0.9;
    }
  `,
})
export class DashboardComponent {
  private readonly router = inject(Router);

  newPost(): void {
    this.router.navigate(['/posts/new']);
  }

  editPost(postId: string): void {
    this.router.navigate(['/posts', postId, 'edit']);
  }
}
