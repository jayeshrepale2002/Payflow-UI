import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WalletService } from '../../core/services/wallet.service';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, RouterLink],
  template: `
    <section class="dash">
      <div class="hero">
        <p class="hero-hello">Welcome back, {{ auth.user()?.name }}</p>
        <p class="hero-label">Wallet balance</p>
        @if (error()) {
          <p class="hero-error">{{ error() }}</p>
        } @else if (wallet.wallet(); as w) {
          <p class="hero-balance">{{ w.balance | currency: w.currency }}</p>
        } @else {
          <p class="hero-balance skeleton">Loading…</p>
        }
      </div>

      <div class="actions">
        <a routerLink="/send" class="action">
          <span class="icon">💸</span><strong>Send money</strong><small>Pay anyone by email</small>
        </a>
        <a routerLink="/wallet" class="action">
          <span class="icon">➕</span><strong>Add money</strong><small>Top up your wallet</small>
        </a>
        <a routerLink="/history" class="action">
          <span class="icon">🕘</span><strong>History</strong><small>Track your payments</small>
        </a>
        @if (auth.isAdmin()) {
          <a routerLink="/admin" class="action">
            <span class="icon">🛡️</span><strong>Admin</strong><small>Monitor all activity</small>
          </a>
        }
      </div>
    </section>
  `,
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  wallet = inject(WalletService);
  error = signal('');

  ngOnInit() {
    this.wallet.load().subscribe({
      error: e => this.error.set(e.error?.message ?? 'Could not load wallet'),
    });
  }
}