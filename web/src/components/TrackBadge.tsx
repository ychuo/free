import { cn } from '../lib/utils';
import type { TrackType } from '../types';
import { TRACK_LABELS } from '../types';

const TRACK_COLORS: Record<TrackType, string> = {
  value: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  momentum: 'bg-amber-50 text-amber-700 border-amber-200',
  unclassified: 'bg-stone-50 text-stone-500 border-stone-200',
};

interface Props {
  track: TrackType;
  className?: string;
}

export default function TrackBadge({ track, className }: Props) {
  return (
    <span
      className={cn(
        'inline-block px-1.5 py-0.5 text-[10px] rounded border font-medium',
        TRACK_COLORS[track],
        className,
      )}
    >
      {TRACK_LABELS[track]}
    </span>
  );
}
