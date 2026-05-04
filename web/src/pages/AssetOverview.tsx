import { Camera } from 'lucide-react';
import { useAssets } from '../hooks/useAssets';
import { useLiabilities } from '../hooks/useLiabilities';
import { useNetWorth } from '../hooks/useNetWorth';
import NetWorthCard from '../components/NetWorthCard';
import AssetPieChart from '../components/AssetPieChart';
import AssetList from '../components/AssetList';
import LiabilityList from '../components/LiabilityList';

export default function AssetOverview() {
  const { assets, create, update, remove } = useAssets();
  const { liabilities, create: createL, update: updateL, remove: removeL } = useLiabilities();
  const { summary, createSnapshot } = useNetWorth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">资产总览</h1>
        <button onClick={createSnapshot} className="flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-secondary text-sm">
          <Camera className="h-4 w-4" /> 生成快照
        </button>
      </div>
      <NetWorthCard summary={summary} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetPieChart summary={summary} />
        <AssetList assets={assets} onCreate={create} onUpdate={update} onDelete={remove} />
      </div>
      <LiabilityList liabilities={liabilities} onCreate={createL} onUpdate={updateL} onDelete={removeL} />
    </div>
  );
}
