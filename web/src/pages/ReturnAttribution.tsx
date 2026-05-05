import { AssetListSkeleton } from '../components/Skeleton';
import { useReturns } from '../hooks/useReturns';

export default function ReturnAttribution() {
  const { analysis, loading } = useReturns();

  const formatPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
  const formatCNY = (n: number) =>
    new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-lg font-serif font-medium tracking-wide text-deep">收益归因</h1>
          <p className="text-[12px] text-stone mt-0.5">投资组合收益分析</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <AssetListSkeleton />
        </div>
      ) : !analysis ? (
        <div className="text-center py-12 text-stone/50 text-[13px]">
          暂无分析数据，请先添加带有成本基础的资产和交易记录
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg border border-sand/60 bg-ivory p-4">
              <div className="text-[11px] text-stone mb-1">总收益</div>
              <div
                className={`text-lg font-medium ${analysis.totalReturn >= 0 ? 'text-emerald-700' : 'text-red-500'}`}
              >
                {formatCNY(analysis.totalReturn)}
              </div>
            </div>
            <div className="rounded-lg border border-sand/60 bg-ivory p-4">
              <div className="text-[11px] text-stone mb-1">总收益率</div>
              <div
                className={`text-lg font-medium ${analysis.totalReturnPercent >= 0 ? 'text-emerald-700' : 'text-red-500'}`}
              >
                {formatPct(analysis.totalReturnPercent)}
              </div>
            </div>
            <div className="rounded-lg border border-sand/60 bg-ivory p-4">
              <div className="text-[11px] text-stone mb-1">TWR (时间加权)</div>
              <div
                className={`text-lg font-medium ${(analysis.twr ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-500'}`}
              >
                {analysis.twr != null ? formatPct(analysis.twr * 100) : '无交易数据'}
              </div>
            </div>
            <div className="rounded-lg border border-sand/60 bg-ivory p-4">
              <div className="text-[11px] text-stone mb-1">分析区间</div>
              <div className="text-[12px] text-deep">
                {new Date(analysis.from).toLocaleDateString('zh-CN')} ~{' '}
                {new Date(analysis.to).toLocaleDateString('zh-CN')}
              </div>
            </div>
          </div>

          {analysis.perAsset.length > 0 && (
            <div className="rounded-lg border border-sand/60 overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-sand/30">
                    <th className="text-left px-4 py-2 font-normal text-stone">资产</th>
                    <th className="text-left px-4 py-2 font-normal text-stone">类别</th>
                    <th className="text-right px-4 py-2 font-normal text-stone">成本</th>
                    <th className="text-right px-4 py-2 font-normal text-stone">市值</th>
                    <th className="text-right px-4 py-2 font-normal text-stone">收益</th>
                    <th className="text-right px-4 py-2 font-normal text-stone">收益率</th>
                    <th className="text-right px-4 py-2 font-normal text-stone">贡献度</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.perAsset.map((pa) => (
                    <tr key={pa.assetId} className="border-t border-sand/30 hover:bg-sand/10">
                      <td className="px-4 py-2 font-medium">{pa.assetName}</td>
                      <td className="px-4 py-2">{pa.category}</td>
                      <td className="px-4 py-2 text-right">{formatCNY(pa.costBasis)}</td>
                      <td className="px-4 py-2 text-right">{formatCNY(pa.currentValue)}</td>
                      <td
                        className={`px-4 py-2 text-right ${pa.totalReturn >= 0 ? 'text-emerald-700' : 'text-red-500'}`}
                      >
                        {formatCNY(pa.totalReturn)}
                      </td>
                      <td
                        className={`px-4 py-2 text-right ${pa.totalReturnPercent >= 0 ? 'text-emerald-700' : 'text-red-500'}`}
                      >
                        {formatPct(pa.totalReturnPercent)}
                      </td>
                      <td className="px-4 py-2 text-right">{pa.contributionPercent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
