// features.type.ts
export type FeaturesMap = Record<string, string[]>;

export interface FeatureDefinition {
  module: string;
  key: string;
}

export const FEATURES = {
  defendx: [
    'csi_assessments',
    'cybersafe',
    'basic_reporting',
    'advanced_reporting',
    'full_security_suite',
  ],
  defendxplus: [
    'phishing_simulations',
    'mobile_wallet_shield',
    'email_security_training',
    'threat_intelligence',
  ],
  backup: [
    'backup_management',
    'backup_retention',
    'backup_agents',
  ],
  monitoring: [
    'realtime_monitoring',
    'siem_integration',
    'compliance_reporting',
    'defendsecure_monitor',
    'fraud_detection',
  ],
  audience: [
    'target_general',
    'target_professional',
    'target_high_risk',
  ],
  common: [
    'priority_support',
    'unlimited_users',
    'max_users_50',
    'max_users_200',
    'national_csi_directory',
    'incident_hotline',
    'secure_badge',
  ],
};

export const ALL_FEATURES = Object.values(FEATURES).flat();

export function isValidFeatureToken(token: string) {
  if (!token) return false;
  if (token.includes(':')) {
    const [, feature] = token.split(':');
    return ALL_FEATURES.includes(feature);
  }
  return ALL_FEATURES.includes(token);
}

export function normalizeToToken(module: string, key: string) {
  return `${module}:${key}`;
}