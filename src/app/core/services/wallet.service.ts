import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { API } from '../config';
import { AddMoneyRequest, Wallet } from '../models/wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private http = inject(HttpClient);

  private _wallet = signal<Wallet | null>(null);
  readonly wallet = this._wallet.asReadonly();

  load() {
    this._wallet.set(null);
    return this.http.get<Wallet>(`${API.baseUrl}/wallet`)
      .pipe(tap(w => this._wallet.set(w)));
  }

  addMoney(req: AddMoneyRequest) {
    return this.http.post<Wallet>(`${API.baseUrl}/wallet/add-money`, req)
      .pipe(tap(w => this._wallet.set(w)));
  }
}