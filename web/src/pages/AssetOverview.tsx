import { format } from 'date-fns';
import { CalendarIcon, Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import AssetList from '../components/AssetList';
import AssetPieChart from '../components/AssetPieChart';
import ConfirmDialog from '../components/ConfirmDialog';
import LiabilityList from '../components/LiabilityList';
import NetWorthCard from '../components/NetWorthCard';
import { AssetListSkeleton, ChartSkeleton, NetWorthSkeleton } from '../components/Skeleton';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { useAllocation } from '../hooks/useAllocation';
import { useAssets } from '../hooks/useAssets';
import { useFireProfile } from '../hooks/useFireProfile';
import { useLiabilities } from '../hooks/useLiabilities';
import { useNetWorth } from '../hooks/useNetWorth';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import type { AssetCategory, ExportData, LiabilityType } from '../types';

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
  const { profile: fireProfile } = useFireProfile();
  const { targets } = useAllocation();
  const [snapshotConfirmOpen, setSnapshotConfirmOpen] = useState(false);
  const [snapshotDate, setSnapshotDate] = useState<Date | undefined>(undefined);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [importData, setImportData] = useState<ExportData | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const withRefresh = <T extends (...args: any[]) => Promise<any>>(fn: T): T =>
    (async (...args: any[]) => {
      await fn(...args);
      await refetchNetWorth();
    }) as T;

  const handleExport = () => {
    const data: ExportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      assets: assets.map(({ id, createdAt, updatedAt, totalValue, ...rest }) => ({
        ...rest,
        subType: rest.subType ?? undefined,
        passiveIncome: rest.passiveIncome ?? undefined,
        properties: rest.properties ?? undefined,
        acquiredAt: rest.acquiredAt ?? undefined,
        notes: rest.notes ?? undefined,
      })),
      liabilities: liabilities.map(({ id, createdAt, updatedAt, ...rest }) => ({
        ...rest,
        interestRate: rest.interestRate ?? undefined,
        monthlyPayment: rest.monthlyPayment ?? undefined,
      })),
      fireProfile: fireProfile
        ? {
            annualExpense: fireProfile.annualExpense,
            safeWithdrawalRate: fireProfile.safeWithdrawalRate,
          }
        : null,
      allocationTargets: targets.map(({ id, ...rest }) => rest),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `free-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;
      if (!data.version || !Array.isArray(data.assets) || !Array.isArray(data.liabilities)) {
        toast.error('文件格式无效');
        return;
      }
      setImportData(data);
      setImportConfirmOpen(true);
    } catch {
      toast.error('解析文件失败');
    }
    e.target.value = '';
  };

  const executeImport = async () => {
    if (!importData) return;
    try {
      for (const a of importData.assets) {
        await api.assets.create({ ...a, category: a.category as AssetCategory });
      }
      for (const l of importData.liabilities) {
        await api.liabilities.create({ ...l, type: l.type as LiabilityType });
      }
      if (importData.fireProfile) {
        await api.fireProfile.update(importData.fireProfile);
      }
      if (importData.allocationTargets.length > 0) {
        await api.allocation.updateTargets({ targets: importData.allocationTargets });
      }
      toast.success('数据导入完成');
      setImportData(null);
      setImportConfirmOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '导入失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-lg font-serif font-medium tracking-wide text-deep">概览</h1>
          <p className="text-[12px] text-stone mt-0.5">你的资产全景</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger
              render={(props) => (
                <Button
                  {...props}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'justify-start text-left font-normal',
                    !snapshotDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {snapshotDate ? format(snapshotDate, 'yyyy-MM-dd') : '选择日期'}
                </Button>
              )}
            />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={snapshotDate}
                onSelect={setSnapshotDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={() => setSnapshotConfirmOpen(true)} variant="outline" size="sm">
            记录快照
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-3 w-3 mr-1" /> 导出
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-3 w-3 mr-1" /> 导入
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
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
          await createSnapshot(snapshotDate?.toISOString());
          setSnapshotDate(undefined);
          setSnapshotConfirmOpen(false);
        }}
        onCancel={() => setSnapshotConfirmOpen(false)}
      />
      <ConfirmDialog
        open={importConfirmOpen}
        title="导入数据"
        description={`即将导入 ${importData?.assets.length ?? 0} 项资产、${importData?.liabilities.length ?? 0} 项负债。数据将追加到现有数据，建议先清除现有数据以避免重复。`}
        confirmLabel="导入"
        variant="default"
        onConfirm={executeImport}
        onCancel={() => {
          setImportConfirmOpen(false);
          setImportData(null);
        }}
      />
    </div>
  );
}
