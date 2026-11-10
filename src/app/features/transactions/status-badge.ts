import { Component, input } from '@angular/core';
import { TxnStatus } from '../../core/models/transaction.model';

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [attr.data-status]="status()">{{ status() }}</span>`,
})
export class StatusBadgeComponent {
  status = input.required<TxnStatus>();
}