
# Hurtrock Music Store 🎸

**Copyright © 2024 Fajar Julyana. All rights reserved.**

Toko musik online untuk alat musik rock vintage dan modern dengan sistem pembayaran Midtrans terintegrasi dan panel admin lengkap.

## 🚀 Deskripsi Aplikasi

Hurtrock Music Store adalah platform e-commerce yang dikhususkan untuk musisi dan penggemar musik rock. Aplikasi ini menawarkan koleksi lengkap alat musik vintage, amplifier klasik, dan peralatan musik berkualitas tinggi dengan desain dark mode yang menawan dan tema rock yang otentik.

### ✨ Fitur Utama

#### 🛒 **Untuk Pelanggan:**
- **Katalog Produk Lengkap**: Gitar listrik, akustik, bass, drum, amplifier, dan aksesoris
- **Sistem Keranjang Pintar**: Kelola pembelian dengan mudah menggunakan session-based cart
- **Pembayaran Aman**: Integrasi Midtrans dengan berbagai metode pembayaran
- **Pencarian & Filter**: Temukan produk dengan cepat berdasarkan kategori dan nama
- **Multi-bahasa**: Interface dalam Bahasa Indonesia dan Inggris dengan deteksi otomatis
- **Multi-mata uang**: IDR untuk Indonesia, USD untuk internasional
- **Responsif**: Optimal di desktop, tablet, dan mobile dengan design system yang konsisten

#### 👨‍💼 **Untuk Admin:**
- **Manajemen Produk**: Tambah, edit, hapus produk dengan validasi lengkap
- **Manajemen Kategori**: CRUD operations untuk kategori dengan referential integrity
- **Upload Gambar**: Support multiple images per produk
- **Kontrol Stok**: Kelola ketersediaan dan harga produk
- **Dashboard Analytics**: Pantau performa toko (dalam pengembangan)
- **Autentikasi Admin**: ADMIN_KEY based authentication untuk development

## 🛠️ Teknologi yang Digunakan

### **Frontend:**
- **React 18** - Library UI modern dengan TypeScript dan Vite
- **Tailwind CSS** - Framework CSS utility-first dengan custom design tokens
- **Shadcn/UI** - Komponen UI yang dapat diakses berbasis Radix UI
- **Wouter** - Router ringan untuk client-side navigation
- **TanStack Query** - Manajemen state server yang powerful dengan caching
- **Lucide React** - Ikon SVG yang konsisten dan customizable

### **Backend:**
- **Node.js + TypeScript** - Runtime JavaScript server-side dengan type safety
- **Express.js** - Framework web minimalis dengan RESTful API design
- **Drizzle ORM** - ORM modern dengan type-safe queries untuk PostgreSQL
- **Express Session** - Session management untuk cart persistence
- **Zod** - Runtime type validation dan schema definition

### **Database & Storage:**
- **PostgreSQL** - Database relational yang robust dengan Neon Database
- **Drizzle Kit** - Schema management dan database migrations
- **Connect PG Simple** - PostgreSQL session store integration

### **Pembayaran & Keamanan:**
- **Midtrans** - Payment gateway Indonesia terpercaya dengan multiple methods
- **HTTPS/SSL** - Secure data transmission
- **Input Validation** - Comprehensive Zod schema validation
- **SQL Injection Prevention** - Drizzle ORM prepared statements

### **Development & Deployment:**
- **Vite** - Fast development server dan build tool dengan HMR
- **ESBuild** - JavaScript bundler untuk production builds
- **PostCSS** - CSS processing dengan Tailwind dan Autoprefixer
- **Replit** - Platform development dan hosting cloud yang terintegrasi

## 🎨 Design System

### **Warna:**
- **Background**: Dark charcoal (#1a1a1a) untuk vintage atmosphere
- **Primary**: Vintage orange (#f97316) untuk brand consistency
- **Foreground**: Light text untuk kontras optimal
- **Muted**: Gray variants untuk teks sekunder dan borders

### **Typography:**
- **Headers**: Bebas Neue (bold, rock-inspired headers)
- **Body**: Inter (readable, modern body text)
- **Decorative**: Rock Salt (accent elements dan decorative text)

### **Layout System:**
- **Responsive Grid**: Mobile-first approach dengan breakpoints yang konsisten
- **Consistent Spacing**: Tailwind spacing primitives (2, 4, 6, 8, 12, 16)
- **Component Variants**: Class Variance Authority untuk type-safe variants

## 🏪 Informasi Toko

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

## 🚀 Cara Menjalankan Aplikasi

### **Persyaratan System:**
- Node.js 18+ 
- PostgreSQL database
- Akun Midtrans (Sandbox/Production)

### **Environment Variables:**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost/hurtrock_db

# Midtrans Payment
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key

# Session & Security
SESSION_SECRET=your-session-secret
ADMIN_KEY=your-admin-key

# Environment
NODE_ENV=development
```

### **Instalasi:**

1. **Install dependencies:**
```bash
npm install
```

2. **Setup database:**
```bash
npm run db:push
npm run db:seed  # Optional: seed with sample data
```

3. **Jalankan aplikasi:**
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

4. **Akses aplikasi:**
- **Website**: http://0.0.0.0:5000
- **Admin Panel**: http://0.0.0.0:5000/admin

### **Kredensial Admin:**
- **Email**: admin@hurtrock.com
- **Password**: admin123

*Catatan: Untuk keamanan, pastikan mengganti kredensial admin default di production environment.*

## 🔄 API Endpoints

### **Public Endpoints:**
```
GET    /api/products          - Daftar produk dengan filtering
GET    /api/products/:id      - Detail produk dengan gambar
GET    /api/categories        - Daftar kategori aktif
POST   /api/cart             - Tambah item ke keranjang
GET    /api/cart             - Lihat isi keranjang
PUT    /api/cart/:id         - Update quantity item
DELETE /api/cart/:id         - Hapus item dari keranjang
POST   /api/contact          - Kirim pesan kontak
POST   /api/payment/create   - Buat Midtrans payment token
POST   /api/payment/notification - Webhook Midtrans
GET    /api/user             - Get user session info
```

### **Admin Endpoints (Requires ADMIN_KEY):**
```
POST   /api/admin/products        - Tambah produk baru
PUT    /api/admin/products/:id    - Update produk existing
DELETE /api/admin/products/:id    - Hapus produk
POST   /api/admin/categories      - Tambah kategori baru
PUT    /api/admin/categories/:id  - Update kategori
DELETE /api/admin/categories/:id  - Hapus kategori (dengan validasi)
GET    /api/admin/orders          - Daftar pesanan (coming soon)
```

## 🗄️ Database Schema

### **Core Tables:**
- **products** - Katalog alat musik dengan relasi ke categories
- **categories** - Kategori produk dengan slug unik
- **cart_items** - Session-based shopping cart items
- **product_images** - Multiple images per produk (1-5 images)
- **orders** - Data pesanan dengan Midtrans integration
- **order_items** - Detail item dalam setiap pesanan
- **contact_submissions** - Pesan dari contact form

### **Key Features:**
- **Referential Integrity**: Foreign key constraints dengan proper cascading
- **Unique Constraints**: Slug uniqueness untuk SEO-friendly URLs
- **Data Validation**: Zod schemas untuk runtime type checking
- **Session Management**: PostgreSQL-backed session store

## 🔐 Keamanan

- **Input Validation**: Comprehensive Zod schema validation di semua endpoints
- **Session Management**: Express session dengan PostgreSQL store untuk persistence
- **SQL Injection Prevention**: Drizzle ORM dengan prepared statements
- **XSS Protection**: React built-in protection dan sanitized inputs
- **CORS Configuration**: Controlled cross-origin requests
- **Admin Authentication**: ADMIN_KEY based protection untuk admin endpoints
- **Error Handling**: Structured error responses dengan proper HTTP status codes

## 🌍 Internationalization

### **Supported Languages:**
- **Bahasa Indonesia** (ID) - Default untuk users di Indonesia
- **English** (EN) - Default untuk international users

### **Features:**
- **Automatic Detection**: Berdasarkan browser locale dan geolocation
- **Currency Conversion**: IDR untuk Indonesia, USD untuk international
- **Localized Content**: UI, error messages, dan success notifications
- **Persistent Preferences**: Tersimpan di browser localStorage

## 📦 Deployment di Replit

### **Production Configuration:**
```bash
# Build production assets
npm run build

# Start production server
npm start
```

### **Environment Setup:**
1. **Database**: PostgreSQL database via Replit atau Neon
2. **Secrets**: Store semua environment variables di Replit Secrets
3. **Port Configuration**: Default port 5000 untuk web access
4. **Auto-deployment**: Otomatis deploy saat git push ke main branch

### **Performance Optimizations:**
- **Static Asset Serving**: Optimized static file serving di production
- **Database Connection Pooling**: Efficient PostgreSQL connections
- **Session Optimization**: PostgreSQL session store untuk scalability
- **Build Optimization**: Vite production build dengan minification

## 🧪 Testing & Development

### **Development Tools:**
- **Hot Module Replacement**: Instant updates during development
- **TypeScript Strict Mode**: Comprehensive type checking
- **ESLint & Prettier**: Code quality dan formatting
- **Path Mapping**: Clean imports dengan `@/` alias

### **Testing Strategy:**
- **Unit Tests**: Component testing dengan Jest dan React Testing Library
- **API Testing**: Endpoint testing dengan proper validation
- **E2E Testing**: User flow testing untuk critical paths
- **Performance Testing**: Load testing untuk production readiness

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TypeScript strict typing
4. Tambahkan tests untuk fitur baru
5. Update dokumentasi jika diperlukan
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open Pull Request dengan deskripsi lengkap

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail lengkap.

**Developed by Fajar Julyana**

## 📞 Support

Butuh bantuan? Hubungi kami:
- **Email**: support@hurtrockstore.com
- **WhatsApp**: +62821-1555-8035
- **Jam Support**: Senin-Jumat 09:00-17:00 WIB

## 📚 Dokumentasi Lengkap

- [📊 System Flowchart](docs/FLOWCHART.md) - Alur kerja sistem dan user flows
- [👨‍💻 Developer Guide](docs/DEVELOPER_GUIDE.md) - Panduan development lengkap
- [👤 User Manual](docs/USER_MANUAL.md) - Panduan penggunaan untuk end users
- [🎨 Design Guidelines](design_guidelines.md) - Design system dan style guide

## 🎯 Roadmap

### **Completed Features:**
- ✅ Full-stack e-commerce functionality
- ✅ Internationalization (ID/EN)
- ✅ Category management system
- ✅ Session-based shopping cart
- ✅ Midtrans payment integration
- ✅ Admin panel dengan authentication
- ✅ Responsive design system
- ✅ Database migrations dan seeding

### **In Development:**
- 🔄 Order management system
- 🔄 User authentication system
- 🔄 Product reviews dan ratings
- 🔄 Email notifications
- 🔄 Analytics dashboard

### **Planned Features:**
- 📋 Inventory management
- 📋 Discount dan promo system
- 📋 Advanced search dengan filters
- 📋 Wishlist functionality
- 📋 Social media integration

---

**🎸 Made with ❤️ for Rock Musicians by Fajar Julyana 🎸**

*Wujudkan legenda rock Anda dengan alat musik berkualitas dari Hurtrock Music Store!*
