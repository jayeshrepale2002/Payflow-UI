import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { WalletService } from '../../core/services/wallet.service';

@Component({
  selector: 'app-add-money',
  imports: [ReactiveFormsModule, CurrencyPipe, RouterLink],
  template: `
    <div class="card">
      <h2>Add money</h2>
      @if (wallet.wallet(); as w) {
        <p>Current balance: <strong>{{ w.balance | currency: w.currency }}</strong></p>
      }
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input type="number" formControlName="amount" placeholder="Amount" />
        <div class="chips">
          @for (a of quickAmounts; track a) {
            <button type="button" (click)="form.controls.amount.setValue(a)">₹{{ a }}</button>
          }
        </div>
        @if (error()) { <p class="error">{{ error() }}</p> }
        @if (success()) { <p class="success">{{ success() }}</p> }
        <button type="submit" [disabled]="loading()">Add money</button>
      </form>
      <p><a routerLink="/dashboard">Back to dashboard</a></p>
    </div>
  `,
})
export class AddMoneyComponent implements OnInit {
  private fb = inject(FormBuilder);
  wallet = inject(WalletService);

  quickAmounts = [100, 500, 1000, 5000];
  form = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(1), Validators.max(100000)]],
  });
  loading = signal(false);
  error = signal('');
  success = signal('');

  ngOnInit() {
    this.wallet.load().subscribe();
  }

  submit() {
    this.success.set('');
    if (this.form.invalid) {
      this.error.set('Enter an amount between 1 and 100000');
      return;
    }
    const amount = this.form.value.amount!;
    this.loading.set(true);
    this.error.set('');
    this.wallet.addMoney({ amount })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.success.set(`Added ₹${amount} successfully`);
          this.form.reset();
        },
        error: e => this.error.set(e.error?.message ?? 'Could not add money'),
      });
  }
}