
# Hurtrock Music Store 🎸

**Copyright © 2024 Fajar Julyana. All rights reserved.**

Toko musik online untuk alat musik rock vintage dan modern dengan sistem pembayaran Midtrans terintegrasi, autentikasi pengguna, dan panel admin lengkap.

## 🚀 Deskripsi Aplikasi

Hurtrock Music Store adalah platform e-commerce yang dikhususkan untuk musisi dan penggemar musik rock. Aplikasi ini menawarkan koleksi lengkap alat musik vintage, amplifier klasik, dan peralatan musik berkualitas tinggi dengan desain dark mode yang menawan dan tema rock yang otentik.

### ✨ Fitur Utama

#### 🛒 **Untuk Pelanggan:**
- **Katalog Produk Lengkap**: Gitar listrik, akustik, bass, drum, amplifier, dan aksesoris
- **Sistem Autentikasi**: Login/Register dengan session management
- **Sistem Keranjang Pintar**: Kelola pembelian dengan mudah menggunakan session-based cart
- **Pembayaran Aman**: Integrasi Midtrans dengan berbagai metode pembayaran
- **Pencarian & Filter**: Temukan produk dengan cepat berdasarkan kategori dan nama
- **Multi-bahasa**: Interface dalam Bahasa Indonesia dan Inggris dengan deteksi otomatis
- **Multi-mata uang**: IDR untuk Indonesia, USD untuk internasional
- **Responsif**: Optimal di desktop, tablet, dan mobile dengan design system yang konsisten
- **Profile Management**: Kelola data profil dan riwayat pesanan

#### 👨‍💼 **Untuk Admin:**
- **Dashboard Analytics**: Overview penjualan dan statistik toko
- **Manajemen Produk**: Tambah, edit, hapus produk dengan validasi lengkap
- **Manajemen Kategori**: CRUD operations untuk kategori dengan referential integrity
- **Upload Gambar**: Support multiple images per produk (hingga 5 gambar)
- **Kontrol Stok**: Kelola ketersediaan dan harga produk
- **Manajemen Pesanan**: Track dan kelola status pesanan pelanggan
- **Autentikasi Admin**: Session-based authentication dengan role management
- **User Management**: Kelola akun pengguna dan permissions

## 🛠️ Teknologi yang Digunakan

### **Frontend:**
- **React 18** - Library UI modern dengan TypeScript dan Vite
- **Tailwind CSS** - Framework CSS utility-first dengan custom design tokens
- **Shadcn/UI** - Komponen UI yang dapat diakses berbasis Radix UI
- **Wouter** - Router ringan untuk client-side navigation
- **TanStack Query** - Manajemen state server yang powerful dengan caching
- **Lucide React** - Ikon SVG yang konsisten dan customizable
- **React Hook Form** - Form management dengan validation

### **Backend:**
- **Node.js + TypeScript** - Runtime JavaScript server-side dengan type safety
- **Express.js** - Framework web minimalis dengan RESTful API design
- **Drizzle ORM** - ORM modern dengan type-safe queries untuk PostgreSQL
- **Express Session** - Session management untuk auth dan cart persistence
- **Zod** - Runtime type validation dan schema definition
- **Bcrypt** - Password hashing untuk keamanan user authentication

### **Database & Storage:**
- **PostgreSQL** - Database relational yang robust dengan Neon Database
- **Drizzle Kit** - Schema management dan database migrations
- **Connect PG Simple** - PostgreSQL session store integration

### **Pembayaran & Keamanan:**
- **Midtrans** - Payment gateway Indonesia terpercaya dengan multiple methods
- **HTTPS/SSL** - Secure data transmission
- **Input Validation** - Comprehensive Zod schema validation
- **SQL Injection Prevention** - Drizzle ORM prepared statements
- **Password Security** - Bcrypt hashing dengan salt rounds

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

### **Akun Demo:**
- **Customer**: Daftar melalui halaman register
- **Admin**: Login melalui halaman admin dengan credentials yang valid

## 🔄 API Endpoints

### **Authentication Endpoints:**
```
POST   /api/login            - User login
POST   /api/register         - User registration
POST   /api/logout           - User logout
GET    /api/user             - Get current user info
```

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
```

### **Protected User Endpoints:**
```
GET    /api/orders           - Riwayat pesanan user
GET    /api/profile          - Data profil user
PUT    /api/profile          - Update profil user
```

### **Admin Endpoints (Requires Admin Role):**
```
GET    /api/admin/dashboard       - Dashboard statistics
POST   /api/admin/products        - Tambah produk baru
PUT    /api/admin/products/:id    - Update produk existing
DELETE /api/admin/products/:id    - Hapus produk
POST   /api/admin/categories      - Tambah kategori baru
PUT    /api/admin/categories/:id  - Update kategori
DELETE /api/admin/categories/:id  - Hapus kategori
GET    /api/admin/orders          - Daftar semua pesanan
PUT    /api/admin/orders/:id      - Update status pesanan
GET    /api/admin/users           - Daftar pengguna
PUT    /api/admin/users/:id       - Update user permissions
```

## 🗄️ Database Schema

### **Core Tables:**
- **users** - Data pengguna dengan authentication dan role management
- **sessions** - Session management untuk authentication dan cart
- **products** - Katalog alat musik dengan relasi ke categories
- **categories** - Kategori produk dengan slug unik
- **cart_items** - Session-based shopping cart items
- **product_images** - Multiple images per produk (1-5 images)
- **orders** - Data pesanan dengan Midtrans integration
- **order_items** - Detail item dalam setiap pesanan
- **contact_submissions** - Pesan dari contact form

### **Key Features:**
- **User Authentication**: Secure password hashing dengan bcrypt
- **Session Management**: PostgreSQL-backed session store
- **Referential Integrity**: Foreign key constraints dengan proper cascading
- **Unique Constraints**: Email uniqueness dan slug untuk SEO-friendly URLs
- **Data Validation**: Zod schemas untuk runtime type checking
- **Role-based Access**: Admin dan customer role management

## 🔐 Keamanan

- **Authentication**: Session-based dengan bcrypt password hashing
- **Authorization**: Role-based access control (Admin/Customer)
- **Input Validation**: Comprehensive Zod schema validation di semua endpoints
- **Session Security**: Secure session configuration dengan proper expiration
- **SQL Injection Prevention**: Drizzle ORM dengan prepared statements
- **XSS Protection**: React built-in protection dan sanitized inputs
- **CORS Configuration**: Controlled cross-origin requests
- **Password Security**: Bcrypt dengan salt rounds untuk secure hashing
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
1. **Database**: PostgreSQL database via Replit PostgreSQL
2. **Secrets**: Store semua environment variables di Replit Secrets
3. **Port Configuration**: Default port 5000 untuk web access
4. **Auto-deployment**: Otomatis deploy saat git push ke main branch

### **Performance Optimizations:**
- **Static Asset Serving**: Optimized static file serving di production
- **Database Connection Pooling**: Efficient PostgreSQL connections
- **Session Optimization**: PostgreSQL session store untuk scalability
- **Build Optimization**: Vite production build dengan minification
- **Caching Strategy**: TanStack Query untuk optimal client-side caching

## 🧪 Testing & Development

### **Development Tools:**
- **Hot Module Replacement**: Instant updates during development
- **TypeScript Strict Mode**: Comprehensive type checking
- **ESLint & Prettier**: Code quality dan formatting
- **Path Mapping**: Clean imports dengan `@/` alias

### **Testing Strategy:**
- **Component Testing**: React Testing Library untuk UI components
- **API Testing**: Endpoint testing dengan proper validation
- **E2E Testing**: User flow testing untuk critical authentication paths
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
- ✅ User authentication dan registration system
- ✅ Admin panel dengan role-based access
- ✅ Internationalization (ID/EN)
- ✅ Category management system
- ✅ Session-based shopping cart
- ✅ Midtrans payment integration
- ✅ Responsive design system
- ✅ Database migrations dan seeding
- ✅ Profile management untuk users
- ✅ Order tracking dan management

### **In Development:**
- 🔄 Product reviews dan ratings system
- 🔄 Email notifications untuk orders
- 🔄 Advanced analytics dashboard
- 🔄 Inventory management system

### **Planned Features:**
- 📋 Wishlist functionality
- 📋 Discount dan promo system
- 📋 Advanced search dengan filters
- 📋 Social media integration
- 📋 Mobile app development
- 📋 Multi-vendor support

### **Recent Updates (December 2024):**
- 🆕 Complete user authentication system
- 🆕 Role-based admin panel
- 🆕 Enhanced security dengan bcrypt
- 🆕 Session-based cart persistence
- 🆕 Order management system
- 🆕 Profile management
- 🆕 Enhanced mobile responsive design

---

**🎸 Made with ❤️ for Rock Musicians by Fajar Julyana 🎸**

*Wujudkan legenda rock Anda dengan alat musik berkualitas dari Hurtrock Music Store!*
