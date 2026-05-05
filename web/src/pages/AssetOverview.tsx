import { useState } from 'react';
import AssetList from '../components/AssetList';
import AssetPieChart from '../components/AssetPieChart';
import ConfirmDialog from '../components/ConfirmDialog';
import LiabilityList from '../components/LiabilityList';
import NetWorthCard from '../components/NetWorthCard';
import { AssetListSkeleton, ChartSkeleton, NetWorthSkeleton } from '../components/Skeleton';
import { Button } from '../components/ui/button';
import { useAssets } from '../hooks/useAssets';
import { useLiabilities } from '../hooks/useLiabilities';
import { useNetWorth } from '../hooks/useNetWorth';

export default function AssetOverview() {
  const { assets, create, update, remove, loading: assetsLoading } = useAssets();
  const {
    liabilities,
    create: createL,
    update: updateL,
    remove: removeL,
    loading: liabLoading,
  } = useLiabilities();
  const { summary, createSnapshot, refetch: refetchNetWorth, loading: nwLoading } = useNetWorth();
  const [snapshotConfirmOpen, setSnapshotConfirmOpen] = useState(false);

  const withRefresh = <T extends (...args: any[]) => Promise<any>>(fn: T): T =>
    (async (...args: any[]) => {
      await fn(...args);
      await refetchNetWorth();
    }) as T;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-lg font-serif font-medium tracking-wide text-deep">概览</h1>
          <p className="text-[12px] text-stone mt-0.5">你的资产全景</p>
        </div>
        <Button onClick={() => setSnapshotConfirmOpen(true)} variant="outline" size="sm">
          记录快照
        </Button>
      </div>

      {nwLoading ? <NetWorthSkeleton /> : <NetWorthCard summary={summary} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {nwLoading ? <ChartSkeleton /> : <AssetPieChart summary={summary} />}
        {assetsLoading ? (
          <AssetListSkeleton />
        ) : (
          <AssetList
            assets={assets}
            onCreate={withRefresh(create)}
            onUpdate={withRefresh(update)}
            onDelete={withRefresh(remove)}
          />
        )}
      </div>

      {liabLoading ? (
        <AssetListSkeleton />
      ) : (
        <LiabilityList
          liabilities={liabilities}
          onCreate={withRefresh(createL)}
          onUpdate={withRefresh(updateL)}
          onDelete={withRefresh(removeL)}
        />
      )}

      <ConfirmDialog
        open={snapshotConfirmOpen}
        title="记录快照"
        description="将当前资产和负债状态保存为一条快照记录，用于后续追踪净值变化趋势。"
        confirmLabel="记录"
        variant="default"
        onConfirm={async () => {
          await createSnapshot();
          setSnapshotConfirmOpen(false);
        }}
        onCancel={() => setSnapshotConfirmOpen(false)}
      />
    </div>
  );
}
