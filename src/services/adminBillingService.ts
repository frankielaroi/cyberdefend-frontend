// adminBillingService.ts
// Front-end helper functions for admin CRUD operations for billing plans
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
export interface FeaturesResponse {
  features: Record<string, string[]>;
}

export interface SubscriptionPlanDto {
  id?: string | number; // local id (uuid or slug) or numeric paystack id
  name: string;
  description?: string;
  price: number; // display price (e.g., 99.0)
  amount?: number; // minor unit amount (e.g., 9900)
  plan_code?: string;
  currency: string; // e.g., 'GHS'
  type?: string;
  trialDays?: number;
  maxUsers?: number;
  maxAssessments?: number;
  features?: Record<string, string[]>;
  total_subscriptions?: number;
  active_subscriptions?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaystackCreateDto {
  name: string;
  amount: number; // in smallest currency unit (e.g., 9900 for 99.00)
  interval: string; // 'monthly'|'yearly' etc
  description?: string;
  features?: Record<string, string[]>;
}

// Backend DTO for creating plans (matches NestJS CreatePlanDto)
export interface CreatePlanDto {
  name: string;
  amount: number;
  interval: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually';
  description?: string;
  send_invoices?: boolean;
  send_sms?: boolean;
  currency?: string;
  invoice_limit?: number;
  features?: Record<string, string[]>;
}

// Admin endpoints (local plans)
/**
 * Fetch available billing features from the backend
 * @param token optional JWT token; will default to `localStorage.getItem('token')`
 * @returns FeaturesResponse - an object containing feature lists
 * @example
 * const features = await adminBillingService.getFeatures();
 */
export async function getFeatures(token?: string): Promise<FeaturesResponse> {
  const resp = await fetch(`${API_BASE}/billing/features`, { headers: getAuthHeaders(token) });
  return handleResp(resp);
}

/**
 * List local billing plans
 * @param token optional JWT token
 * @returns Array or backend shape with a `plans` field
 * @example
 * // returns { plans: [...] } or [...]
 * const result = await adminBillingService.getLocalPlans();
 */
export async function getLocalPlans(token?: string) {
  const resp = await fetch(`${API_BASE}/billing/paystack/subscriptions`, { headers: getAuthHeaders(token) });
  return handleResp(resp);
}

/**
 * Get details for a specific local plan
 * @param id plan id (slug or uuid)
 * @param token optional JWT token
 */
export async function getLocalPlan(id: string, token?: string) {
  const resp = await fetch(`${API_BASE}/billing/paystack/subscriptions/${encodeURIComponent(id)}`, { headers: getAuthHeaders(token) });
  return handleResp(resp);
}

/**
 * Create a local subscription plan
 * @param data SubscriptionPlanDto payload
 * @param token optional JWT token
 * @example
 * await adminBillingService.createLocalPlan({ name: 'Pro', price: 99, currency: 'GHS', features: { limits: ['10 teams'] }});
 */
export async function createLocalPlan(data: SubscriptionPlanDto, token?: string) {
  const resp = await fetch(`${API_BASE}/billing/paystack/subscriptions`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResp(resp);
}

/**
 * Update a local plan by ID
 * @param id plan id
 * @param data Partial<SubscriptionPlanDto>
 */
export async function updateLocalPlan(id: string, data: Partial<SubscriptionPlanDto>, token?: string) {
  const resp = await fetch(`${API_BASE}/billing/paystack/subscriptions/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResp(resp);
}

/**
 * Delete a local plan by ID
 * @param id plan id
 */
export async function deleteLocalPlan(id: string, token?: string) {
  const resp = await fetch(`${API_BASE}/billing/paystack/subscriptions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  return handleResp(resp);
}

// Paystack endpoints (proxy through backend)
/**
 * Create a Paystack plan (backend will proxy to Paystack)
 * @param data PaystackCreateDto payload
 * @param token optional jwt
 */
export async function createPaystackPlan(data: PaystackCreateDto, token?: string) {
  const resp = await fetch(`${API_BASE}/billing/paystack/plan`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResp(resp);
}

/**
 * List Paystack plans via the backend
 */
export async function listPaystackPlans(token?: string) {
  const resp = await fetch(`${API_BASE}/billing/paystack/plan`, { headers: getAuthHeaders(token) });
  return handleResp(resp);
}

/**
 * Get Paystack plan by id or code
 */
export async function getPaystackPlan(idOrCode: string, token?: string) {
  const resp = await fetch(`${API_BASE}/billing/paystack/plan/${encodeURIComponent(idOrCode)}`, { headers: getAuthHeaders(token) });
  return handleResp(resp);
}

/**
 * Update a Paystack plan via backend proxy
 */
export async function updatePaystackPlan(idOrCode: string, data: Partial<PaystackCreateDto>, token?: string) {
  const resp = await fetch(`${API_BASE}/billing/paystack/plan/${encodeURIComponent(idOrCode)}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResp(resp);
}

/**
 * Delete a paystack plan via backend proxy
 */
export async function deletePaystackPlan(idOrCode: string, token?: string) {
  const resp = await fetch(`${API_BASE}/billing/paystack/plan/${encodeURIComponent(idOrCode)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  return handleResp(resp);
}

export default {
  getFeatures,
  getLocalPlans,
  getLocalPlan,
  createLocalPlan,
  updateLocalPlan,
  deleteLocalPlan,
  createPaystackPlan,
  listPaystackPlans,
  getPaystackPlan,
  updatePaystackPlan,
};
