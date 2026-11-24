import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Standard disclaimer used wherever a processing duration or program outcome is
 * described. Durations are estimates only; the decision always rests with the
 * relevant immigration authority or embassy.
 */
export const EstimateNotice: React.FC<{
  className?: string;
  text?: string;
  compact?: boolean;
}> = ({
  className = '',
  text = 'Durations shown are planning estimates only. Actual timelines depend on the destination authority, quota availability and document readiness, and the final decision always rests with the relevant immigration authority or embassy.',
  compact = false,
}) => (
  <div
    className={`flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50 text-amber-900 ${
      compact ? 'px-3 py-2.5 text-xs leading-relaxed' : 'px-4 py-3.5 text-xs leading-relaxed'
    } ${className}`}
  >
    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
    <span>{text}</span>
  </div>
);
