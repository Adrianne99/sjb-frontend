// A search box whose value lives in the URL.
// Typing updates the box immediately; the URL (and the API request) follows
// after a short pause. If the URL changes from elsewhere (e.g. the top-bar
// search), the box updates to match.
//
//   const [searchText, setSearchText] = useSearchBox(filters.search, (value) => setFilter("search", value));
import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

export function useSearchBox(urlValue: string, commit: (value: string) => void) {
  const [text, setText] = useState(urlValue);

  // Follow outside changes to the URL.
  const [seenUrlValue, setSeenUrlValue] = useState(urlValue);
  if (urlValue !== seenUrlValue) {
    setSeenUrlValue(urlValue);
    setText(urlValue);
  }

  const commitRef = useRef(commit);
  const urlRef = useRef(urlValue);
  useEffect(() => {
    commitRef.current = commit;
    urlRef.current = urlValue;
  });

  const debounced = useDebouncedValue(text);
  useEffect(() => {
    if (debounced !== urlRef.current) commitRef.current(debounced);
  }, [debounced]);

  return [text, setText] as const;
}
