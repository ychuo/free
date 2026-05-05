export enum AssetCategory {
  CASH = 'cash',
  FIXED_INCOME = 'fixed_income',
  EQUITY = 'equity',
  REAL_ESTATE = 'real_estate',
  CRYPTO = 'crypto',
  PRECIOUS = 'precious',
  OTHER = 'other',
}

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  [AssetCategory.CASH]: '现金',
  [AssetCategory.FIXED_INCOME]: '固收',
  [AssetCategory.EQUITY]: '权益',
  [AssetCategory.REAL_ESTATE]: '不动产',
  [AssetCategory.CRYPTO]: '数字货币',
  [AssetCategory.PRECIOUS]: '贵金属',
  [AssetCategory.OTHER]: '其他',
};

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  subType: string | null;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  currency: string;
  passiveIncome: number | null;
  properties: Record<string, unknown> | null;
  acquiredAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetInput {
  name: string;
  category: AssetCategory;
  subType?: string;
  quantity: number;
  unitPrice: number;
  currency?: string;
  passiveIncome?: number;
  properties?: Record<string, unknown>;
  acquiredAt?: string;
  notes?: string;
}

export interface UpdateAssetInput extends Partial<CreateAssetInput> {}

export enum LiabilityType {
  MORTGAGE = 'mortgage',
  CONSUMER = 'consumer',
  OTHER = 'other',
}

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  totalAmount: number;
  remaining: number;
  interestRate: number | null;
  monthlyPayment: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLiabilityInput {
  name: string;
  type: LiabilityType;
  totalAmount: number;
  remaining: number;
  interestRate?: number;
  monthlyPayment?: number;
}

export interface UpdateLiabilityInput extends Partial<CreateLiabilityInput> {}

export interface FireProfile {
  annualExpense: number;
  safeWithdrawalRate: number;
  fireTarget: number;
}

export interface UpdateFireProfileInput {
  annualExpense: number;
  safeWithdrawalRate: number;
}

export interface FireProgress {
  annualExpense: number;
  safeWithdrawalRate: number;
  fireTarget: number;
  annualPassiveIncome: number;
  coverageRate: number;
  netWorth: number;
  gap: number;
}

export interface AllocationTarget {
  id: string;
  category: AssetCategory;
  targetRatio: number;
}

export interface UpdateAllocationTargetsInput {
  targets: { category: AssetCategory; targetRatio: number }[];
}

export interface AllocationAnalysis {
  category: AssetCategory;
  currentValue: number;
  currentRatio: number;
  targetRatio: number;
  deviation: number;
  rebalanceAmount: number;
}

export interface NetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  previousNetWorth: number | null;
  change: number | null;
  changePercent: number | null;
  categoryBreakdown: Record<AssetCategory, number>;
}

export interface Snapshot {
  id: string;
  snapshotDate: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  breakdown: Record<AssetCategory, number>;
  createdAt: string;
}

export interface ApiError {
  error: string;
  code: number;
}
