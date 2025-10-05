import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
  selectedOrganization: string | null;
  dashboardFilters: {
    region?: string;
    sector?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

const initialState: AdminState = {
  selectedOrganization: null,
  dashboardFilters: {},
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setSelectedOrganization: (state, action: PayloadAction<string | null>) => {
      state.selectedOrganization = action.payload;
    },
    setDashboardFilters: (state, action: PayloadAction<AdminState['dashboardFilters']>) => {
      state.dashboardFilters = { ...state.dashboardFilters, ...action.payload };
    },
    clearDashboardFilters: (state) => {
      state.dashboardFilters = {};
    },
  },
});

export const { setSelectedOrganization, setDashboardFilters, clearDashboardFilters } = adminSlice.actions;
export default adminSlice.reducer;
