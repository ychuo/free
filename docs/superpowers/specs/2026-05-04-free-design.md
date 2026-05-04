# Free - 个人资产配置管理应用 设计文档

**日期：** 2026-05-04
**状态：** 设计中

---

## 1. 项目概述

**定位：** 资产配置决策辅助系统，帮助用户在多类别资产中看清全貌、追踪 FIRE 进度、分析配置偏离度并给出再平衡建议。

**核心理念：** 财务自由（FIRE）= 被动投资收入覆盖年生活支出。在达成临界点的基础上持续优化配置实现净资产最大化。应用本身不预设投资流派，让用户在动态环境中逐步形成自己的配置方法论。

**应用名称：** free — 通过财务自由找到人生自由。

---

## 2. 设计决策摘要

| 决策项 | 选择 |
|--------|------|
| 平台 | Web 优先，后续考虑移动端 |
| 用户模型 | v1 单用户，架构预留多用户 |
| 资产范围 | 多元资产（股票、基金、期权、房产、数字货币、贵金属、现金等） |
| 价格数据 | v1 手动录入，资产模型预留 price source 接口 |
| 技术架构 | 前后端分离（React + Node.js + PostgreSQL） |
| FIRE 模型 | 被动收入 ≥ 年支出为达标线，支持自定义提取率 |

---

## 3. 技术栈

| 层 | 选型 | 说明 |
|---|------|------|
| 运行时 | Bun | 快速、原生 TypeScript、内置打包 |
| 构建 | Turborepo | monorepo 编排 |
| 前端 | React + TypeScript | 生态好、类型安全、可迁 React Native |
| 样式 | Tailwind CSS v4 (@tailwindcss/vite) + shadcn/ui | Vite 原生插件、组件丰富、暗色模式 |
| 图表 | Recharts | 饼图、面积图、柱状图 |
| 后端 | Fastify | 高性能、TypeScript 原生支持 |
| 数据库 | PostgreSQL | JSON 字段灵活、分析查询强 |
| ORM | Prisma | 类型安全、迁移管理 |

**多用户预留策略：** 所有表带 `user_id`，v1 硬编码单用户 ID，查询已带条件。后期引入 auth 后加中间件注入即可。

---

## 4. 数据模型

### 4.1 资产大类枚举

```
AssetCategory:
  cash          - 现金及等价物
  fixed_income  - 固定收益（存款、债券）
  equity        - 权益类（股票、基金、期权/股权激励）
  real_estate   - 不动产
  crypto        - 数字货币
  precious      - 贵金属
  other         - 其他
```

### 4.2 核心实体

**Asset（资产）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 ID |
| name | text | 资产名称 |
| category | enum | 大类 |
| sub_type | text? | 子类别（stock/fund/option 等） |
| quantity | decimal | 持有数量/份额 |
| unit_price | decimal | 当前单价 |
| total_value | decimal | 市值（可自动计算） |
| currency | text | 币种（CNY/USD 等） |
| passive_income | decimal? | 该资产产生的年被动收入（股息、租金等） |
| properties | jsonb? | 扩展属性（期权行权价、归属期等） |
| acquired_at | date? | 购入时间 |
| notes | text? | 备注 |
| created_at | timestamp | |
| updated_at | timestamp | |

**Liability（负债）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 ID |
| name | text | 负债名称 |
| type | enum | 类型（mortgage/consumer/other） |
| total_amount | decimal | 原始总负债额 |
| remaining | decimal | 剩余本金 |
| interest_rate | decimal? | 年利率 |
| monthly_payment | decimal? | 月供 |
| created_at | timestamp | |
| updated_at | timestamp | |

**FIREProfile（自由目标）**
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | UUID | 主键，每个用户一条 |
| annual_expense | decimal | 年生活支出目标 |
| safe_withdrawal_rate | decimal | 安全提取率（默认 4%） |
| fire_target | decimal | 达标金额 = annual_expense / rate |
| created_at | timestamp | |
| updated_at | timestamp | |

**AllocationTarget（目标配置）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 ID |
| category | enum | 资产大类 |
| target_ratio | decimal | 目标占比（百分比） |
| updated_at | timestamp | |

**Snapshot（资产快照）**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 ID |
| snapshot_date | date | 快照日期 |
| total_assets | decimal | 总资产 |
| total_liabilities | decimal | 总负债 |
| net_worth | decimal | 净资产 |
| breakdown | jsonb | 各大类资产明细 |
| created_at | timestamp | |

---

## 5. API 设计

### 5.1 资产管理
```
GET    /api/assets              资产列表（支持?category=筛选）
POST   /api/assets              新增资产
PUT    /api/assets/:id          更新资产
DELETE /api/assets/:id          删除资产
```

### 5.2 负债管理
```
GET    /api/liabilities         负债列表
POST   /api/liabilities         新增负债
PUT    /api/liabilities/:id     更新负债
DELETE /api/liabilities/:id     删除负债
```

### 5.3 净资产
```
GET    /api/net-worth            当前净资产汇总
GET    /api/net-worth/history    历史快照列表
```

### 5.4 FIRE 目标
```
GET    /api/fire-profile         获取 FIRE 设定
PUT    /api/fire-profile         更新 FIRE 设定
GET    /api/fire-progress        当前进度（覆盖度、达标百分比、预计时间）
```

### 5.5 配置分析
```
GET    /api/allocation-targets   获取目标配置比例
PUT    /api/allocation-targets   更新目标配置（批量）
GET    /api/allocation-analysis  偏离度分析（当前 vs 目标）
```

### 5.6 快照
```
POST   /api/snapshots            生成当前快照
GET    /api/snapshots            快照历史列表
```

### 5.7 通用要求
- 所有接口内部按 `user_id` 隔离
- 请求/响应统一 JSON
- 错误返回 `{ error: string, code: number }`

---

## 6. 前端页面结构

```
导航栏：资产总览 | FIRE 追踪 | 配置分析
       [默认首页：资产总览]

资产总览 /
├── 净资产卡片（总资产 - 总负债 = 净资产，环比变化）
├── 资产大类分布图（饼图/柱状图）
├── 资产明细列表（按大类分组，增删改）
├── 负债明细列表
└── 生成快照

FIRE 追踪 /
├── 目标面板（年支出、提取率、达标金额）
├── 被动收入汇总
├── 覆盖度指示器（被动收入 / 年支出 × 100%）
├── 预计达标时间估算
└── 目标设定编辑

配置分析 /
├── 目标配置比例设定
├── 当前 vs 目标并排对比（偏离度颜色标注）
├── 再平衡建议清单
└── 历史配置变化趋势图
```

---

## 7. v1 范围

### 7.1 包含
- 多元资产 CRUD（支持大类 + 子类型 + 扩展属性）
- 负债管理
- 净资产总览仪表盘
- FIRE 目标设定与进度追踪
- 目标配置比例设定
- 偏离度分析
- 再平衡建议（加减什么、加减多少）
- 手动资产快照
- 暗色模式

### 7.2 不包含（v2+）
- 市场行情数据接入
- 经济周期因子分析
- 社会事件影响评估
- 未来事件场景模拟（买房、生娃、换工作）
- 多策略对比引擎
- 自动价格更新
- 多用户登录系统
- 定时再平衡提醒
- 数据导出/导入

---

## 8. 长期路线（核心）

这部分是 free 的长期灵魂，v1 架构上需要提前考虑：

### v2：智能化
- **市场行情接入**：对接公开行情 API（股票/基金价格、数字货币价格）
- **价格自动更新**：可配置的定时拉取 + 手动刷新
- **动态再平衡提醒**：基于偏离度阈值自动触发通知
- **收益归因**：每笔资产的收益率、对总增值的贡献度

### v3：决策引擎
- **经济周期识别**：基于宏观经济指标（利率、CPI、PMI）判断当前周期位置
- **资产配置策略引擎**：支持多种经典策略（永久组合、全天候、60/40 等）并对比
- **自适应建议**：根据用户年龄、风险偏好、市场环境动态调整目标比例
- **事件驱动调整**：重大事件（政策变动、市场崩盘、加息周期）触发配置审视

### v4：场景模拟与优化
- **未来事件规划**：用户定义未来节点（买房首付、教育支出、退休），模拟现金流
- **Monte Carlo 模拟**：基于历史数据模拟不同配置路径的成功概率
- **压力测试**：极端市场条件下的回撤和恢复分析
- **税务优化**：不同资产类别的税负影响

---

## 9. 非功能需求

- **数据安全**：资产数据极度敏感，所有 API 需 HTTPS，数据库加密存储
- **类型安全**：前后端共享 TypeScript 类型定义
- **响应式设计**：桌面端为主，移动端可用
- **暗色模式**：必须支持，用户长时间看数据
- **架构可扩展**：预留 price_source 字段用于 v2 行情接入；预留 user_id 用于多用户
