import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, switchMap, timer } from 'rxjs';
import { FraudFlag, Transaction, TxnStatus, isSettled } from '../../core/models/transaction.model';
import { AdminService } from '../../core/services/admin.service';
import { StatusBadgeComponent } from '../transactions/status-badge';

@Component({
  selector: 'app-admin',
  imports: [CurrencyPipe, DatePipe, StatusBadgeComponent],
  template: `
    <div class="card wide">
      <h2>Admin dashboard</h2>
      @if (error()) {
        <p class="error">{{ error() }}</p>
      } @else if (loading()) {
        <p>Loading…</p>
      } @else {
        <div class="stats">
          <div class="stat"><span>Total payments</span><strong>{{ stats().total }}</strong></div>
          <div class="stat"><span>Successful</span><strong>{{ stats().success }}</strong></div>
          <div class="stat"><span>Failed</span><strong>{{ stats().failed }}</strong></div>
          <div class="stat"><span>In progress</span><strong>{{ stats().inProgress }}</strong></div>
          <div class="stat"><span>Settled volume</span><strong>{{ stats().volume | currency: 'INR' }}</strong></div>
        </div>
      }
    </div>

    @if (!loading() && !error()) {
      <div class="card wide">
        <h3>Fraud flags ({{ flags().length }})</h3>
        @if (flags().length === 0) {
          <p>No fraud flags raised.</p>
        } @else {
          <table>
            <thead>
              <tr><th>Time</th><th>User</th><th>Rule</th><th>Detail</th><th>Amount</th></tr>
            </thead>
            <tbody>
              @for (f of flags(); track f.id) {
                <tr>
                  <td>{{ f.createdAt | date: 'dd MMM, HH:mm:ss' }}</td>
                  <td>{{ f.userName }}</td>
                  <td><span class="badge" data-status="FAILED">{{ f.rule }}</span></td>
                  <td>{{ f.detail }}</td>
                  <td>{{ f.amount | currency: 'INR' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <div class="card wide">
        <h3>All transactions</h3>
        <select (change)="setFilter($event)">
          <option value="ALL">All statuses</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
        @if (visible().length === 0) {
          <p>No transactions to show.</p>
        } @else {
          <table>
            <thead>
              <tr><th>Time</th><th>From</th><th>To</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              @for (t of visible(); track t.id) {
                <tr>
                  <td>{{ t.createdAt | date: 'dd MMM, HH:mm:ss' }}</td>
                  <td>{{ t.fromName }}</td>
                  <td>{{ t.toName }}</td>
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
    }
  `,
})
export class AdminComponent implements OnInit {
  private admin = inject(AdminService);
  private destroyRef = inject(DestroyRef);

  statuses: TxnStatus[] = ['INITIATED', 'FRAUD_CHECK', 'PENDING', 'SUCCESS', 'FAILED', 'REVERSED'];

  txns = signal<Transaction[]>([]);
  flags = signal<FraudFlag[]>([]);
  filter = signal<TxnStatus | 'ALL'>('ALL');
  loading = signal(true);
  error = signal('');

  visible = computed(() =>
    this.filter() === 'ALL' ? this.txns() : this.txns().filter(t => t.status === this.filter()),
  );

  stats = computed(() => {
    const all = this.txns();
    const success = all.filter(t => t.status === 'SUCCESS');
    return {
      total: all.length,
      success: success.length,
      failed: all.filter(t => t.status === 'FAILED').length,
      inProgress: all.filter(t => !isSettled(t.status)).length,
      volume: success.reduce((sum, t) => sum + t.amount, 0),
    };
  });

  ngOnInit() {
    timer(0, 3000)
      .pipe(
        switchMap(() => forkJoin({ txns: this.admin.allTransactions(), flags: this.admin.fraudFlags() })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ txns, flags }) => {
          this.txns.set(txns);
          this.flags.set(flags);
          this.loading.set(false);
        },
        error: e => {
          this.error.set(e.error?.message ?? 'Could not load admin data');
          this.loading.set(false);
        },
      });
  }

  setFilter(event: Event) {
    this.filter.set((event.target as HTMLSelectElement).value as TxnStatus | 'ALL');
  }
}