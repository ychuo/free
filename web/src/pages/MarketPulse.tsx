import { RefreshCw } from 'lucide-react';
import ConceptBoardList from '../components/ConceptBoardList';
import FundFlowOverview from '../components/FundFlowOverview';
import { Button } from '../components/ui/button';
import ValuationHeatmap from '../components/ValuationHeatmap';
import { useMarketData } from '../hooks/useMarketData';
import { cn } from '../lib/utils';

export default function MarketPulse() {
  const { valuation, concepts, fundFlow, alerts, loading, refreshing, refresh } = useMarketData();

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-serif font-medium tracking-wide text-deep">市场脉搏</h1>
          <p className="text-[12px] text-stone mt-0.5">行业估值水位、概念板块热度与资金流向</p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={cn('h-3 w-3 mr-1', refreshing && 'animate-spin')} />
          {refreshing ? '刷新中...' : '刷新数据'}
        </Button>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div
              key={`${a.assetName}-${a.alertType}`}
              className={`rounded-lg border px-4 py-3 text-[12px] ${
                a.alertType === 'undervalued'
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                  : 'border-red-200 bg-red-50/50 text-red-700'
              }`}
            >
              <span className="font-medium">{a.assetName}</span>
              {' — '}
              {a.message}
            </div>
          ))}
        </div>
      )}

      <ValuationHeatmap data={valuation} loading={loading} />
      <ConceptBoardList data={concepts} loading={loading} />
      <FundFlowOverview data={fundFlow} loading={loading} />
    </div>
  );
}
