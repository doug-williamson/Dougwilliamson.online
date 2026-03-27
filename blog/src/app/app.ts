import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent } from '@foliokit/cms-ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppShellComponent],
  template: `
    <folio-app-shell>
      <router-outlet />
    </folio-app-shell>
  `,
})
export class App {}
