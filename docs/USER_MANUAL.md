
# User Manual - Hurtrock Music Store

**Copyright 2024 Fajar Julyana. All rights reserved.**

## Panduan Lengkap untuk Pengguna

Selamat datang di Hurtrock Music Store! Panduan ini akan membantu Anda memahami semua fitur yang tersedia untuk pengalaman berbelanja alat musik yang optimal, termasuk sistem tracking pesanan yang terintegrasi.

## Memulai dengan Hurtrock Music Store

### Akses Website:
- **URL**: [URL Replit Anda]
- **Browser**: Chrome, Firefox, Safari, Edge (versi terbaru)
- **Device**: Desktop, tablet, dan mobile responsif

### Fitur Utama untuk Customer:
- **Katalog Produk Lengkap**: Gitar, bass, drum, amplifier, dan aksesoris
- **Pencarian & Filter Canggih**: Temukan produk dengan mudah
- **Shopping Cart Session-based**: Keranjang tetap tersimpan
- **Checkout Aman**: Pembayaran via Midtrans
- **Order Tracking**: Lacak pesanan real-time dengan resi
- **Live Chat Support**: Bantuan langsung dari admin
- **Multi-language**: Bahasa Indonesia dan English

## Registrasi dan Login

### Membuat Akun Baru:

1. **Akses Halaman Register:**
   - Klik "Login/Register" di header
   - Pilih tab "Register"

2. **Isi Form Registrasi:**
   ```
   Form Fields:
   ├── Email * (akan digunakan untuk login)
   ├── Password * (minimal 6 karakter)
   ├── First Name * (nama depan)
   ├── Last Name * (nama belakang)
   └── Konfirmasi Password *
   ```

3. **Validasi dan Submit:**
   - Sistem akan validasi format email
   - Password akan di-hash untuk keamanan
   - Akun langsung aktif setelah registrasi

### Login ke Akun:

1. **Form Login:**
   - Email dan password yang sudah terdaftar
   - Checkbox "Remember me" untuk session yang lebih lama

2. **Lupa Password:**
   - Klik "Forgot Password" (fitur akan datang)
   - Atau hubungi customer service via live chat

## Browsing dan Pencarian Produk

### Enhanced Search Features:

#### 1. Pencarian Real-time:
- **Search Bar**: Ketik di header, hasil muncul real-time
- **Debounced Search**: Hasil update setelah berhenti mengetik
- **Search Suggestions**: Auto-complete berdasarkan produk populer
- **Recent Searches**: History pencarian Anda (jika login)

#### 2. Advanced Filtering:
```
Filter Options:
├── Category Filter:
│   ├── Gitar Listrik
│   ├── Gitar Akustik
│   ├── Bass
│   ├── Drum
│   ├── Amplifier
│   └── Aksesoris
├── Price Range:
│   ├── Slider untuk range harga
│   ├── Input manual min/max
│   └── Preset ranges (Under 1jt, 1-5jt, etc.)
├── Brand Filter:
│   ├── Yamaha, Fender, Gibson, dll
│   ├── Multiple selection
│   └── Brand popularity ranking
├── Status Filter:
│   ├── New Arrivals
│   ├── On Sale
│   ├── In Stock
│   └── Best Sellers
└── Rating Filter:
    ├── 5 stars, 4+ stars, etc.
    ├── Number of reviews
    └── Customer ratings
```

#### 3. Sorting Options:
- **Relevance**: Berdasarkan search query match
- **Price**: Low to High / High to Low
- **Name**: A-Z / Z-A
- **Newest**: Produk terbaru dahulu
- **Rating**: Highest rated first
- **Popularity**: Berdasarkan views dan sales

#### 4. View Modes:
- **Grid View**: Thumbnail view dengan informasi ringkas
- **List View**: Detailed view dengan deskripsi
- **Responsive**: Auto-adjust untuk mobile dan tablet

## Shopping Cart dan Checkout

### Enhanced Shopping Cart:

#### 1. Session-based Cart:
- **Persistent Cart**: Items tersimpan meski belum login
- **Cart Sidebar**: Quick view tanpa leave halaman
- **Quantity Controls**: Adjust quantity dengan +/- buttons
- **Remove Items**: Delete individual items atau clear all
- **Price Updates**: Real-time price calculation
- **Stock Validation**: Check availability saat add to cart

#### 2. Cart Features:
```
Shopping Cart Information:
├── Product Details:
│   ├── Product image thumbnail
│   ├── Product name dan description
│   ├── Individual price dan total
│   ├── Stock availability indicator
│   └── Quick access ke product page
├── Quantity Management:
│   ├── Quantity selector dengan validation
│   ├── Max quantity based on stock
│   ├── Bulk quantity update
│   └── Auto-remove jika quantity = 0
├── Price Calculation:
│   ├── Subtotal per item
│   ├── Cart subtotal
│   ├── Estimated shipping (if applicable)
│   ├── Tax calculation (if applicable)
│   └── Grand total dengan currency format
└── Cart Actions:
    ├── Continue Shopping button
    ├── Clear Cart option
    ├── Save for Later (coming soon)
    └── Proceed to Checkout
```

### Secure Checkout Process:

#### 1. Checkout Steps:
```
Checkout Workflow:
├── Step 1: Cart Review
│   ├── Final item verification
│   ├── Quantity adjustments
│   ├── Remove unwanted items
│   └── Price confirmation
├── Step 2: Customer Information
│   ├── Auto-fill jika sudah login
│   ├── Guest checkout option
│   ├── Billing information
│   └── Contact details verification
├── Step 3: Shipping Information
│   ├── Shipping address input
│   ├── Address validation
│   ├── Delivery preferences
│   └── Special instructions
├── Step 4: Payment Method
│   ├── Midtrans payment gateway
│   ├── Multiple payment options
│   ├── Secure payment processing
│   └── Payment confirmation
└── Step 5: Order Confirmation
    ├── Order summary review
    ├── Order ID generation
    ├── Email confirmation
    └── Redirect ke tracking page
```

#### 2. Payment Options (via Midtrans):
- **Bank Transfer**: BCA, BNI, BRI, Mandiri, Permata
- **E-Wallet**: GoPay, OVO, DANA, LinkAja, ShopeePay
- **Credit/Debit Cards**: Visa, MasterCard, JCB
- **Virtual Account**: All major banks
- **Convenience Store**: Indomaret, Alfamart
- **Installment**: Credit card installment options

## Buyer Dashboard Enhanced

### Akses Dashboard:

1. **Login Required**: Dashboard hanya accessible setelah login
2. **Navigation**: Klik avatar/name di header → "Dashboard"
3. **Mobile Friendly**: Responsive design untuk semua device

### Dashboard Features:

#### 1. Profile Management:
```
Profile Information:
├── Personal Information:
│   ├── Full name editing
│   ├── Email address (login credential)
│   ├── Phone number untuk notifications
│   ├── Profile picture upload (coming soon)
│   └── Account preferences
├── Address Management:
│   ├── Default shipping address
│   ├── Multiple address support (coming soon)
│   ├── Address validation dengan maps
│   └── Quick address selection saat checkout
├── Security Settings:
│   ├── Change password functionality
│   ├── Login activity monitoring
│   ├── Session management
│   └── Two-factor authentication (coming soon)
└── Preferences:
    ├── Language preference (ID/EN)
    ├── Currency display (IDR/USD)
    ├── Email notification settings
    └── Marketing communication opt-in/out
```

#### 2. Order Management Enhanced:

**Tab Navigation:**
- **All Orders**: Semua pesanan dengan filter
- **Pending**: Orders awaiting payment/processing
- **Processing**: Orders sedang disiapkan
- **Shipped**: Orders dalam pengiriman dengan tracking
- **Delivered**: Orders yang sudah diterima
- **Tracking**: Dedicated tab untuk tracking active shipments

**Order Information Display:**
```
Enhanced Order Details:
├── Order Header:
│   ├── Order ID dengan format ORD-xxxxx-timestamp
│   ├── Order date dan time (timezone local)
│   ├── Order status dengan color-coded badges
│   └── Payment status verification
├── Items Breakdown:
│   ├── Product thumbnails dengan links
│   ├── Product names dan descriptions
│   ├── Quantities dan individual prices
│   ├── Subtotal per item
│   └── Grand total dengan tax breakdown
├── Customer Information:
│   ├── Billing information snapshot
│   ├── Shipping address dengan formatting
│   ├── Contact details used
│   └── Special delivery instructions
├── Payment Information:
│   ├── Payment method used
│   ├── Transaction ID dari Midtrans
│   ├── Payment timestamp
│   ├── Payment verification status
│   └── Receipt download link (coming soon)
└── Shipping & Tracking:
    ├── Shipping method selected
    ├── Estimated delivery time
    ├── Tracking information (jika available)
    ├── Real-time status updates
    └── Delivery confirmation details
```

### Enhanced Order Tracking System

#### 1. Real-time Order Tracking:

**Tracking Information Display:**
```
Comprehensive Tracking Features:
├── Order Status Timeline:
│   ├── Visual progress bar dengan milestones
│   ├── Status checkpoints dengan timestamps
│   ├── Current status highlighting
│   ├── Estimated completion times
│   └── Status change notifications
├── Shipping Information:
│   ├── Courier service name dan logo
│   ├── Tracking number dengan copy function
│   ├── Direct link ke website kurir
│   ├── Last known package location
│   └── Estimated delivery date/time
├── Tracking Actions:
│   ├── "Track Package" button ke external site
│   ├── Refresh tracking status
│   ├── Report delivery issues
│   ├── Contact customer service about order
│   └── Request delivery reschedule (coming soon)
└── Delivery Information:
    ├── Delivery address confirmation
    ├── Recipient information
    ├── Special delivery instructions
    ├── Proof of delivery (photo, signature)
    └── Delivery feedback form
```

#### 2. Supported Courier Services:

**Indonesia Major Couriers:**
```
Integrated Courier Tracking:
├── JNE (Jalur Nugraha Ekakurir):
│   ├── Direct link: jne.co.id tracking
│   ├── Real-time status updates
│   ├── Delivery estimation
│   └── Branch location finder
├── POS Indonesia:
│   ├── Direct link: posindonesia.co.id
│   ├── Government postal service
│   ├── Wide coverage area
│   └── Affordable shipping rates
├── TIKI (Titipan Kilat):
│   ├── Direct link: tiki.id tracking
│   ├── Express delivery options
│   ├── Same-day delivery (Jakarta area)
│   └── Package insurance included
├── SiCepat Express:
│   ├── Direct link: sicepat.com
│   ├── Fast delivery guarantee
│   ├── Real-time GPS tracking
│   └── Mobile app integration
├── Anteraja:
│   ├── Direct link: anteraja.com
│   ├── Competitive pricing
│   ├── Wide Indonesia coverage
│   └── Quality service guarantee
└── J&T Express:
    ├── Direct link: jet.co.id
    ├── International shipping
    ├── COD (Cash on Delivery) support
    ├── Flexible pickup/delivery
    └── Mobile tracking app
```

#### 3. Tracking Features:

**Real-time Updates:**
- **Status Notifications**: Email/SMS saat status berubah
- **Delivery Alerts**: Notifikasi saat package akan diantar
- **Issue Reporting**: Report masalah delivery langsung dari dashboard
- **Communication**: Chat dengan customer service tentang specific order

**Mobile-Optimized Tracking:**
- **Responsive Design**: Perfect untuk mobile tracking on-the-go
- **Quick Actions**: Call courier, report issues, contact store
- **GPS Integration**: Get directions ke pickup point (coming soon)
- **Camera Integration**: Upload delivery photos untuk verification

## Live Chat Support

### Floating Chat Widget:

#### 1. Chat Features:
```
Live Chat Capabilities:
├── Widget Access:
│   ├── Floating chat bubble (bottom right)
│   ├── Always visible pada semua pages
│   ├── Online/offline status indicator
│   ├── Unread message counter
│   └── Minimizable chat window
├── Chat Functionality:
│   ├── Real-time messaging dengan WebSocket
│   ├── Message read receipts
│   ├── Typing indicators
│   ├── File attachment support (images)
│   ├── Quick emoji reactions
│   └── Chat history persistence
├── Customer Context:
│   ├── Auto-fill customer info (jika login)
│   ├── Current page context sharing
│   ├── Order history access dalam chat
│   ├── Product inquiry dengan product links
│   └── Previous conversation history
└── Support Features:
    ├── Queue position indicator (jika busy)
    ├── Average response time display
    ├── Agent information (name, role)
    ├── Satisfaction rating after chat
    └── Email transcript option
```

#### 2. Chat Use Cases:
- **Product Inquiries**: Pertanyaan tentang spesifikasi, availability
- **Order Support**: Status updates, tracking issues, payment problems
- **Technical Help**: Website navigation, account issues
- **General Support**: Store policies, shipping info, return procedures
- **Feedback**: Customer satisfaction, suggestions, complaints

## Advanced Features

### Multi-language Support:

#### 1. Language Toggle:
- **Header Toggle**: Flag icons untuk ID/EN switching
- **Auto-detection**: Browser language detection
- **Persistent Choice**: Language preference tersimpan
- **Complete Translation**: UI, product names, descriptions
- **Currency Adjustment**: IDR untuk ID, USD untuk EN

#### 2. Localization Features:
```
Localized Content:
├── User Interface:
│   ├── Menu dan navigation
│   ├── Button labels dan tooltips
│   ├── Error messages dan notifications
│   ├── Form labels dan placeholders
│   └── Help text dan instructions
├── Product Information:
│   ├── Product names (original + translated)
│   ├── Product descriptions
│   ├── Category names
│   ├── Brand information
│   └── Specification terms
├── Order & Payment:
│   ├── Order status dalam bahasa lokal
│   ├── Payment method names
│   ├── Shipping terms
│   ├── Invoice dalam bahasa yang dipilih
│   └── Email notifications
└── Support Content:
    ├── FAQ dalam multiple languages
    ├── Help documentation
    ├── Chat support (admin bilingual)
    ├── Error explanations
    └── Success messages
```

### Mobile Experience:

#### 1. Mobile-First Design:
- **Responsive Layout**: Auto-adjust untuk screen sizes
- **Touch-Optimized**: Large touch targets, swipe gestures
- **Fast Loading**: Optimized images dan assets
- **Offline Capability**: Basic browsing saat connection lemah
- **App-like Experience**: PWA features (coming soon)

#### 2. Mobile-Specific Features:
```
Mobile Enhancements:
├── Navigation:
│   ├── Hamburger menu untuk navigation
│   ├── Sticky header dengan search
│   ├── Back button support
│   ├── Gesture navigation
│   └── Bottom navigation bar (coming soon)
├── Shopping Experience:
│   ├── Swipe gallery untuk product images
│   ├── Quick add to cart gestures
│   ├── Mobile-optimized checkout flow
│   ├── Auto-fill payment information
│   └── Touch-friendly quantity selectors
├── Account Management:
│   ├── Simplified dashboard navigation
│   ├── Thumb-friendly buttons
│   ├── Mobile-optimized forms
│   ├── Camera integration untuk profile pics
│   └── Biometric login support (coming soon)
└── Communication:
    ├── One-tap phone call ke customer service
    ├── WhatsApp integration untuk support
    ├── SMS notifications dengan opt-out
    ├── Push notifications (PWA)
    └── Location-based services (store finder)
```

## Troubleshooting & FAQ

### Common Issues dan Solutions:

#### 1. Account & Login Issues:

**Problem**: Lupa password
**Solution**: 
- Gunakan "Forgot Password" link di login page
- Atau hubungi customer service via live chat
- Provide email address untuk verification

**Problem**: Email sudah terdaftar saat register
**Solution**:
- Coba login dengan email tersebut
- Use "Forgot Password" jika lupa password
- Contact support jika masih ada masalah

**Problem**: Session expired/logout otomatis
**Solution**:
- Normal security feature (24 jam default)
- Check "Remember me" untuk session lebih lama
- Re-login untuk continue shopping

#### 2. Shopping & Payment Issues:

**Problem**: Item out of stock saat checkout
**Solution**:
- Stock reserved for limited time saat di cart
- Remove out-of-stock items atau wait for restock
- Contact admin untuk estimated restock date

**Problem**: Payment failed atau pending
**Solution**:
- Check internet connection dan retry
- Verify payment method details
- Contact bank jika card declined
- Use alternative payment method
- Contact Midtrans support untuk specific issues

**Problem**: Order tidak muncul setelah payment
**Solution**:
- Wait 2-5 minutes untuk payment confirmation
- Check email untuk order confirmation
- Check dashboard "All Orders" tab
- Contact customer service dengan payment reference

#### 3. Tracking & Delivery Issues:

**Problem**: Tracking number tidak bekerja
**Solution**:
- Wait 1-2 hours setelah admin input tracking
- Check tracking number format (copy-paste)
- Try tracking directly di courier website
- Contact customer service untuk verification

**Problem**: Package tidak sampai sesuai estimasi
**Solution**:
- Check tracking untuk last update
- Contact courier directly untuk status
- Report delay via chat atau dashboard
- Customer service will investigate dan provide updates

**Problem**: Wrong delivery address
**Solution**:
- Contact customer service immediately
- Cannot change address setelah shipping
- May require package rerouting (additional cost)
- Prevention: double-check address saat checkout

### Customer Service Contact:

#### 1. Multiple Support Channels:
```
Customer Support Options:
├── Live Chat:
│   ├── Floating widget pada semua pages
│   ├── Real-time support (business hours)
│   ├── Queue system dengan estimated wait time
│   ├── Agent escalation untuk complex issues
│   └── Chat transcript email option
├── Email Support:
│   ├── support@hurtrockstore.com
│   ├── Response time: 24 hours maximum
│   ├── Include order ID untuk faster resolution
│   ├── Attach screenshots untuk technical issues
│   └── Auto-reply dengan ticket number
├── Phone Support:
│   ├── 0821-1555-8035 (WhatsApp ready)
│   ├── Business hours: Mon-Sat 09:30-18:00 WIB
│   ├── Emergency line untuk urgent delivery issues
│   ├── Multi-language support (ID/EN)
│   └── Call recording untuk quality assurance
└── Social Media:
    ├── Facebook: Hurtrock Music Store
    ├── Instagram: @hurtrockstore
    ├── Response time: 2-4 hours
    ├── Public atau private message support
    └── Social proof melalui public interactions
```

#### 2. Support Best Practices:
- **Be Specific**: Include order ID, error messages, screenshots
- **Be Patient**: Response times vary by channel dan time
- **Be Polite**: Our support team is here to help you
- **Follow Up**: If issue not resolved, don't hesitate to follow up
- **Feedback**: Rate your support experience untuk continuous improvement

## Tips untuk Pengalaman Berbelanja Optimal

### 1. Account Management:
- **Keep Information Updated**: Regularly update profile dan shipping address
- **Strong Password**: Use unique, strong password untuk account security
- **Email Verification**: Ensure email notifications tidak masuk spam
- **Regular Check**: Monitor order status regularly untuk updates

### 2. Smart Shopping:
- **Compare Products**: Use comparison features untuk informed decisions
- **Read Reviews**: Check customer reviews dan ratings
- **Stock Alerts**: Sign up untuk restock notifications (coming soon)
- **Wishlist**: Save items untuk future purchase (coming soon)

### 3. Order Management:
- **Double-check Details**: Verify address dan contact info before checkout
- **Track Actively**: Monitor tracking status untuk delivery coordination
- **Communicate Issues**: Report problems early untuk faster resolution
- **Feedback**: Leave reviews untuk help other customers

**Developed by Fajar Julyana**

*User manual terbaru ini menyediakan panduan komprehensif untuk semua fitur Hurtrock Music Store, dengan penekanan khusus pada pengalaman order tracking yang seamless dan customer support yang responsif.*
