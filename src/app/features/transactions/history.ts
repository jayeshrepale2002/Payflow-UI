import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, takeWhile, tap, timer } from 'rxjs';
import { Transaction, isSettled } from '../../core/models/transaction.model';
import { AuthService } from '../../core/services/auth.service';
import { TransactionService } from '../../core/services/transaction.service';
import { StatusBadgeComponent } from './status-badge';

@Component({
  selector: 'app-history',
  imports: [CurrencyPipe, DatePipe, StatusBadgeComponent],
  template: `
    <div class="card wide">
      <h2>Transaction history</h2>
      @if (error()) {
        <p class="error">{{ error() }}</p>
      } @else if (loading()) {
        <p>Loading…</p>
      } @else if (rows().length === 0) {
        <p>No transactions yet.</p>
      } @else {
        <table>
          <thead>
            <tr><th>Time</th><th>Details</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            @for (t of rows(); track t.id) {
              <tr>
                <td>{{ t.createdAt | date: 'dd MMM, HH:mm:ss' }}</td>
                <td>{{ isSent(t) ? 'Sent to ' + t.toName : 'Received from ' + t.fromName }}</td>
                <td>{{ t.amount | currency: 'INR' }}</td>
                <td>
                  <app-status-badge [status]="t.status" />
                  @if (t.failureReason) { <small class="reason">{{ t.failureReason }}</small> }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class HistoryComponent implements OnInit {
  private txns = inject(TransactionService);
  private destroyRef = inject(DestroyRef);
  private auth = inject(AuthService);

  rows = signal<Transaction[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    timer(0, 2000)
      .pipe(
        switchMap(() => this.txns.list()),
        tap(list => {
          this.rows.set(list);
          this.loading.set(false);
        }),
        takeWhile(list => list.some(t => !isSettled(t.status)), true),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: e => {
          this.error.set(e.error?.message ?? 'Could not load transactions');
          this.loading.set(false);
        },
      });
  }

  isSent(t: Transaction) {
    return t.fromUserId === this.auth.user()?.id;
  }
}