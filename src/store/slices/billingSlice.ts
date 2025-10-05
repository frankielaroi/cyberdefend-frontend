import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Subscription, Invoice } from '../../types';

interface BillingState {
  subscription: Subscription | null;
  invoices: Invoice[];
  paymentMethods: Array<{
    id: string;
    type: 'card' | 'momo';
    last4?: string;
    isDefault: boolean;
  }>;
}

const initialState: BillingState = {
  subscription: null,
  invoices: [],
  paymentMethods: [],
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    setSubscription: (state, action: PayloadAction<Subscription>) => {
      state.subscription = action.payload;
    },
    setInvoices: (state, action: PayloadAction<Invoice[]>) => {
      state.invoices = action.payload;
    },
    setPaymentMethods: (state, action: PayloadAction<BillingState['paymentMethods']>) => {
      state.paymentMethods = action.payload;
    },
  },
});

export const { setSubscription, setInvoices, setPaymentMethods } = billingSlice.actions;
export default billingSlice.reducer;
