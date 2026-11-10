import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav>
      <span class="brand"><span class="logo">₹</span>PayFlow</span>
      <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
      <a routerLink="/wallet" routerLinkActive="active">Add money</a>
      <a routerLink="/send" routerLinkActive="active">Send money</a>
      <a routerLink="/history" routerLinkActive="active">History</a>
      @if (auth.isAdmin()) {
        <a routerLink="/admin" routerLinkActive="active">Admin</a>
      }
      <span class="spacer"></span>
      <span class="avatar">{{ initial() }}</span>
      <span class="username">{{ auth.user()?.name }}</span>
      <button class="ghost" (click)="auth.logout()">Logout</button>
    </nav>
  `,
})
export class NavbarComponent {
  auth = inject(AuthService);
  initial = computed(() => (this.auth.user()?.name ?? '?').charAt(0).toUpperCase());
}