import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import { Button } from '../components/ui/button';
import { useAssets } from '../hooks/useAssets';
import { useTransactions } from '../hooks/useTransactions';
import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from '../types';
import { TRANSACTION_TYPE_LABELS } from '../types';

export default function TransactionList() {
  const { assets } = useAssets();
  const { transactions, loading, create, update, remove } = useTransactions();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();

  const handleSubmit = async (data: CreateTransactionInput | UpdateTransactionInput) => {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data as CreateTransactionInput);
    }
    setFormOpen(false);
    setEditing(undefined);
  };

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-lg font-serif font-medium tracking-wide text-deep">交易记录</h1>
          <p className="text-[12px] text-stone mt-0.5">管理买卖、分红和费用记录</p>
        </div>
        <Button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          size="sm"
        >
          <Plus className="h-3 w-3 mr-1" /> 新增交易
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-md bg-sand/20 animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-stone/50 text-[13px]">暂无交易记录</div>
      ) : (
        <div className="rounded-lg border border-sand/60 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-sand/30">
                <th className="text-left px-4 py-2 font-normal text-stone">日期</th>
                <th className="text-left px-4 py-2 font-normal text-stone">资产</th>
                <th className="text-left px-4 py-2 font-normal text-stone">类型</th>
                <th className="text-right px-4 py-2 font-normal text-stone">数量</th>
                <th className="text-right px-4 py-2 font-normal text-stone">价格</th>
                <th className="text-right px-4 py-2 font-normal text-stone">金额</th>
                <th className="text-right px-4 py-2 font-normal text-stone">费用</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const asset = assets.find((a) => a.id === tx.assetId);
                return (
                  <tr
                    key={tx.id}
                    className="border-t border-sand/30 hover:bg-sand/10 cursor-pointer"
                    onClick={() => {
                      setEditing(tx);
                      setFormOpen(true);
                    }}
                  >
                    <td className="px-4 py-2">{tx.date.slice(0, 10)}</td>
                    <td className="px-4 py-2">{asset?.name ?? tx.assetId}</td>
                    <td className="px-4 py-2">{TRANSACTION_TYPE_LABELS[tx.type] || tx.type}</td>
                    <td className="px-4 py-2 text-right">{tx.quantity ?? '-'}</td>
                    <td className="px-4 py-2 text-right">{tx.price?.toFixed(2) ?? '-'}</td>
                    <td className="px-4 py-2 text-right">{formatAmount(tx.amount)}</td>
                    <td className="px-4 py-2 text-right">{tx.fee ? formatAmount(tx.fee) : '-'}</td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(tx.id);
                        }}
                        className="text-stone/30 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <TransactionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
        onSubmit={handleSubmit}
        transaction={editing}
        assets={assets}
      />
    </div>
  );
}
