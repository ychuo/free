# Free v3 — 投资决策辅助系统 设计文档

**日期：** 2026-05-06
**状态：** 设计确认
**前序文档：** [2026-05-04-free-design.md](./2026-05-04-free-design.md)（v1/v2 基础设计）

---

## 1. v3 定位

### 1.1 版本演进

| 版本 | 定位 | 状态 |
|------|------|------|
| v1 | 资产配置追踪：CRUD + 净值 + FIRE + 配置偏离度 | ✅ 完成 |
| v2 | 数据自动化：行情接入 + 自动价格 + 收益归因 + 再平衡提醒 | ✅ 完成 |
| **v3** | **伴随用户成长的投资决策辅助系统** | 🎯 当前 |
| v4+ | 场景模拟 + 压力测试 + 全球市场扩展 | 🔮 未来 |

### 1.2 v3 核心转变

v1/v2 是**记录型系统** — 告诉用户"你的资产现状是什么"。
v3 升级为**决策辅助系统** — 告诉用户"你可以做什么、为什么、怎么做"。

### 1.3 设计原则

1. **双轨制** — 价值轨道（核心仓）和动量轨道（卫星仓）泾渭分明，系统永远标注信号来源
2. **三层递进** — 策略基础 → 市场脉搏 → 信号引擎，三层共存，用户从入门到进阶自然成长
3. **市场插件化** — 数据源按市场抽象接口，v3 仅实现 A 股插件，架构预留全球插槽
4. **价值投资为底色** — 信号评分以估值+质量+护城河为核心，热点信号作为卫星仓补充
5. **教育优先于信号** — 每个策略、每个指标附带解释，系统帮助用户理解"为什么"而非仅给结论

---

## 2. 双轨架构

### 2.1 两条轨道

| | 价值轨道（核心仓） | 动量轨道（卫星仓） |
|---|---|---|
| **目标** | 长期复利，安全边际 | 短期超额，热点套利 |
| **仓位建议** | 总仓位的 70-80% | 总仓位的 20-30% |
| **信号评分** | ValueScore（估值+质量+护城河） | HotScore（量价+资金+热度） |
| **持有周期** | 年为单位 | 周到月为单位 |
| **买入触发** | 估值进入历史低分位 + 生意质量好 | 资金异常 + 概念升温 + 趋势确认 |
| **卖出触发** | 估值进入历史高分位 或 基本面恶化 | 趋势衰减 + 热度退潮 + 止损线 |
| **标的类型** | 行业龙头、ETF、白马股 | 概念板块成分股、行业 ETF |
| **策略模板** | 深度价值/GARP/红利增长/质量护城河 | 事件驱动/板块轮动/趋势跟踪 |

### 2.2 数据模型变更

Asset 表新增 `track` 字段：

```
track: 'value' | 'momentum' | 'unclassified'  // 默认 'unclassified'
```

现有 v1/v2 功能不受影响，前端按 track 分组展示，信号和建议按 track 分流。

---

## 3. 三层递进架构

```
                       ┌─────────────────────────┐
                       │  信号引擎层（v3.3）       │
                       │  ValueScore + HotScore   │
                       │  价值发现榜 + 热点榜       │
                       │  提前量判断 + 预警推送     │
                       ├─────────────────────────┤
                       │  市场脉搏层（v3.2）       │
                       │  估值水位图 + 行业景气度   │
                       │  概念板块热度 + 价值过滤   │
                       │  持仓关联提醒              │
                       ├─────────────────────────┤
                       │  策略基础层（v3.1）       │
                       │  价值策略模板 + 一键配置   │
                       │  热点策略模板              │
                       │  投资知识引导              │
                       └─────────────────────────┘

         三层始终共存，用户在不同阶段关注不同层
```

---

## 4. 市场插件化架构

### 4.1 MarketDataAdapter 接口

参照现有 `PriceAdapter` 模式，定义市场数据适配器接口：

```typescript
interface MarketDataAdapter {
  readonly market: string;          // 'A_STOCK' | 'US_STOCK' | 'HK_STOCK' | 'CRYPTO'
  readonly name: string;

  // 估值数据
  getValuationData(symbol: string): Promise<ValuationData>;
  getSectorValuation(): Promise<SectorValuation[]>;

  // 板块/概念数据
  getConceptBoards(): Promise<ConceptBoard[]>;
  getBoardConstituents(boardId: string): Promise<Constituent[]>;

  // 资金流向
  getFundFlow(symbol: string, days: number): Promise<FundFlowData>;

  // 市场情绪
  getMarketSentiment(): Promise<MarketSentiment>;

  isAvailable(): Promise<boolean>;
}
```

### 4.2 v3 实现：A 股插件

| 适配器 | 数据源 | 实现接口 |
|--------|--------|---------|
| `AStockMarketAdapter` | AKShare（Python 子进程调用） | 估值 + 概念板块 + 资金流向 + 情绪 |
| `DCTHSAdapter` | FinanceMCP-DCTHS（npx 子进程） | 概念板块 + 行业指数 |

AKShare 是 Python 库，通过 `child_process.spawn` 调用 Python 脚本获取 JSON 结果。FinanceMCP-DCTHS 同理。两者的子进程调用模式统一封装。

### 4.3 未来扩展插槽

| 市场 | 适配器 | 数据源 | 优先级 |
|------|--------|--------|--------|
| 美股 | `USStockMarketAdapter` | Polygon.io / Alpha Vantage | v4 |
| 港股 | `HKStockMarketAdapter` | AKShare（港股数据） | v4 |
| Crypto | `CryptoMarketAdapter` | 现有 CryptoAdapter 扩展 | v4 |

### 4.4 数据源总览

| 数据源 | 用途 | 成本 | 状态 |
|--------|------|------|------|
| AKShare | A 股概念板块 + 估值 + 资金流向 + 龙虎榜 | 免费 | v3 新增 |
| FinanceMCP-DCTHS | 同花顺/东财板块指数 + 成分股 | 免费 | v3 新增 |
| Alpha Vantage | 汇率 + NEWS_SENTIMENT（备用） | 免费(已有) | 已有 |

---

## 5. 功能分期

### 5.1 v3.1 — 策略基础层

**目标：** 帮助用户建立投资框架，从"不知道该买什么"到"有清晰的配置方案"。

**功能清单：**

1. **策略探索页 `/strategies`**
   - 价值策略模板：深度价值、GARP、红利增长、质量护城河
   - 动量策略模板：事件驱动、板块轮动、趋势跟踪
   - 每个模板展示：核心理念、适合谁、关键指标、A 股示例标的
   - 策略对比视图：并排展示 2-3 个策略的差异

2. **一键配置导入**
   - 选择策略 → 预览行业/大类配置比例 → 确认导入为 AllocationTarget
   - 导入后自动触发 allocation-analysis 刷新

3. **Asset track 标签**
   - AssetForm 新增 track 选择（价值仓/卫星仓/未分类）
   - AssetList 按 track 分组展示，价值仓和卫星仓分开显示净值贡献

4. **仓位分配仪表盘**
   - 在 AssetOverview 新增仓位比例卡片：价值仓 vs 卫星仓占比
   - 偏离目标比例时给出调整提示

**新增数据模型：**

```prisma
model StrategyTemplate {
  id          String   @id @default(uuid())
  name        String                    // 策略名称
  type        String                    // 'value' | 'momentum'
  description String                    // 核心理念（中文）
  suitableFor String                    // 适合什么人（中文）
  indicators  Json                      // 关键指标列表
  allocation  Json                      // 建议配置比例 {category: ratio}
  examples    Json?                     // A股示例标的
  riskLevel   String                    // 'low' | 'medium' | 'high'
  createdAt   DateTime @default(now())
}
```

策略模板数据通过 seed 脚本预置，不提供用户编辑能力（v3.1）。

---

### 5.2 v3.2 — 市场脉搏层

**目标：** 让用户感知当前市场环境，知道"现在处于什么位置、什么被低估了"。

**功能清单：**

1. **市场脉搏页 `/market-pulse`**
   - 估值水位仪表盘：各行业当前 PE/PB 在历史分位数中的位置（热力图或柱状图）
   - 盈利质量扫描：ROE > 15% 且稳定的行业/标的
   - 概念板块热度榜 + 价值过滤开关（"只看基本面支撑的"）
   - 资金流向概览：北向资金、主力资金净流入/流出

2. **行业详情面板**
   - 点击行业 → 展开：估值趋势图、成分股列表、近期催化剂
   - 标注"当前处于低估/合理/高估区间"

3. **持仓关联提醒**
   - 基于用户持仓 track 标签，匹配对应的市场信号
   - 价值仓：提醒持仓行业估值是否大幅偏离
   - 卫星仓：提醒概念板块是否升温或退潮

**新增/变更数据模型：**

```prisma
model MarketIndicator {
  id          String   @id @default(uuid())
  market      String   @default("A_STOCK")  // 市场标识
  indicatorType String  // 'valuation' | 'fund_flow' | 'sentiment' | 'concept'
  category    String                         // 行业/概念名称
  data        Json                           // 指标数据
  fetchedAt   DateTime @default(now())

  @@index([market, indicatorType])
  @@index([fetchedAt])
}
```

MarketIndicator 作为缓存层存储拉取的市场数据，避免每次请求都调外部 API。

---

### 5.3 v3.3 — 信号引擎层

**目标：** 主动发现机会，输出可执行的决策参考。

**功能清单：**

1. **信号发现页 `/signals`**
   - 双轨榜单切换：价值发现榜 / 热点信号榜
   - 价值发现榜：基于 ValueScore 排序的行业/标的
   - 热点信号榜：基于 HotScore 排序的概念板块
   - 每个信号展示：得分、关键因子拆解、提前量标签

2. **提前量评分系统**
   - 早期：信号刚出现，资金和舆情刚开始升温，风险高收益潜力大
   - 中期：趋势已确认，多个信号源交叉验证，风险收益平衡
   - 末期：热度顶峰或开始衰退，追高风险大
   - 判断逻辑：综合提及增速斜率、资金流入加速度、估值分位变化

3. **信号评分公式**

   **ValueScore（价值轨道）：**
   ```
   ValueScore = 0.35 × 估值安全边际（PE/PB 分位取反）
              + 0.30 × 生意质量（ROE 稳定性 + 毛利率水平）
              + 0.20 × 护城河信号（行业地位 + 现金流质量）
              + 0.15 × 催化剂（景气改善 + 政策利好）
   ```
   输出 0-100 分，>70 进入价值发现榜。

   **HotScore（动量轨道）：**
   ```
   HotScore = 0.30 × 概念热度（提及增速 + 搜索量变化）
            + 0.30 × 资金信号（成交量异常 + 主力净流入）
            + 0.20 × 趋势强度（连续上涨天数 + 突破均线）
            + 0.20 × 情绪信号（新闻正向率 + 讨论活跃度）
   ```
   输出 0-100 分，>70 进入热点信号榜，附带提前量标签。

4. **信号预警推送**
   - 当持仓标的/相关板块触发信号时，系统 toast 通知
   - 价值轨道预警："XX 进入近 3 年估值低点，ValueScore 85"
   - 动量轨道预警："XX 概念板块资金异常流入，热度飙升，提前量：早期"
   - 预警阈值用户可配置

5. **仓位分配建议**
   - 基于市场环境（估值水位 + 波动率）建议当前核心/卫星比例
   - 极度低估时建议提高核心仓比重，过热时建议收敛卫星仓

**新增数据模型：**

```prisma
model SignalRecord {
  id          String   @id @default(uuid())
  market      String   @default("A_STOCK")
  track       String                       // 'value' | 'momentum'
  targetCode  String                       // 行业/概念/标的代码
  targetName  String                       // 显示名称
  score       Float                        // ValueScore 或 HotScore
  factors     Json                         // 评分因子拆解
  stage       String                       // 'early' | 'mid' | 'late'
  triggeredAt DateTime @default(now())

  @@index([market, track])
  @@index([triggeredAt])
}

model SignalAlert {
  id          String   @id @default(uuid())
  userId      String   @default("default")
  signalId    String
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([userId, read])
}
```

---

## 6. 页面结构更新

```
导航栏：资产总览 | FIRE 追踪 | 配置分析 | 收益归因 | 交易记录 | 策略 | 市场脉搏 | 信号
                         [v1/v2 已有]                [v3 新增]

策略探索 /strategies
├── 策略类型切换（价值/动量）
├── 策略模板卡片（核心理念 + 关键指标 + 示例）
├── 策略对比视图
└── 一键导入配置按钮

市场脉搏 /market-pulse
├── 估值水位热力图
├── 行业景气度面板
├── 概念板块热度榜（价值过滤开关）
├── 资金流向概览
└── 持仓关联提醒

信号发现 /signals
├── 双轨榜单切换（价值发现 / 热点信号）
├── 信号因子拆解
├── 提前量标签（早期/中期/末期）
├── 信号预警配置
└── 仓位分配建议
```

---

## 7. 路由与 API 设计

### 7.1 新增 API

```
策略模板
GET    /api/strategies              策略模板列表（?type=value|momentum）
GET    /api/strategies/:id          策略模板详情

市场数据
GET    /api/market-data/valuation   估值水位数据（?sector=）
GET    /api/market-data/concepts    概念板块热度（?filter=fundamental）
GET    /api/market-data/fund-flow   资金流向概览
GET    /api/market-data/sentiment   市场情绪指标

信号引擎
GET    /api/signals                 信号列表（?track=value|momentum&stage=）
GET    /api/signals/:id             信号详情+因子拆解
GET    /api/signal-alerts           预警列表
PUT    /api/signal-alerts           更新预警配置
PUT    /api/signal-alerts/:id/read  标记已读

仓位建议
GET    /api/portfolio/advice        仓位分配建议
```

### 7.2 Asset 模型变更

```
PUT /api/assets/:id  请求体新增 track 字段（可选：'value' | 'momentum'）
GET /api/assets      响应新增 track 字段
```

---

## 8. 非功能需求

- **AKShare Python 调用**：通过 `child_process.spawn` 调用，5 秒超时，失败降级返回缓存数据
- **市场数据缓存**：MarketIndicator 表缓存，估值数据 TTL 24h，概念热度 TTL 1h
- **信号计算**：服务端定时计算（每小时），结果写 SignalRecord 表，前端只读
- **数据安全**：延续 v1/v2 策略，所有数据 userId 隔离
- **暗色模式**：新页面全部支持
- **响应式**：桌面端为主，移动端可用

---

## 9. 与原有设计文档的差异

原 [2026-05-04-free-design.md](./2026-05-04-free-design.md) 第 8 节定义了 v3 为"决策引擎"（经济周期识别 + 策略引擎 + 自适应建议 + 事件驱动调整）。

本次设计将原 v3 四大模块重新定位：

| 原 v3 模块 | 新 v3 中的位置 | 变化说明 |
|-----------|---------------|---------|
| 经济周期识别 | 市场脉搏层的一部分（估值水位 + 行业景气） | 从独立深度模型简化为轻量市场感知 |
| 策略引擎 | 策略基础层核心（策略模板 + 一键配置） | 从多策略对比引擎转变为引导式策略教育 |
| 自适应建议 | 信号引擎层 + 仓位分配建议 | 从风险偏好驱动转变为双轨信号驱动 |
| 事件驱动调整 | 信号引擎层（催化剂因子） | 从用户手动记录转变为系统自动感知 |

新增能力：
- 双轨制（价值 + 动量）贯穿三层
- 策略模板系统 + 一键导入
- 市场插件化架构
- ValueScore / HotScore 双评分引擎
- 提前量评分（早期/中期/末期）
- 持仓关联匹配
- 仓位分配建议

---

## 10. v4+ 展望

- **全球市场扩展**：基于 MarketDataAdapter 接口实现美股/港股/crypto 插件
- **场景模拟**：Monte Carlo 模拟 + 压力测试（原设计 doc v4）
- **税务优化**：不同资产类别的税负影响
- **社交信号**：雪球/微博讨论热度接入
- **KOL 追踪**：识别先知 vs 跟风者
- **自动化交易**：基于信号触发券商 API 下单
