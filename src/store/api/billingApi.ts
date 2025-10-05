// Mock Billing API - Replace with actual implementation when backend is ready
import { mockBillingOrganizationService } from '../../services/mockBillingOrganizationService';

// Simple mock implementations that return promises
export const useGetBillingInfoQuery = () => ({
  data: undefined,
  isLoading: false,
  error: null,
  refetch: () => mockBillingOrganizationService.getBillingInfo()
});

export const useGetSubscriptionPlansQuery = () => ({
  data: undefined,
  isLoading: false,
  error: null,
  refetch: () => mockBillingOrganizationService.getSubscriptionPlans()
});

export const useGetPlanRecommendationsQuery = () => ({
  data: [],
  isLoading: false,
  error: null,
  refetch: () => mockBillingOrganizationService.getSubscriptionPlans()
});

export const useGetSubscriptionQuery = () => ({
  data: undefined,
  isLoading: false,
  error: null,
  refetch: () => mockBillingOrganizationService.getSubscription()
});

export const useUpgradeSubscriptionMutation = () => [
  (data: any) => mockBillingOrganizationService.mockGeneric(data),
  { isLoading: false, error: null, reset: () => {} }
];

export const useCancelSubscriptionMutation = () => [
  (data: any) => mockBillingOrganizationService.mockGeneric(data),
  { isLoading: false, error: null, reset: () => {} }
];

export const useUpdateSubscriptionMutation = () => [
  (data: any) => mockBillingOrganizationService.mockGeneric(data),
  { isLoading: false, error: null, reset: () => {} }
];

export const useGetPaymentMethodsQuery = () => ({
  data: [],
  isLoading: false,
  error: null,
  refetch: () => mockBillingOrganizationService.mockGeneric([])
});

export const useAddPaymentMethodMutation = () => [
  (data: any) => mockBillingOrganizationService.mockGeneric(data),
  { isLoading: false, error: null, reset: () => {} }
];

export const useSetDefaultPaymentMethodMutation = () => [
  (data: any) => mockBillingOrganizationService.mockGeneric(data),
  { isLoading: false, error: null, reset: () => {} }
];

export const useRemovePaymentMethodMutation = () => [
  (data: any) => mockBillingOrganizationService.mockGeneric(data),
  { isLoading: false, error: null, reset: () => {} }
];

export const useGetInvoicesQuery = () => ({
  data: [],
  isLoading: false,
  error: null,
  refetch: () => mockBillingOrganizationService.getInvoices()
});

export const useGetInvoiceQuery = () => ({
  data: undefined,
  isLoading: false,
  error: null,
  refetch: () => mockBillingOrganizationService.mockGeneric()
});

export const useLazyDownloadInvoiceQuery = () => [
  (_data: any) => mockBillingOrganizationService.mockGeneric(new Blob(['Mock invoice'], { type: 'application/pdf' })),
  { data: undefined, isLoading: false, error: null }
];

export const useCreateCheckoutSessionMutation = () => [
  (_data: any) => mockBillingOrganizationService.mockGeneric({ sessionId: 'mock-session', checkoutUrl: '/mock-checkout' }),
  { isLoading: false, error: null, reset: () => {} }
];

export const useProcessPaymentMutation = () => [
  (data: any) => mockBillingOrganizationService.mockGeneric(data),
  { isLoading: false, error: null, reset: () => {} }
];

export const useGetUsageMetricsQuery = () => ({
  data: {},
  isLoading: false,
  error: null,
  refetch: () => mockBillingOrganizationService.mockGeneric({})
});

export const useGetBillingHistoryQuery = () => ({
  data: [],
  isLoading: false,
  error: null,
  refetch: () => mockBillingOrganizationService.mockGeneric([])
});

// Legacy exports
export const useGetPlansQuery = useGetSubscriptionPlansQuery;
