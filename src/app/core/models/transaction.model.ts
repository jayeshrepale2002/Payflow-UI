export type TxnStatus = 'INITIATED' | 'FRAUD_CHECK' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REVERSED';

export interface Transaction {
  id: string;
  fromUserId: number;
  toUserId: number;
  fromName: string;
  toName: string;
  amount: number;
  status: TxnStatus;
  failureReason?: string;
  createdAt: string;
}


export interface SendMoneyRequest { receiverEmail: string; amount: number; }

// statuses after which the payment will not change on its own
export const isSettled = (s: TxnStatus) => s === 'SUCCESS' || s === 'FAILED' || s === 'REVERSED';


export interface FraudFlag {
  id: string;
  transactionId: string;
  userName: string;
  rule: 'AMOUNT_LIMIT' | 'VELOCITY';
  detail: string;
  amount: number;
  createdAt: string;
}