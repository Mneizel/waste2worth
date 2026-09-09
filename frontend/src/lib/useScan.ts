import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { ApiError, api } from './api';
import type { Scan } from './types';

interface LocationState {
  scan?: Scan;
}

export function useScan(scanId: string | undefined) {
  const location = useLocation();
  const seeded = (location.state as LocationState | null)?.scan;

  const [scan, setScan] = useState<Scan | null>(
    seeded && seeded.id === scanId ? seeded : null,
  );
  const [loading, setLoading] = useState(Boolean(scanId) && !scan);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!scanId) return;
    setLoading(true);
    setError(null);
    try {
      setScan(await api.getScan(scanId));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'تعذّر تحميل بيانات الجلسة. جرّب مرة ثانية.',
      );
    } finally {
      setLoading(false);
    }
  }, [scanId]);

  useEffect(() => {
    if (!scan && scanId) void reload();
  }, [scan, scanId, reload]);

  return { scan, setScan, loading, error, reload };
}
