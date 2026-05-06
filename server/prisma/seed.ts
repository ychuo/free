import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const STRATEGY_TEMPLATES = [
  {
    name: '深度价值',
    type: 'value',
    description: '格雷厄姆式投资：寻找价格远低于内在价值的标的，追求高安全边际。核心理念是"用50块买100块的东西"。关注低PE、低PB、高股息率的公司，适合市场恐慌和熊市底部建仓。',
    suitableFor: '有耐心等待价值回归的长期投资者，能忍受短期账面浮亏，偏好逆向投资思维。',
    indicators: ['PE < 行业均值 50%', 'PB < 1.5', '股息率 > 3%', '负债率 < 50%', '自由现金流为正'],
    allocation: { equity: 70, cash: 15, fixed_income: 10, precious: 5 },
    examples: ['银行股（低PB、高股息）', '资源股（周期底部）', '传统制造龙头'],
    riskLevel: 'medium',
  },
  {
    name: 'GARP',
    type: 'value',
    description: 'Growth at a Reasonable Price — 以合理价格买入成长股。在价值和成长之间找平衡，用PEG指标衡量"成长是否被低估"。适合A股市场中寻找盈利增速与估值匹配的标的。',
    suitableFor: '希望参与成长又不想追高的投资者，追求"性价比"投资，适合结构性行情。',
    indicators: ['PEG < 1', '盈利增速 > 15%', 'ROE > 12%', '毛利率稳定或上升', '营收增长 > 行业均值'],
    allocation: { equity: 65, cash: 15, fixed_income: 15, other: 5 },
    examples: ['消费龙头（合理估值+稳定增长）', '医药白马', '细分制造龙头'],
    riskLevel: 'medium',
  },
  {
    name: '红利增长',
    type: 'value',
    description: '聚焦持续产生现金流并稳定分红的公司。不求暴富，但求复利。核心指标是股息率、分红连续性、自由现金流质量。在震荡市和低利率环境中表现突出。',
    suitableFor: '追求被动收入增长的投资者，适合作为FIRE组合的核心持仓，风险偏好较低。',
    indicators: ['股息率 > 2.5%', '连续分红 > 5年', '自由现金流/净利润 > 0.8', '分红率 < 70%', '营收波动率低'],
    allocation: { equity: 50, fixed_income: 25, cash: 15, real_estate: 10 },
    examples: ['长江电力', '四大行', '公用事业龙头', '高速公路REITs'],
    riskLevel: 'low',
  },
  {
    name: '质量护城河',
    type: 'value',
    description: '好生意优先。寻找具有持续竞争优势（品牌、网络效应、转换成本、规模优势）的公司，以合理的价格买入并长期持有。ROE、毛利率、护城河宽度是核心评估维度。',
    suitableFor: '信奉"买股票就是买公司"的长期投资者，愿意深入研究企业基本面，持有周期3年以上。',
    indicators: ['ROE > 15%（连续3年）', '毛利率 > 30%', '市场份额前三', '净利率 > 10%', '资本回报率 > 资本成本'],
    allocation: { equity: 75, cash: 10, fixed_income: 10, other: 5 },
    examples: ['贵州茅台', '海天味业', '恒瑞医药', '美的集团'],
    riskLevel: 'medium',
  },
  {
    name: '事件驱动',
    type: 'momentum',
    description: '捕捉特定事件带来的短期交易机会：政策发布、财报超预期、重组并购、行业催化。不关注长期估值，关注事件对短期供需和情绪的冲击程度。',
    suitableFor: '对市场信息敏感、反应快的投资者，能接受较高换手率和短期波动，需要纪律性止损。',
    indicators: ['事件影响广度（受益标的数量）', '事件持续性（一次性还是长期利好）', '资金异动（公告前后成交量变化）', '历史类似事件收益分布'],
    allocation: { equity: 60, cash: 30, crypto: 10 },
    examples: ['政策利好板块（如数据要素、低空经济）', '财报超预期个股', '并购重组标的'],
    riskLevel: 'high',
  },
  {
    name: '板块轮动',
    type: 'momentum',
    description: '跟踪A股行业轮动规律，在经济周期不同阶段超配表现更好的板块。核心是识别"当前处于什么阶段、下一阶段什么板块受益"。',
    suitableFor: '熟悉A股行业分类和轮动规律的投资者，能关注宏观变量（利率、PMI、政策方向）。',
    indicators: ['板块相对强弱（RS）排名', '行业ETF资金流', '宏观经济指标（PMI/CPI/利率）', '板块估值分位变化'],
    allocation: { equity: 70, cash: 20, fixed_income: 10 },
    examples: ['复苏期：金融+周期', '过热期：消费+医药', '衰退期：公用事业+必选消费'],
    riskLevel: 'high',
  },
  {
    name: '趋势跟踪',
    type: 'momentum',
    description: '顺势而为，不做预判。当价格突破关键均线且成交量放大时入场，趋势走弱时离场。严格止损，截断亏损让利润奔跑。',
    suitableFor: '相信"市场永远是对的"的技术派投资者，执行纪律强，能严格遵守止损规则。',
    indicators: ['价格 > MA20 > MA60', '成交量 > 20日均量1.5倍', 'MACD金叉', 'RSI 40-70区间'],
    allocation: { equity: 55, cash: 30, crypto: 15 },
    examples: ['沪深300ETF趋势交易', '行业ETF轮动', '强势个股突破'],
    riskLevel: 'high',
  },
];

async function main() {
  await prisma.fireProfile.upsert({
    where: { userId: 'default' },
    update: {},
    create: {
      annualExpense: 300000,
      safeWithdrawalRate: 0.04,
      fireTarget: 7500000,
    },
  });

  const categories = [
    'cash',
    'fixed_income',
    'equity',
    'real_estate',
    'crypto',
    'precious',
    'other',
  ];
  for (const category of categories) {
    await prisma.allocationTarget.upsert({
      where: { userId_category: { userId: 'default', category } },
      update: {},
      create: { category, targetRatio: Math.round(100 / categories.length) },
    });
  }

  // Strategy templates: delete all and re-create for idempotent seeding
  await prisma.strategyTemplate.deleteMany();
  for (const tmpl of STRATEGY_TEMPLATES) {
    await prisma.strategyTemplate.create({ data: tmpl });
  }

  console.log('Seed data created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
