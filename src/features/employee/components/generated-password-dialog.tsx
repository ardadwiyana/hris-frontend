import { useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GeneratedPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  email: string;
  password: string;
}

export function GeneratedPasswordDialog({
  open,
  onOpenChange,
  employeeName,
  email,
  password,
}: GeneratedPasswordDialogProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may be unavailable; user can still select the text manually.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Karyawan Berhasil Ditambahkan"
      description={`Akun login untuk ${employeeName} telah dibuat otomatis. Password ini hanya ditampilkan sekali — catat dan bagikan secara aman.`}
      size="sm"
      footer={<Button onClick={() => onOpenChange(false)}>Selesai</Button>}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-[var(--radius-control)] bg-primary-light/50 px-3.5 py-2.5">
          <KeyRound className="h-4 w-4 shrink-0 text-primary-dark" />
          <div className="min-w-0">
            <p className="text-xs text-text-secondary">Email</p>
            <p className="truncate text-sm font-medium text-text-primary">{email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] border border-border bg-card px-3.5 py-2.5">
          <div className="min-w-0">
            <p className="text-xs text-text-secondary">Password Sementara</p>
            <p className="truncate font-mono text-sm font-semibold text-text-primary">{password}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Tersalin" : "Salin"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
