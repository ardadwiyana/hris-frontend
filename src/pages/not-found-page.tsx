import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Halaman tidak ditemukan</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
      </div>
      <Link to="/dashboard">
        <Button>Kembali ke Dashboard</Button>
      </Link>
    </div>
  );
}
