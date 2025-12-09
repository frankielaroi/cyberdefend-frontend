// billingService.ts
// Simple service to call Paystack subscription endpoint with Authorization header

export interface PaystackPlan {
  id: string;
  name: string;
  amount?: number;
  interval?: string;
  [key: string]: any;
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000');

export async function fetchPaystackSubscriptionPlans(token?: string): Promise<PaystackPlan[]> {
  // Default to token from localStorage if not provided. You can also pass the token directly.
  const authToken = token || localStorage.getItem('token') || '';

  const url = 'http://localhost:3000/api/v1/billing/paystack/subscriptions';

  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const resp = await fetch(url, { method: 'GET', headers });
  if (!resp.ok) {
    const bodyText = await resp.text().catch(() => '');
    throw new Error(`Failed to fetch subscription plans: ${resp.status} ${resp.statusText} ${bodyText}`);
  }

  const data = await resp.json();

  // Paystack/your backend may return an array in `data` or a `data` object with subscriptions
  if (Array.isArray(data)) return data as PaystackPlan[];
  if (Array.isArray(data?.data)) return data.data as PaystackPlan[];

  // If unknown format, return as-is wrapped in an array
  return [data] as PaystackPlan[];
}

export interface InitializeSubscriptionRequest {
  email: string;
  plan: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export interface InitializeSubscriptionResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
  };
}

export async function initializePaystackSubscription(
  body: InitializeSubscriptionRequest,
  token?: string
): Promise<InitializeSubscriptionResponse> {
  const authToken = token || localStorage.getItem('token') || '';
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const url = `${API_BASE}/billing/paystack/initialize`;
  const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });

  if (!resp.ok) {
    const bodyText = await resp.text().catch(() => '');
    throw new Error(`Failed to initialize subscription: ${resp.status} ${resp.statusText} ${bodyText}`);
  }

  const data = await resp.json();
  return data as InitializeSubscriptionResponse;
}

export default { fetchPaystackSubscriptionPlans, initializePaystackSubscription };
