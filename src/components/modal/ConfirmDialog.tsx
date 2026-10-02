// "Are you sure?" dialog for important actions (publish grades, void payment...).
//
//   <ConfirmDialog open={open} title="Publish these grades?"
//     description="Published grades will become visible to students."
//     confirmLabel="Publish" onConfirm={publish} onCancel={close} loading={busy} />
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  tone?: "primary" | "danger";
  /** Extra content, e.g. a "reason" textarea. */
  children?: ReactNode;
  confirmDisabled?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  loading = false,
  tone = "primary",
  children,
  confirmDisabled,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      dismissible={!loading}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-ink-soft">{description}</div>
      {children && <div className="mt-4">{children}</div>}
    </Modal>
  );
}
