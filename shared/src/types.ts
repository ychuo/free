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

export const ASSET_SCHEMA = {
  type: 'object',
  required: ['name', 'category', 'quantity', 'unitPrice'],
  properties: {
    name: { type: 'string', minLength: 1 },
    category: { type: 'string', enum: Object.values(AssetCategory) },
    subType: { type: 'string' },
    quantity: { type: 'number' },
    unitPrice: { type: 'number' },
    currency: { type: 'string' },
    passiveIncome: { type: 'number' },
    properties: { type: 'object' },
    acquiredAt: { type: 'string' },
    notes: { type: 'string' },
  },
  additionalProperties: false,
} as const;

export const LIABILITY_SCHEMA = {
  type: 'object',
  required: ['name', 'type', 'totalAmount', 'remaining'],
  properties: {
    name: { type: 'string', minLength: 1 },
    type: { type: 'string', enum: Object.values(LiabilityType) },
    totalAmount: { type: 'number' },
    remaining: { type: 'number' },
    interestRate: { type: 'number' },
    monthlyPayment: { type: 'number' },
  },
  additionalProperties: false,
} as const;

export const FIRE_PROFILE_SCHEMA = {
  type: 'object',
  required: ['annualExpense', 'safeWithdrawalRate'],
  properties: {
    annualExpense: { type: 'number', minimum: 0 },
    safeWithdrawalRate: { type: 'number', minimum: 0, maximum: 1 },
  },
  additionalProperties: false,
} as const;

export const SUPPORTED_CURRENCIES: Record<string, string> = {
  CNY: '人民币 (CNY)',
  USD: '美元 (USD)',
  HKD: '港币 (HKD)',
  EUR: '欧元 (EUR)',
  JPY: '日元 (JPY)',
  GBP: '英镑 (GBP)',
};

export const DEFAULT_CURRENCY = 'CNY';

export interface ExportData {
  version: 1;
  exportedAt: string;
  assets: Array<{
    name: string;
    category: string;
    subType?: string;
    quantity: number;
    unitPrice: number;
    currency: string;
    passiveIncome?: number;
    properties?: Record<string, unknown>;
    acquiredAt?: string;
    notes?: string;
  }>;
  liabilities: Array<{
    name: string;
    type: string;
    totalAmount: number;
    remaining: number;
    interestRate?: number;
    monthlyPayment?: number;
  }>;
  fireProfile: {
    annualExpense: number;
    safeWithdrawalRate: number;
  } | null;
  allocationTargets: Array<{
    category: string;
    targetRatio: number;
  }>;
}

export const ALLOCATION_TARGETS_SCHEMA = {
  type: 'object',
  required: ['targets'],
  properties: {
    targets: {
      type: 'array',
      items: {
        type: 'object',
        required: ['category', 'targetRatio'],
        properties: {
          category: { type: 'string', enum: Object.values(AssetCategory) },
          targetRatio: { type: 'number', minimum: 0, maximum: 100 },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
} as const;
