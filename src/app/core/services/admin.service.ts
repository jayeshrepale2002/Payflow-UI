import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../config';
import { FraudFlag, Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  allTransactions() {
    return this.http.get<Transaction[]>(`${API.baseUrl}/admin/transactions`);
  }

  fraudFlags() {
    return this.http.get<FraudFlag[]>(`${API.baseUrl}/admin/fraud-flags`);
  }
}