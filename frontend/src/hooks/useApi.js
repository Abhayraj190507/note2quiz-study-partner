import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

/**
 * GET a path and keep { data, error, loading }. Pass null to skip. `reload()` refetches without
 * clearing the old data, so lists don't flash while they refresh.
 */
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: path !== null });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (path === null) { setState({ data: null, error: null, loading: false }); return; }
    let live = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    api.get(path)
      .then((data) => live && setState({ data, error: null, loading: false }))
      .catch((error) => live && setState((s) => ({ data: s.data, error, loading: false })));
    return () => { live = false; };
  }, [path, n]);
  const reload = useCallback(() => setN((x) => x + 1), []);
  return { ...state, reload };
}
