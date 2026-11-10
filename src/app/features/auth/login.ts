import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="card">
      <h2>Login</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input type="email" formControlName="email" placeholder="Email" />
        <input type="password" formControlName="password" placeholder="Password" />
        @if (error()) { <p class="error">{{ error() }}</p> }
        <p>{{ form.status }} | loading: {{ loading() }}</p>
        <button type="submit" [disabled]="loading()">Login</button>
      </form>
      <p>New here? <a routerLink="/register">Register</a></p>
      <p class="hint">Demo: user&#64;payflow.com / user123</p>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  loading = signal(false);
  error = signal('');

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Enter a valid email and a password of at least 6 characters');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.form.getRawValue())
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: e => { this.error.set(e.error?.message ?? 'Login failed');},
    });
  }
}