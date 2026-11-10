import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API } from '../config';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

const TOKEN_KEY = 'payflow_token';
const USER_KEY = 'payflow_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<User | null>(this.loadUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');

  get token(): string | null { return localStorage.getItem(TOKEN_KEY); }

  login(req: LoginRequest) {
    return this.http.post<AuthResponse>(`${API.baseUrl}/auth/login`, req)
      .pipe(tap(res => this.saveSession(res)));
  }

  register(req: RegisterRequest) {
    return this.http.post<AuthResponse>(`${API.baseUrl}/auth/register`, req)
      .pipe(tap(res => this.saveSession(res)));
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.router.navigateByUrl('/login');
  }

  private saveSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._user.set(res.user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}