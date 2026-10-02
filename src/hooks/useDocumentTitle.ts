import { useEffect } from "react";
import { school } from "@/config/school";

/** Sets the browser tab title, e.g. "Students | Saint John Bosco". */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${school.shortName}` : school.name;
  }, [title]);
}
