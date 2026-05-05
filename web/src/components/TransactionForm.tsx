import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Asset, CreateTransactionInput, Transaction, UpdateTransactionInput } from '../types';
import { TRANSACTION_TYPE_LABELS, TransactionType } from '../types';
import Modal from './Modal';
import { Button } from './ui/button';
import { DatePicker } from './ui/date-picker';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionInput | UpdateTransactionInput) => void;
  transaction?: Transaction;
  assets: Asset[];
  preselectedAssetId?: string;
}

export default function TransactionForm({
  open,
  onClose,
  onSubmit,
  transaction,
  assets,
  preselectedAssetId,
}: TransactionFormProps) {
  const [assetId, setAssetId] = useState(transaction?.assetId ?? preselectedAssetId ?? '');
  const [type, setType] = useState<TransactionType>(transaction?.type ?? TransactionType.BUY);
  const [date, setDate] = useState(
    transaction?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
  );
  const [quantity, setQuantity] = useState(transaction?.quantity?.toString() ?? '');
  const [price, setPrice] = useState(transaction?.price?.toString() ?? '');
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? '');
  const [fee, setFee] = useState(transaction?.fee?.toString() ?? '');
  const [notes, setNotes] = useState(transaction?.notes ?? '');

  useEffect(() => {
    if (open) {
      setAssetId(transaction?.assetId ?? preselectedAssetId ?? '');
      setType(transaction?.type ?? TransactionType.BUY);
      setDate(transaction?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
      setQuantity(transaction?.quantity?.toString() ?? '');
      setPrice(transaction?.price?.toString() ?? '');
      setAmount(transaction?.amount?.toString() ?? '');
      setFee(transaction?.fee?.toString() ?? '');
      setNotes(transaction?.notes ?? '');
    }
  }, [open, transaction, preselectedAssetId]);

  const handleSubmit = () => {
    if (!assetId || !date || !amount) return;
    const data: CreateTransactionInput = {
      assetId,
      type,
      date,
      quantity: quantity ? parseFloat(quantity) : null,
      price: price ? parseFloat(price) : null,
      amount: parseFloat(amount),
      fee: fee ? parseFloat(fee) : null,
      notes: notes || null,
    };
    onSubmit(data);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">{transaction ? '编辑交易' : '新增交易'}</h2>
          <button type="button" onClick={onClose} className="text-stone/50 hover:text-stone">
            <X className="h-3 w-3" />
          </button>
        </div>

        <div>
          <label className="text-[12px] text-stone">资产</label>
          <Select value={assetId} onValueChange={(v) => setAssetId(v ?? '')}>
            <SelectTrigger className="w-full h-8 text-[13px]">
              <SelectValue placeholder="选择资产">
                {assets.find((a) => a.id === assetId)?.name ?? '选择资产'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {assets.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[12px] text-stone">类型</label>
          <Select
            value={type}
            onValueChange={(v) => setType((v ?? TransactionType.BUY) as TransactionType)}
          >
            <SelectTrigger className="w-full h-8 text-[13px]">
              <SelectValue placeholder="选择类型">{TRANSACTION_TYPE_LABELS[type]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TRANSACTION_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[12px] text-stone">日期</label>
          <DatePicker
            value={date}
            onChange={setDate}
            placeholder="选择日期"
            className="bg-transparent hover:bg-sand/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[12px] text-stone">数量</label>
            <Input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="可选"
              className="h-8 text-[13px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-stone">单价</label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="可选"
              className="h-8 text-[13px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[12px] text-stone">金额 *</label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="交易金额"
              className="h-8 text-[13px]"
            />
          </div>
          <div>
            <label className="text-[12px] text-stone">手续费</label>
            <Input
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="0"
              className="h-8 text-[13px]"
            />
          </div>
        </div>

        <div>
          <label className="text-[12px] text-stone">备注</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-8 text-[13px]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            {transaction ? '保存' : '创建'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
