import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { take } from 'rxjs/operators';
import { type NavItem, SiteConfigService } from '@foliokit/cms-core';
import { AppShellComponent } from '@foliokit/cms-ui';

const DEFAULT_NAV: NavItem[] = [
  { label: 'Home', url: '/' },
  { label: 'Blog', url: '/posts' },
];

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AppShellComponent,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
})
export class App {
  private readonly siteConfigService = inject(SiteConfigService);
  private readonly siteConfig = toSignal(this.siteConfigService.getDefaultSiteConfig().pipe(take(1)), {
    initialValue: null,
  });

  protected readonly navItems = computed(() => {
    const config = this.siteConfig();
    const base = config?.nav?.length ? config.nav : DEFAULT_NAV;
    const extra: NavItem[] = [];
    if (config?.pages?.about?.enabled) {
      extra.push({ label: 'About', url: '/about' });
    }
    if (config?.pages?.links?.enabled) {
      extra.push({ label: 'Links', url: '/links' });
    }
    const existingUrls = new Set(base.map((i) => i.url));
    return [...base, ...extra.filter((e) => !existingUrls.has(e.url))];
  });
}
