import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent showCloseButton={false} className="border-sand bg-ivory p-5">
        {children}
      </DialogContent>
    </Dialog>
  );
}
