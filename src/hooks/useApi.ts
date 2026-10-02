// Loads data from the API and tracks loading / error state.
//
//   const { data, loading, error, reload } = useApi(() => studentService.get(id), [id]);
//
// The request re-runs whenever a value in `deps` changes, or when reload() is called.
import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/services/api";

type Dep = string | number | boolean | null | undefined;

interface Result<T> {
  key: string | null;
  data: T | undefined;
  error: string | null;
}

export function useApi<T>(fetcher: () => Promise<T>, deps: Dep[] = []) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<Result<T>>({ key: null, data: undefined, error: null });

  // Always call the latest fetcher without re-running the effect for it.
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const key = JSON.stringify([...deps, version]);

  useEffect(() => {
    let cancelled = false;
    fetcherRef.current().then(
      (data) => {
        if (!cancelled) setResult({ key, data, error: null });
      },
      (error: unknown) => {
        if (!cancelled) setResult((previous) => ({ key, data: previous.data, error: getErrorMessage(error) }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  const setData = useCallback((data: T) => setResult((previous) => ({ ...previous, data })), []);

  const loading = result.key !== key;
  return { data: result.data, error: loading ? null : result.error, loading, reload, setData };
}
