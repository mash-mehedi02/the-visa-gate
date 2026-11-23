import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Tailwind max-width class for the dialog panel. */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Prevent closing on backdrop click (used for destructive confirmations in flight). */
  dismissible?: boolean;
}

const MAX_WIDTH_CLASS: Record<NonNullable<ModalProps['maxWidth']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: labelled, described, Escape-dismissable, focus-trapped,
 * and restores focus to the trigger when closed.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  dismissible = true,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const focusFirst = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      const target = focusable.length > 0 ? focusable[0] : panel;
      target.focus();
    };

    // Focus after paint so the dialog is mounted and visible first.
    const raf = window.requestAnimationFrame(focusFirst);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose, dismissible]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-brand-navy/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      onMouseDown={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`bg-white rounded-2xl w-full ${MAX_WIDTH_CLASS[maxWidth]} my-4 sm:my-8 shadow-2xl border border-slate-100 flex flex-col max-h-[calc(100vh-2rem)]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 sm:px-6 py-4 shrink-0">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-bold text-brand-navy font-serif">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-xs text-slate-500 mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 overflow-y-auto grow">{children}</div>

        {footer && (
          <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2 shrink-0 bg-slate-50/60 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
