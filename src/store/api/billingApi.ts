import { apiSlice } from './apiSlice';
import type { 
  Subscription, 
  Invoice,
  BillingInfo,
  PaymentMethod,
  SubscriptionPlan,
  UpgradeSubscriptionDto,
  ApiResponse
} from '../../types';

interface CheckoutSessionRequest {
  planId: string;
  paymentMethod: 'card' | 'momo';
}

interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
}

interface AddPaymentMethodDto {
  type: 'card' | 'bank_transfer';
  token: string;
}

export const billingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Subscription Management
    getBillingInfo: builder.query<BillingInfo, void>({
      query: () => '/billing/info',
      providesTags: ['Subscription'],
    }),
    getSubscriptionPlans: builder.query<SubscriptionPlan[], void>({
      query: () => '/billing/plans',
    }),
    getPlanRecommendations: builder.query<SubscriptionPlan[], void>({
      query: () => '/billing/plans/recommendations',
    }),
    getSubscription: builder.query<Subscription, void>({
      query: () => '/billing/subscription',
      providesTags: ['Subscription'],
    }),
    upgradeSubscription: builder.mutation<Subscription, UpgradeSubscriptionDto>({
      query: (upgradeData) => ({
        url: '/billing/subscription/upgrade',
        method: 'POST',
        body: upgradeData,
      }),
      invalidatesTags: ['Subscription'],
    }),
    cancelSubscription: builder.mutation<ApiResponse, { reason?: string }>({
      query: (data) => ({
        url: '/billing/subscription/cancel',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),
    updateSubscription: builder.mutation<Subscription, { planId: string; billingCycle?: 'monthly' | 'annually' }>({
      query: (data) => ({
        url: '/billing/subscription',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Payment Methods
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => '/billing/payment-methods',
      providesTags: ['Subscription'],
    }),
    addPaymentMethod: builder.mutation<PaymentMethod, AddPaymentMethodDto>({
      query: (data) => ({
        url: '/billing/payment-methods',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),
    setDefaultPaymentMethod: builder.mutation<ApiResponse, string>({
      query: (paymentMethodId) => ({
        url: `/billing/payment-methods/${paymentMethodId}/default`,
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),
    removePaymentMethod: builder.mutation<ApiResponse, string>({
      query: (paymentMethodId) => ({
        url: `/billing/payment-methods/${paymentMethodId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Invoicing
    getInvoices: builder.query<Invoice[], { limit?: number; status?: string }>({
      query: (params) => ({
        url: '/billing/invoices',
        params,
      }),
    }),
    getInvoice: builder.query<Invoice, string>({
      query: (invoiceId) => `/billing/invoices/${invoiceId}`,
    }),
    downloadInvoice: builder.query<Blob, string>({
      query: (invoiceId) => ({
        url: `/billing/invoices/${invoiceId}/download`,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    // Checkout & Payment
    createCheckoutSession: builder.mutation<CheckoutSessionResponse, CheckoutSessionRequest>({
      query: (data) => ({
        url: '/billing/checkout/session',
        method: 'POST',
        body: data,
      }),
    }),
    processPayment: builder.mutation<ApiResponse, { invoiceId: string; paymentMethodId: string }>({
      query: (data) => ({
        url: '/billing/payments/process',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Usage & Billing History
    getUsageMetrics: builder.query<any, { startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: '/billing/usage',
        params,
      }),
    }),
    getBillingHistory: builder.query<any[], { limit?: number; offset?: number }>({
      query: (params) => ({
        url: '/billing/history',
        params,
      }),
    }),
  }),
});

export const {
  // Subscription hooks
  useGetBillingInfoQuery,
  useGetSubscriptionPlansQuery,
  useGetPlanRecommendationsQuery,
  useGetSubscriptionQuery,
  useUpgradeSubscriptionMutation,
  useCancelSubscriptionMutation,
  useUpdateSubscriptionMutation,
  
  // Payment method hooks
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
  useRemovePaymentMethodMutation,
  
  // Invoice hooks
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useLazyDownloadInvoiceQuery,
  
  // Checkout hooks
  useCreateCheckoutSessionMutation,
  useProcessPaymentMutation,
  
  // Usage hooks
  useGetUsageMetricsQuery,
  useGetBillingHistoryQuery,
} = billingApi;

// Legacy exports for backward compatibility
export const useGetPlansQuery = billingApi.endpoints.getSubscriptionPlans.useQuery;
