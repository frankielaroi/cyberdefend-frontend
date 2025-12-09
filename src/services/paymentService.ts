// paymentService.ts
// Front-end helper functions for Paystack payment initialization and verification
// Uses fetch and expects JWT in localStorage under `token` by default.

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000');

function getAuthHeaders(token?: string) {
  const t = token ?? localStorage.getItem('token') ?? '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (t) headers['Authorization'] = `Bearer ${t}`;
  return headers;
}

async function handleResp(resp: Response) {
  const text = await resp.text().catch(() => '');
  try {
    const json = text ? JSON.parse(text) : null;
    if (!resp.ok) throw { status: resp.status, body: json ?? text };
    return json;
  } catch (e) {
    if (!resp.ok) throw { status: resp.status, body: text };
    // If parse failed but status OK, return raw text
    return text;
  }
}

// Types
export interface PaymentInitializeRequest {
  email: string;
  plan: string; // Paystack plan code
  callback_url?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaymentVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    paid_at: string;
    created_at: string;
    channel: string;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    plan?: {
      id: number;
      name: string;
      plan_code: string;
      description?: string;
      amount: number;
      interval: string;
    };
    subscription?: {
      id: number;
      customer: number;
      plan: number;
      integration: number;
      domain: string;
      start: number;
      status: string;
      quantity: number;
      amount: number;
      subscription_code: string;
      email_token: string;
      authorization: {
        authorization_code: string;
        bin: string;
        last4: string;
        exp_month: string;
        exp_year: string;
        channel: string;
        card_type: string;
        bank: string;
        country_code: string;
        brand: string;
        reusable: boolean;
        signature: string;
        account_name: string;
      };
      easy_cron_id: string;
      cron_expression: string;
      next_payment_date: string;
      open_invoice: string;
    };
    metadata?: Record<string, any>;
  };
}

/**
 * Initialize a Paystack payment for a subscription plan
 * @param request Payment initialization request
 * @param token optional JWT token
 * @returns Paystack initialization response with authorization URL
 */
export async function initializePayment(
  request: PaymentInitializeRequest,
  token?: string
): Promise<PaymentInitializeResponse> {
  const resp = await fetch(`${API_BASE}/billing/paystack/initialize`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(request),
  });
  return handleResp(resp);
}

/**
 * Verify a Paystack payment transaction
 * @param reference Paystack transaction reference
 * @param token optional JWT token
 * @returns Payment verification response
 */
export async function verifyPayment(
  reference: string,
  token?: string
): Promise<PaymentVerifyResponse> {
  const resp = await fetch(`${API_BASE}/billing/paystack/verify/${encodeURIComponent(reference)}`, {
    headers: getAuthHeaders(token),
  });
  return handleResp(resp);
}

/**
 * Get current user's email (helper function)
 * This should be replaced with actual user context management
 */
export function getCurrentUserEmail(): string | null {
  // This is a placeholder - you should get this from your auth context/store
  // For now, we'll try to get it from localStorage or return null
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.email || null;
    }
  } catch (e) {
    console.warn('Could not parse user data from localStorage');
  }
  return null;
}

export default {
  initializePayment,
  verifyPayment,
  getCurrentUserEmail,
};