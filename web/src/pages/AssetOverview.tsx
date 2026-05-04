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
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-lg font-serif font-medium tracking-wide text-deep">概览</h1>
          <p className="text-[12px] text-stone mt-0.5">你的资产全景</p>
        </div>
        <button
          onClick={createSnapshot}
          className="px-3 py-1.5 text-[12px] font-medium rounded-md border border-sand text-olive hover:bg-sand/50 transition-colors"
        >
          记录快照
        </button>
      </div>

      <NetWorthCard summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AssetPieChart summary={summary} />
        <AssetList assets={assets} onCreate={create} onUpdate={update} onDelete={remove} />
      </div>

      <LiabilityList liabilities={liabilities} onCreate={createL} onUpdate={updateL} onDelete={removeL} />
    </div>
  );
}
