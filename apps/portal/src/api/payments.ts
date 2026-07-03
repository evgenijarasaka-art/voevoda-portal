import apiClient from './client';

export interface CheckoutPaymentItem {
  id: string;
  kind: 'course' | 'product';
  title: string;
  price: number;
  qty?: number;
  city?: string;
  brand?: string;
  stream?: string;
}

export interface CreatePaymentPayload {
  purpose?: 'purchase' | 'wallet_topup';
  login: string;
  email: string;
  phone: string;
  return_url: string;
  items: CheckoutPaymentItem[];
}

export interface CreatePaymentResponse {
  order_id: string;
  payment_id: string;
  status: string;
  confirmation_url: string;
}

export interface PaymentOrder {
  id: string;
  status: 'new' | 'pending' | 'paid' | 'canceled' | 'failed';
  purpose: 'purchase' | 'wallet_topup';
  customer_email: string;
  total_amount: string;
  currency: string;
  yookassa_payment_id: string;
  yookassa_status: string;
  confirmation_url: string;
  created_at: string;
  paid_at: string | null;
  items?: {
    id: number;
    kind: 'course' | 'product' | 'wallet_topup';
    source_id: string;
    title: string;
    quantity: number;
    unit_price: string;
    amount: string;
  }[];
}

export interface WalletTopupPayload {
  login?: string;
  email: string;
  phone?: string;
  amount: number;
  return_url: string;
}

export async function createCheckoutPayment(payload: CreatePaymentPayload) {
  const { data } = await apiClient.post<CreatePaymentResponse>('/payments/create/', payload);
  return data;
}

export async function getPaymentOrder(orderId: string) {
  const { data } = await apiClient.get<PaymentOrder>(`/payments/orders/${orderId}/`);
  return data;
}

export async function listPaymentOrders() {
  const { data } = await apiClient.get<PaymentOrder[]>('/payments/orders/');
  return data;
}

export async function createWalletTopupPayment(payload: WalletTopupPayload) {
  const { data } = await apiClient.post<CreatePaymentResponse>('/payments/wallet/topup/', payload);
  return data;
}

export interface CardBindingPayload {
  email: string;
  return_url: string;
}

export async function createCardBindingPayment(payload: CardBindingPayload) {
  const { data } = await apiClient.post<CreatePaymentResponse>('/payments/card/bind/', payload);
  return data;
}
