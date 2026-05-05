interface PriceBadgeProps {
  tickerSymbol: string | null;
  priceSource: string;
  currentPrice: number | null;
  dayChangePercent: number | null;
  priceUpdatedAt: string | null;
}

export function PriceBadge({
  tickerSymbol,
  priceSource,
  currentPrice,
  dayChangePercent,
  priceUpdatedAt,
}: PriceBadgeProps) {
  if (priceSource === 'MANUAL' || !tickerSymbol) return null;

  const isUp = dayChangePercent != null && dayChangePercent >= 0;
  const isDown = dayChangePercent != null && dayChangePercent < 0;

  return (
    <span className="inline-flex items-center gap-1 text-[11px]">
      {currentPrice != null && <span className="font-medium">{currentPrice.toFixed(2)}</span>}
      {isUp && <span className="text-emerald-600">+{dayChangePercent.toFixed(2)}%</span>}
      {isDown && <span className="text-red-500">{dayChangePercent.toFixed(2)}%</span>}
      {priceUpdatedAt && (
        <span className="text-stone/50 ml-1">
          {new Date(priceUpdatedAt).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      )}
    </span>
  );
}
