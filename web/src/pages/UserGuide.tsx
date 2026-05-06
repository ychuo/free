export default function UserGuide() {
  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-lg font-serif font-medium tracking-wide text-deep">使用指南</h1>
        <p className="text-[12px] text-stone mt-0.5">快速了解 free 的功能与操作方式</p>
      </div>

      <Section title="快速入门" icon="1">
        <p>
          free 是一个<strong>个人资产配置与 FIRE 追踪工具</strong>。核心思路：记录你拥有的每项资产 →
          系统自动汇总净值 → 分析配置偏离 → 追踪财务自由进度。
        </p>
        <ul className="list-disc list-outside ml-4 space-y-1 text-[13px]">
          <li>
            先到「<strong>概览</strong>」添加资产和负债，建立你的资产画像
          </li>
          <li>
            到「<strong>FIRE</strong>」设定年支出目标和提取率，查看自由进度
          </li>
          <li>
            到「<strong>配置</strong>」设定各大类目标比例，看偏离度与再平衡建议
          </li>
          <li>
            到「<strong>交易</strong>」录入买入/卖出/分红记录，系统自动计算成本基数
          </li>
          <li>
            到「<strong>收益</strong>」查看组合收益率、TWR 和各资产贡献度
          </li>
          <li>
            到「<strong>策略</strong>」选择投资策略模板，一键导入配置比例
          </li>
        </ul>
      </Section>

      <Section title="资产与负债" icon="2">
        <h4 className="text-[13px] font-medium text-deep mb-1">添加资产</h4>
        <p>
          在概览页点「新增」，填写名称、类别（现金/固收/权益/不动产/数字货币/贵金属/其他）、数量、单价即可。系统自动计算市值。
        </p>
        <p className="mt-1.5">
          <strong>仓位轨道</strong>
          ：每项资产可标记为"价值仓"（长期持有核心仓位）或"卫星仓"（短期交易机会）。概览页的仓位分配卡片会展示两条轨道的占比，对比目标比例
          75/25。
          <br />
          <strong>子类型</strong>：可选填 A股/港股/美股/基金等，用于更细粒度的分类。
          <br />
          <strong>被动收入</strong>：该资产每年产生的股息、租金、利息等，用于 FIRE 覆盖度计算。
          <br />
          <strong>币种</strong>：支持人民币/美元/港币/欧元/日元/英镑，系统自动获取汇率换算。
        </p>

        <h4 className="text-[13px] font-medium text-deep mt-3 mb-1">负债管理</h4>
        <p>添加房贷、消费贷等负债。原始总额和剩余本金分开填写，系统在净值计算时自动扣除。</p>

        <h4 className="text-[13px] font-medium text-deep mt-3 mb-1">记录快照</h4>
        <p>点「记录快照」保存当前净值状态。系统用于计算环比变化和历史趋势。</p>
      </Section>

      <Section title="市场行情与价格刷新" icon="3">
        <p>
          对于股票/基金/数字货币类资产，填写<strong>交易代码</strong>和<strong>交易所</strong>
          后，系统会自动标记为 AUTO 模式，每分钟自动从市场数据源拉取最新价格。
        </p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-sand/60 text-left text-stone">
                <th className="py-1 pr-4 font-normal">市场</th>
                <th className="py-1 pr-4 font-normal">交易所</th>
                <th className="py-1 pr-4 font-normal">代码格式</th>
                <th className="py-1 pr-4 font-normal">示例</th>
                <th className="py-1 font-normal">数据源</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-sand/30">
                <td className="py-1 pr-4">A股上海</td>
                <td className="py-1 pr-4">SH</td>
                <td className="py-1 pr-4 text-[11px]">代码（6位）</td>
                <td className="py-1 pr-4">600519</td>
                <td className="py-1">东方财富</td>
              </tr>
              <tr className="border-b border-sand/30">
                <td className="py-1 pr-4">A股深圳</td>
                <td className="py-1 pr-4">SZ</td>
                <td className="py-1 pr-4 text-[11px]">代码（6位）</td>
                <td className="py-1 pr-4">000001</td>
                <td className="py-1">东方财富</td>
              </tr>
              <tr className="border-b border-sand/30">
                <td className="py-1 pr-4">港股</td>
                <td className="py-1 pr-4">HKEX</td>
                <td className="py-1 pr-4 text-[11px]">代码（5位）</td>
                <td className="py-1 pr-4">00700</td>
                <td className="py-1">东方财富</td>
              </tr>
              <tr className="border-b border-sand/30">
                <td className="py-1 pr-4">美股</td>
                <td className="py-1 pr-4">NASDAQ/NYSE</td>
                <td className="py-1 pr-4 text-[11px]">股票代号</td>
                <td className="py-1 pr-4">AAPL</td>
                <td className="py-1">Alpha Vantage</td>
              </tr>
              <tr className="border-b border-sand/30">
                <td className="py-1 pr-4">基金</td>
                <td className="py-1 pr-4">FUND</td>
                <td className="py-1 pr-4 text-[11px]">基金代码（6位）</td>
                <td className="py-1 pr-4">000001</td>
                <td className="py-1">天天基金</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">数字货币</td>
                <td className="py-1 pr-4">CRYPTO</td>
                <td className="py-1 pr-4 text-[11px]">币种代号</td>
                <td className="py-1 pr-4">BTC / ETH</td>
                <td className="py-1">CoinGecko</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12px] text-stone/70">
          A股/港股/基金/数字货币无需 API Key。美股需要 Alpha Vantage 免费 Key，存入 server/.env。
        </p>
      </Section>

      <Section title="交易记录与成本基数" icon="4">
        <p>
          在「交易」页面添加买入/卖出/分红记录。每次添加买入交易后，系统
          <strong>自动计算该资产的成本基数</strong>（买入金额 + 手续费），卖出时按平均成本法扣减。
        </p>
        <p className="mt-1.5">
          成本基数用于「收益」页面的收益率计算：<code>收益率 = (当前市值 - 成本) / 成本</code>。
          没有交易记录的资产，成本基数为 0，收益率无意义。
        </p>
      </Section>

      <Section title="FIRE 追踪" icon="5">
        <p>
          在「FIRE」页面设定<strong>年生活支出</strong>和<strong>安全提取率</strong>（默认
          4%）。系统自动计算：
        </p>
        <ul className="list-disc list-outside ml-4 space-y-1 text-[13px] mt-1">
          <li>
            <strong>达标金额</strong> = 年支出 / 提取率（经典 FIRE 公式）
          </li>
          <li>
            <strong>覆盖度</strong> = 被动收入 / 年支出 × 100%
          </li>
          <li>
            <strong>缺口</strong> = 达标金额 - 当前净资产
          </li>
        </ul>
      </Section>

      <Section title="配置分析与再平衡" icon="6">
        <p>
          在「配置」页面设定每个资产大类的<strong>目标配置比例</strong>。系统会：
        </p>
        <ul className="list-disc list-outside ml-4 space-y-1 text-[13px] mt-1">
          <li>
            对比当前实际比例与目标比例的<strong>偏离度</strong>
          </li>
          <li>
            给出<strong>再平衡建议</strong>（该加仓/减仓多少）
          </li>
          <li>
            支持设定<strong>偏离阈值</strong>，超阈值时浏览器弹出提醒
          </li>
        </ul>
      </Section>

      <Section title="收益归因" icon="7">
        <p>「收益」页面展示组合的收益分析：</p>
        <ul className="list-disc list-outside ml-4 space-y-1 text-[13px] mt-1">
          <li>
            <strong>TWR</strong>（时间加权收益率）：排除资金流入流出影响，反映纯投资能力
          </li>
          <li>
            <strong>贡献度</strong>：每项资产的盈亏对总收益的占比，帮你识别拖后腿的资产
          </li>
          <li>所有金额已换算为人民币，非 CNY 资产使用实时汇率</li>
        </ul>
      </Section>

      <Section title="策略探索与仓位轨道" icon="8">
        <h4 className="text-[13px] font-medium text-deep mb-1">策略模板</h4>
        <p>在「策略」页面浏览预置的投资策略模板。分为两类：</p>
        <ul className="list-disc list-outside ml-4 space-y-1 text-[13px] mt-1">
          <li>
            <strong>价值轨道</strong>（深度价值 / GARP / 红利增长 /
            质量护城河）：长期复利，以估值+质量+护城河为核心
          </li>
          <li>
            <strong>动量轨道</strong>（事件驱动 / 板块轮动 /
            趋势跟踪）：短期超额，以量价+资金+热度为信号
          </li>
        </ul>
        <p className="mt-1.5">
          点击任一策略卡片展开详情，查看核心理念、适合人群、关键指标和 A 股示例标的。
          点击「导入此配置」可将该策略的建议配置比例一键写入「配置」页的目标配置，
          导入后自动跳转到配置页查看偏离度。
        </p>

        <h4 className="text-[13px] font-medium text-deep mt-3 mb-1">仓位轨道</h4>
        <p>每项资产在新增/编辑时可标记所属轨道。概览页的仓位分配卡片实时展示两条轨道的占比：</p>
        <ul className="list-disc list-outside ml-4 space-y-1 text-[13px] mt-1">
          <li>
            <strong>价值仓</strong>（目标 75%）：长期持有的核心仓位，追求复利和安全边际
          </li>
          <li>
            <strong>卫星仓</strong>（目标 25%）：短期交易机会仓位，捕捉热点和趋势
          </li>
        </ul>
        <p className="mt-1.5">
          资产列表按轨道分组显示，每条资产名称旁标注轨道标签。未分类资产超过 5% 时系统会提示标注。
          随着市场环境和投资经验变化，你可以逐步调整两条轨道的比例。
        </p>
      </Section>

      <Section title="市场脉搏" icon="9">
        <p>「脉搏」页面展示当前市场状态，包含三个模块：</p>

        <h4 className="text-[13px] font-medium text-deep mt-3 mb-1">行业板块</h4>
        <p>展示 A 股 90 个行业的实时数据，按涨跌幅排序：</p>
        <ul className="list-disc list-outside ml-4 space-y-1 text-[13px] mt-1">
          <li>
            <strong>涨跌幅</strong>：行业板块当日涨跌百分比
          </li>
          <li>
            <strong>净流入</strong>：主力资金净流入金额（亿元），正数=流入，负数=流出
          </li>
          <li>
            <strong>上涨/下跌家数</strong>：该行业成分股涨跌统计
          </li>
          <li>
            <strong>领涨股</strong>：当日涨幅最大的成分股及涨幅
          </li>
        </ul>
        <p className="mt-1.5 text-[12px] text-stone/70">
          数据来源：同花顺，每小时自动刷新，也可点击右上角手动刷新。
        </p>

        <h4 className="text-[13px] font-medium text-deep mt-3 mb-1">市场热点</h4>
        <p>展示近期市场关注的概念主题，以卡片形式呈现：</p>
        <ul className="list-disc list-outside ml-4 space-y-1 text-[13px] mt-1">
          <li>
            <strong>概念名称</strong>：当前热门概念或主题
          </li>
          <li>
            <strong>驱动事件</strong>：触发该概念升温的具体原因（如政策发布、行业催化）
          </li>
          <li>
            <strong>龙头股</strong>：该概念中市场关注度最高的代表性标的
          </li>
          <li>
            <strong>成分股数量</strong>：该概念包含的股票数量
          </li>
        </ul>
        <p className="mt-1.5 text-[12px] text-stone/70">
          注意：概念板块没有实时涨跌幅数据（需东方财富接口，当前不可用），驱动事件来自同花顺。
        </p>

        <h4 className="text-[13px] font-medium text-deep mt-3 mb-1">资金流向</h4>
        <p>展示全市场资金流向拆解：</p>
        <ul className="list-disc list-outside ml-4 space-y-1 text-[13px] mt-1">
          <li>
            <strong>北向资金</strong>：沪/深港通外资日度和周度净流入（数据可能为 0，偶有延迟）
          </li>
          <li>
            <strong>主力资金</strong>：超大单、大单、中单、小单的净流入拆解
          </li>
          <li>
            <strong>指数行情</strong>：上证指数和深证成指的当前点位和涨跌幅
          </li>
        </ul>
      </Section>

      <Section title="信号发现与复盘" icon="10">
        <p>「信号」页面是系统的核心决策辅助功能，分为两个视图：</p>

        <h4 className="text-[13px] font-medium text-deep mt-3 mb-1">价值发现（ValueScore）</h4>
        <p>基于已有市场数据，对每个行业进行四因子加权评分（0-100 分）：</p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-sand/60 text-left text-stone">
                <th className="py-1 pr-4 font-normal">因子</th>
                <th className="py-1 pr-4 font-normal">权重</th>
                <th className="py-1 pr-4 font-normal">计算方法</th>
                <th className="py-1 font-normal">局限性</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-sand/30">
                <td className="py-1 pr-4 font-medium">估值安全边际</td>
                <td className="py-1 pr-4">35%</td>
                <td className="py-1 pr-4 text-[11px]">50 - 涨跌幅 × 5</td>
                <td className="py-1 text-[11px] text-stone/70">
                  用涨跌幅代替 PE 分位，跌了不等于低估
                </td>
              </tr>
              <tr className="border-b border-sand/30">
                <td className="py-1 pr-4 font-medium">生意质量</td>
                <td className="py-1 pr-4">30%</td>
                <td className="py-1 pr-4 text-[11px]">上涨家数占比 × 100</td>
                <td className="py-1 text-[11px] text-stone/70">
                  用涨跌比代替 ROE，全涨不等于生意好
                </td>
              </tr>
              <tr className="border-b border-sand/30">
                <td className="py-1 pr-4 font-medium">护城河信号</td>
                <td className="py-1 pr-4">20%</td>
                <td className="py-1 pr-4 text-[11px]">50 + 净流入 × 2</td>
                <td className="py-1 text-[11px] text-stone/70">用资金流代替护城河</td>
              </tr>
              <tr>
                <td className="py-1 pr-4 font-medium">催化剂</td>
                <td className="py-1 pr-4">15%</td>
                <td className="py-1 pr-4 text-[11px]">|涨跌幅| × 10 + 40</td>
                <td className="py-1 text-[11px] text-stone/70">波动大不等于有催化剂</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-[13px] font-medium text-deep mt-3 mb-1">热点信号（HotScore）</h4>
        <p>对概念板块进行四因子评分（0-100 分）：</p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-sand/60 text-left text-stone">
                <th className="py-1 pr-4 font-normal">因子</th>
                <th className="py-1 pr-4 font-normal">权重</th>
                <th className="py-1 pr-4 font-normal">计算方法</th>
                <th className="py-1 font-normal">局限性</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-sand/30">
                <td className="py-1 pr-4 font-medium">概念热度</td>
                <td className="py-1 pr-4">30%</td>
                <td className="py-1 pr-4 text-[11px]">成分股数量 × 0.2 + 有驱动事件 +30</td>
                <td className="py-1 text-[11px] text-stone/70">大板块天然得分高</td>
              </tr>
              <tr className="border-b border-sand/30">
                <td className="py-1 pr-4 font-medium">资金信号</td>
                <td className="py-1 pr-4">30%</td>
                <td className="py-1 pr-4 text-[11px]">固定 50</td>
                <td className="py-1 text-[11px] text-stone/70">概念板块暂无实时资金数据</td>
              </tr>
              <tr className="border-b border-sand/30">
                <td className="py-1 pr-4 font-medium">趋势强度</td>
                <td className="py-1 pr-4">20%</td>
                <td className="py-1 pr-4 text-[11px]">固定 50</td>
                <td className="py-1 text-[11px] text-stone/70">同上</td>
              </tr>
              <tr>
                <td className="py-1 pr-4 font-medium">情绪信号</td>
                <td className="py-1 pr-4">20%</td>
                <td className="py-1 pr-4 text-[11px]">有驱动事件 60 / 无 40</td>
                <td className="py-1 text-[11px] text-stone/70">过于简化</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-[13px] font-medium text-deep mt-3 mb-1">如何使用信号</h4>
        <ul className="list-disc list-outside ml-4 space-y-1 text-[13px] mt-1">
          <li>
            点击信号卡片展开：查看<strong>因子拆解</strong>，了解每个因子的得分和贡献度
          </li>
          <li>
            在每个信号下方记录你的<strong>判断</strong>（跟进/忽略/观望 + 笔记），积累决策经验
          </li>
          <li>
            到「信号」→「信号复盘」查看<strong>历史记录</strong>：对比信号触发时和当前的变化，
            回顾自己的判断，建立模式识别能力
          </li>
          <li>
            仓位建议卡片会根据市场整体涨跌动态调整建议比例：
            市场偏热时建议提高核心仓，偏弱时建议关注低估机会
          </li>
        </ul>

        <h4 className="text-[13px] font-medium text-deep mt-3 mb-1">重要提醒</h4>
        <p className="text-[12px] text-stone/70">
          当前评分使用的是代理指标而非真实基本面数据（PE、PB、ROE 等），
          信号仅供参考，不能替代独立判断。系统没有历史回测数据，
          不支持"这个信号历史上准确率多少"的查询。 随着 v4
          引入更完整的基本面数据后，评分准确度会逐步提高。
        </p>
      </Section>

      <Section title="数据导入导出" icon="11">
        <p>
          概览页的「导出」按钮将全部数据（资产/负债/FIRE 设定/配置目标）导出为 JSON 文件。
          「导入」可将之前导出的数据恢复。建议定期导出备份。
        </p>
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-sand/60 bg-ivory p-5">
      <h3 className="text-sm font-serif font-medium text-deep mb-3 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand/10 text-brand text-[11px] font-medium">
          {icon}
        </span>
        {title}
      </h3>
      <div className="text-[13px] leading-relaxed text-olive space-y-1.5">{children}</div>
    </section>
  );
}
