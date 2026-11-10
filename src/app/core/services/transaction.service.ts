import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../config';
import { SendMoneyRequest, Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);

  send(idempotencyKey: string, req: SendMoneyRequest) {
    return this.http.post<Transaction>(`${API.baseUrl}/transactions`, req, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  }

  list() {
    return this.http.get<Transaction[]>(`${API.baseUrl}/transactions`);
  }

  get(id: string) {
    return this.http.get<Transaction>(`${API.baseUrl}/transactions/${id}`);
  }
}