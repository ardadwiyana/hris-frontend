# Nadi HRIS — Frontend

Frontend HRIS SaaS ("Soft Candy Red") untuk backend Express + Prisma yang sudah ada, dibangun dengan React + TypeScript + Vite + Tailwind v4.

## Menjalankan proyek

```bash
npm install
cp .env.example .env   # sesuaikan VITE_API_URL dengan alamat backend Anda
npm run dev
```

Build produksi:

```bash
npm run build
npm run preview
```

## Konfigurasi

Satu-satunya environment variable yang dibutuhkan:

```
VITE_API_URL=http://localhost:3000/api
```

## Struktur proyek

Feature-based architecture di `src/features/*` (auth, dashboard, employee, attendance, leave, department, position, user), dengan lapisan `api/`, `hooks/`, `types/`, `components/`, `pages/` di masing-masing fitur. Komponen reusable ada di `src/components/{ui,layout,common,table,form,feedback}`.

## Keterbatasan yang mengikuti backend apa adanya

Frontend ini sengaja **tidak mengarang endpoint atau field** yang tidak ada di backend. Beberapa penyesuaian penting:

- **Role**: hanya `admin`, `manager`, `employee` (tidak ada role "HR" terpisah).
- **Employee**: tidak ada field Gender / Tanggal Lahir di database — form Add/Edit tidak menampilkannya.
- **Create Employee**: otomatis membuat akun user dengan password ter-generate. Password ini ditampilkan sekali lewat modal setelah create — simpan/salin sebelum menutup modal tersebut.
- **Position**: tidak punya relasi ke Department di database, sehingga kolom "Department" tidak ditampilkan di halaman Positions.
- **Attendance**: backend kini memiliki kolom `status` (string bebas) pada tabel `attendances`. Frontend memakai nilai ini langsung untuk badge/status; nilai dikirim otomatis ("Hadir"/"Terlambat") saat Clock In lewat fitur Quick Attendance berdasarkan jam saat itu. Saat Clock Out, frontend **tidak mengirim ulang `status`** — asumsinya endpoint upsert hanya memperbarui field yang dikirim (clock_out saja) dan tidak menimpa status yang sudah tersimpan dari saat Clock In. Mohon konfirmasi/sesuaikan bila perilaku upsert di backend berbeda. Untuk data lama yang belum punya `status` tersimpan, frontend memakai estimasi dari jam masuk sebagai fallback (lihat `src/utils/attendance.ts`).
- **Leave & User**: backend tidak menyediakan endpoint update selain `PATCH /leaves/:id/status`. Karena itu tidak ada "Edit Leave" atau "Edit User" — hanya create, approve/reject (leave), dan delete.
- **Proteksi endpoint**: saat ini hanya route `/employees` yang benar-benar dilindungi middleware auth/role di backend. Route lain (departments, positions, attendances, leaves, users) belum diberi middleware. Frontend tetap menerapkan `ProtectedRoute` berbasis role untuk UX yang konsisten, tapi proteksi sesungguhnya perlu ditambahkan di backend.
- **Pencarian/paginasi**: endpoint backend tidak mendukung query pencarian/paginasi/sorting, sehingga semuanya dilakukan di sisi client setelah data lengkap diambil.

## Kredensial login

Gunakan akun yang sudah ada di database (dibuat lewat `/api/auth/register` atau otomatis saat menambah karyawan). Username harus berformat email.
