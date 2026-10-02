// Keeps field-level errors from the API next to the right inputs.
//
//   const { errors, setFromError, clear } = useFormErrors();
//   try { await save() } catch (e) { setFromError(e) }
//   <TextInput error={errors.firstName} ... />
import { useCallback, useState } from "react";
import { ApiError } from "@/services/api";

export function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Returns true if the error had field messages (so you can skip a toast). */
  const setFromError = useCallback((error: unknown) => {
    if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
      setErrors(error.fieldErrors);
      return true;
    }
    setErrors({});
    return false;
  }, []);

  const clear = useCallback(() => setErrors({}), []);
  return { errors, setErrors, setFromError, clear };
}
