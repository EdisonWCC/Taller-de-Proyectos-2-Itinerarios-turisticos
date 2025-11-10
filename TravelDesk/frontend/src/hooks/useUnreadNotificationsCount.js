import { useEffect, useState, useCallback } from 'react';

export default function useUnreadNotificationsCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem('user');
      const parsed = stored ? JSON.parse(stored) : null;
      const tk = parsed?.token || '';
      if (!tk) {
        setCount(0);
        setLoading(false);
        return;
      }
      const res = await fetch(`http://localhost:3000/api/turista/notificaciones?dias=14`, {
        headers: { Authorization: `Bearer ${tk}` }
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        setCount(0);
      } else {
        const unread = data.filter(n => !n.read).length;
        setCount(unread);
      }
    } catch {
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const onRefresh = () => fetchCount();
    window.addEventListener('notif-refresh', onRefresh);
    window.addEventListener('focus', onRefresh);
    return () => {
      window.removeEventListener('notif-refresh', onRefresh);
      window.removeEventListener('focus', onRefresh);
    };
  }, [fetchCount]);

  return { count, loading, refresh: fetchCount };
}
