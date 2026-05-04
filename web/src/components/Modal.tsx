import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 animate-[fade-in_120ms_ease-out]"
        onClick={onClose}
      />
      <div className="relative animate-[modal-in_150ms_ease-out] rounded-lg border border-sand bg-ivory p-5 shadow-lg">
        {children}
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modal-in { from { opacity: 0; transform: scale(0.97) translateY(6px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      `}</style>
    </div>,
    document.body
  );
}
