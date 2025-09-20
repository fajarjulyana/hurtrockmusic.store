
# Hurtrock Music Store

**Copyright 2024 Fajar Julyana. All rights reserved.**

Toko musik online untuk alat musik rock entry level dan profesional dengan sistem pembayaran Midtrans terintegrasi, autentikasi pengguna, panel admin lengkap, dan fitur pencarian canggih.

## Deskripsi Aplikasi

Hurtrock Music Store adalah platform e-commerce yang dikhususkan untuk musisi pemula dan profesional. Aplikasi ini menawarkan koleksi lengkap alat musik entry level dan profesional, amplifier berkualitas, dan peralatan musik untuk semua level dengan desain dark mode yang menawan, tema rock yang otentik, dan sistem pencarian yang powerful.

### Fitur Utama

#### Untuk Pelanggan:
- **Katalog Produk Lengkap**: Gitar listrik, akustik, bass, drum, amplifier, dan aksesoris
- **Sistem Autentikasi**: Login/Register dengan session management
- **Sistem Keranjang Pintar**: Kelola pembelian dengan mudah menggunakan session-based cart
- **Pembayaran Aman**: Integrasi Midtrans dengan berbagai metode pembayaran
- **Pencarian & Filter Canggih**: 
  - Real-time search dengan debouncing
  - Filter berdasarkan kategori, harga, rating, dan status
  - Sort berdasarkan nama, harga, rating, dan tanggal
  - View mode (grid/list) dengan responsive layout
- **Multi-bahasa**: Interface dalam Bahasa Indonesia dan Inggris dengan deteksi otomatis
- **Multi-mata uang**: IDR sebagai mata uang default, konversi otomatis ke USD untuk user internasional
- **Responsif**: Optimal di desktop, tablet, dan mobile dengan design system yang konsisten
- **Profile Management**: Kelola data profil dan riwayat pesanan
- **Live Chat Support**: Widget chat floating dengan admin support

#### Untuk Admin:
- **Dashboard Analytics**: Overview penjualan dan statistik toko
- **Manajemen Produk Canggih**: 
  - Tambah, edit, hapus produk dengan validasi lengkap
  - Upload multiple images (hingga 5 gambar per produk)
  - Pencarian dan filter produk admin
  - Kontrol stok real-time dan status produk
- **Manajemen Kategori**: 
  - CRUD operations dengan referential integrity
  - Auto-generated SEO-friendly slugs
  - Validation untuk mencegah penghapusan kategori yang masih digunakan
- **Konfigurasi Pembayaran Midtrans**:
  - Kelola konfigurasi Midtrans (Server Key, Client Key, Environment)
  - **URL Callback Management**: Konfigurasikan URL callback untuk Midtrans
    - Finish Redirect URL (pembayaran berhasil)
    - Unfinish Redirect URL (pembayaran belum selesai)  
    - Error Redirect URL (pembayaran error)
    - Notification URL (webhook pembayaran)
    - Recurring Notification URL (pembayaran berulang)
  - Test koneksi Midtrans langsung dari admin panel
  - Konfigurasi tersimpan aman di database
- **Manajemen Pesanan**: 
  - Track dan kelola status pesanan pelanggan
  - Print PDF labels untuk shipping
  - Update status dengan real-time notifications
- **Chat Room Management**: 
  - Kelola chat rooms dari customers
  - Real-time messaging dengan WebSocket
  - Status management untuk chat sessions
- **Autentikasi Admin**: Session-based authentication dengan role management
- **User Management**: Kelola akun pengguna dan permissions

## Teknologi yang Digunakan

### Frontend:
- **React 18** - Library UI modern dengan TypeScript dan Vite
- **Tailwind CSS** - Framework CSS utility-first dengan custom design tokens
- **Shadcn/UI** - Komponen UI yang dapat diakses berbasis Radix UI
- **Wouter** - Router ringan untuk client-side navigation
- **TanStack Query** - Manajemen state server yang powerful dengan caching
- **Lucide React** - Ikon SVG yang konsisten dan customizable
- **React Hook Form** - Form management dengan validation
- **jsPDF** - PDF generation untuk order labels

### Backend:
- **Node.js + TypeScript** - Runtime JavaScript server-side dengan type safety
- **Express.js** - Framework web minimalis dengan RESTful API design
- **Drizzle ORM** - ORM modern dengan type-safe queries untuk PostgreSQL
- **Express Session** - Session management untuk auth dan cart persistence
- **Zod** - Runtime type validation dan schema definition
- **Bcrypt** - Password hashing untuk keamanan user authentication
- **WebSocket** - Real-time communication untuk chat features

### Database & Storage:
- **PostgreSQL** - Database relational yang robust dengan Neon Database
- **Drizzle Kit** - Schema management dan database migrations
- **Connect PG Simple** - PostgreSQL session store integration

### Pembayaran & Keamanan:
- **Midtrans** - Payment gateway Indonesia terpercaya dengan multiple methods
- **HTTPS/SSL** - Secure data transmission
- **Input Validation** - Comprehensive Zod schema validation
- **SQL Injection Prevention** - Drizzle ORM prepared statements
- **Password Security** - Bcrypt hashing dengan salt rounds

### Development & Deployment:
- **Vite** - Fast development server dan build tool dengan HMR
- **ESBuild** - JavaScript bundler untuk production builds
- **PostCSS** - CSS processing dengan Tailwind dan Autoprefixer
- **Docker** - Containerization untuk deployment consistency
- **PM2** - Process manager untuk production server management

## Informasi Toko

**Alamat:**
```
Jl Gegerkalong Girang complex Darut Tauhid Kav 22
Gegerkalong, Setiabudhi North Bandung Area
Sukasari, Gegerkalong, Kec. Sukasari
Kota Bandung, Jawa Barat 40153
```

**Kontak:**
- **Telepon**: 0821-1555-8035
- **Email**: info@hurtrockstore.com

**Jam Operasional:**
- Senin - Kamis: 09.30 - 18.00 WIB
- Jumat: 09.30 - 18.00 WIB  
- Sabtu: 09.30 - 17.00 WIB
- Minggu: Tutup

## Cara Menjalankan Aplikasi

### Persyaratan System:
- **Node.js 18+**
- **PostgreSQL 13+** 
- **npm atau yarn**

### ✨ **Instalasi Mudah - Langkah Demi Langkah**

#### **Development Lokal:**

1. **Clone Repository:**
   ```bash
   git clone https://github.com/fajarjulyana/hurtrock-music-store.git
   cd hurtrock-music-store
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Setup Environment:**
   ```bash
   # Buat file .env
   cp .env.example .env
   
   # Edit .env dengan konfigurasi database Anda
   DATABASE_URL=postgresql://user:password@localhost/hurtrock_db
   SESSION_SECRET=your-session-secret
   NODE_ENV=development
   PORT=5000
   ```

4. **Setup Database:**
   ```bash
   npm run db:push
   npm run db:seed  # Optional: sample data
   ```

5. **Jalankan Server:**
   ```bash
   npm run dev
   ```

6. **Akses Aplikasi:**
   - Buka browser: `http://localhost:5000`

### **Akses Aplikasi:**
- **🌐 Website**: http://localhost:5000
- **👑 Admin Panel**: `/admin`

### **Akun Default yang Dibuat Otomatis:**
- **Admin**: `admin@hurtrock.com` / `admin123`
- **Customer**: Daftar melalui halaman `/register`

### **Konfigurasi Payment Gateway (Setelah Running):**
1. Login sebagai admin
2. Masuk ke `/admin`
3. Buka tab "Settings" > "Payment Configuration"
4. Masukkan konfigurasi Midtrans:
   - **Server Key** dan **Client Key**
   - **Environment** (Sandbox/Production)
   - **URL Callback Management**:
     - Finish Redirect URL (pembayaran berhasil)
     - Unfinish Redirect URL (pembayaran belum selesai)
     - Error Redirect URL (pembayaran error)  
     - Notification URL (webhook pembayaran)
     - Recurring Notification URL (pembayaran berulang)
5. Test koneksi dan simpan

> **Catatan**: 
> - Konfigurasi Midtrans disimpan di database untuk keamanan yang lebih baik
> - URL Callback dapat dikonfigurasi secara dinamis tanpa perlu restart server
> - Notification URL digunakan untuk webhook pembayaran dari Midtrans

### **Fitur Auto-Initialization:**
- 🔐 **Auto Admin Creation**: Sistem otomatis membuat akun admin pertama
- 🗄️ **Auto Database Setup**: Semua tabel dibuat otomatis tanpa manual migration
- 🔑 **Auto Session Management**: Session secret di-generate otomatis untuk keamanan
- 💳 **Dynamic Payment Config**: Konfigurasi Midtrans disimpan dan dikelola via database
- 🌐 **Environment Detection**: Sistem otomatis mendeteksi environment (development/production)
- 📱 **Mobile-First Design**: Responsive design otomatis menyesuaikan semua device
- 🌍 **Auto Language Detection**: Deteksi bahasa dan mata uang berdasarkan lokasi user

## License

MIT License - lihat file [LICENSE](LICENSE) untuk detail lengkap.

**Developed by Fajar Julyana**

## Support

Butuh bantuan? Hubungi kami:
- **Email**: support@hurtrockstore.com
- **WhatsApp**: +62821-1555-8035
- **Live Chat**: Available di website (floating chat widget)
- **Jam Support**: Senin-Jumat 09:00-17:00 WIB

## Dokumentasi

- [System Flowchart](docs/FLOWCHART.md) - Alur kerja sistem dan user flows
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Panduan development lengkap
- [User Manual](docs/USER_MANUAL.md) - Panduan penggunaan untuk end users
- [Admin Guide](docs/ADMIN_GUIDE.md) - Panduan khusus untuk administrator
- [Design Guidelines](design_guidelines.md) - Design system dan style guide
- [Dokumentasi Lengkap](DOKUMENTASI-LENGKAP.md) - Dokumentasi komprehensif semua aspek sistem

**Made with passion for Rock Musicians by Fajar Julyana**

*Mulai perjalanan musik rock Anda dengan alat musik entry level dan profesional dari Hurtrock Music Store!*
