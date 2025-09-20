
# Admin Guide - Hurtrock Music Store

**Copyright 2024 Fajar Julyana. All rights reserved.**

## Panduan Lengkap untuk Administrator

Panduan ini khusus dirancang untuk administrator Hurtrock Music Store yang mengelola panel admin, produk, kategori, pesanan dengan sistem tracking terintegrasi, pengguna, dan sistem chat support.

## Akses Admin Panel

### Login sebagai Administrator:

1. **Akses Halaman Admin:**
   - Navigasi ke: `/admin`
   - Atau klik "Admin Panel" dari dropdown user menu (jika sudah login)

2. **Credentials Admin:**
   - Email: admin@hurtrock.com
   - Password: admin123
   - Role: admin (required untuk akses panel admin)

3. **Security Requirements:**
   - Session-based authentication dengan role validation
   - Admin key authentication untuk operasi sensitif
   - Auto-logout setelah periode inaktif
   - Audit logging untuk semua admin actions

## Dashboard Admin

### Overview Statistics:

Dashboard menampilkan statistik penting toko dengan real-time updates:

```
Dashboard Metrics:
├── Total Products: Jumlah produk aktif di catalog
├── Total Orders: Jumlah pesanan keseluruhan dengan breakdown status
├── Total Customers: Jumlah pengguna terdaftar yang aktif
├── Total Revenue: Total pendapatan dari pesanan terbayar
├── Recent Orders: 10 pesanan terbaru dengan tracking status
├── Low Stock Products: Produk dengan stock < 5 unit
├── Pending Tracking: Orders yang perlu input resi
├── Chat Notifications: Active chat rooms yang butuh respon
└── System Health: Status database dan server
```

### Navigation Menu:

Panel admin memiliki tab-tab utama yang enhanced:
- **Dashboard**: Overview dan statistik real-time
- **Products**: Manajemen produk dan inventory
- **Categories**: Manajemen kategori produk dengan SEO
- **Orders**: Manajemen pesanan dengan tracking system
- **Chat**: Live chat support management
- **Analytics**: Advanced reporting dengan export
- **Payment**: Konfigurasi Midtrans dan payment settings
- **Settings**: User management dan system configuration
- **Roles**: Role-based access control management

## Enhanced Order Management dengan Tracking System

### Order Listing dengan Tracking Info:

```
Enhanced Order Information Display:
├── Order ID (unique identifier dengan format ORD-xxxxx)
├── Customer Name, Email, dan Phone
├── Order Date dan Time
├── Total Amount (IDR format dengan thousand separator)
├── Payment Status (pending, paid, failed) dengan color coding
├── Order Status (pending, processing, shipped, delivered, cancelled)
├── Tracking Information:
│   ├── Tracking Number (jika sudah diinput)
│   ├── Shipping Service (JNE, TIKI, POS, etc.)
│   └── Tracking URL (direct link ke website kurir)
├── Items Count dan Preview
├── Shipping Address (truncated dengan tooltip)
└── Enhanced Action Buttons:
    ├── View Details (modal dengan complete info)
    ├── Update Status (dropdown dengan validation)
    ├── Input/Edit Resi (tracking management)
    ├── Print Label (PDF generation)
    └── Contact Customer (chat integration)
```

### New: Tracking Management System

#### 1. Input Tracking Number:

**Fitur Utama:**
- **Multi-Carrier Support**: Dropdown dengan 12+ jasa pengiriman utama
- **Format Validation**: Auto-validate format resi per carrier
- **Auto-Status Update**: Status otomatis berubah ke "shipped" saat resi diinput
- **Tracking URL Generation**: Auto-generate link ke website kurir
- **Customer Notification**: Email/SMS notification otomatis (jika dikonfigurasi)

**Supported Carriers:**
```
Jasa Pengiriman yang Didukung:
├── JNE - Jalur Nugraha Ekakurir
├── POS Indonesia - Pos Indonesia
├── TIKI - Titipan Kilat
├── SiCepat Express
├── Anteraja
├── J&T Express
├── Ninja Xpress
├── Lion Parcel
├── SAP Express
├── RPX (Repex Cargo)
├── ID Express
├── Wahana Prestasi Logistik
└── Kurir Toko Sendiri / Lainnya
```

#### 2. Tracking Input Workflow:

1. **Access Tracking Input:**
   - Klik tombol "Resi" pada order list
   - Atau dari order details modal
   - Modal tracking input akan terbuka

2. **Input Process:**
   ```
   Tracking Input Steps:
   ├── Step 1: Order Information Display
   │   ├── Order ID dan Customer Details
   │   ├── Current Status dan Payment Info
   │   └── Warning untuk status yang tidak bisa diupdate
   ├── Step 2: Tracking Number Input
   │   ├── Text input dengan format validation
   │   ├── Auto-uppercase dan trim whitespace
   │   └── Format example per carrier (coming soon)
   ├── Step 3: Shipping Service Selection
   │   ├── Dropdown dengan 12+ carriers
   │   ├── Search functionality dalam dropdown
   │   └── Custom option untuk carrier lain
   ├── Step 4: Validation & Confirmation
   │   ├── Client-side validation
   │   ├── Server-side format check
   │   └── Konfirmasi auto-update status
   └── Step 5: Update & Notification
       ├── Database update dengan transaction
       ├── Audit log untuk tracking action
       ├── Customer notification (email/SMS)
       └── Real-time UI update
   ```

3. **Validation Rules:**
   - Tracking number minimal 5 karakter, maksimal 50 karakter
   - Hanya alphanumeric dan dash (-) yang diperbolehkan
   - Tidak boleh kosong atau hanya whitespace
   - Status order harus pending, processing, atau shipped (tidak bisa update cancelled/delivered)

#### 3. Tracking URL Management:

**Auto-Generated Tracking URLs:**
```javascript
Tracking URL Templates:
├── JNE: https://www.jne.co.id/id/tracking/trace?keyword={trackingNumber}
├── POS Indonesia: https://www.posindonesia.co.id/app/trace?barcode={trackingNumber}
├── TIKI: https://www.tiki.id/id/tracking?keyword={trackingNumber}
├── SiCepat: https://www.sicepat.com/?action=track&keyword={trackingNumber}
├── Anteraja: https://www.anteraja.com/cek-resi/{trackingNumber}
├── J&T: https://jet.co.id/track/{trackingNumber}
├── Ninja Xpress: https://www.ninjaxpress.co/en-id/tracking?id={trackingNumber}
├── Lion Parcel: https://www.lionparcel.com/en/shipment-tracking/?barcode={trackingNumber}
└── Lainnya: Google search dengan tracking number dan carrier name
```

### Enhanced Order Status Management:

#### 1. Status Workflow dengan Tracking:
```
Enhanced Order Status Flow:
pending --> processing --> shipped --> delivered
├── cancelled (dapat dilakukan dari status apapun kecuali delivered)
├── Auto-shipped saat tracking number diinput
├── Notification otomatis untuk setiap perubahan status
└── Audit trail dengan timestamp dan admin info
```

#### 2. Status Descriptions dengan Tracking Context:
- **Pending**: Order baru, awaiting payment confirmation
- **Processing**: Payment confirmed, admin preparing items untuk shipment
- **Shipped**: Order dikirim dengan tracking number aktif
- **Delivered**: Order successfully delivered, tracking confirmed
- **Cancelled**: Order dibatalkan dengan reason (tracking dihapus jika ada)

#### 3. Bulk Status Updates:
- Select multiple orders dengan checkboxes
- Bulk update status untuk efficiency
- Bulk tracking input untuk multiple shipments (coming soon)
- Export selected orders untuk external processing

### Order Details Enhanced dengan Tracking:

#### 1. Comprehensive Order Information Panel:
```
Enhanced Order Details Modal:
├── Header Section:
│   ├── Order ID dengan QR code (untuk mobile scanning)
│   ├── Order date dan time dengan timezone
│   ├── Status badges dengan color coding
│   └── Quick action buttons
├── Customer Information:
│   ├── Full name dan contact details
│   ├── Shipping address dengan map link (coming soon)
│   ├── Customer order history link
│   └── Customer communication history
├── Tracking Information Section:
│   ├── Current tracking status dengan visual timeline
│   ├── Tracking number dengan copy-to-clipboard
│   ├── Shipping service dengan logo (coming soon)
│   ├── Direct tracking link dengan external indicator
│   ├── Estimated delivery date (if available from carrier)
│   └── Edit tracking button untuk admin updates
├── Order Items Breakdown:
│   ├── Product details dengan thumbnails
│   ├── Quantities dan individual prices
│   ├── Stock availability check
│   └── Product links untuk quick access
├── Payment Information:
│   ├── Payment method dan gateway info
│   ├── Payment timeline dan transaction ID
│   ├── Payment verification status
│   └── Refund information (if applicable)
└── Admin Notes & Actions:
    ├── Internal notes section (admin-only)
    ├── Customer communication log
    ├── Audit trail dengan timestamps
    └── Advanced actions (refund, cancel, etc.)
```

#### 2. Tracking Timeline Visualization:
- Visual progress bar dengan milestones
- Timestamp untuk setiap status change
- Admin username untuk manual updates
- Integration dengan carrier APIs untuk real-time updates (future enhancement)

### Print Order Labels Enhanced:

#### 1. Indonesian Professional PDF Labels:
```
Enhanced PDF Label Contents:
├── Header Section:
│   ├── Store branding dengan logo
│   ├── Store address dan contact info
│   ├── Professional letterhead design
│   └── Document title "SURAT JALAN PESANAN"
├── Order Information Section:
│   ├── Order ID dengan barcode
│   ├── Order date dalam format Indonesia
│   ├── Order status dan payment status
│   └── Tracking number (jika sudah ada)
├── Customer Information Section:
│   ├── Customer name dan contact details
│   ├── Shipping address yang formatted
│   ├── Customer phone number
│   └── Special delivery instructions
├── Shipping Information:
│   ├── Shipping service name dan logo
│   ├── Tracking number dengan barcode
│   ├── Estimated delivery time
│   └── Special handling requirements
├── Items Breakdown Table:
│   ├── Product names dengan detailed descriptions
│   ├── Quantities dan unit prices
│   ├── Individual totals dan grand total
│   ├── Tax information (PPN jika applicable)
│   └── Discount information (jika ada)
├── Terms & Conditions:
│   ├── Return policy information
│   ├── Warranty terms
│   ├── Customer service contact
│   └── Legal disclaimers
└── Footer Section:
    ├── Signature areas untuk pengirim dan penerima
    ├── Date fields untuk konfirmasi
    ├── Store stamp area
    └── Thank you message dengan branding
```

#### 2. PDF Generation Features:
- **Multi-page support** untuk order dengan banyak items
- **QR code integration** untuk tracking dan verification
- **Professional formatting** dengan consistent branding
- **Print optimization** untuk various paper sizes
- **Download naming convention**: `SuratJalan-{CustomerName}-{OrderID}-{Date}.pdf`

## Enhanced Analytics Dashboard

### Real-time Analytics dengan Export:

#### 1. Advanced Revenue Analytics:
```
Enhanced Analytics Features:
├── Revenue Analysis:
│   ├── Daily, weekly, monthly revenue trends
│   ├── Revenue by shipping method
│   ├── Revenue by payment method
│   ├── Profit margin analysis dengan cost calculation
│   └── Revenue forecasting based on trends
├── Order Analytics:
│   ├── Order volume trends dengan seasonal analysis
│   ├── Average order value (AOV) tracking
│   ├── Conversion rate dari visitor ke buyer
│   ├── Order status distribution
│   └── Shipping method popularity analysis
├── Product Performance:
│   ├── Top-selling products dengan revenue contribution
│   ├── Slow-moving inventory identification
│   ├── Stock turnover rate analysis
│   ├── Product category performance
│   └── Price optimization recommendations
├── Customer Analytics:
│   ├── Customer lifetime value (CLV) analysis
│   ├── Customer acquisition costs
│   ├── Repeat purchase rate
│   ├── Customer geographic distribution
│   └── Customer satisfaction scores (dari chat feedback)
└── Shipping & Tracking Analytics:
    ├── Delivery time analysis per carrier
    ├── Tracking adoption rate
    ├── Shipping cost optimization
    ├── Carrier performance comparison
    └── Delivery success rate tracking
```

#### 2. Enhanced Export Capabilities:
```
Advanced Export Options:
├── Laporan Pesanan (Orders Report):
│   ├── Complete order details dengan tracking info
│   ├── Customer information dan shipping addresses
│   ├── Payment status dan transaction details
│   ├── Item breakdown dengan product details
│   └── Shipping information dan tracking numbers
├── Laporan Transaksi Harian (Daily Transactions):
│   ├── Daily revenue breakdown
│   ├── Order count dan average order value
│   ├── Payment method distribution
│   ├── Shipping method usage
│   └── Top products sold per day
├── Laporan Detail Item (Item Details Report):
│   ├── Product-wise sales analysis
│   ├── Quantity sold dan revenue per product
│   ├── Customer information per product sale
│   ├── Shipping details per item
│   └── Profit margin per product
├── Laporan Tracking (Tracking Report):
│   ├── Shipping carrier performance
│   ├── Average delivery times
│   ├── Tracking adoption rate
│   ├── Failed delivery analysis
│   └── Customer satisfaction dengan shipping
└── Custom Report Builder:
    ├── Date range selection dengan presets
    ├── Multiple filter combinations
    ├── Custom field selection
    ├── Various export formats (CSV, Excel, PDF)
    └── Scheduled report generation (coming soon)
```

## Live Chat Management Enhanced

### Advanced Chat Room Management:

#### 1. Enhanced Chat Interface:
```
Advanced Chat Features:
├── Chat Room Overview:
│   ├── Active chat rooms dengan real-time indicators
│   ├── Customer information preview
│   ├── Chat subject dan priority levels
│   ├── Response time tracking
│   └── Chat satisfaction scores
├── Message Management:
│   ├── Real-time messaging dengan typing indicators
│   ├── Message read receipts
│   ├── File attachment support (images, documents)
│   ├── Quick reply templates
│   └── Internal admin notes (tidak visible ke customer)
├── Customer Context Integration:
│   ├── Customer order history dalam chat
│   ├── Product inquiry context
│   ├── Previous chat history
│   ├── Customer profile information
│   └── Order tracking integration dalam chat
└── Admin Tools:
    ├── Multiple admin support dalam satu chat
    ├── Chat transfer between admins
    ├── Escalation management
    ├── Chat analytics dan reporting
    └── Customer satisfaction surveys
```

#### 2. Integration dengan Order Management:
- **Order Inquiry Support**: Customer bisa tanya status order langsung di chat
- **Tracking Information**: Admin bisa share tracking info langsung dalam chat
- **Quick Order Lookup**: Search order by ID atau customer email dalam chat
- **Status Update Notifications**: Customer mendapat notif chat saat order status berubah

## User Management System

### Enhanced User Administration:

#### 1. Role-Based User Management:
```
Enhanced User Management Features:
├── User Overview Dashboard:
│   ├── Total users dengan breakdown by role
│   ├── Active vs inactive users
│   ├── Recent registrations
│   ├── User engagement metrics
│   └── User geographic distribution
├── User Profile Management:
│   ├── Complete user information editing
│   ├── Order history dengan quick access
│   ├── Chat history dengan customer service
│   ├── Account activity logs
│   └── Security settings management
├── Role & Permission Management:
│   ├── Admin role dengan full access
│   ├── Operator role dengan limited access
│   ├── Buyer role dengan customer features
│   ├── Custom role creation (coming soon)
│   └── Permission matrix management
└── User Actions & Monitoring:
    ├── Account activation/deactivation
    ├── Password reset functionality
    ├── Login activity monitoring
    ├── Security breach detection
    └── User behavior analytics
```

## System Configuration

### Enhanced Settings Management:

#### 1. Store Configuration:
```
Comprehensive Store Settings:
├── Basic Store Information:
│   ├── Store name, address, dan contact details
│   ├── Business hours dan holiday schedules
│   ├── Store policies (return, warranty, etc.)
│   └── Legal information (terms of service, privacy policy)
├── Payment Gateway Configuration:
│   ├── Midtrans settings dengan environment management
│   ├── Payment method enablement
│   ├── Transaction fee configuration
│   └── Payment notification URLs
├── Shipping Configuration:
│   ├── Supported shipping carriers
│   ├── Shipping rate calculation
│   ├── Delivery area coverage
│   └── Express shipping options
├── Notification Settings:
│   ├── Email notification templates
│   ├── SMS notification configuration
│   ├── Push notification settings
│   └── Admin alert preferences
└── System Security:
    ├── Admin key management
    ├── Session timeout settings
    ├── Login attempt limitations
    └── Two-factor authentication (coming soon)
```

## Troubleshooting Enhanced Issues

### Order & Tracking Issues:

**Problem**: Tracking number tidak bisa diupdate
**Solution**: 
- Cek status order (tidak bisa update cancelled/delivered)
- Verify admin permissions
- Check tracking number format (alphanumeric + dash only)
- Ensure shipping service is selected

**Problem**: Tracking URL tidak bekerja
**Solution**:
- Verify tracking number format per carrier
- Check carrier website availability
- Update tracking URL templates jika carrier mengubah format
- Use fallback Google search option

**Problem**: Customer tidak menerima tracking notification
**Solution**:
- Verify customer email address
- Check email notification settings
- Test SMTP configuration
- Check spam folder recommendations

### Performance Issues:

**Problem**: Order list loading lambat
**Solution**:
- Check database indexes pada orders table
- Implement pagination untuk large datasets
- Add caching untuk frequently accessed data
- Optimize JOIN queries dengan tracking updates

**Problem**: PDF generation gagal
**Solution**:
- Check jsPDF library version
- Verify order items data availability
- Test dengan different browsers
- Check server memory usage untuk large PDFs

### System Maintenance:

#### 1. Database Maintenance:
```sql
-- Regular maintenance queries
-- Clean up old session data
DELETE FROM sessions WHERE expires < NOW();

-- Archive old tracking updates (older than 1 year)
INSERT INTO tracking_updates_archive SELECT * FROM tracking_updates 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Update order statistics
REFRESH MATERIALIZED VIEW order_statistics;

-- Reindex untuk performance
REINDEX INDEX CONCURRENTLY idx_orders_tracking;
```

#### 2. Performance Monitoring:
- Monitor response times untuk tracking endpoints
- Check database query performance
- Monitor WebSocket connection stability
- Track PDF generation success rate

## Security Best Practices Enhanced

### Admin Security:

#### 1. Enhanced Authentication:
- **Strong Admin Keys**: Generate cryptographically secure admin keys
- **Session Management**: Proper session timeout dan cleanup
- **Action Logging**: Comprehensive audit trails untuk semua admin actions
- **IP Whitelisting**: Restrict admin access dari specific IPs (production)

#### 2. Data Protection:
- **Input Validation**: Comprehensive validation untuk tracking data
- **SQL Injection Prevention**: Parameterized queries untuk all database operations
- **XSS Protection**: Sanitize all user inputs
- **CSRF Protection**: Implement CSRF tokens untuk admin forms

#### 3. Privacy Compliance:
- **Customer Data Protection**: Secure handling customer information
- **Data Retention Policies**: Automatic cleanup old data
- **Privacy Settings**: Customer control over data sharing
- **GDPR Compliance**: Right to be forgotten implementation (coming soon)

## Advanced Reporting & Analytics

### Custom Report Generation:

#### 1. Report Builder Interface:
- **Date Range Selection**: Predefined ranges + custom date picker
- **Filter Combinations**: Multiple filter criteria support
- **Field Selection**: Choose specific columns untuk export
- **Grouping Options**: Group by day, week, month, category, etc.
- **Chart Generation**: Visual charts dengan export options

#### 2. Automated Reports:
- **Scheduled Reports**: Daily, weekly, monthly automated reports
- **Email Delivery**: Automatic report delivery ke admin emails
- **Dashboard Widgets**: Real-time metrics pada admin dashboard
- **Alert System**: Notifications untuk unusual patterns atau issues

**Developed by Fajar Julyana**

*Admin guide terbaru ini menyediakan panduan komprehensif untuk mengelola semua aspek administratif Hurtrock Music Store dengan fokus khusus pada fitur order tracking yang powerful dan terintegrasi dengan carrier-carrier utama Indonesia.*
