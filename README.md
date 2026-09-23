# Rekber

Manual teknis untuk platform rekening bersama (escrow) yang terdiri dari aplikasi pengguna, dashboard admin, dan API backend.

> **Status dokumentasi:** Manual ini disusun dari source code dan konfigurasi yang ada di repository. Nilai secret, kredensial, serta konfigurasi deployment tidak ditampilkan. Bagian yang tidak dapat dipastikan dari repository ditandai **Need configuration**.

## 1. Deskripsi Project

Rekber adalah platform untuk memfasilitasi transaksi rekening bersama antara pembeli dan penjual. API menyimpan data pengguna, transaksi, pembayaran, status transaksi, percakapan, KYC, notifikasi, voucher, konten, dan laporan. Frontend pengguna menyediakan alur transaksi dan dashboard; frontend admin menyediakan operasi dan moderasi.

### Masalah yang ditangani

- Menyediakan alur transaksi dengan peran pembeli dan penjual.
- Mengelola pembayaran, biaya layanan, voucher, virtual account, refund, dan pencairan.
- Menyediakan verifikasi identitas KYC sebelum fitur tertentu digunakan.
- Menyediakan komunikasi transaksi melalui chat dan notifikasi real-time.
- Menyediakan payment link dan product link yang dapat dibagikan.
- Menyediakan operasi admin untuk memantau transaksi, pengguna, KYC, konten, kategori, dan partnership.

### Pengguna sistem

- **Pengguna:** pembeli, penjual, atau pengguna yang membuat/mengklaim link transaksi.
- **Admin:** mengelola transaksi, pembayaran, pengguna, KYC, voucher, blog, kategori, halaman statis, dan partnership.

## 2. Teknologi yang Digunakan

Versi di bawah mengikuti deklarasi dependency pada masing-masing `package.json`; tanda `^` berarti versi yang diizinkan oleh package manager dapat lebih baru dalam major version yang sama.

| Teknologi/framework | Versi yang dideklarasikan | Tujuan |
|---|---:|---|
| Next.js (frontend pengguna) | `^15.5.9` | Rendering dan routing aplikasi pengguna |
| Next.js (dashboard admin) | `^14.2.35` | Rendering dan routing dashboard admin |
| React | `^19.0.0` / `^19.2.4` | UI frontend |
| TypeScript | `^5.8.3` / `^5` | Type checking frontend |
| Tailwind CSS | `^4` / `^4.1.9` | Styling |
| Express | `^5.1.0` | HTTP API backend |
| Node.js | Need configuration | Runtime frontend dan backend; versi engine tidak dikunci di package.json |
| PostgreSQL (`pg`) | `^8.16.3` | Database backend |
| Prisma | `^7.4.0` | Dependency dan konfigurasi schema pada admin; belum memiliki model/migration aktif |
| JWT (`jsonwebtoken`) | `^9.0.2` | Autentikasi user dan admin |
| Socket.IO | `^4.8.1` / `^4.8.3` | Chat dan notifikasi real-time |
| Cloudinary, Multer | `^1.41.3`, `^2.0.2` | Upload dan penyimpanan media |
| Nodemailer | `^7.0.5` | Pengiriman email |
| Google Auth Library | `^11.0.0` | Login Google |
| node-cron | `^4.2.1` | Pembatalan otomatis transaksi yang kedaluwarsa |
| OpenNext Cloudflare | `^1.16.5` | Build/deployment frontend ke Cloudflare |
| Wrangler | `^4.67.0` / `^4.68.1` | Preview dan deployment Cloudflare |

## 3. Arsitektur Project

Repository berisi tiga aplikasi yang dijalankan terpisah:

1. `rekber`: frontend publik dan dashboard pengguna berbasis Next.js.
2. `rekber-admin`: dashboard operasi admin berbasis Next.js.
3. `rekber_api`: API Express yang berkomunikasi dengan PostgreSQL dan layanan eksternal.

```mermaid
flowchart LR
    U[Pengguna] --> F[rekber<br/>Next.js]
    A[Admin] --> AD[rekber-admin<br/>Next.js]
    F -->|HTTP JSON / multipart| API[rekber_api<br/>Express + Socket.IO]
    AD -->|HTTP JSON / multipart| API
    API --> DB[(PostgreSQL)]
    API --> CL[Cloudinary]
    API --> MAIL[Nodemailer / SMTP]
    API --> PAY[Payment provider<br/>konfigurasi tidak ditentukan]
    API <-->|WebSocket / polling| F
    API <-->|WebSocket / polling| AD
```

### Frontend pengguna

`rekber/src/app` berisi route publik, autentikasi, dashboard, transaksi, KYC, payment link, product link, chat, blog, kalkulator fee, dan halaman informasi/legal. Base URL API dibaca dari `NEXT_PUBLIC_API_URL` dengan fallback yang didefinisikan source.

### Frontend admin

`rekber-admin/src/app` berisi login dan halaman dashboard untuk statistik, transaksi, pembayaran, pengguna, partnership, KYC, voucher, blog, kategori, halaman konten, dan chat. Konfigurasi admin saat ini mengarah ke API production melalui `next.config.js`; tidak ditemukan file `.env` admin yang mendefinisikan URL API.

### Backend dan API

`rekber_api/index.js` membuat Express app dan HTTP server Socket.IO. Route dipasang tanpa prefix global untuk sebagian besar endpoint, sedangkan beberapa route juga tersedia di prefix `/api`. API memuat `.env`, lalu `.env.local` dengan `override: true`.

### Database

Backend memakai PostgreSQL melalui `pg`. Dump awal tersedia di `rekber_api/db/rekber.sql`. Saat startup, API juga menjalankan perubahan struktur idempotent untuk beberapa kolom/tabel, sehingga dump awal bukan satu-satunya sumber schema.

### Autentikasi dan otorisasi

- User memakai JWT pada header `Authorization: Bearer <token>`.
- Admin memakai JWT yang harus memiliki `is_admin` truthy.
- Frontend admin menyimpan status login di `localStorage`; API tetap menjadi tempat validasi akses sebenarnya.
- Login Google menggunakan credential dari Google OAuth.
- CORS menerima domain production yang didefinisikan backend dan origin localhost/127.0.0.1 dengan port.

### Layanan eksternal

Cloudinary digunakan untuk media, Nodemailer untuk email, Google untuk login, dan payment provider untuk callback pembayaran. Nama/provider pembayaran serta konfigurasi SMTP production tidak dapat ditentukan dari repository (**Need configuration**).

## 4. Struktur Folder

```text
.
├── rekber/                 # Frontend pengguna/storefront Next.js
│   ├── src/app/            # Route publik, auth, dashboard, dan halaman fitur
│   ├── src/components/     # Komponen UI bersama
│   ├── src/hooks/          # Hook auth, KYC, notifikasi, dan API terkait
│   ├── src/constants/      # Konstanta, termasuk konfigurasi API
│   ├── public/              # Asset publik dan service worker/PWA
│   ├── next.config.ts       # Konfigurasi Next.js/PWA
│   ├── wrangler.toml        # Konfigurasi Cloudflare
│   └── package.json         # Script dan dependency frontend pengguna
├── rekber_api/             # Backend Express/CommonJS
│   ├── index.js             # Bootstrap server, route, CORS, Socket.IO, cron
│   ├── routes/              # Definisi endpoint
│   ├── controllers/         # Handler request dan aturan proses bisnis
│   ├── models/              # Akses/aturan data tertentu
│   ├── middleware/           # JWT user dan admin
│   ├── config/               # Koneksi database dan Cloudinary
│   ├── utils/                # Email, cipher ID, dan utility backend
│   ├── db/rekber.sql         # Dump schema/data PostgreSQL
│   ├── scripts/              # Pembuatan tabel/seed manual
│   └── package.json          # Script dan dependency backend
├── rekber-admin/            # Dashboard admin Next.js
│   ├── src/app/              # Route login dan dashboard admin
│   ├── src/components/       # Sidebar, auth guard, dan komponen admin
│   ├── prisma/               # Schema Prisma (belum berisi model)
│   ├── next.config.js        # Konfigurasi Next.js dan URL API admin
│   ├── wrangler.toml         # Konfigurasi Cloudflare
│   └── package.json          # Script dan dependency dashboard admin
└── README.md                # Manual teknis ini
```

Folder `backup/`, `static-pages-2026-07-30/`, dan output `.open-next` bukan sumber konfigurasi runtime utama; jangan menjadikannya dasar instalasi baru tanpa verifikasi tambahan.

## 5. Persyaratan Sistem

- OS: Linux, macOS, atau Windows yang mampu menjalankan Node.js dan PostgreSQL. Repository tidak menetapkan OS minimum.
- Node.js: diperlukan untuk ketiga aplikasi. Versi minimum/tepat tidak dikunci pada `engines`; gunakan versi LTS yang kompatibel dengan Next.js dan dependency yang terpasang (**Need configuration** untuk versi resmi tim).
- Package manager: `npm` digunakan oleh script dan package layout repository.
- PostgreSQL: backend mengharapkan PostgreSQL pada konfigurasi `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME`. Dump menyebut PostgreSQL server version `12.0.4`, tetapi versi production tidak ditentukan.
- Layanan eksternal bila fitur terkait dipakai: Cloudinary, Google OAuth, email/SMTP, dan payment provider.
- `nodemon`: dibutuhkan oleh `npm run dev` pada API, tetapi tidak tercantum dalam `rekber_api/package.json`. Instalasi lokal atau konfigurasi global perlu disediakan sendiri (**Need configuration**).

## 6. Instalasi

### 6.1 Clone repository

```bash
git clone https://github.com/bagusansyah/rekber-project-pkl.git
cd rekber-project-pkl
```

URL di atas adalah remote repository yang terlihat dari riwayat push; gunakan URL fork Anda bila diperlukan.

### 6.2 Install dependency

```bash
cd rekber
npm install

cd ../rekber_api
npm install

cd ../rekber-admin
npm install
```

### 6.3 Siapkan environment

Buat file environment berdasarkan tabel pada bagian [Konfigurasi Environment](#7-konfigurasi-environment). Repository tidak menyediakan `.env.example` yang aman untuk ketiga aplikasi. Jangan menyalin secret production ke Git.

Untuk API, kode memuat `.env` dan kemudian `.env.local`; `.env.local` akan menimpa nilai `.env`. Siapkan PostgreSQL lebih dahulu sebelum menjalankan API.

### 6.4 Siapkan database

Buat database PostgreSQL sesuai nilai `DB_NAME`, lalu impor dump:

```bash
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d <DB_NAME> -f rekber_api/db/rekber.sql
```

Setelah server API dijalankan, startup akan mencoba menambahkan kolom `expired_at`, `google_id`, `product_images`, `product_link_id`, tabel `kyc_verifications`, dan unique index Google ID bila belum ada.

Tabel tambahan dapat dibuat/di-seed dengan script yang tersedia:

```bash
cd rekber_api
node scripts/createProductLinksTable.js
node scripts/seedStaticPages.js
```

Tidak ada sistem migration versioned yang aktif pada API. Tabel `withdrawals` dirujuk oleh route/controller tetapi schema pembuatannya tidak ditemukan (**Need configuration** sebelum mengaktifkan alur withdrawal). Schema Prisma admin juga belum memiliki model atau migration aktif.

### 6.5 Build

Build Next.js standar:

```bash
cd rekber
npm run build

cd ../rekber-admin
npm run build
```

Build Cloudflare/OpenNext yang tersedia:

```bash
cd rekber
npm run pages:build

cd ../rekber-admin
npm run pages:build
```

## 7. Konfigurasi Environment

Nilai contoh di bawah adalah placeholder, bukan kredensial yang dapat dipakai. Nilai rahasia yang pernah tersimpan di file konfigurasi repository harus dianggap sensitif dan sebaiknya dirotasi.

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | Opsional | Port HTTP API; default source adalah `5000` | `5000` |
| `DB_HOST` | Ya untuk API | Host PostgreSQL | `localhost` |
| `DB_PORT` | Ya untuk API | Port PostgreSQL | `5432` |
| `DB_USER` | Ya untuk API | User database | `rekber_user` |
| `DB_PASSWORD` | Ya untuk API | Password database | `<password>` |
| `DB_NAME` | Ya untuk API | Nama database | `rekber` |
| `JWT_SECRET` | Ya untuk API | Secret signing JWT | `<random-secret>` |
| `ID_CIPHER_SECRET` | Untuk fitur terkait | Secret enkripsi ID transaksi admin | `<random-secret>` |
| `CLOUDINARY_CLOUD_NAME` | Untuk upload media | Nama cloud Cloudinary | `<cloud-name>` |
| `CLOUDINARY_API_KEY` | Untuk upload media | API key Cloudinary | `<api-key>` |
| `CLOUDINARY_API_SECRET` | Untuk upload media | API secret Cloudinary | `<api-secret>` |
| `GOOGLE_CLIENT_ID` | Untuk Google login | Client ID Google OAuth backend | `<client-id>` |
| `APP_URL` | Opsional | URL aplikasi yang dipakai backend; fallback source adalah `https://www.rekber.com` | `http://localhost:3000` |
| `INDEXNOW_KEY` | Opsional | Key IndexNow bila fitur terkait digunakan | `<indexnow-key>` |
| `NEXT_PUBLIC_API_URL` | Frontend pengguna | Base URL API yang diekspos ke browser | `http://localhost:5000` |
| `NEXT_PUBLIC_SITE_URL` | Frontend pengguna | URL situs frontend | `http://localhost:3000` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google login frontend | Client ID Google OAuth browser | `<client-id>` |
| `NEXT_PUBLIC_SOCKET_URL` | Chat/notifikasi bila diatur | URL server Socket.IO | `http://localhost:5000` |
| `NEXT_PUBLIC_ID_HASH_SALT` | Fitur hash ID frontend | Salt hash ID pada frontend | `<random-salt>` |
| `NEXTAUTH_SECRET` | Deployment/config tertentu | Secret yang dirujuk konfigurasi frontend | `<random-secret>` |
| `DATABASE_URL` | Prisma admin bila digunakan | Connection string PostgreSQL Prisma | `postgresql://user:password@localhost:5432/rekber` |

`rekber-admin` tidak memiliki file `.env`/`.env.production` yang mendefinisikan URL API; `next.config.js` saat ini menetapkan URL API production. Pastikan keputusan deployment tersebut disengaja sebelum menjalankan admin secara lokal.

## 8. Menjalankan Project

Buka tiga terminal dari root repository.

### API

```bash
cd rekber_api
npm start
```

API mendengarkan pada `PORT` atau `http://localhost:5000`. Server baru mulai listen setelah pemeriksaan/update database startup selesai.

Script development yang tersedia:

```bash
npm run dev
```

Script ini memanggil `nodemon`, tetapi `nodemon` tidak dideklarasikan sebagai dependency repository.

### Frontend pengguna

```bash
cd rekber
npm run dev
```

Default Next.js adalah `http://localhost:3000`. Atur `NEXT_PUBLIC_API_URL=http://localhost:5000` untuk mengarah ke API lokal.

### Dashboard admin

```bash
cd rekber-admin
npm run dev -- --port 3001
```

Port `3001` dipakai agar tidak bentrok dengan frontend pengguna yang default-nya `3000`. Pastikan konfigurasi API admin mengarah ke server yang diinginkan; source saat ini mengandung URL production.

### Production

Server Next.js hasil build dapat dijalankan dengan:

```bash
cd rekber
npm run start

cd ../rekber-admin
npm run start
```

Untuk deployment Cloudflare/OpenNext, script `pages:build`, `pages:deploy`, dan `preview` tersedia pada kedua frontend. Kredensial Cloudflare, project, domain binding, dan environment production tidak ditentukan di repository (**Need configuration**).

## 9. Akun / Login

### User

1. Buka `/auth/register`.
2. Kirim `name`, `email`, `password`, dan `phone`.
3. Password harus minimal 8 karakter dan mengandung huruf besar, huruf kecil, serta angka.
4. Aktivasi akun dilakukan melalui alur `/auth/activate` menggunakan token.
5. Login biasa dilakukan melalui `/auth/login`; token JWT berlaku 30 hari menurut controller.
6. Alternatifnya, gunakan login Google melalui `/auth/google` dengan credential Google.

User yang login dapat berperan sebagai pembeli atau penjual sesuai konteks transaksi. Fitur Payment Link dan Product Link digate oleh frontend agar hanya dapat digunakan setelah KYC berstatus terverifikasi.

### Admin

Admin login melalui `/login` pada dashboard admin, yang memanggil endpoint `/admin/auth/login`. JWT admin harus memuat `is_admin` truthy. Daftar kredensial admin resmi atau prosedur pembuatan admin tidak ditemukan (**Need configuration**); jangan memakai kredensial dari file environment repository.

### Pemulihan akun

Endpoint pemulihan password tersedia melalui request email, verifikasi token, dan reset password. Konfigurasi SMTP serta template/pengiriman email perlu disediakan sebelum alur ini dapat dipastikan berjalan di environment baru.

## 10. Manual Penggunaan

### 10.1 Pengguna: transaksi biasa

1. Daftar atau login.
2. Buka dashboard transaksi atau form transaksi.
3. Isi data transaksi seperti `name`, `email`, `role`, `total_amount`, `notes`, `fee_by`, `status`, kategori, opsi pengiriman, biaya pengiriman, durasi kerja, dan kode voucher bila relevan.
4. Buat transaksi. Backend menghitung fee dari `fee_rules` dan menetapkan expiry sekitar 24 jam pada alur yang sesuai.
5. Buka detail transaksi untuk melihat status, pembayaran, pengiriman, chat, dan riwayat terkait.
6. Pembayaran diproses melalui channel yang tersedia. Callback payment provider dapat mengubah status menjadi `paid`.
7. Penjual dapat mengunggah bukti pengiriman; pembeli dapat menyelesaikan transaksi setelah menerima barang/jasa.
8. Gunakan chat transaksi untuk komunikasi. Akses chat dibatasi ke pembeli, penjual, pembuat transaksi, atau admin oleh Socket.IO/API.
9. Bila terjadi masalah, buat laporan melalui fitur laporan dan sertakan bukti bila diminta.

### 10.2 Pengguna: KYC

1. Buka `/dashboard/verifikasi`.
2. Kirim NIK, foto KTP, selfie dengan KTP, dan video selfie.
3. Media diunggah melalui backend dan disimpan melalui Cloudinary.
4. Tunggu review admin. Status KYC dapat berupa `pending`, disetujui, atau ditolak dengan alasan.

### 10.3 Pengguna: payment link dan product link

1. Pastikan KYC telah terverifikasi.
2. Untuk payment link, buat link dan bagikan token publik `/pay/[token]` atau `/buy/[token]` sesuai halaman yang digunakan.
3. Untuk product link, buat link dengan nama, nominal, kategori, penanggung fee, catatan, opsi pengiriman, durasi, dan gambar produk.
4. Pembeli membuka link publik dan melakukan redeem/claim.
5. Product link dapat digunakan berulang kali; setiap redeem membuat transaksi baru.
6. Pantau transaksi yang berasal dari link pada halaman product link.

### 10.4 Pengguna: profil dan notifikasi

1. Kelola data pada `/dashboard/profile`.
2. Gunakan menu notifikasi untuk membaca, menandai terbaca semua, atau menghapus notifikasi.
3. Ubah password melalui endpoint perubahan password setelah login.

### 10.5 Admin

1. Login di `/login`.
2. Gunakan dashboard untuk melihat statistik dan transaksi.
3. Buka detail transaksi untuk konfirmasi pembayaran manual, cancel, complete, refund, atau disburse sesuai status dan kewenangan bisnis.
4. Kelola pengguna dan partnership dari menu users/partnership.
5. Review detail KYC lalu approve atau reject dengan alasan bila diperlukan.
6. Kelola voucher, blog, kategori, dan static content dari menu masing-masing.
7. Gunakan chat/notifikasi admin untuk memantau aktivitas yang dikirim backend.

## 11. API Documentation

Base URL lokal: `http://localhost:5000`. API tidak memiliki prefix global tunggal. Endpoint transaksi tersedia baik pada `/transactions` maupun `/api/transactions`; endpoint lain mengikuti prefix masing-masing di bawah.

### Format autentikasi

Untuk endpoint yang membutuhkan user/admin, kirim:

```http
Authorization: Bearer <JWT>
Content-Type: application/json
```

Endpoint multipart memakai `multipart/form-data`. Detail field utama yang terlihat di route/controller dicantumkan di bawah; response lengkap dapat berbeda menurut status dan controller.

### Auth

#### `POST /auth/register`

**Description:** Mendaftarkan user baru.

**Authentication:** Public.

**Request:** `name`, `email`, `password`, `phone`.

```json
{
  "name": "Nama Pengguna",
  "email": "user@example.com",
  "password": "PasswordA1",
  "phone": "081234567890"
}
```

#### `POST /auth/login`

**Description:** Login user dan memperoleh JWT.

**Authentication:** Public.

**Request:** `email`, `password`.

#### `POST /auth/google`

**Description:** Login/registrasi menggunakan credential Google.

**Authentication:** Public.

**Request:** `credential` dari Google OAuth.

#### `PUT /auth/change-password`

**Description:** Mengubah password user yang sedang login.

**Authentication:** User JWT.

**Request:** `oldPassword`, `newPassword`.

### Profile dan wilayah

| Method | Endpoint | Authentication | Keterangan |
|---|---|---|---|
| `GET` | `/profile` | User JWT | Profil ringkas |
| `GET` | `/profile-detail` | User JWT | Detail profil |
| `PUT` | `/profile-detail` | User JWT | Memperbarui detail profil |
| `GET` | `/usersearch?q=<query>` | User JWT | Mencari user |
| `GET` | `/provinces` | Public | Daftar provinsi |
| `GET` | `/regencies/:province_id` | Public | Kabupaten/kota per provinsi |
| `GET` | `/districts/:regency_id` | Public | Kecamatan per kabupaten/kota |

### Transaksi

| Method | Endpoint | Authentication | Keterangan |
|---|---|---|---|
| `POST` | `/transactions` | User JWT | Membuat transaksi |
| `GET` | `/transactions` | User JWT | Daftar transaksi |
| `GET` | `/transactions/:id` | User JWT | Detail transaksi |
| `PUT` | `/transactions/:id/cancel` | User JWT | Membatalkan transaksi |
| `PUT` | `/transactions/:id/complete` | User JWT | Menyelesaikan transaksi |
| `PUT` | `/transactions/waiting-payment` | User JWT | Memproses alur menunggu pembayaran |
| `POST` | `/transactions/apply-voucher` | User JWT | Menerapkan voucher |
| `POST` | `/transactions/create_VA` | User JWT | Membuat virtual account |
| `GET` | `/transactions/unpaid` | User JWT | Daftar transaksi belum dibayar |
| `GET` | `/transactions/:id/chat` | User JWT | Riwayat chat transaksi |
| `POST` | `/transactions/:id/chat` | User JWT | Mengirim chat transaksi |
| `POST` | `/transactions/:id/upload-shipping-proof` | User JWT | Upload bukti pengiriman |
| `GET` | `/transactions/:transactionId/shipping-proofs` | User JWT | Daftar bukti pengiriman |
| `GET` | `/transactions/admin/all` | Admin JWT | Daftar transaksi admin |

Payload pembuatan transaksi yang dipakai frontend/backend mencakup `name`, `email`, `role`, `total_amount`, `notes`, `fee_by`, `status`, `categ_id`, `shipping_option`, `shipping_fee`, `work_duration`, dan `voucher_code`.

### Link transaksi publik

#### `GET /public/transactions/:token`

**Description:** Mengambil ringkasan transaksi publik, termasuk kode, judul, nominal, fee, status, seller, expiry, dan flag claim.

**Authentication:** Public.

#### `POST /public/transactions/:token/claim`

**Description:** Mengklaim transaksi publik.

**Authentication:** User login atau data `name`, `email`, `phone` sesuai alur controller.

### Product link

| Method | Endpoint | Authentication | Keterangan |
|---|---|---|---|
| `POST` | `/product-links` | User JWT, multipart | Membuat product link |
| `GET` | `/product-links` | User JWT | Daftar product link |
| `GET` | `/product-links/:id/transactions` | User JWT | Transaksi dari product link |
| `PUT` | `/product-links/:id/active` | User JWT | Mengaktifkan/menonaktifkan link |
| `GET` | `/public/product-links/:token` | Public | Melihat product link publik |
| `POST` | `/public/product-links/:token/redeem` | Public | Redeem product link |

Field create product link: `name`, `total_amount`, `categ_id`, `fee_by`, `notes`, `shipping_option`, `work_duration`, dan `product_images[]`.

### KYC

| Method | Endpoint | Authentication | Keterangan |
|---|---|---|---|
| `POST` | `/api/kyc` | User JWT, multipart | Mengirim KYC |
| `GET` | `/api/kyc/me` | User JWT | Melihat KYC sendiri |

Field upload: `nik`, `ktp_photo`, `selfie_with_ktp`, `selfie_video`. Batas media yang disebut controller adalah maksimum 20 MB untuk foto/video.

### Pembayaran

| Method | Endpoint | Authentication | Keterangan |
|---|---|---|---|
| `GET` | `/payment-channels` | Public | Daftar channel pembayaran |
| `POST` | `/payment/callback` | API key | Callback status pembayaran |
| `POST` | `/payment/notify` | API key | Notifikasi pembayaran |

Callback memproses field seperti `trxid`, `refid`, `va_number`, `desc`, `channel`, `paid_amount`, dan `trx_date`. API key dan payment provider tidak didokumentasikan nilainya; **Need configuration**.

### Admin dashboard

Semua endpoint dashboard berikut dimaksudkan untuk admin JWT menurut middleware/controller:

| Method | Endpoint | Keterangan |
|---|---|---|
| `POST` | `/admin/auth/login` | Login admin |
| `GET` | `/admin/auth/profile` | Profil admin |
| `GET` | `/admin/dashboard/stats` | Statistik dashboard |
| `GET` | `/admin/dashboard/transactions` | Daftar transaksi |
| `GET` | `/admin/dashboard/transactions/:id` | Detail transaksi |
| `POST` | `/admin/dashboard/transactions/:id/disbursed` | Menandai pencairan |
| `POST` | `/admin/dashboard/transactions/:id/refund` | Refund |
| `POST` | `/admin/dashboard/transactions/:id/confirm-payment` | Konfirmasi pembayaran |
| `PUT` | `/admin/dashboard/transactions/:id/cancel` | Cancel |
| `PUT` | `/admin/dashboard/transactions/:id/complete` | Complete |
| `GET` | `/admin/dashboard/users` | Daftar user |
| `GET` | `/admin/dashboard/users/:id` | Detail user |
| `PUT` | `/admin/dashboard/users/:id/partnership` | Atur partnership |
| `GET` | `/admin/dashboard/kyc` | Daftar KYC |
| `GET` | `/admin/dashboard/kyc/:id` | Detail KYC |
| `POST` | `/admin/dashboard/kyc/:id/approve` | Menyetujui KYC |
| `POST` | `/admin/dashboard/kyc/:id/reject` | Menolak KYC |

### Blog, kategori, dan static page

| Method | Endpoint | Authentication |
|---|---|---|
| `GET` | `/api/blogs/published` | Public |
| `GET` | `/api/blogs/:slug` | Public |
| `GET` | `/api/blogs/admin/all` | Admin |
| `POST` | `/api/blogs` | Admin, optional multipart image |
| `PUT` | `/api/blogs/:id` | Admin, optional multipart image |
| `DELETE` | `/api/blogs/:id` | Admin |
| `GET` | `/api/categories` | Public |
| `POST` / `PUT` / `DELETE` | `/api/categories` / `:id` | Admin |
| `GET` | `/api/static-pages/:slug` | Public |
| `GET` | `/api/static-pages/admin/all` | Admin |
| `PUT` | `/api/static-pages/admin/:slug` | Admin |

### Voucher, laporan, chat, dan notifikasi

| Method | Endpoint | Authentication | Keterangan |
|---|---|---|---|
| `POST` | `/vouchers/apply` | User JWT | Terapkan voucher |
| `GET` / `POST` | `/vouchers` | User JWT di route layer | Daftar/buat voucher |
| `GET` / `PUT` / `DELETE` | `/vouchers/:id` | User JWT di route layer | Detail/ubah/hapus voucher |
| `POST` | `/reports` | User JWT, multipart | Buat laporan dengan bukti |
| `POST` | `/chat/upload-image` | User JWT | Upload gambar chat |
| `GET` | `/notifications` | User JWT | Daftar notifikasi |
| `PUT` | `/notifications/:id/read` | User JWT | Tandai satu terbaca |
| `PUT` | `/notifications/read-all` | User JWT | Tandai semua terbaca |
| `DELETE` | `/notifications/:id` | User JWT | Hapus notifikasi |

Route `/api/notifications` juga dipasang untuk route notifikasi. Route admin notification dan `/api/withdrawals` ada di source, tetapi perlindungan middleware route-level tidak terlihat konsisten; verifikasi deployment dan otorisasi wajib dilakukan sebelum membuka endpoint tersebut ke publik.

## 12. Socket.IO dan Event Real-time

Socket.IO berjalan pada server API dengan transport websocket dan polling. Token dapat dikirim melalui `handshake.auth.token` atau header Authorization. User yang terautentikasi masuk ke room `user_<id>`; chat transaksi menggunakan room `transaction_<id>`.

Event yang terlihat di source:

```text
get_notifications
mark_notification_read
mark_all_notifications_read
join_transaction
send_chat
chat-message
transaction_status_update
admin_notification
```

URL Socket.IO frontend dibaca dari `NEXT_PUBLIC_SOCKET_URL`; fallback dashboard chat user pada source adalah `http://localhost:5000` bila variable tidak tersedia.

## 13. Model Data dan Status Transaksi

Dump PostgreSQL mendefinisikan tabel utama berikut: `users`, `user_detail`, `transactions`, `payments`, `virtual_accounts`, `payment_callbacks`, `transaction_fees`, `transaction_shipping`, `transaction_chat`, `transaction_status_logs`, `notifications`, `reports`, `vouchers`, `voucher_usage`, `fee_rules`, `provinces`, `regencies`, `districts`, dan `wilayah`, serta tabel lain yang tercantum dalam dump.

Status transaksi yang terlihat mencakup:

```text
draft
wait_payment
paid
funded
completed
cancelled
refunded
disputed
disbursed
```

API menjalankan cron setiap menit untuk memproses transaksi `draft` dan `wait_payment` yang melewati `expired_at`, lalu mengubahnya menjadi `cancelled`. Nilai fee awal pada dump memuat aturan 1% dengan minimum Rp10.000 untuk rentang nominal tertentu dan 0,5% mulai Rp100.000.000; aturan production perlu diverifikasi terhadap database target.

## 14. Pengujian, Lint, dan Validasi

Tidak ditemukan suite test otomatis yang dapat dijalankan dari script package. Script yang tersedia:

```bash
cd rekber
npm run lint

cd ../rekber-admin
npm run lint
```

Kedua package frontend mendeklarasikan `next lint`; pada kombinasi Next.js modern, command ini dapat perlu penyesuaian bila CLI tidak lagi mendukung subcommand tersebut. Backend tidak menyediakan script test atau lint.

Validasi manual minimum setelah instalasi:

1. Pastikan API tersambung ke PostgreSQL dan startup update selesai.
2. Pastikan halaman frontend dapat memanggil API melalui CORS.
3. Uji register/login tanpa mencatat JWT ke log publik.
4. Uji satu transaksi, pembayaran sandbox bila tersedia, chat, dan notifikasi.
5. Uji login admin dan endpoint yang sesuai dengan role admin.

## 15. Deployment dan Operasional

Frontend memiliki konfigurasi OpenNext/Cloudflare melalui `wrangler.toml` dan script `pages:deploy`. Backend adalah proses Node.js biasa dan tidak memiliki konfigurasi deployment provider yang lengkap di repository.

Domain yang dirujuk source/config production adalah:

- User: `https://www.rekber.com`
- API: `https://api.rekber.com`
- Admin: `https://admin.rekber.com`

Domain, binding Cloudflare, database production, secrets, SMTP, payment gateway, backup, monitoring, dan rollback procedure harus dikonfirmasi oleh pemilik deployment (**Need configuration**). Artefak `.open-next` yang tersimpan menunjukkan konfigurasi build yang berbeda dari sebagian source production; lakukan build baru dari environment target sebelum deployment.

## 16. Catatan Keamanan dan Batasan

- Jangan commit `.env`, `.env.local`, password database, JWT secret, API key Cloudinary, Google credential, atau secret deployment.
- Nilai secret yang ada di konfigurasi repository tidak disalin ke manual ini; rotasi secret bila pernah ter-push ke remote.
- Payment callback menggunakan API key yang dirujuk source; mekanisme distribusi dan rotasi key perlu ditentukan.
- Route test `/test-admin-notif` tidak menunjukkan autentikasi dan sebaiknya tidak tersedia pada deployment publik.
- Route withdrawal serta beberapa route notifikasi admin perlu audit middleware sebelum digunakan pada production.
- API memakai auto-update schema tanpa migration versioning. Buat backup dan lakukan review SQL sebelum perubahan database production.
- `rekber-admin/prisma/schema.prisma` hanya berisi datasource PostgreSQL dan generator, tanpa model; jangan menganggap Prisma sebagai sumber schema admin saat ini.

## 17. Informasi yang Masih Diperlukan

Informasi berikut tidak dapat ditentukan secara aman dari repository:

- Versi Node.js resmi dan strategi package lock yang diwajibkan tim.
- Kredensial admin dan prosedur pembuatan admin.
- Payment provider, base URL sandbox/production, format API key, dan prosedur callback.
- Host database production, `DATABASE_URL` admin, backup/restore, dan migration release process.
- Kredensial SMTP dan konfigurasi Google OAuth production.
- Apakah tabel `product_payment_links`, `static_pages`, `kyc_verifications`, dan `withdrawals` sudah ada pada database target.
- Domain/binding deployment Cloudflare dan environment variables rahasia.
- Kontrak response lengkap seluruh endpoint serta dokumentasi error code.
