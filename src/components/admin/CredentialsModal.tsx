// Shows a temporary password ONCE (after creating an account or resetting a
// password). It is never stored in plain text and cannot be shown again.
import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modal/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import type { IssuedCredentials } from "@/types";

export function CredentialsModal({ credentials, onClose, title = "Temporary password issued" }: { credentials: IssuedCredentials | null; onClose: () => void; title?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(`Username: ${credentials.username}\nTemporary password: ${credentials.temporaryPassword}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked; the values are still visible */
    }
  }

  return (
    <Modal open={Boolean(credentials)} onClose={onClose} title={title} size="sm" footer={<Button onClick={onClose}>Done</Button>}>
      {credentials && (
        <div className="space-y-4">
          <Alert tone="warning">Give these to the account owner now. This password will <strong>not</strong> be shown again.</Alert>
          <dl className="space-y-3 rounded-lg border border-border bg-surface-muted p-4">
            <div>
              <dt className="text-xs text-ink-muted">Username</dt>
              <dd className="font-mono text-base font-semibold text-ink">{credentials.username}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Temporary password</dt>
              <dd className="flex items-center gap-2 font-mono text-base font-semibold text-primary-900">
                <KeyRound className="size-4 text-gold-600" aria-hidden="true" />
                {credentials.temporaryPassword}
              </dd>
            </div>
          </dl>
          <p className="text-sm text-ink-muted">They will be asked to choose a new password the first time they log in.</p>
          {credentials.emailSent && <p className="text-sm text-success-700">A notice was also emailed to the account's address.</p>}
          <Button variant="secondary" size="sm" onClick={copy} leftIcon={copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}>
            {copied ? "Copied" : "Copy to clipboard"}
          </Button>
        </div>
      )}
    </Modal>
  );
}
