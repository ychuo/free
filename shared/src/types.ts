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

export enum PriceSource {
  MANUAL = 'MANUAL',
  AUTO = 'AUTO',
}

export enum TrackType {
  VALUE = 'value',
  MOMENTUM = 'momentum',
  UNCLASSIFIED = 'unclassified',
}

export const TRACK_LABELS: Record<TrackType, string> = {
  [TrackType.VALUE]: '价值仓',
  [TrackType.MOMENTUM]: '卫星仓',
  [TrackType.UNCLASSIFIED]: '未分类',
};

export const EXCHANGE_CODES = ['SH', 'SZ', 'HKEX', 'NYSE', 'NASDAQ', 'FUND', 'CRYPTO'] as const;
export type ExchangeCode = (typeof EXCHANGE_CODES)[number];

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  subType: string | null;
  tickerSymbol: string | null;
  exchangeCode: string | null;
  priceSource: PriceSource;
  track: TrackType;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  currency: string;
  costBasis: number | null;
  passiveIncome: number | null;
  properties: Record<string, unknown> | null;
  acquiredAt: string | null;
  notes: string | null;
  priceUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetInput {
  name: string;
  category: AssetCategory;
  subType?: string;
  tickerSymbol?: string;
  exchangeCode?: string;
  track?: TrackType;
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
    tickerSymbol: { type: 'string' },
    exchangeCode: { type: 'string' },
    priceSource: { type: 'string' },
    track: { type: 'string', enum: Object.values(TrackType) },
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
    track?: string;
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

// === v2: Price & Market ===

export interface MarketPrice {
  tickerSymbol: string;
  exchangeCode: string;
  name: string | null;
  currentPrice: number;
  previousClose: number | null;
  dayChange: number | null;
  dayChangePercent: number | null;
  updatedAt: string;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  updatedAt: string;
}

// === v2: Transactions ===

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  DIVIDEND = 'DIVIDEND',
  FEE = 'FEE',
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.BUY]: '买入',
  [TransactionType.SELL]: '卖出',
  [TransactionType.DIVIDEND]: '分红',
  [TransactionType.FEE]: '费用',
};

export interface Transaction {
  id: string;
  userId: string;
  assetId: string;
  type: TransactionType;
  date: string;
  quantity: number | null;
  price: number | null;
  amount: number;
  fee: number | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateTransactionInput {
  assetId: string;
  type: TransactionType;
  date: string;
  quantity?: number | null;
  price?: number | null;
  amount: number;
  fee?: number | null;
  notes?: string | null;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {}

// === v2: Returns ===

export interface AssetReturn {
  assetId: string;
  assetName: string;
  category: AssetCategory;
  costBasis: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  contribution: number;
  contributionPercent: number;
}

export interface ReturnAnalysis {
  twr: number | null;
  totalReturn: number;
  totalReturnPercent: number;
  perAsset: AssetReturn[];
  from: string;
  to: string;
}

// === v2: Rebalance Alerts ===

export interface RebalanceAlert {
  userId: string;
  category: AssetCategory;
  threshold: number;
  enabled: boolean;
}

export interface RebalanceAlertStatus {
  category: AssetCategory;
  currentRatio: number;
  targetRatio: number;
  deviation: number;
  threshold: number;
  enabled: boolean;
  triggered: boolean;
}

export interface UpdateRebalanceAlertsInput {
  alerts: { category: AssetCategory; threshold: number; enabled: boolean }[];
}

// === v2: JSON Schemas ===

export const TRANSACTION_SCHEMA = {
  type: 'object',
  required: ['assetId', 'type', 'date', 'amount'],
  properties: {
    assetId: { type: 'string', minLength: 1 },
    type: { type: 'string', enum: Object.values(TransactionType) },
    date: { type: 'string' },
    quantity: { type: 'number' },
    price: { type: 'number' },
    amount: { type: 'number' },
    fee: { type: 'number' },
    notes: { type: 'string' },
  },
  additionalProperties: false,
} as const;

export const REBALANCE_ALERTS_SCHEMA = {
  type: 'object',
  required: ['alerts'],
  properties: {
    alerts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['category', 'threshold', 'enabled'],
        properties: {
          category: { type: 'string', enum: Object.values(AssetCategory) },
          threshold: { type: 'number', minimum: 1, maximum: 50 },
          enabled: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
} as const;

export interface StrategyTemplate {
  id: string;
  name: string;
  type: 'value' | 'momentum';
  description: string;
  suitableFor: string;
  indicators: string[];
  allocation: Record<string, number>;
  examples: string[] | null;
  riskLevel: 'low' | 'medium' | 'high';
}

// === v3: Market Data ===

export interface ValuationItem {
  sector: string;
  changePercent: number;
  netInflow: number;
  upCount: number;
  downCount: number;
  leadingStock: string;
  leadingStockChange: number;
  updatedAt: string;
}

export interface ConceptItem {
  name: string;
  driverEvent: string;
  leadingStock: string;
  stockCount: number;
}

export interface FundFlowData {
  northBound: {
    daily: number;
    weekly: number;
  };
  marketFlow: {
    mainNetInflow: number;
    mainNetPct: number;
    superLarge: number;
    large: number;
    medium: number;
    small: number;
    shIndex: number;
    shChange: number;
    szIndex: number;
    szChange: number;
  };
  sectorFlow: Array<{
    sector: string;
    netInflow: number;
    direction: 'inflow' | 'outflow';
  }>;
}

export interface MarketIndicator {
  id: string;
  market: string;
  indicatorType: 'valuation' | 'concept' | 'fund_flow';
  category: string;
  data: unknown;
  fetchedAt: string;
}

export interface PortfolioAlert {
  assetName: string;
  assetTrack: string;
  sector: string;
  currentPE: number;
  pePercentile: number;
  alertType: 'undervalued' | 'overvalued';
  message: string;
}
