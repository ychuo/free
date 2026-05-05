# free

个人资产配置 & FIRE 自由追踪工具。简洁、无账户体系、开箱即用。

## 功能

- **资产概览** — 净值总览卡片、资产大类饼图、资产/负债 CRUD、净值快照、价格实时刷新
- **FIRE 追踪** — 财务自由进度仪表盘、被动收入覆盖率和缺口计算
- **配置分析** — 目标比例 vs 实际比例对比、调仓建议、偏离度阈值提醒
- **市场行情** — 多市场实时价格（A股/港股/美股/基金/数字货币）、汇率自动获取
- **收益归因** — 时间加权收益率 (TWR)、单资产收益率与贡献度
- **交易记录** — 买卖/分红/费用记录管理、成本基数自动计算

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | React 19, Vite, Tailwind CSS v4, shadcn/ui, Recharts, react-day-picker |
| 后端 | Fastify (Bun), Prisma 7 |
| 数据库 | PostgreSQL |
| 共享层 | TypeScript 类型, `@free/shared` workspace |
| 工具 | Bun workspaces, Turborepo, Biome |

## 快速开始

```bash
# 1. 安装依赖
bun install

# 2. 配置数据库连接（在 server/.env 中设置 DATABASE_URL）
echo 'DATABASE_URL="postgresql://localhost:5432/free"' > server/.env

# 3. 运行数据库迁移
bun run db:migrate

# 4. 启动开发环境（前端 :5173 + 后端 :3001）
bun run dev

# （可选）填充示例数据
bun run db:seed
```

## 项目结构

```
free/
├── shared/              # 共享类型定义 (@free/shared)
│   └── src/types.ts
├── server/              # Fastify API 服务
│   ├── src/
│   │   ├── index.ts           # 入口，注册适配器 + 启动调度器
│   │   ├── app.ts             # 路由注册 & 中间件
│   │   ├── config.ts          # 环境配置
│   │   ├── lib/               # 业务逻辑
│   │   │   ├── adapters/      # 价格源适配器（A股/港股/美股/基金/数字货币/汇率）
│   │   │   ├── PriceService.ts
│   │   │   ├── ExchangeRateService.ts
│   │   │   ├── ReturnCalculator.ts
│   │   │   ├── RebalanceChecker.ts
│   │   │   ├── calculations.ts
│   │   │   └── exchangeRate.ts
│   │   └── routes/            # API 路由（assets, liabilities, netWorth, fireProfile, allocation, snapshots, prices, exchangeRates, transactions, returns, rebalanceAlerts）
│   └── prisma/
│       └── schema.prisma      # 数据模型（9 个表）
├── web/                 # React SPA
│   └── src/
│       ├── pages/             # 5 个页面（概览 / FIRE / 配置 / 收益 / 交易）
│       ├── components/        # 业务组件 + shadcn/ui 基础组件
│       ├── hooks/             # 数据获取 hooks（9 个）
│       └── lib/api.ts         # API 客户端
└── turbo.json
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `bun dev` | 启动前后端开发服务 |
| `bun run build` | 构建所有包 |
| `bun run db:migrate` | 执行数据库迁移 |
| `bun run db:seed` | 填充种子数据 |
| `bun run db:studio` | 打开 Prisma Studio |
| `bun run lint` | 代码检查 (Biome) |
| `bun run format` | 代码格式化 (Biome) |

## 市场数据

支持 6 种行情数据源，价格自动定时刷新（15 分钟间隔），汇率每日更新：

| 市场 | 数据源 | API Key |
|------|--------|---------|
| A股（沪深） | 东方财富 | 无需 |
| 港股 | 东方财富 | 无需 |
| 美股 | Alpha Vantage | 免费申请 |
| 基金 | 天天基金 | 无需 |
| 数字货币 | CoinGecko | 无需 |
| 汇率 | frankfurter.app (ECB) | 无需 |

## 设计

「Kami 紙」主题：暖色羊皮纸底色、墨蓝点缀、衬线字体层级。支持亮/暗模式切换，持久化在 localStorage。
