
# Hurtrock Music Store

**Copyright 2024 Fajar Julyana. All rights reserved.**

Toko musik online untuk alat musik rock entry level dan profesional dengan sistem pembayaran Midtrans terintegrasi, autentikasi pengguna, panel admin lengkap, fitur pencarian canggih, dan sistem tracking pengiriman.

## Deskripsi Aplikasi

Hurtrock Music Store adalah platform e-commerce yang dikhususkan untuk musisi pemula dan profesional. Aplikasi ini menawarkan koleksi lengkap alat musik entry level dan profesional, amplifier berkualitas, dan peralatan musik untuk semua level dengan desain dark mode yang menawan, tema rock yang otentik, dan sistem pencarian yang powerful.

### Fitur Utama

#### Untuk Pelanggan:
- **Katalog Produk Lengkap**: Gitar listrik, akustik, bass, drum, amplifier, dan aksesoris
- **Sistem Autentikasi**: Login/Register dengan session management yang aman
- **Sistem Keranjang Pintar**: Kelola pembelian dengan mudah menggunakan session-based cart
- **Pembayaran Aman**: Integrasi Midtrans dengan callback handling yang robust:
  * Support multiple status pembayaran (settlement, capture, success)
  * Fallback mechanism untuk menangani variasi response Midtrans
  * Auto-completion pesanan dengan validasi server-side
  * Error handling yang comprehensive untuk payment edge cases
- **Pencarian & Filter Canggih**: 
  - Real-time search dengan debouncing
  - Filter berdasarkan kategori, harga, rating, dan status
  - Sort berdasarkan nama, harga, rating, dan tanggal
  - View mode (grid/list) dengan responsive layout
- **Dashboard Buyer**: Kelola profil, riwayat pesanan, dan tracking pengiriman
- **Order Tracking System**: 
  - Tracking real-time status pesanan dari pending hingga delivered
  - Integrasi dengan jasa pengiriman utama (JNE, POS Indonesia, TIKI, SiCepat, dll)
  - Notifikasi otomatis untuk setiap perubahan status
  - Link tracking langsung ke website kurir
- **Multi-bahasa**: Interface dalam Bahasa Indonesia dan Inggris dengan deteksi otomatis
- **Multi-mata uang**: IDR sebagai mata uang default, konversi otomatis ke USD untuk user internasional
- **Responsif**: Optimal di desktop, tablet, dan mobile dengan design system yang konsisten
- **Live Chat Support**: Widget chat floating dengan admin support real-time

#### Untuk Admin:
- **Dashboard Analytics Komprehensif**: 
  - Overview penjualan dengan profit/loss analysis
  - Grafik tren pendapatan bulanan dengan detail item
  - Top selling products dengan analisis kuantitas dan revenue
  - Filter data berdasarkan rentang tanggal
  - Export laporan dalam format Excel/CSV:
    * Laporan pesanan dengan detail alamat pengiriman  
    * Laporan transaksi harian dengan breakdown item
    * Laporan detail item terjual per produk
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
- **Order Management System**: 
  - Track dan kelola status pesanan pelanggan dengan workflow lengkap
  - **Input Resi Manual**: Fitur input nomor resi pengiriman dengan:
    * Dropdown jasa pengiriman (JNE, POS Indonesia, TIKI, SiCepat, Anteraja, J&T, dll)
    * Auto-update status ke "shipped" saat resi diinput
    * Validasi nomor resi format
    * Link tracking otomatis ke website kurir
  - Print PDF labels dengan format Indonesia professional:
    * Layout terstruktur dengan header branded
    * Informasi pelanggan dan alamat dalam bahasa Indonesia
    * Detail pesanan dalam format tabel yang rapi
    * Ongkir dan total pembayaran yang jelas
    * Footer dengan informasi toko dan customer service
  - Update status dengan real-time notifications
  - Filter pesanan berdasarkan status dan tanggal
- **Chat Room Management**: 
  - Kelola chat rooms dari customers dengan real-time messaging
  - WebSocket-based communication untuk instant support
  - Status management untuk chat sessions
  - Chat history dan archive system
- **User Management System**: 
  - Kelola akun pengguna dengan role-based permissions
  - Admin key authentication untuk security
  - Session management dan timeout handling
- **Role Management**: CRUD operations untuk role dan permissions

## Teknologi yang Digunakan

### Frontend:
- **React 18** - Library UI modern dengan TypeScript dan Vite
- **Tailwind CSS** - Framework CSS utility-first dengan custom design tokens
- **Shadcn/UI** - Komponen UI yang dapat diakses berbasis Radix UI
- **Wouter** - Router ringan untuk client-side navigation
- **TanStack Query** - Manajemen state server yang powerful dengan caching
- **Lucide React** - Ikon SVG yang konsisten dan customizable
- **React Hook Form** - Form management dengan validation
- **jsPDF** - PDF generation untuk order labels dan invoice

### Backend:
- **Node.js + TypeScript** - Runtime JavaScript server-side dengan type safety
- **Express.js** - Framework web minimalis dengan RESTful API design
- **Drizzle ORM** - ORM modern dengan type-safe queries untuk PostgreSQL
- **Express Session** - Session management untuk auth dan cart persistence
- **Zod** - Runtime type validation dan schema definition
- **Bcrypt** - Password hashing untuk keamanan user authentication
- **WebSocket** - Real-time communication untuk chat dan notifications

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
- **Replit** - Cloud development dan deployment platform

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

#### **Development di Replit (Recommended):**

1. **Fork/Clone Repository di Replit:**
   ```bash
   # Sistem otomatis setup environment
   npm run dev
   
   # Sistem akan otomatis:
   # 1. Install dependencies
   # 2. Setup PostgreSQL database + schema  
   # 3. Generate secure session secret
   # 4. Create default admin account
   # 5. Start server di port 5000
   ```

2. **Akses Aplikasi:**
   - **🌐 Website**: URL yang disediakan Replit
   - **👑 Admin Panel**: `/admin`

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

### **Akun Default yang Dibuat Otomatis:**
- **Admin**: `admin@hurtrock.com` / `admin123`
- **Customer**: Daftar melalui halaman `/register`

### **Konfigurasi Payment Gateway (Setelah Running):**
1. Login sebagai admin
2. Masuk ke `/admin`
3. Buka tab "Payment" > "Payment Configuration"
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

### **Fitur Auto-Initialization:**
- 🔐 **Auto Admin Creation**: Sistem otomatis membuat akun admin pertama
- 🗄️ **Auto Database Setup**: Semua tabel dibuat otomatis tanpa manual migration
- 🔑 **Auto Session Management**: Session secret di-generate otomatis untuk keamanan
- 💳 **Dynamic Payment Config**: Konfigurasi Midtrans disimpan dan dikelola via database
- 🌐 **Environment Detection**: Sistem otomatis mendeteksi environment (development/production)
- 📱 **Mobile-First Design**: Responsive design otomatis menyesuaikan semua device
- 🌍 **Auto Language Detection**: Deteksi bahasa dan mata uang berdasarkan lokasi user
- 🚚 **Order Tracking Integration**: Auto-setup tracking links untuk semua kurir utama Indonesia

## Deployment di Replit

### **Production Deployment:**
1. **Setup Environment di Replit:**
   - Buka Secrets tab di Replit
   - Tambahkan environment variables:
     ```
     DATABASE_URL=your-production-database-url
     SESSION_SECRET=secure-random-string
     NODE_ENV=production
     ```

2. **Deploy:**
   ```bash
   npm run build
   npm start
   ```

3. **Konfigurasi Domain:**
   - Gunakan custom domain Replit untuk production
   - Setup SSL certificate otomatis
   - Configure DNS sesuai kebutuhan

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

- [System Flowchart](docs/FLOWCHART.md) - Alur kerja sistem dan user flows dengan tracking
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Panduan development lengkap dengan API documentation
- [User Manual](docs/USER_MANUAL.md) - Panduan penggunaan untuk end users termasuk tracking order
- [Admin Guide](docs/ADMIN_GUIDE.md) - Panduan khusus untuk administrator dengan order management
- [Design Guidelines](design_guidelines.md) - Design system dan style guide
- [Dokumentasi Lengkap](DOKUMENTASI-LENGKAP.md) - Dokumentasi komprehensif semua aspek sistem

**Made with passion for Rock Musicians by Fajar Julyana**

*Mulai perjalanan musik rock Anda dengan alat musik entry level dan profesional dari Hurtrock Music Store! Nikmati pengalaman berbelanja yang seamless dengan tracking pengiriman real-time.*
