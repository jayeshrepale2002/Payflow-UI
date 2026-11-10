import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, finalize, switchMap, takeWhile, tap, timer } from 'rxjs';
import { SendMoneyRequest, Transaction, isSettled } from '../../core/models/transaction.model';
import { TransactionService } from '../../core/services/transaction.service';
import { StatusBadgeComponent } from './status-badge';

@Component({
  selector: 'app-send-money',
  imports: [ReactiveFormsModule, RouterLink, StatusBadgeComponent],
  template: `
    <div class="card">
      <h2>Send money</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input type="email" formControlName="receiverEmail" placeholder="Receiver email" />
        <input type="number" formControlName="amount" placeholder="Amount" />
        <p class="hint">Idempotency key: {{ idempotencyKey() }}</p>
        @if (error()) { <p class="error">{{ error() }}</p> }
        <button type="submit" [disabled]="loading()">Pay</button>
      </form>

      @if (result(); as t) {
        <div class="notice">
          <p>Payment status: <app-status-badge [status]="t.status" /></p>
          @if (t.failureReason) { <p class="error">{{ t.failureReason }}</p> }
          <p class="hint">Transaction {{ t.id }}</p>
          @if (duplicate()) {
            <p class="success">Same transaction returned. You were not charged twice.</p>
          }
          <a routerLink="/history">View in History</a>
          <p>
            <button type="button" (click)="resendSame()" [disabled]="loading()">
              Resend same request (idempotency demo)
            </button>
          </p>
        </div>
      }
    </div>
  `,
})
export class SendMoneyComponent {
  private fb = inject(FormBuilder);
  private txns = inject(TransactionService);
  private destroyRef = inject(DestroyRef);
  private tracking?: Subscription;

  form = this.fb.group({
    receiverEmail: ['', [Validators.required, Validators.email]],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  idempotencyKey = signal(crypto.randomUUID());
  lastSent = signal<{ key: string; req: SendMoneyRequest } | null>(null);
  result = signal<Transaction | null>(null);
  duplicate = signal(false);
  loading = signal(false);
  error = signal('');

  submit() {
    if (this.form.invalid) {
      this.error.set('Enter a valid receiver email and an amount of at least 1');
      return;
    }
    const { receiverEmail, amount } = this.form.value;
    this.sendWith(this.idempotencyKey(), { receiverEmail: receiverEmail!, amount: amount! });
  }

  resendSame() {
    const last = this.lastSent();
    if (last) this.sendWith(last.key, last.req);
  }

  private sendWith(key: string, req: SendMoneyRequest) {
    const previousId = this.result()?.id;
    this.loading.set(true);
    this.error.set('');

    this.txns.send(key, req)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: t => {
          this.duplicate.set(previousId === t.id);
          this.result.set(t);
          this.lastSent.set({ key, req });
          this.track(t.id);
          if (key === this.idempotencyKey()) {
            this.idempotencyKey.set(crypto.randomUUID());
            this.form.reset();
          }
        },
        error: e => this.error.set(e.error?.message ?? 'Payment failed'),
      });
  }

  // keeps refreshing the payment's status until it is settled
  private track(id: string) {
    this.tracking?.unsubscribe();
    this.tracking = timer(0, 1000)
      .pipe(
        switchMap(() => this.txns.get(id)),
        tap(t => this.result.set(t)),
        takeWhile(t => !isSettled(t.status), true),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({ error: () => this.error.set('Could not refresh payment status') });
  }
}