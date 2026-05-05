# Free v2 — 智能化阶段 设计文档

**日期：** 2026-05-05
**状态：** 设计中
**基于：** [2026-05-04-free-design.md](./2026-05-04-free-design.md) v1 设计文档

---

## 1. 概述

v2 在 v1 手动录入基础上引入自动化智能层，核心目标：

- **市场行情接入**：对接公开行情 API，自动获取股票/基金/数字货币实时价格
- **价格自动更新**：服务端定时拉取 + 手动刷新，价格缓存与历史记录
- **收益归因**：基于交易记录计算时间加权收益率（TWR）和贡献度
- **动态再平衡提醒**：偏离度阈值可配置，超阈值触发浏览器通知

### 决策记录

| 决策项 | 选择 |
|--------|------|
| 行情范围 | 全部市场同时支持（A股/港股/美股/基金/数字货币） |
| 汇率 | 自动获取 + ExchangeRate 专用表，替换手工录入 |
| 更新机制 | 服务端 setInterval 定时（15min）+ 页面手动刷新 |
| 收益归因 | 完整版（Transaction 表 + TWR 计算） |
| 价格源架构 | 适配器模式，每市场一个实现 |
| 所有API Key | 免费方案，用户自行申请存入 server/.env |

---

## 2. 架构

```
前端 (React SPA, 5 个页面)
  ├── 资产总览 /（增强：价格徽章、刷新按钮）
  ├── FIRE 追踪 /（不变）
  ├── 配置分析 /（增强：偏离度阈值设置 + 提醒）
  ├── 收益归因 /returns（新增）
  └── 交易记录 /transactions（新增）

API 层 (Fastify, /api 前缀)
  ├── 既有端点不变（assets, liabilities, net-worth, fire-profile, allocation, snapshots）
  └── 新增端点（prices, exchange-rates, transactions, returns, rebalance-alerts）

服务层 (server/src/lib/)
  ├── PriceService.ts       价格源注册表 + 拉取调度
  ├── ExchangeRateService.ts 汇率拉取 + 缓存
  ├── ReturnCalculator.ts    TWR + 贡献度计算
  └── RebalanceChecker.ts    阈值偏离检测

适配器层 (server/src/lib/adapters/)
  ├── PriceAdapter.ts        接口定义
  ├── AStockAdapter.ts       东方财富 API
  ├── HStockAdapter.ts       港交所/东方财富
  ├── UStockAdapter.ts       Alpha Vantage
  ├── FundAdapter.ts         天天基金 API
  ├── CryptoAdapter.ts       CoinGecko API
  └── ExchangeRateAdapter.ts frankfurter.app (欧洲央行数据)

数据层 (PostgreSQL, Prisma)
  ├── 既有表不变（Asset, Liability, FireProfile, AllocationTarget, Snapshot）
  └── 新增表（MarketPrice, ExchangeRate, Transaction, RebalanceAlert）
```

---

## 3. 数据模型

### 3.1 Asset 表 — 新增字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `tickerSymbol` | String? | 交易代码，如 "600519", "AAPL" |
| `exchangeCode` | String? | 交易所：SH/SZ/HKEX/NYSE/NASDAQ/CRYPTO |
| `priceSource` | enum | MANUAL（默认）/ AUTO |
| `costBasis` | Float? | 总成本基数 = sum(买入 qty*price + 费用) |
| `priceUpdatedAt` | DateTime? | 上次价格更新时间 |

兼容性：现有资产的 tickerSymbol/exchangeCode/costBasis 默认为 null，priceSource 默认为 MANUAL。

### 3.2 MarketPrice（价格缓存）

| 字段 | 类型 | 说明 |
|------|------|------|
| tickerSymbol | String | 交易代码 |
| exchangeCode | String | 交易所 |
| name | String? | 资产名称 |
| currentPrice | Float | 当前价格 |
| previousClose | Float? | 前收盘价 |
| dayChange | Float? | 日内涨跌额 |
| dayChangePercent | Float? | 日内涨跌幅(%) |
| updatedAt | DateTime | 更新时间 |

PK: (tickerSymbol, exchangeCode)

### 3.3 ExchangeRate（汇率缓存）

| 字段 | 类型 | 说明 |
|------|------|------|
| fromCurrency | String | 源币种 |
| toCurrency | String | 目标币种，默认 CNY |
| rate | Float | 汇率 |
| updatedAt | DateTime | 更新时间 |

PK: (fromCurrency, toCurrency)

### 3.4 Transaction（交易记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | String | 用户 ID |
| assetId | UUID | FK → Asset |
| type | enum | BUY / SELL / DIVIDEND / FEE |
| date | DateTime | 交易日期 |
| quantity | Float? | 数量（分红/费用可为空） |
| price | Float? | 单价（分红/费用可为空） |
| amount | Float | 金额 |
| fee | Float? | 手续费，默认 0 |
| notes | String? | 备注 |
| createdAt | DateTime | |

### 3.5 RebalanceAlert（再平衡提醒配置）

| 字段 | 类型 | 说明 |
|------|------|------|
| userId | String | 用户 ID |
| category | String | 资产大类 |
| threshold | Float | 偏离度阈值(%)，默认 5 |
| enabled | Boolean | 是否启用 |

PK: (userId, category)

### 3.6 汇率处理迁移

- `properties.exchangeRate` 保留但标记 deprecated
- 计算函数优先查 ExchangeRate 表，未命中则 fallback 到 properties
- 新创建的资产不再写入 properties.exchangeRate

---

## 4. API 设计

### 4.1 价格服务 `/api/prices`

```
GET   /                    获取所有已缓存价格（MarketPrice 表全量）
POST  /refresh             手动刷新所有 priceSource=AUTO 的资产价格
POST  /refresh/:assetId    刷新单个资产价格
```

### 4.2 汇率服务 `/api/exchange-rates`

```
GET   /                    获取所有缓存汇率
POST  /refresh             刷新所有汇率（从 CNY 到所有 SUPPORTED_CURRENCIES）
```

### 4.3 交易记录 `/api/transactions`

```
GET   /                    交易列表（支持 ?assetId= 筛选）
POST  /                    新增交易（创建后自动重算该资产 costBasis）
PUT   /:id                 更新交易
DELETE /:id                删除交易（自动重算 costBasis）
```

### 4.4 收益分析 `/api/returns`

```
GET   /                    全量收益分析（支持 ?from=&to= 时间段筛选）
                           返回: { twr, totalReturn, perAsset: [{id, name, return, percent, contribution}] }
GET   /:assetId            单资产收益详情（含交易明细）
```

### 4.5 再平衡提醒 `/api/rebalance-alerts`

```
GET   /                    获取配置 + 当前偏离状态
PUT   /                    批量更新阈值配置
```

### 4.6 通用要求

- 所有接口按 userId 隔离
- JSON Schema 校验（Fastify schema 选项）
- 错误统一返回 `{ error: string, code: number }`

---

## 5. 适配器设计

### 5.1 PriceAdapter 接口

```typescript
interface PriceResult {
  tickerSymbol: string;
  exchangeCode: string;
  name?: string;
  currentPrice: number;
  previousClose?: number;
  dayChange?: number;
  dayChangePercent?: number;
  currency: string;
}

interface PriceAdapter {
  readonly name: string;
  fetchPrices(symbols: string[]): Promise<PriceResult[]>;
  fetchPrice(symbol: string): Promise<PriceResult>;
  isAvailable(): Promise<boolean>;
}
```

### 5.2 各市场实现

| 适配器 | 数据源 | 代码格式 | API Key |
|--------|--------|----------|---------|
| AStockAdapter | 东方财富 API | ticker: "600519", market: "SH" | 无需 |
| HStockAdapter | 东方财富/港交所 | ticker: "00700", market: "HKEX" | 无需 |
| UStockAdapter | Alpha Vantage | ticker: "AAPL", market: "NASDAQ" | 免费 Key |
| FundAdapter | 天天基金 API | ticker: "000001" | 无需 |
| CryptoAdapter | CoinGecko API | ticker: "BTC", market: "CRYPTO" | 无需 |
| ExchangeRateAdapter | frankfurter.app | from: "USD", to: "CNY" | 无需 |

### 5.3 容错策略

- 所有价格写入 MarketPrice 表缓存
- `isAvailable()` 拉前预检，不可用则跳过该市场
- 拉取失败记录 console.error，不回滚已成功的市场拉取
- 单一适配器故障不影响其他市场
- 价格更新间隔：股票/基金/数字货币 15 分钟，汇率 24 小时

### 5.4 调度

Fastify 启动时 `setInterval` 注册定时任务。无需外部 cron。服务器关闭时定时器自动销毁。

---

## 6. 前端

### 6.1 路由

```
/              资产总览（增强）
/fire           FIRE 追踪（不变）
/allocation     配置分析（增强：偏离度阈值 + 提醒）
/returns        收益归因（新增）
/transactions   交易记录（新增）
```

导航栏从 3 项扩展为 5 项。

### 6.2 新增 Hooks

| Hook | 职责 |
|------|------|
| usePrices | 获取缓存价格列表 + 刷新方法 |
| useTransactions | 交易 CRUD |
| useReturns | 收益分析数据 |
| useRebalanceAlerts | 提醒配置 + 触发状态 |

### 6.3 页面增强

**资产总览：**
- 资产列表每行显示当前价格 + 涨跌幅徽章（绿涨红跌）
- 顶部工具栏新增「刷新价格」按钮 + 显示最后刷新时间戳
- AssetForm 新增 ticker/交易所/价格来源 字段（仅当 category 支持市场数据时显示）

**配置分析：**
- 新增偏离度阈值设置（每个大类可设不同阈值，默认 5%）
- 超出阈值的大类卡片高亮（橙色边框/背景）
- 浏览器 Notification API 推送提醒（需用户授权）

### 6.4 新增页面

**收益归因 /returns：**
- TWR 总览卡片（组合时间加权收益率 + 时间段切换）
- 每资产收益率柱状图（正负着色）
- 资产收益明细列表（成本、市值、收益额、收益率、贡献度）

**交易记录 /transactions：**
- 交易列表（日期、资产、类型、数量、价格、金额、费用）
- 新增/编辑/删除交易弹窗
- 按资产筛选

---

## 7. TWR 计算

时间加权收益率（TWR）排除现金流影响，反映纯投资回报。

### 算法

```
将考察期按现金流事件（买入/卖出/分红）分为 N 个子周期
每个子周期收益 = (期末值 - 期初值 - 现金流入 + 现金流出) / 期初值
TWR = [(1+R1) × (1+R2) × ... × (1+Rn)] - 1
```

### 实现要点

- 子周期期初值 = 上次现金流事件后的持仓市值
- 买入 = 现金流入（增加持仓），卖出/分红 = 现金流出（减少持仓）
- costBasis 每次买入后更新：`costBasis += quantity × price + fee`
- 卖出后 costBasis 按比例减少：`costBasis -= (soldQty / totalQty) × costBasis`

---

## 8. 非功能需求

- 适配器接口设计确保新增市场只需加一个文件
- 价格缓存避免重复请求外部 API（缓存有效期 15 分钟）
- 前端骨架屏（Skeleton）用于价格加载状态
- 所有外部 API 调用有超时（10 秒）
- 生产环境下 HTTPS 保护价格数据

---

## 9. 不包含（v3+）

- 多策略对比引擎
- 未来事件场景模拟（Monte Carlo）
- 经济周期因子分析
- 税务优化
- 多用户登录系统
- 移动端 App
