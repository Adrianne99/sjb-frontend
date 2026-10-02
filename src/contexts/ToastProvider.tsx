// Small success/error notifications in the corner. Use with the useToast() hook:
//   const toast = useToast();  toast.success("Payment recorded.");
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { ToastContext, type ToastApi, type ToastMessage, type ToastTone } from "./toast-context";

const icons = { success: CircleCheck, error: CircleAlert, info: Info };
const styles = {
  success: "border-l-success-600 [&_svg]:text-success-600",
  error: "border-l-danger-600 [&_svg]:text-danger-600",
  info: "border-l-primary-600 [&_svg]:text-primary-600",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);

  const show = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-3), { id, tone, title, description }]);
      window.setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4500);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, description) => show("success", title, description),
      error: (title, description) => show("error", title, description),
      info: (title, description) => show("info", title, description),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" aria-relevant="additions" className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:w-96 no-print">
        {toasts.map((toast) => {
          const Icon = icons[toast.tone];
          return (
            <div
              key={toast.id}
              role={toast.tone === "error" ? "alert" : "status"}
              className={cn("pointer-events-auto flex w-full animate-slide-up gap-3 rounded-lg border border-l-4 border-border bg-surface p-4 shadow-lg", styles[toast.tone])}
            >
              <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{toast.title}</p>
                {toast.description && <p className="mt-0.5 text-sm text-ink-muted">{toast.description}</p>}
              </div>
              <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="-m-1 flex size-7 items-center justify-center rounded text-ink-muted hover:bg-surface-muted">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
