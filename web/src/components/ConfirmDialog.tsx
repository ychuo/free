import { Dialog, DialogContent, DialogHeader, DialogTitle  } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent showCloseButton={false} className="max-w-xs">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-muted-foreground">{description}</p>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onCancel}>取消</Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>删除</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
