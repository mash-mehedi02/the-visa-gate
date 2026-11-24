import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import { Bell, CheckCheck, X, ShieldAlert } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  linkUrl?: string | null;
}

/**
 * Console notification bell. Also the delivery channel for the staff
 * two-factor verification code, so it must stay reachable on every breakpoint.
 */
export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/notifications?limit=10');
      if (res.data) setItems(res.data);
    } catch {
      // A failed notification fetch must never block the console.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const unreadCount = items.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Non-critical.
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // Non-critical.
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative flex items-center justify-center w-9 h-9 rounded-md bg-slate-50 text-slate-500 hover:text-brand-navy hover:bg-slate-100 border border-slate-200 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-gold text-brand-navy text-xs font-bold flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider">Notifications</h2>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded text-xs font-semibold text-brand-navy hover:bg-brand-navy/5 min-h-[36px]"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="p-1.5 rounded text-slate-500 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-slate-500">Loading notifications…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-slate-500">
                You have no notifications right now.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                        n.isRead ? '' : 'bg-brand-gold/5'
                      }`}
                    >
                      <span className="flex items-start gap-2.5">
                        {!n.isRead && (
                          <span
                            className="w-2 h-2 rounded-full bg-brand-gold shrink-0 mt-1.5"
                            aria-label="Unread"
                          />
                        )}
                        <span className="min-w-0 grow">
                          <span className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-brand-navy truncate">{n.title}</span>
                            {n.type === 'URGENT' && (
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            )}
                          </span>
                          <span className="block text-xs text-slate-600 leading-relaxed mt-0.5 break-words">
                            {n.message}
                          </span>
                          <span className="block text-xs text-slate-500 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
