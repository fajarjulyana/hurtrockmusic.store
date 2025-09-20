
# Admin Guide - Hurtrock Music Store

**Copyright 2024 Fajar Julyana. All rights reserved.**

## Panduan Lengkap untuk Administrator

Panduan ini khusus dirancang untuk administrator Hurtrock Music Store yang mengelola panel admin, produk, kategori, pesanan, pengguna, dan sistem chat support.

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
   - Admin role diperlukan untuk semua fungsi administratif
   - Auto-logout setelah periode inaktif

## Dashboard Admin

### Overview Statistics:

Dashboard menampilkan statistik penting toko:

```
Dashboard Metrics:
├── Total Products: Jumlah produk aktif di catalog
├── Total Orders: Jumlah pesanan keseluruhan
├── Total Customers: Jumlah pengguna terdaftar
├── Total Revenue: Total pendapatan dari pesanan terbayar
├── Recent Orders: 10 pesanan terbaru dengan status
├── Low Stock Products: Produk dengan stock < 5 unit
├── Chat Notifications: Active chat rooms yang butuh respon
└── System Health: Status database dan server
```

### Navigation Menu:

Panel admin memiliki tab-tab utama:
- **Dashboard**: Overview dan statistik
- **Products**: Manajemen produk dan inventory
- **Categories**: Manajemen kategori produk
- **Orders**: Manajemen pesanan pelanggan
- **Users**: Manajemen akun pengguna
- **Chat**: Live chat support management
- **Settings**: Konfigurasi toko (coming soon)

## Manajemen Produk

### Menambah Produk Baru:

1. **Akses Product Management:**
   - Klik tab "Products" di admin panel
   - Klik tombol "Add New Product"

2. **Form Input Produk:**
   ```
   Required Fields:
   ├── Product Name *
   ├── Description
   ├── Price (IDR) *
   ├── Category *
   ├── Stock Quantity *
   ├── Primary Image URL *
   ├── Additional Images (optional, max 4)
   ├── Status (Active/Inactive)
   ├── Featured Product (boolean)
   └── SEO Keywords (optional)
   ```

3. **Image Management:**
   - Primary image: URL utama untuk thumbnail
   - Gallery images: hingga 4 gambar tambahan
   - Recommended size: 800x600px minimum
   - Format yang didukung: JPG, PNG, WebP

4. **Validation Rules:**
   - Nama produk: 3-100 karakter
   - Deskripsi: maksimal 1000 karakter
   - Harga: nilai positif, format decimal(10,2)
   - Stock: integer non-negatif
   - Category: harus ada dalam database

### Edit Produk Existing:

1. **Pencarian Produk:**
   - Gunakan search box di product management
   - Filter berdasarkan category atau status
   - Sort berdasarkan nama, harga, atau tanggal

2. **Edit Process:**
   - Klik "Edit" pada produk yang dipilih
   - Modify fields yang diperlukan
   - Simpan perubahan dengan validation

3. **Bulk Operations:**
   - Update stock multiple products
   - Change category untuk selected products
   - Activate/deactivate products in bulk
   - Export product data to CSV

### Hapus Produk:

1. **Delete Confirmation:**
   - Sistem akan cek apakah produk ada dalam pesanan aktif
   - Jika ada orders yang belum complete, delete akan ditolak
   - Konfirmasi delete dengan modal dialog

2. **Soft Delete:**
   - Produk tidak dihapus permanen dari database
   - Status diubah menjadi 'deleted' atau 'inactive'
   - Masih bisa direstore jika diperlukan

## Manajemen Kategori

### Tambah Kategori Baru:

1. **Category Form:**
   ```
   Category Fields:
   ├── Category Name * (unique)
   ├── Description
   ├── SEO Slug (auto-generated)
   ├── Meta Keywords
   ├── Display Order (integer)
   ├── Status (Active/Inactive)
   └── Parent Category (for subcategories - coming soon)
   ```

2. **SEO Optimization:**
   - Slug otomatis dibuat dari nama kategori
   - Format: lowercase, hyphen-separated
   - Contoh: "Electric Guitars" -> "electric-guitars"
   - Manual override tersedia jika diperlukan

### Edit/Delete Kategori:

1. **Edit Category:**
   - Modify nama, deskripsi, atau meta information
   - Update display order untuk sorting
   - Change status active/inactive

2. **Delete Validation:**
   - Sistem cek produk yang menggunakan kategori tersebut
   - Jika ada produk active, delete ditolak
   - Admin harus move products ke kategori lain dulu
   - Atau inactive kategori tanpa menghapus

### Category Management Best Practices:

- **Naming Convention**: Gunakan nama yang jelas dan descriptive
- **SEO Friendly**: Pastikan slug readable dan SEO-friendly
- **Hierarchy Planning**: Rencanakan struktur category yang logical
- **Regular Audit**: Review kategori yang tidak digunakan

## Manajemen Pesanan

### Order Listing:

```
Order Information Display:
├── Order ID (unique identifier)
├── Customer Name dan Email
├── Order Date dan Time
├── Total Amount (IDR format)
├── Payment Status (pending, paid, failed)
├── Order Status (pending, processing, shipped, delivered, cancelled)
├── Items Count
├── Shipping Address
└── Action Buttons (View, Update Status, Print Label, Chat)
```

### Order Status Management:

1. **Status Workflow:**
   ```
   Order Status Flow:
   pending -> processing -> shipped -> delivered
   └── cancelled (dapat dilakukan dari status apapun)
   ```

2. **Update Order Status:**
   - Select order dari list
   - Choose new status dari dropdown
   - Add optional notes untuk customer
   - System akan send notification email

3. **Status Descriptions:**
   - **Pending**: Order baru, awaiting admin confirmation
   - **Processing**: Order confirmed, preparing items
   - **Shipped**: Order dikirim, tracking info available
   - **Delivered**: Order successfully delivered
   - **Cancelled**: Order dibatalkan (with reason)

### Order Details:

1. **Order Information Panel:**
   - Customer details dan shipping address
   - Item list dengan quantities dan prices
   - Payment information dan method
   - Order timeline dengan timestamps
   - Internal notes (admin only)

2. **Customer Communication:**
   - Send update emails manually
   - Access chat history dengan customer
   - Add internal notes untuk tracking

### Print Order Labels:

1. **PDF Generation:**
   - Click "Print Label" pada order detail
   - System generate PDF dengan shipping info
   - Include order items dan customer details
   - Barcode untuk tracking (jika tersedia)

2. **Label Information:**
   - Customer name dan address
   - Order number dan date
   - Item summary dengan quantities
   - Special handling instructions

## Manajemen Pengguna

### User Management Overview:

```
User Information Display:
├── User ID dan Registration Date
├── Full Name (First + Last)
├── Email Address
├── Role (customer, admin)
├── Account Status (active, inactive)
├── Total Orders
├── Last Login Date
└── Actions (View, Edit, Deactivate)
```

### User Actions:

1. **View User Profile:**
   - Complete user information
   - Order history dan spending
   - Account activity logs
   - Communication history

2. **Edit User Information:**
   - Update nama dan contact information
   - Change account status (active/inactive)
   - Modify user role (customer/admin)
   - Reset password (generate new temporary password)

3. **Account Management:**
   - Deactivate problematic accounts
   - Reactivate suspended accounts
   - Merge duplicate accounts (manual process)
   - Export user data untuk analysis

### Role Management:

1. **Customer Role:**
   - Default role untuk new registrations
   - Access to shopping features
   - Can place orders dan use chat support
   - Profile management permissions

2. **Admin Role:**
   - Full access ke admin panel
   - Manage products, orders, dan users
   - Handle customer support chats
   - System configuration access

## Live Chat Management

### Chat Room Overview:

```
Chat Room Information:
├── Room ID dan Creation Date
├── Customer Name dan Email
├── Chat Subject/Topic
├── Status (active, closed, archived)
├── Message Count
├── Admin Joined Status
├── Last Message Timestamp
└── Actions (Join, Close, Archive)
```

### Chat Operations:

1. **Join Active Chat:**
   - Click "Join" pada chat room
   - WebSocket connection established
   - Real-time messaging interface
   - Customer receives notification bahwa admin joined

2. **Chat Interface Features:**
   - Real-time message display
   - Typing indicators
   - Message timestamps
   - Admin identification badges
   - Quick reply templates

3. **Chat Management:**
   - Mark messages as read/unread
   - Archive resolved conversations
   - Export chat history
   - Internal notes untuk chat context

### Customer Support Best Practices:

1. **Response Times:**
   - Aim for < 5 minutes during business hours
   - Set auto-responses untuk after hours
   - Use quick replies untuk common questions
   - Escalate complex issues appropriately

2. **Communication Guidelines:**
   - Professional dan friendly tone
   - Clear, concise answers
   - Proactive problem solving
   - Follow up on resolved issues

3. **Chat Categories:**
   - Product inquiries
   - Order status questions
   - Technical support
   - General customer service
   - Complaints dan feedback

## System Administration

### Database Management:

1. **Data Backup:**
   - Regular automated backups
   - Manual backup before major changes
   - Test restore procedures regularly
   - Keep multiple backup versions

2. **Performance Monitoring:**
   - Monitor database query performance
   - Check slow query logs
   - Optimize indexes regularly
   - Monitor storage usage

3. **Data Integrity:**
   - Regular consistency checks
   - Foreign key validation
   - Duplicate data detection
   - Cleanup old session data

### Security Management:

1. **Admin Account Security:**
   - Strong password requirements
   - Regular password changes
   - Two-factor authentication (planned)
   - Login attempt monitoring

2. **System Security:**
   - Regular security updates
   - SQL injection protection
   - XSS prevention measures
   - CSRF token implementation

3. **Access Control:**
   - Role-based permissions
   - Session timeout management
   - Failed login lockouts
   - Admin action logging

## Reporting dan Analytics

### Sales Reports:

1. **Revenue Analytics:**
   - Daily, weekly, monthly revenue trends
   - Payment method breakdown
   - Top-selling products
   - Customer lifetime value

2. **Order Analytics:**
   - Order volume trends
   - Average order value
   - Conversion rates
   - Geographic distribution

### Product Analytics:

1. **Inventory Reports:**
   - Stock levels per product
   - Low stock alerts
   - Inventory turnover rates
   - Reorder recommendations

2. **Performance Metrics:**
   - Product view counts
   - Add-to-cart rates
   - Purchase conversion rates
   - Return/refund rates

### Customer Analytics:

1. **User Behavior:**
   - Registration trends
   - Login frequency
   - Purchase patterns
   - Support ticket volume

2. **Engagement Metrics:**
   - Chat usage statistics
   - Search query analysis
   - Feature adoption rates
   - User satisfaction scores

## Troubleshooting Common Issues

### Order Issues:

**Problem**: Order stuck in 'pending' status
**Solution**: 
- Check payment status with Midtrans
- Verify inventory availability
- Update status manually if payment confirmed

**Problem**: Customer can't see order history
**Solution**:
- Verify user authentication
- Check order-user relationship in database
- Clear browser cache/cookies

### Product Issues:

**Problem**: Product images not displaying
**Solution**:
- Verify image URL accessibility
- Check file format dan size
- Update image path if needed

**Problem**: Search results inaccurate
**Solution**:
- Rebuild search indexes
- Update product descriptions
- Check category assignments

### Chat Issues:

**Problem**: Real-time messages not working
**Solution**:
- Check WebSocket connection
- Verify server WebSocket setup
- Restart chat service if needed

**Problem**: Chat history missing
**Solution**:
- Check database chat_messages table
- Verify room_id relationships
- Check for connection timeouts

## Performance Optimization

### Database Optimization:

1. **Query Performance:**
   - Add indexes pada frequently searched fields
   - Optimize JOIN operations
   - Use LIMIT pada large result sets
   - Implement query caching

2. **Regular Maintenance:**
   - Analyze query performance regularly
   - Clean up old session data
   - Archive completed orders
   - Update table statistics

### Application Performance:

1. **Frontend Optimization:**
   - Compress images before upload
   - Use CDN untuk static assets
   - Implement lazy loading
   - Minimize bundle sizes

2. **Backend Optimization:**
   - Cache frequently accessed data
   - Optimize API response times
   - Use connection pooling
   - Monitor memory usage

## Backup dan Recovery

### Data Backup Procedures:

1. **Regular Backups:**
   - Daily automated database backups
   - Weekly full system backups
   - Monthly archive backups
   - Off-site backup storage

2. **Recovery Procedures:**
   - Document recovery steps clearly
   - Test recovery procedures regularly
   - Have rollback plans ready
   - Maintain backup verification logs

### Disaster Recovery:

1. **Service Continuity:**
   - Maintain service during maintenance
   - Quick recovery procedures
   - Backup server configurations
   - Emergency contact procedures

## Admin Training dan Support

### New Admin Onboarding:

1. **Training Checklist:**
   - System overview dan navigation
   - Product management procedures
   - Order processing workflows
   - Customer service protocols
   - Security best practices

2. **Ongoing Training:**
   - Feature updates dan changes
   - Performance optimization techniques
   - Customer service improvements
   - System troubleshooting

### Admin Resources:

1. **Documentation:**
   - Complete system documentation
   - Process flowcharts
   - Troubleshooting guides
   - FAQ untuk common issues

2. **Support Channels:**
   - Technical support contact
   - Developer escalation procedures
   - System administrator resources
   - Community forums (if available)

**Developed by Fajar Julyana**

*Admin guide ini menyediakan panduan komprehensif untuk mengelola semua aspek administratif Hurtrock Music Store dengan efisien dan profesional.*
