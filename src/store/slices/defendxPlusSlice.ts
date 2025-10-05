import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PhishingCampaign, Alert, SystemScan } from '../../types';

interface DefendXPlusState {
  activeCampaigns: PhishingCampaign[];
  recentAlerts: Alert[];
  activeScans: SystemScan[];
  alertCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const initialState: DefendXPlusState = {
  activeCampaigns: [],
  recentAlerts: [],
  activeScans: [],
  alertCount: {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  },
};

const defendxPlusSlice = createSlice({
  name: 'defendxPlus',
  initialState,
  reducers: {
    setActiveCampaigns: (state, action: PayloadAction<PhishingCampaign[]>) => {
      state.activeCampaigns = action.payload;
    },
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.recentAlerts.unshift(action.payload);
      if (state.recentAlerts.length > 50) {
        state.recentAlerts = state.recentAlerts.slice(0, 50);
      }
      state.alertCount[action.payload.severity] += 1;
    },
    acknowledgeAlert: (state, action: PayloadAction<string>) => {
      const alert = state.recentAlerts.find((a) => a.id === action.payload);
      if (alert) {
        alert.acknowledged = true;
      }
    },
    updateAlertCounts: (state, action: PayloadAction<DefendXPlusState['alertCount']>) => {
      state.alertCount = action.payload;
    },
    setActiveScans: (state, action: PayloadAction<SystemScan[]>) => {
      state.activeScans = action.payload;
    },
  },
});

export const {
  setActiveCampaigns,
  addAlert,
  acknowledgeAlert,
  updateAlertCounts,
  setActiveScans,
} = defendxPlusSlice.actions;

export default defendxPlusSlice.reducer;
