# Monitrack Web (Next.js)

Monitrack adalah aplikasi pelacak pemasukan dan pengeluaran pribadi yang berjalan 100% di browser. Seluruh data disimpan di IndexedDB dan localStorage sehingga tidak membutuhkan backend ataupun akun.

## Fitur

- Dashboard dengan ringkasan saldo, pemasukan/pengeluaran bulanan, dan grafik pengeluaran 7 hari terakhir.
- Form tambah transaksi dengan kategori preset dan kategori custom yang otomatis tersimpan.
- Riwayat transaksi lengkap dengan filter rentang tanggal (hari ini, minggu ini, bulan ini, semua, dan custom).
- Export data ke CSV/JSON dan import kembali langsung dari browser.
- Pengaturan profil sederhana untuk nama pengguna dan mata uang utama.
- Desain responsif menggunakan Tailwind CSS dengan dukungan dark mode.

## Teknologi

- [Next.js 15](https://nextjs.org/)
- [React 18](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- IndexedDB (native browser API)
- Chart.js

## Menjalankan secara lokal

```bash
pnpm install
pnpm dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

## Deployment

Aplikasi dapat langsung dideploy ke Vercel tanpa konfigurasi tambahan karena seluruh fitur berjalan di sisi klien.
