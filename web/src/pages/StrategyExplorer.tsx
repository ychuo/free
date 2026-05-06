import { ArrowRight, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useStrategies } from '../hooks/useStrategies';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import type { StrategyTemplate } from '../types';

const TRACK_MAP: Record<string, { label: string; color: string }> = {
  value: { label: '价值轨道', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  momentum: { label: '动量轨道', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const RISK_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: '低风险', color: 'text-emerald-600' },
  medium: { label: '中风险', color: 'text-amber-600' },
  high: { label: '高风险', color: 'text-red-500' },
};

export default function StrategyExplorer() {
  const [filter, setFilter] = useState<'all' | 'value' | 'momentum'>('all');
  const { templates, loading } = useStrategies(filter === 'all' ? undefined : filter);
  const [importing, setImporting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleImport = async (tmpl: StrategyTemplate) => {
    setImporting(tmpl.id);
    try {
      const targets = Object.entries(tmpl.allocation).map(([category, ratio]) => ({
        category,
        targetRatio: ratio,
      }));
      await api.allocation.updateTargets({ targets });
      setImporting(null);
      navigate('/allocation');
    } catch {
      setImporting(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-lg font-serif font-medium tracking-wide text-deep">策略探索</h1>
        <p className="text-[12px] text-stone mt-0.5 max-w-lg">
          选择适合你的投资策略模板，了解核心理念和关键指标，一键导入配置比例开始执行。
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {(['all', 'value', 'momentum'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1 text-[12px] rounded-md transition-colors border',
              filter === f
                ? 'border-brand/40 bg-brand/5 text-deep font-medium'
                : 'border-sand/60 text-stone hover:text-olive',
            )}
          >
            {f === 'all' ? '全部' : f === 'value' ? '价值轨道' : '动量轨道'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-lg border border-sand bg-ivory animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tmpl) => {
            const track = TRACK_MAP[tmpl.type];
            const risk = RISK_LABELS[tmpl.riskLevel];
            const isExpanded = expanded === tmpl.id;

            return (
              <Card
                key={tmpl.id}
                className={cn(
                  'p-5 cursor-pointer transition-all',
                  isExpanded && 'ring-1 ring-brand/20 shadow-sm',
                )}
                onClick={() => setExpanded(isExpanded ? null : tmpl.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-serif font-medium text-deep">{tmpl.name}</h3>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] px-1.5 py-0', track.color)}
                      >
                        {track.label}
                      </Badge>
                    </div>
                    <span className={cn('text-[11px]', risk.color)}>{risk.label}</span>
                  </div>
                  <TrendingUp
                    className={cn(
                      'h-4 w-4',
                      tmpl.type === 'value' ? 'text-emerald-500' : 'text-amber-500',
                    )}
                  />
                </div>

                <p className="text-[12px] text-stone leading-relaxed mb-3 line-clamp-2">
                  {tmpl.description}
                </p>

                {isExpanded && (
                  <div className="space-y-3 pt-3 border-t border-sand/60 animate-fade-up">
                    <div>
                      <h4 className="text-[11px] font-medium text-deep mb-1">适合谁</h4>
                      <p className="text-[12px] text-stone">{tmpl.suitableFor}</p>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-medium text-deep mb-1">关键指标</h4>
                      <div className="flex flex-wrap gap-1">
                        {tmpl.indicators.map((ind: string) => (
                          <span
                            key={ind}
                            className="px-1.5 py-0.5 text-[10px] rounded border border-sand/60 bg-parchment text-stone"
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-medium text-deep mb-1">建议配置</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(tmpl.allocation).map(([cat, ratio]) => (
                          <span
                            key={cat}
                            className="px-1.5 py-0.5 text-[10px] rounded bg-brand/5 text-deep font-medium"
                          >
                            {cat} {ratio}%
                          </span>
                        ))}
                      </div>
                    </div>
                    {tmpl.examples && tmpl.examples.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-medium text-deep mb-1">A股示例</h4>
                        <div className="flex flex-wrap gap-1">
                          {tmpl.examples.map((ex: string) => (
                            <span
                              key={ex}
                              className="px-1.5 py-0.5 text-[10px] rounded bg-ivory text-stone"
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="w-full mt-2"
                      disabled={importing === tmpl.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImport(tmpl);
                      }}
                    >
                      {importing === tmpl.id ? (
                        '导入中...'
                      ) : (
                        <>
                          导入此配置 <ArrowRight className="h-3 w-3 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
