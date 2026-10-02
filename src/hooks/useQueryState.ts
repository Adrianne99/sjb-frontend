// Keeps list filters in the URL (?search=...&page=2), so they survive a refresh
// and can be shared or bookmarked.
//
//   const [filters, setFilter] = useQueryState({ search: "", status: "", page: "1" });
//   setFilter("status", "ENROLLED");   // also resets page to 1
//   setFilters({ sectionId: "3", subjectId: "7" });  // several keys at once
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

export function useQueryState<T extends Record<string, string>>(defaults: T) {
  const [params, setParams] = useSearchParams();

  const values = useMemo(() => {
    const result = { ...defaults };
    for (const key of Object.keys(defaults) as Array<keyof T>) {
      const value = params.get(key as string);
      if (value !== null) result[key] = value as T[keyof T];
    }
    return result;
    // `defaults` is a literal object in each page; its keys never change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const setValues = useCallback(
    (patch: Partial<Record<keyof T & string, string>>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(patch) as Array<[string, string | undefined]>) {
            if (value) next.set(key, value);
            else next.delete(key);
          }
          if (!("page" in patch)) next.delete("page"); // new filters start at page 1
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setValue = useCallback(
    (key: keyof T & string, value: string) => setValues({ [key]: value } as Partial<Record<keyof T & string, string>>),
    [setValues],
  );

  return [values, setValue, setValues] as const;
}
