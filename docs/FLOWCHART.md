

# 📊 Flowchart Sistem Hurtrock Music Store

**Copyright © 2024 Fajar Julyana. All rights reserved.**

## 🛒 Alur Pengguna (User Flow)

### **1. Alur Belanja Pelanggan**

```mermaid
flowchart TD
    A[👤 Pengguna Mengakses Website] --> B[🏠 Halaman Beranda]
    B --> C{🔍 Mencari Produk?}
    
    C -->|Ya| D[🔎 Gunakan Search/Filter]
    C -->|Tidak| E[📋 Lihat Kategori/Produk]
    
    D --> F[📦 Pilih Produk]
    E --> F
    
    F --> G[📱 Lihat Detail Produk]
    G --> H{🛒 Tambah ke Keranjang?}
    
    H -->|Ya| I[➕ Produk Masuk Keranjang Session-based]
    H -->|Tidak| J[⬅️ Kembali ke Katalog]
    
    I --> K{🛍️ Lanjut Belanja?}
    K -->|Ya| J
    K -->|Tidak| L[🛒 Buka Keranjang]
    
    L --> M[✏️ Review & Edit Keranjang]
    M --> N{💸 Checkout?}
    
    N -->|Ya| O[📝 Input Data Pembeli]
    N -->|Tidak| P[❌ Tutup Keranjang]
    
    O --> Q[💳 Pilih Metode Pembayaran Midtrans]
    Q --> R[🔒 Proses Pembayaran]
    
    R --> S{✅ Pembayaran Berhasil?}
    S -->|Ya| T[✉️ Konfirmasi Pesanan via Email]
    S -->|Tidak| U[❌ Pembayaran Gagal]
    
    T --> V[📦 Order Tersimpan ke Database]
    U --> Q
    
    P --> B
    J --> B
    
    style A fill:#f97316
    style T fill:#16a34a
    style U fill:#dc2626
```

### **2. Alur Kontak Customer Service**

```mermaid
flowchart TD
    A[👤 Pengguna Butuh Bantuan] --> B[📧 Scroll ke Contact Section]
    B --> C[📝 Isi Form Kontak dengan Validasi Zod]
    C --> D[📤 Submit Pertanyaan]
    D --> E{✅ Validasi Berhasil?}
    
    E -->|Ya| F[💾 Pesan Tersimpan ke PostgreSQL]
    E -->|Tidak| G[⚠️ Tampilkan Error Validasi]
    
    F --> H[📱 Admin Mendapat Notifikasi]
    H --> I[👨‍💼 Customer Service Respond]
    
    G --> C
    
    style A fill:#f97316
    style I fill:#16a34a
    style G fill:#dc2626
```

### **3. Alur Multi-bahasa & Internasionalisasi**

```mermaid
flowchart TD
    A[👤 User Akses Website] --> B[🌍 Deteksi Browser Locale]
    B --> C{🔍 Auto-detect Language?}
    
    C -->|Indonesia| D[🇮🇩 Set Bahasa Indonesia + IDR]
    C -->|International| E[🇺🇸 Set English + USD]
    C -->|Manual Select| F[🎛️ User Pilih Manual]
    
    F --> G{🌍 Pilih Bahasa}
    G -->|Indonesia| D
    G -->|English| E
    
    D --> H[💾 Simpan Preferensi ke LocalStorage]
    E --> H
    
    H --> I[🔄 Update Interface & Currency Format]
    I --> J[✅ Website Siap dengan Localization]
    
    style A fill:#f97316
    style J fill:#16a34a
```

## 👨‍💼 Alur Admin/Developer

### **4. Alur Autentikasi Admin**

```mermaid
flowchart TD
    A[🔐 Admin Akses /admin] --> B[📝 Form Login Admin]
    B --> C[🔑 Input ADMIN_KEY]
    C --> D[📤 Submit ke /api/auth/admin]
    
    D --> E[🛡️ Server Validasi ADMIN_KEY]
    E --> F{✅ Valid?}
    
    F -->|Ya| G[🎫 Generate Session Token]
    F -->|Tidak| H[❌ Unauthorized Response]
    
    G --> I[💾 Simpan Session ke PostgreSQL]
    I --> J[📊 Redirect ke Admin Dashboard]
    
    H --> K[⚠️ Tampilkan Error Message]
    K --> B
    
    J --> L[🔒 Protected Admin Routes Active]
    
    style A fill:#f97316
    style J fill:#16a34a
    style H fill:#dc2626
```

### **5. Alur Manajemen Produk Admin**

```mermaid
flowchart TD
    A[👨‍💼 Admin di Dashboard] --> B{🎯 Pilih Aksi CRUD}
    
    B -->|Create| C[📝 Form Produk Baru]
    B -->|Read| D[📋 View Products List]
    B -->|Update| E[✏️ Edit Produk Existing]
    B -->|Delete| F[🗑️ Konfirmasi Hapus Produk]
    
    C --> G[📸 Upload Multiple Images]
    E --> G
    G --> H[📊 Validasi dengan Zod Schema]
    
    H --> I{✅ Validasi Berhasil?}
    I -->|Ya| J[💾 Simpan ke PostgreSQL via Drizzle ORM]
    I -->|Tidak| K[⚠️ Tampilkan Validation Errors]
    
    J --> L[🔄 Invalidate TanStack Query Cache]
    L --> M[✅ Update UI Real-time]
    
    F --> N[❌ Soft Delete dari Database]
    N --> L
    
    D --> O[📊 Display dengan Pagination]
    
    K --> C
    
    style A fill:#f97316
    style M fill:#16a34a
    style K fill:#dc2626
```

### **6. Alur Sistem Pembayaran Midtrans Terintegrasi**

```mermaid
flowchart TD
    A[🛒 User Click Checkout] --> B[📝 Input Customer Data dengan Validation]
    B --> C{✅ Form Valid?}
    
    C -->|Ya| D[🔄 Frontend Send Request ke /api/payment/create]
    C -->|Tidak| E[⚠️ Show Validation Errors]
    
    D --> F[🛠️ Backend Create Order in Database]
    F --> G[💳 Call Midtrans Snap API]
    G --> H[🔒 Midtrans Generate Payment Token]
    H --> I[↩️ Return Token to Frontend]
    
    I --> J[💰 Show Midtrans Payment Modal]
    J --> K[💸 User Process Payment]
    K --> L{✅ Payment Success?}
    
    L -->|Ya| M[📧 Midtrans Send Webhook to /api/payment/webhook]
    L -->|Tidak| N[❌ Payment Failed]
    
    M --> O[🛠️ Backend Process Webhook]
    O --> P[💾 Update Order Status in PostgreSQL]
    P --> Q[🗑️ Clear Shopping Cart Session]
    Q --> R[✉️ Send Confirmation Email]
    
    N --> S[🔄 Return to Payment Options]
    E --> B
    S --> J
    
    style A fill:#f97316
    style R fill:#16a34a
    style N fill:#dc2626
```

## 🏗️ Arsitektur Sistem Terbaru

### **7. Alur Arsitektur Full-Stack dengan Database**

```mermaid
flowchart TB
    subgraph "🌐 Frontend Layer (React + TypeScript + Vite)"
        A1[📱 React Components dengan Shadcn/UI]
        A2[🛒 Shopping Cart dengan Session Persistence]
        A3[💳 Midtrans Payment Integration]
        A4[👨‍💼 Admin Panel dengan Auth Protection]
        A5[🌍 Localization Context dengan Auto-detection]
        A6[🔍 TanStack Query State Management]
    end
    
    subgraph "🔄 API Layer (Express.js + TypeScript)"
        B1[📦 Products CRUD API dengan Validation]
        B2[🛒 Session-based Cart API]
        B3[💳 Payment API dengan Webhook Handler]
        B4[🔐 Authentication API dengan Session]
        B5[📧 Contact Form API dengan Email]
        B6[📂 Categories Management API]
    end
    
    subgraph "💾 Database Layer (PostgreSQL + Drizzle ORM)"
        C1[📦 Products Table dengan Images]
        C2[📂 Categories Table dengan Relations]
        C3[🛒 Cart Items Table Session-based]
        C4[📋 Orders Table dengan Customer Info]
        C5[🖼️ Product Images Table dengan URLs]
        C6[📧 Contact Submissions Table]
        C7[👤 Sessions Table untuk Auth & Cart]
    end
    
    subgraph "☁️ External Services & APIs"
        D1[💰 Midtrans Payment Gateway]
        D2[📧 Email Service untuk Notifications]
        D3[🌐 Replit Deployment Platform]
        D4[📊 Database Hosting (Neon/Railway)]
    end
    
    A1 <--> B1
    A2 <--> B2
    A3 <--> B3
    A4 <--> B4
    A5 <--> B5
    A6 <--> B1
    
    B1 <--> C1
    B2 <--> C3
    B3 <--> C4
    B4 <--> C7
    B5 <--> C6
    B6 <--> C2
    
    B3 <--> D1
    B5 <--> D2
    C1 <--> D3
    C7 <--> D4
    
    style A1 fill:#3b82f6
    style B1 fill:#16a34a
    style C1 fill:#f59e0b
    style D1 fill:#dc2626
```

### **8. Alur State Management dengan TanStack Query**

```mermaid
flowchart TD
    A[🔄 Component Request Data] --> B[📊 TanStack Query Check Cache]
    B --> C{💾 Cache Hit?}
    
    C -->|Ya| D[⚡ Return Cached Data Instantly]
    C -->|Tidak| E[🌐 Fetch from API]
    
    E --> F[📡 Express.js API Handler]
    F --> G[🔍 Drizzle ORM Query PostgreSQL]
    G --> H[💾 Return Data to Frontend]
    
    H --> I[📊 TanStack Query Cache Data]
    I --> J[🔄 Update Component State]
    
    D --> J
    
    J --> K[👁️ Component Re-render dengan Data Baru]
    
    style A fill:#f97316
    style K fill:#16a34a
```

## 📱 Enhanced Mobile & Responsive Flow

### **9. Alur Responsive Design dengan Tailwind**

```mermaid
flowchart LR
    A[📱 User Access dari Device] --> B[📏 CSS Media Queries Detect Screen]
    
    B -->|≤768px| C[📱 Mobile Layout Active]
    B -->|768-1024px| D[📓 Tablet Layout Active]
    B -->|≥1024px| E[🖥️ Desktop Layout Active]
    
    C --> F[🍔 Hamburger Navigation]
    C --> G[📋 Single Column Product Grid]
    C --> H[👆 Touch-optimized Controls]
    
    D --> I[📐 Two Column Grid Layout]
    D --> J[🔀 Condensed Navigation]
    
    E --> K[🖱️ Multi-column dengan Hover Effects]
    E --> L[📊 Full Admin Dashboard]
    
    F --> M[📱 Optimized Shopping Experience]
    G --> M
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M
    
    style A fill:#f97316
    style M fill:#16a34a
```

## 🔐 Security & Authentication Flow

### **10. Alur Keamanan Multi-layer**

```mermaid
flowchart TD
    A[🌐 Incoming Request] --> B[🔍 Express.js Input Validation]
    B --> C[📊 Zod Schema Validation]
    C --> D{✅ Input Valid?}
    
    D -->|Ya| E{🔐 Protected Route?}
    D -->|Tidak| F[❌ Return Validation Error]
    
    E -->|Ya| G[🎫 Check Session Token]
    E -->|Tidak| H[📡 Process Public Request]
    
    G --> I{👤 Valid Session?}
    I -->|Ya| J[🔑 Check Admin Permissions]
    I -->|Tidak| K[❌ Unauthorized Response]
    
    J --> L{👨‍💼 Admin Access Required?}
    L -->|Ya| M[🛡️ Verify ADMIN_KEY]
    L -->|Tidak| H
    
    M --> N{🔐 Valid Admin?}
    N -->|Ya| H
    N -->|Tidak| K
    
    H --> O[🗄️ Drizzle ORM Safe Query]
    O --> P[🛡️ SQL Injection Prevention]
    P --> Q[📤 Return Sanitized Response]
    
    F --> R[🚨 Log Security Event]
    K --> R
    
    style A fill:#f97316
    style Q fill:#16a34a
    style F fill:#dc2626
    style K fill:#dc2626
    style R fill:#dc2626
```

## 🚀 Development & Deployment Flow di Replit

### **11. Alur Development Lifecycle**

```mermaid
flowchart TD
    A[💻 Developer Coding di Replit IDE] --> B[🔧 Hot Module Replacement Active]
    B --> C[🧪 Real-time Testing dengan Vite HMR]
    C --> D{✅ Feature Complete?}
    
    D -->|Tidak| E[🐛 Debug & Iterate]
    E --> A
    
    D -->|Ya| F[📋 TypeScript Type Checking]
    F --> G[🧪 Run Tests & Validation]
    G --> H{✅ All Tests Pass?}
    
    H -->|Tidak| I[🔧 Fix Issues]
    I --> F
    
    H -->|Ya| J[📤 Git Commit & Push]
    J --> K[☁️ Replit Auto Build Trigger]
    
    K --> L[🏗️ Build Production Bundle]
    L --> M[📦 Build Client Assets dengan Vite]
    M --> N[🗄️ Database Migration Check]
    N --> O[🚀 Deploy to Production URL]
    
    O --> P[📊 Health Check & Monitoring]
    P --> Q{🔍 Deployment Success?}
    
    Q -->|Ya| R[✅ Live Application Ready]
    Q -->|Tidak| S[🚨 Rollback & Alert]
    
    S --> T[🔍 Debug Deployment Issues]
    T --> K
    
    style A fill:#f97316
    style R fill:#16a34a
    style S fill:#dc2626
```

## 🗄️ Entity Relationship Diagram (ERD)

### **12. Database Schema & Relations**

```mermaid
erDiagram
    USERS {
        VARCHAR id PK "gen_random_uuid()"
        TEXT username UK "Unique username"
        TEXT email UK "Unique email"
        TEXT password "Hashed password"
        TEXT first_name "User first name"
        TEXT last_name "User last name"
        BOOLEAN is_admin "Admin privileges"
        TIMESTAMP created_at "Creation date"
        TIMESTAMP updated_at "Last update"
    }
    
    CATEGORIES {
        VARCHAR id PK "gen_random_uuid()"
        TEXT name "Category name"
        TEXT description "Category description"
        TEXT slug UK "SEO-friendly URL slug"
        TIMESTAMP created_at "Creation date"
    }
    
    PRODUCTS {
        VARCHAR id PK "gen_random_uuid()"
        TEXT name "Product name"
        TEXT description "Product description"
        DECIMAL price "Current price (10,2)"
        DECIMAL original_price "Original price (10,2)"
        VARCHAR category_id FK "References categories.id"
        TEXT image_url "Primary image URL"
        DECIMAL rating "Average rating (2,1)"
        INTEGER review_count "Number of reviews"
        BOOLEAN is_new "New arrival flag"
        BOOLEAN is_sale "Sale item flag"
        BOOLEAN in_stock "Stock availability"
        INTEGER stock_quantity "Available quantity"
        TIMESTAMP created_at "Creation date"
        TIMESTAMP updated_at "Last update"
    }
    
    PRODUCT_IMAGES {
        VARCHAR id PK "gen_random_uuid()"
        VARCHAR product_id FK "References products.id"
        TEXT image_url "Image URL"
        TEXT alt_text "Alternative text"
        BOOLEAN is_primary "Primary image flag"
        INTEGER sort_order "Display order"
        TIMESTAMP created_at "Creation date"
    }
    
    CART_ITEMS {
        VARCHAR id PK "gen_random_uuid()"
        TEXT session_id "Browser session ID"
        VARCHAR product_id FK "References products.id"
        INTEGER quantity "Item quantity"
        TIMESTAMP created_at "Creation date"
        TIMESTAMP updated_at "Last update"
    }
    
    ORDERS {
        VARCHAR id PK "gen_random_uuid()"
        TEXT order_id UK "Unique order number"
        TEXT session_id "Browser session ID"
        TEXT customer_name "Customer full name"
        TEXT customer_email "Customer email"
        TEXT customer_phone "Customer phone"
        TEXT shipping_address "Delivery address"
        DECIMAL total_amount "Total order value (10,2)"
        TEXT payment_status "pending|paid|failed|cancelled"
        TEXT order_status "processing|shipped|delivered|cancelled"
        TEXT tracking_number "Shipping tracking"
        TEXT midtrans_token "Payment token"
        TIMESTAMP created_at "Order date"
        TIMESTAMP updated_at "Last update"
    }
    
    ORDER_ITEMS {
        VARCHAR id PK "gen_random_uuid()"
        VARCHAR order_id FK "References orders.id"
        VARCHAR product_id FK "References products.id"
        TEXT product_name "Product name snapshot"
        DECIMAL product_price "Price snapshot (10,2)"
        INTEGER quantity "Ordered quantity"
        TIMESTAMP created_at "Creation date"
    }
    
    CONTACT_SUBMISSIONS {
        VARCHAR id PK "gen_random_uuid()"
        TEXT name "Contact name"
        TEXT email "Contact email"
        TEXT subject "Message subject"
        TEXT message "Message content"
        TIMESTAMP created_at "Submission date"
    }
    
    %% Relationships
    CATEGORIES ||--o{ PRODUCTS : "has many"
    PRODUCTS ||--o{ PRODUCT_IMAGES : "has multiple"
    PRODUCTS ||--o{ CART_ITEMS : "added to cart"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered as"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
```

### **13. Database Constraints & Indexes**

```mermaid
flowchart TD
    subgraph "🔑 Primary Keys & Unique Constraints"
        A1[🆔 UUID Primary Keys on All Tables]
        A2[👤 Unique Username & Email in Users]
        A3[🏷️ Unique Slug in Categories]
        A4[📋 Unique Order ID in Orders]
    end
    
    subgraph "🔗 Foreign Key Relations"
        B1[📦 Products → Categories]
        B2[🖼️ Product Images → Products]
        B3[🛒 Cart Items → Products]
        B4[📋 Order Items → Orders]
        B5[📋 Order Items → Products]
    end
    
    subgraph "📊 Database Indexes"
        C1[📇 Index on Products.category_id]
        C2[📇 Index on Cart_Items.session_id]
        C3[📇 Index on Orders.payment_status]
        C4[📇 Index on Products.is_new, is_sale]
        C5[📇 Index on Product_Images.product_id]
    end
    
    subgraph "✅ Data Validation"
        D1[💰 Price >= 0 Check Constraints]
        D2[📊 Rating 0-5 Range Validation]
        D3[📈 Stock Quantity >= 0]
        D4[📧 Email Format Validation]
        D5[🔢 Quantity > 0 in Cart & Orders]
    end
    
    A1 --> B1
    B1 --> C1
    C1 --> D1
    
    style A1 fill:#3b82f6
    style B1 fill:#16a34a
    style C1 fill:#f59e0b
    style D1 fill:#8b5cf6
```

## 📊 Data Flow dengan PostgreSQL

### **14. Alur Data Persistence**

```mermaid
flowchart TB
    subgraph "📥 Data Input Sources"
        A1[👤 User Form Submissions]
        A2[👨‍💼 Admin CRUD Operations]
        A3[💳 Payment Webhook Data]
        A4[🌍 Session & Preference Data]
    end
    
    subgraph "🔄 Processing & Validation Layer"
        B1[✅ Zod Schema Validation]
        B2[🔐 Authentication & Authorization]
        B3[📊 Business Logic Processing]
        B4[🛡️ Sanitization & Security Checks]
    end
    
    subgraph "💾 PostgreSQL Database Layer"
        C1[📦 Products & Categories Tables]
        C2[👤 Sessions & User Data]
        C3[📋 Orders & Payment Records]
        C4[💳 Transaction Logs]
        C5[🌍 Localization Preferences]
        C6[📧 Contact Form Submissions]
    end
    
    subgraph "📤 Output & Response Layer"
        D1[🌐 Website Data Display]
        D2[📧 Email Notifications]
        D3[📊 Admin Dashboard Reports]
        D4[🌍 Localized Content Delivery]
        D5[💳 Payment Status Updates]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B4
    
    B1 --> C1
    B2 --> C2
    B3 --> C3
    B4 --> C4
    B3 --> C5
    B1 --> C6
    
    C1 --> D1
    C2 --> D1
    C3 --> D2
    C4 --> D3
    C5 --> D4
    C3 --> D5
    
    style A1 fill:#3b82f6
    style B1 fill:#16a34a
    style C1 fill:#f59e0b
    style D1 fill:#8b5cf6
```

---

## 📋 Legenda Flowchart & ERD Terbaru

### **Flowchart Symbols:**
| Simbol | Arti | Penggunaan Konteks |
|--------|------|--------------------|
| 🏠 | Homepage | Landing page dengan hero section |
| 👤 | User/Customer | End users yang berbelanja |
| 👨‍💼 | Admin | System administrator dengan ADMIN_KEY |
| 📦 | Products | Catalog items dengan multiple images |
| 🛒 | Shopping Cart | Session-based cart persistence |
| 💳 | Payment | Midtrans payment gateway integration |
| 📱 | Mobile Responsive | Touch-optimized mobile interface |
| 🖥️ | Desktop Interface | Full-featured desktop experience |
| 💾 | PostgreSQL Database | Persistent data storage dengan Drizzle ORM |
| ☁️ | Replit Platform | Cloud development dan hosting environment |
| ✅ | Success State | Successful operations atau validations |
| ❌ | Error State | Failed operations atau validation errors |
| 🔄 | Processing | Ongoing operations atau state transitions |
| 📊 | TanStack Query | Client-side state management dan caching |
| 🌍 | Internationalization | Multi-language support dengan auto-detection |
| 🔐 | Authentication | Session-based auth dengan ADMIN_KEY |
| 🛡️ | Security | Input validation, SQL injection prevention |
| 📧 | Email Integration | Notifications dan contact form responses |

### **ERD Symbols & Notation:**
| Simbol | Arti | Penggunaan Database |
|--------|------|--------------------|
| PK | Primary Key | Unique identifier untuk setiap record |
| FK | Foreign Key | Reference ke primary key table lain |
| UK | Unique Key | Unique constraint selain primary key |
| `||--o{` | One-to-Many | Relasi satu ke banyak (e.g., Category → Products) |
| `||--||` | One-to-One | Relasi satu ke satu (rare dalam sistem ini) |
| `}o--o{` | Many-to-Many | Relasi banyak ke banyak (melalui junction table) |
| VARCHAR | Variable Character | String dengan max length |
| TEXT | Text Field | Unlimited length string |
| DECIMAL(10,2) | Decimal Number | Numeric dengan 10 digits, 2 decimal places |
| INTEGER | Whole Number | Bilangan bulat |
| BOOLEAN | True/False | Boolean value |
| TIMESTAMP | Date/Time | Tanggal dan waktu dengan timezone |

## 🔧 Database Performance & Security Features

### **15. Performance Optimization Strategy**

```mermaid
flowchart LR
    subgraph "📈 Query Optimization"
        A1[📇 Strategic Indexing]
        A2[🔍 Efficient JOIN Operations]
        A3[📊 Query Result Caching]
        A4[🎯 Selective Field Loading]
    end
    
    subgraph "🛡️ Security Measures"
        B1[🔐 Input Sanitization]
        B2[🛡️ SQL Injection Prevention]
        B3[🔑 Role-based Access Control]
        B4[📊 Audit Logging]
    end
    
    subgraph "⚡ Connection Management"
        C1[🏊 Connection Pooling]
        C2[💤 Auto-sleep on Idle]
        C3[🔄 Connection Recycling]
        C4[📊 Pool Monitoring]
    end
    
    A1 --> B1
    B1 --> C1
    A2 --> B2
    B2 --> C2
    A3 --> B3
    B3 --> C3
    A4 --> B4
    B4 --> C4
    
    style A1 fill:#3b82f6
    style B1 fill:#16a34a
    style C1 fill:#f59e0b
```

### **16. Database Migration & Seeding Flow**

```mermaid
flowchart TD
    A[🚀 Initial Database Setup] --> B[📋 Create Schema Tables]
    B --> C[🔗 Add Foreign Key Constraints]
    C --> D[📇 Create Performance Indexes]
    D --> E[✅ Add Check Constraints]
    E --> F[🌱 Seed Initial Data]
    
    F --> G{🏷️ Categories Seeded?}
    G -->|Ya| H[📦 Seed Sample Products]
    G -->|Tidak| I[⚠️ Seed Categories First]
    
    I --> H
    H --> J[🖼️ Add Product Images]
    J --> K[👤 Create Admin User]
    K --> L[✅ Database Ready for Production]
    
    L --> M[🔄 Run Drizzle Migrations]
    M --> N[📊 Verify Data Integrity]
    N --> O[🚀 Application Start]
    
    style A fill:#f97316
    style L fill:#16a34a
    style O fill:#8b5cf6
```

---

## 🎯 Key System Improvements

### **Enhanced Features dalam Flowchart & ERD:**

1. **Session-based Authentication**: ADMIN_KEY authentication dengan PostgreSQL session storage
2. **Database Persistence**: Complete PostgreSQL integration dengan Drizzle ORM dan ERD documentation
3. **Real-time State Management**: TanStack Query untuk optimal caching dan synchronization
4. **Enhanced Security**: Multi-layer validation dengan Zod schemas dan SQL injection prevention
5. **Advanced Internationalization**: Auto-detection browser locale dengan currency conversion
6. **Production-ready Payment**: Full Midtrans webhook integration dengan order tracking
7. **Responsive Design**: Mobile-first approach dengan Tailwind breakpoint optimization
8. **Developer Experience**: Hot module replacement dengan comprehensive error handling
9. **Database Design**: Comprehensive ERD dengan proper constraints dan performance indexes
10. **Data Integrity**: Foreign key relationships dengan referential integrity enforcement

---

**Developed by Fajar Julyana**

*Flowchart ini mencerminkan arsitektur lengkap sistem Hurtrock Music Store dengan teknologi modern, keamanan berlapis, dan user experience yang optimal untuk semua platform.*

