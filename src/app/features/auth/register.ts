import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="card">
      <h2>Create account</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input formControlName="name" placeholder="Full name" />
        <input type="email" formControlName="email" placeholder="Email" />
        <input type="password" formControlName="password" placeholder="Password (min 6)" />
        @if (error()) { <p class="error">{{ error() }}</p> }
        <button type="submit" [disabled]="loading()">Register</button>
      </form>
      <p>Have an account? <a routerLink="/login">Login</a></p>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
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
    this.auth.register(this.form.getRawValue())
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: e => { this.error.set(e.error?.message ?? 'Registration failed');},
    });
  }
}