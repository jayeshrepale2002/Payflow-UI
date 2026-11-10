import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/layout/navbar';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  template: `
    @if (auth.isLoggedIn()) { <app-navbar /> }
    <main><router-outlet /></main>
  `,
})
export class App {
  auth = inject(AuthService);
}