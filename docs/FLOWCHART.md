

# System Flowchart - Hurtrock Music Store

**Copyright 2024 Fajar Julyana. All rights reserved.**

## Alur Pengguna (User Flow)

### 1. Alur Autentikasi Pengguna

```mermaid
flowchart TD
    A[Pengguna Mengakses Website] --> B[Halaman Beranda]
    B --> C{Sudah Login?}

    C -->|Ya| D[Dashboard User/Lanjut Belanja]
    C -->|Tidak| E{Pilih Aksi}

    E -->|Register| F[Form Registrasi]
    E -->|Login| G[Form Login]
    E -->|Guest| H[Belanja sebagai Guest]

    F --> I[Input Email, Password, Nama]
    I --> J[Validasi Data dengan Zod]
    J --> K{Valid?}

    K -->|Ya| L[Hash Password dengan Bcrypt]
    K -->|Tidak| M[Tampilkan Error Validasi]

    L --> N[Simpan User ke PostgreSQL]
    N --> O[Buat Session]
    O --> P[Redirect ke Dashboard]

    G --> Q[Input Email & Password]
    Q --> R[Cek Database User]
    R --> S{User Exists?}

    S -->|Ya| T[Verify Password dengan Bcrypt]
    S -->|Tidak| U[User Tidak Ditemukan]

    T --> V{Password Benar?}
    V -->|Ya| O
    V -->|Tidak| W[Password Salah]

    M --> F
    U --> G
    W --> G
    H --> X[Akses Terbatas ke Katalog]

    style A fill:#f97316
    style P fill:#16a34a
    style U fill:#dc2626
    style W fill:#dc2626
```

### 2. Enhanced Search & Filter Flow

```mermaid
flowchart TD
    A[User Akses Pencarian] --> B{Device Type?}

    B -->|Desktop| C[Header Search + Sidebar Filters]
    B -->|Mobile| D[Search Bar + Filter Modal]

    C --> E[Ketik Query di Search Box]
    D --> E

    E --> F[Debounce 300ms]
    F --> G[Real-time API Call]
    G --> H[Database Query dengan Indexing]

    H --> I{Filter Applied?}
    I -->|Ya| J[Advanced Query Builder]
    I -->|Tidak| K[Basic Search Results]

    J --> L{Multiple Filters?}
    L -->|Ya| M[Combined Filter Logic]
    L -->|Tidak| N[Single Filter Apply]

    M --> O[Complex WHERE Clauses]
    N --> O
    K --> O

    O --> P[Sort Results]
    P --> Q{View Mode?}

    Q -->|Grid| R[Grid Layout Render]
    Q -->|List| S[List Layout Render]

    R --> T[Display dengan Hover Effects]
    S --> T

    T --> U{No Results?}
    U -->|Ya| V[Suggest Alternatives]
    U -->|Tidak| W[Show Results dengan Pagination]

    V --> X[Random Recommendations]
    W --> Y[Responsive Grid/List]

    style A fill:#f97316
    style W fill:#16a34a
    style V fill:#f59e0b
```

### 3. Real-time Chat System Flow

```mermaid
flowchart TD
    A[User Klik Chat Widget] --> B{User Status?}

    B -->|Logged In| C[Auto-fill User Data]
    B -->|Guest| D[Input Name & Email]

    C --> E[Create Chat Room]
    D --> E

    E --> F[WebSocket Connection]
    F --> G[Join Room dengan Room ID]

    G --> H{Connection Status?}
    H -->|Connected| I[Show Connected Indicator]
    H -->|Failed| J[Show Offline Mode]

    I --> K[Chat Interface Active]
    J --> L[Email Fallback Option]

    K --> M[User Types Message]
    M --> N[Send Message via WebSocket]
    N --> O[Save to Database]

    O --> P[Broadcast to Admin Panel]
    P --> Q[Admin Receives Notification]

    Q --> R[Admin Responds]
    R --> S[Admin Message via WebSocket]
    S --> T[User Receives Real-time]

    T --> U{Continue Chat?}
    U -->|Ya| M
    U -->|Tidak| V[End Chat Session]

    V --> W[Save Chat History]
    W --> X[Optional Rating]

    style A fill:#f97316
    style I fill:#16a34a
    style J fill:#dc2626
    style P fill:#8b5cf6
```

### 4. Enhanced Order Management Flow dengan Tracking

```mermaid
flowchart TD
    %% Admin Access
    A[Admin Akses /admin] --> B{Authentication?}
    B -->|Valid| C[Admin Dashboard]
    B -->|Invalid| D[Login Required]

    %% Admin Dashboard Actions
    C --> E{Admin Action?}
    E -->|Products| F[Product Management]
    E -->|Categories| G[Category Management]
    E -->|Orders| H[Order Management]
    E -->|Chat| I[Chat Management]
    E -->|Users| J[User Management]
    E -->|Analytics| K[Analytics Dashboard]

    %% Order Management dengan Tracking
    H --> R{Order Action?}
    R -->|View| S[Order Details]
    R -->|Update Status| T[Status Update]
    R -->|Print Label| U[Generate PDF Label]
    R -->|Input Resi| V[Tracking Number Input]

    S --> V1[Order Items Breakdown]
    T --> W[Notify Customer]
    U --> X[Download PDF]

    %% New: Tracking Number Input Flow
    V --> V2[Input Tracking Form]
    V2 --> V3[Select Shipping Service]
    V3 --> V4{Valid Tracking Number?}
    V4 -->|Ya| V5[Update Order dengan Resi]
    V4 -->|Tidak| V6[Show Validation Error]

    V5 --> V7[Auto-update Status ke 'Shipped']
    V7 --> V8[Generate Tracking URL]
    V8 --> V9[Send Notification ke Customer]
    V9 --> V10[Update Order List]

    V6 --> V2

    %% Tracking URL Generation
    V8 --> V11{Shipping Service?}
    V11 -->|JNE| V12[JNE Tracking URL]
    V11 -->|POS Indonesia| V13[POS Tracking URL]
    V11 -->|TIKI| V14[TIKI Tracking URL]
    V11 -->|SiCepat| V15[SiCepat Tracking URL]
    V11 -->|Lainnya| V16[Google Search URL]

    %% Analytics Dashboard
    K --> KA{Analytics Action?}
    KA -->|Overview| KB[Dashboard Overview]
    KA -->|Filter| KC[Date Range Filter]
    KA -->|Export| KD{Export Type?}
    
    KB --> KE[Revenue & Profit Analysis]
    KE --> KF[Top Selling Products]
    KF --> KG[Monthly Trends Chart]
    
    KC --> KH[Apply Date Filters]
    KH --> KB
    
    KD -->|Orders| KI[Export Laporan Pesanan]
    KD -->|Daily| KJ[Export Transaksi Harian]
    KD -->|Items| KK[Export Detail Item]
    
    KI --> KL[Generate CSV with Indonesian Headers]
    KJ --> KM[Generate Daily Report with Item Breakdown]
    KK --> KN[Generate Item Details with Customer Info]

    %% Node Styling
    style C fill:#16a34a,stroke:#000,stroke-width:1px
    style D fill:#dc2626,stroke:#000,stroke-width:1px
    style X fill:#3b82f6,stroke:#000,stroke-width:1px
    style V7 fill:#16a34a,stroke:#000,stroke-width:1px
    style V9 fill:#8b5cf6,stroke:#000,stroke-width:1px
```

### 5. Customer Order Tracking Flow

```mermaid
flowchart TD
    A[Customer Login] --> B[Dashboard Buyer]
    B --> C[Orders Tab]
    
    C --> D{Filter Orders?}
    D -->|All| E[Show All Orders]
    D -->|Pending| F[Show Pending Orders]
    D -->|Processing| G[Show Processing Orders]
    D -->|Shipped| H[Show Shipped Orders]
    D -->|Delivered| I[Show Delivered Orders]

    E --> J[Order List Display]
    F --> J
    G --> J
    H --> J
    I --> J

    J --> K{Select Order?}
    K -->|Ya| L[Order Details Modal]
    K -->|Tidak| M[Browse Other Orders]

    L --> N{Has Tracking Number?}
    N -->|Ya| O[Show Tracking Information]
    N -->|Tidak| P[Show Status Only]

    O --> Q[Display Shipping Service]
    Q --> R[Display Tracking Number]
    R --> S[Generate Tracking Link]
    S --> T{Click Track Button?}

    T -->|Ya| U[Open Carrier Website]
    T -->|Tidak| V[Stay in Dashboard]

    P --> W[Show Current Status]
    W --> X[Show Estimated Timeline]

    U --> Y[External Tracking Page]
    V --> M
    X --> M

    style A fill:#f97316
    style O fill:#16a34a
    style U fill:#3b82f6
    style Y fill:#8b5cf6
```

### 6. Complete Order Lifecycle Flow

```mermaid
flowchart TD
    A[Customer Places Order] --> B[Order Created - Pending]
    B --> C[Payment Gateway]
    C --> D{Payment Success?}

    D -->|Ya| E[Order Status: Processing]
    D -->|Tidak| F[Order Status: Cancelled]

    E --> G[Admin Receives Order]
    G --> H[Admin Confirms Order]
    H --> I[Prepare Items]

    I --> J[Admin Input Tracking Number]
    J --> K[Select Shipping Service]
    K --> L[Validate Tracking Format]
    L --> M{Valid Format?}

    M -->|Ya| N[Update Order Status: Shipped]
    M -->|Tidak| O[Show Error - Retry Input]

    N --> P[Generate Tracking URL]
    P --> Q[Send Email Notification]
    Q --> R[Customer Receives Tracking Info]

    R --> S[Customer Tracks Package]
    S --> T{Package Delivered?}

    T -->|Ya| U[Admin Update: Delivered]
    T -->|Tidak| V[Continue Tracking]

    U --> W[Order Complete]
    V --> S

    O --> J
    F --> X[Order Cancelled]

    style A fill:#f97316
    style N fill:#16a34a
    style W fill:#16a34a
    style F fill:#dc2626
    style X fill:#dc2626
```

### 7. Enhanced Database Operations Flow dengan Tracking

```mermaid
flowchart TD
    A[API Request] --> B[Input Validation]
    B --> C{Valid Input?}

    C -->|Ya| D[Authentication Check]
    C -->|Tidak| E[Return 400 Error]

    D --> F{Authorized?}
    F -->|Ya| G{Operation Type?}
    F -->|Tidak| H[Return 403 Error]

    %% Different Database Operations
    G -->|Order Tracking Update| I[Tracking Operation]
    G -->|Search/Filter| J[Query Builder]
    G -->|CRUD| K[Database Mutation]
    G -->|File Upload| L[File Processing]

    %% New: Tracking Operations
    I --> M[Validate Tracking Number]
    M --> N[Check Order Status]
    N --> O{Can Update?}
    O -->|Ya| P[Update Order Table]
    O -->|Tidak| Q[Return Status Error]

    P --> R[Generate Tracking URL]
    R --> S[Log Tracking Update]
    S --> T[Return Success Response]

    %% Search & Filter Operations
    J --> U{Search Query?}
    U -->|Ya| V[Full-text Search]
    U -->|Tidak| W[Filter Only]

    V --> X[Relevance Scoring]
    W --> Y[WHERE Clauses]
    X --> Y

    Y --> Z{Complex Filters?}
    Z -->|Ya| AA[JOIN Operations]
    Z -->|Tidak| BB[Simple Query]

    AA --> CC[Index Optimization]
    BB --> CC
    CC --> DD[Results with Pagination]

    %% CRUD Operations
    K --> EE{Operation?}
    EE -->|Create| FF[INSERT Query]
    EE -->|Update| GG[UPDATE Query]
    EE -->|Delete| HH[DELETE with Constraints]

    FF --> II[Transaction Start]
    GG --> II
    HH --> II

    II --> JJ[Execute Query]
    JJ --> KK{Success?}
    KK -->|Ya| LL[Commit Transaction]
    KK -->|Tidak| MM[Rollback Transaction]

    LL --> T
    MM --> NN[Return Error Response]
    DD --> T
    Q --> NN

    style A fill:#f97316
    style T fill:#16a34a
    style E fill:#dc2626
    style H fill:#dc2626
    style NN fill:#dc2626
    style P fill:#8b5cf6
```

## Enhanced System Architecture

### 8. Order Tracking Architecture

```mermaid
flowchart TB
    subgraph "Frontend Layer"
        A1[Buyer Dashboard]
        A2[Admin Panel]
        A3[Order Tracking Components]
        A4[Real-time Status Updates]
    end

    subgraph "API Gateway"
        B1[Order API Endpoints]
        B2[Tracking API Routes]
        B3[Admin Authentication]
        B4[Validation Middleware]
    end

    subgraph "Database Layer"
        C1[Orders Table]
        C2[Order Items Table]
        C3[Tracking Updates Log]
        C4[Real-time Queries]
    end

    subgraph "External Services"
        D1[JNE Tracking API]
        D2[POS Indonesia API]
        D3[TIKI Tracking API]
        D4[SiCepat API]
        D5[Other Carriers]
    end

    subgraph "Notification System"
        E1[Email Notifications]
        E2[SMS Notifications]
        E3[In-app Notifications]
        E4[Admin Alerts]
    end

    A1 <--> B1
    A2 <--> B2
    A3 <--> B1
    A4 <--> B2

    B1 <--> C1
    B2 <--> C2
    B3 <--> C3
    B4 <--> B1

    C1 <--> D1
    C2 <--> D2
    C3 <--> D3
    C4 <--> D4

    B2 --> E1
    C1 --> E2
    C2 --> E3
    C3 --> E4

    style A3 fill:#3b82f6
    style B2 fill:#16a34a
    style C3 fill:#f59e0b
    style E1 fill:#8b5cf6
```

### 9. Enhanced Database Schema dengan Tracking

```mermaid
erDiagram
    USERS {
        VARCHAR id PK "gen_random_uuid()"
        TEXT email UK "Unique email"
        TEXT password "Bcrypt hashed password"
        TEXT first_name "User first name"
        TEXT last_name "User last name"
        TEXT role "admin|buyer|operator"
        BOOLEAN is_active "Account status"
        TIMESTAMP created_at "Registration date"
        TIMESTAMP updated_at "Last profile update"
    }

    CATEGORIES {
        VARCHAR id PK "gen_random_uuid()"
        TEXT name "Category name"
        TEXT description "Category description"
        TEXT slug UK "SEO-friendly URL slug"
        BOOLEAN is_active "Category status"
        TIMESTAMP created_at "Creation date"
        TIMESTAMP updated_at "Last update"
    }

    PRODUCTS {
        VARCHAR id PK "gen_random_uuid()"
        TEXT name "Product name - indexed for search"
        TEXT description "Product description - full-text indexed"
        DECIMAL price "Current price (10,2)"
        DECIMAL original_price "Original price (10,2)"
        VARCHAR category_id FK "References categories.id"
        TEXT image_url "Primary image URL"
        INTEGER stock_quantity "Available quantity"
        BOOLEAN is_new "New arrival flag"
        BOOLEAN is_sale "Sale item flag"
        BOOLEAN in_stock "Stock availability"
        TIMESTAMP created_at "Creation date"
        TIMESTAMP updated_at "Last update"
    }

    ORDERS {
        VARCHAR id PK "gen_random_uuid()"
        TEXT order_id UK "Unique order identifier"
        TEXT session_id "Browser session ID"
        TEXT customer_name "Customer name"
        TEXT customer_email "Customer email"
        TEXT customer_phone "Customer phone"
        TEXT shipping_address "Delivery address"
        DECIMAL total_amount "Order total (10,2)"
        TEXT payment_status "pending|paid|failed"
        TEXT order_status "pending|processing|shipped|delivered|cancelled"
        TEXT tracking_number "Shipping tracking number"
        TEXT shipping_service "Courier service name"
        TEXT midtrans_token "Payment token"
        VARCHAR processed_by FK "References users.id"
        TIMESTAMP created_at "Order date"
        TIMESTAMP updated_at "Last status update"
    }

    ORDER_ITEMS {
        VARCHAR id PK "gen_random_uuid()"
        VARCHAR order_id FK "References orders.id"
        VARCHAR product_id FK "References products.id"
        TEXT product_name "Product name snapshot"
        DECIMAL product_price "Price at time of order"
        INTEGER quantity "Ordered quantity"
        TIMESTAMP created_at "Item added date"
    }

    TRACKING_UPDATES {
        VARCHAR id PK "gen_random_uuid()"
        VARCHAR order_id FK "References orders.id"
        TEXT old_status "Previous order status"
        TEXT new_status "Updated order status"
        TEXT tracking_number "Tracking number if added"
        TEXT shipping_service "Shipping service if updated"
        TEXT notes "Optional update notes"
        VARCHAR updated_by FK "References users.id"
        TIMESTAMP created_at "Update timestamp"
    }

    CHAT_ROOMS {
        VARCHAR id PK "gen_random_uuid()"
        VARCHAR user_id FK "References users.id (optional)"
        TEXT session_id "Browser session ID"
        TEXT customer_name "Customer name"
        TEXT customer_email "Customer email"
        TEXT subject "Chat subject"
        TEXT status "active|closed|archived"
        BOOLEAN admin_joined "Admin participation status"
        TIMESTAMP last_message_at "Last message timestamp"
        TIMESTAMP created_at "Creation date"
        TIMESTAMP updated_at "Last update"
    }

    CHAT_MESSAGES {
        VARCHAR id PK "gen_random_uuid()"
        VARCHAR room_id FK "References chat_rooms.id"
        TEXT sender_name "Message sender name"
        TEXT sender_type "customer|admin"
        TEXT message "Message content"
        BOOLEAN is_read "Message read status"
        TIMESTAMP created_at "Message timestamp"
    }

    %% Relationships
    USERS ||--o{ ORDERS : "processes (admin)"
    CATEGORIES ||--o{ PRODUCTS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered as"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    ORDERS ||--o{ TRACKING_UPDATES : "has updates"
    USERS ||--o{ TRACKING_UPDATES : "updates (admin)"
    USERS ||--o{ CHAT_ROOMS : "initiates"
    CHAT_ROOMS ||--o{ CHAT_MESSAGES : "contains"
```

### 10. Enhanced Performance Optimization Flow

```mermaid
flowchart TD
    A[User Request] --> B[CDN Check]
    B --> C{Cached?}
    
    C -->|Hit| D[Serve from CDN]
    C -->|Miss| E[Forward to Server]
    
    E --> F[Database Query]
    F --> G{Query Type?}
    
    G -->|Tracking| H[Order Tracking Query]
    G -->|Search| I[Index Utilization]
    G -->|Simple| J[Direct Query]
    
    H --> K[Join Orders + Tracking Updates]
    I --> L[Full-text Search Engine]
    J --> M[Database Cache]
    
    K --> N[Generate Tracking URL]
    L --> O[Result Aggregation]
    M --> O
    
    N --> P[Response Formatting]
    O --> P
    
    P --> Q[Send to Client]
    Q --> R[Client-side Caching]
    
    R --> S[React State Update]
    S --> T[UI Re-render]
    
    T --> U[User Sees Results]
    
    %% Optimization Branches
    H --> V[Analytics Tracking]
    I --> W[Search Optimization]
    V --> X[Performance Monitoring]
    W --> X

    style D fill:#16a34a
    style N fill:#3b82f6
    style U fill:#16a34a
    style X fill:#8b5cf6
```

## Complete User Journey Flows

### 11. End-to-End Shopping Flow dengan Tracking

```mermaid
flowchart TD
    A[User Visit Website] --> B[Browse/Search Products]
    
    B --> C{Search Method?}
    C -->|Search Bar| D[Type Query]
    C -->|Category Browse| E[Select Category]
    C -->|Filter| F[Apply Filters]
    
    D --> G[Search Results]
    E --> G
    F --> G
    
    G --> H[View Product Details]
    H --> I{Purchase Decision?}
    
    I -->|Add to Cart| J[Add to Cart]
    I -->|Need Help| K[Start Live Chat]
    I -->|Compare| L[Compare Products]
    
    K --> M[Chat with Support]
    M --> N{Issue Resolved?}
    N -->|Yes| J
    N -->|No| O[Escalate to Email]
    
    L --> P[Side-by-side Comparison]
    P --> J
    
    J --> Q[Review Cart]
    Q --> R{Logged In?}
    
    R -->|Yes| S[Express Checkout]
    R -->|No| T[Guest Checkout/Login]
    
    S --> U[Payment Process]
    T --> U
    
    U --> V[Order Confirmation]
    V --> W[Buyer Dashboard]
    
    W --> X[Order Tracking Tab]
    X --> Y{Order Status?}
    
    Y -->|Processing| Z[Wait for Admin Update]
    Y -->|Shipped| AA[View Tracking Info]
    Y -->|Delivered| BB[Order Complete]
    
    AA --> CC{Has Tracking Number?}
    CC -->|Yes| DD[Click Track Button]
    CC -->|No| EE[Contact Support]
    
    DD --> FF[Open Carrier Website]
    FF --> GG[Real-time Tracking Info]
    
    Z --> X
    EE --> K
    GG --> BB
    BB --> HH[Rate & Review]
    
    style A fill:#f97316
    style BB fill:#16a34a
    style HH fill:#8b5cf6
    style AA fill:#3b82f6
```

### 12. Admin Workflow untuk Complete Order Management

```mermaid
flowchart TD
    A[Admin Login] --> B[Dashboard Overview]
    
    B --> C[Orders Management Tab]
    C --> D{Filter Orders?}
    
    D -->|Status| E[Filter by Status]
    D -->|Date| F[Filter by Date Range]
    D -->|Customer| G[Search by Customer]
    D -->|All| H[Show All Orders]
    
    E --> I[Filtered Order List]
    F --> I
    G --> I
    H --> I
    
    I --> J{Select Order Action}
    
    J -->|View Details| K[Order Details Modal]
    J -->|Update Status| L[Status Update Dropdown]
    J -->|Print Label| M[Generate PDF Label]
    J -->|Input Resi| N[Tracking Input Modal]
    J -->|Contact Customer| O[Open Chat Room]
    
    %% New: Tracking Input Flow
    N --> P[Input Tracking Form]
    P --> Q[Enter Tracking Number]
    Q --> R[Select Shipping Service]
    R --> S{Valid Input?}
    
    S -->|Yes| T[Update Order Status to Shipped]
    S -->|No| U[Show Validation Error]
    
    T --> V[Generate Tracking URL]
    V --> W[Send Customer Notification]
    W --> X[Log Admin Action]
    X --> Y[Refresh Order List]
    
    U --> P
    
    %% Other Order Actions
    K --> Z[Order Items Breakdown]
    Z --> AA[Payment Information]
    AA --> BB[Customer Details]
    
    L --> CC[Status Update Notification]
    CC --> DD[Email Customer]
    DD --> EE[Update Dashboard]
    
    M --> FF[Fetch Order Items API]
    FF --> GG{Items Found?}
    GG -->|Yes| HH[Generate jsPDF]
    GG -->|No| II[Error Message]
    
    HH --> JJ[Download PDF Label]
    II --> KK[Show Error to Admin]
    
    O --> LL[Real-time Chat Interface]
    LL --> MM[WebSocket Connection]
    MM --> NN[Send Messages to Customer]
    
    style A fill:#f97316
    style T fill:#16a34a
    style JJ fill:#16a34a
    style II fill:#dc2626
    style NN fill:#8b5cf6
    style V fill:#3b82f6
```

**Key Enhancements dalam Flowchart Terbaru:**

### Fitur Order Tracking System:
1. **Manual Tracking Input**: Admin dapat input nomor resi dengan dropdown jasa pengiriman
2. **Auto Status Update**: Status otomatis berubah ke "shipped" saat resi diinput
3. **Tracking URL Generation**: Auto-generate link tracking ke website kurir
4. **Customer Notifications**: Email/SMS notification saat tracking diupdate
5. **Real-time Updates**: Buyer dashboard menampilkan tracking info real-time

### Enhanced Order Management:
1. **Complete Order Lifecycle**: From pending hingga delivered dengan tracking
2. **Multi-Carrier Support**: JNE, POS Indonesia, TIKI, SiCepat, Anteraja, J&T
3. **Validation System**: Format tracking number validation per carrier
4. **Admin Action Logging**: Audit trail untuk semua perubahan order
5. **Customer Communication**: Integrated chat dan notification system

### Database Architecture Improvements:
1. **Tracking Updates Table**: Log semua perubahan status dengan timestamp
2. **Enhanced Orders Table**: Tambah shipping_service dan tracking_number fields
3. **Performance Optimization**: Indexed queries untuk tracking lookups
4. **Real-time Capabilities**: WebSocket support untuk instant updates

### Security & Performance:
1. **Admin Authentication**: Role-based access untuk order management
2. **Input Validation**: Comprehensive validation untuk tracking data
3. **Rate Limiting**: API protection untuk tracking updates
4. **Caching Strategy**: Optimize frequent tracking queries

### Customer Experience:
1. **Buyer Dashboard**: Dedicated tracking tab dengan real-time status
2. **External Tracking Links**: Direct links ke website kurir
3. **Status Notifications**: Email/SMS untuk setiap perubahan status
4. **Mobile-Friendly**: Responsive tracking interface untuk semua device

**Developed by Fajar Julyana**

*Flowchart terbaru ini mencerminkan evolusi sistem menjadi platform e-commerce yang fully-featured dengan comprehensive order tracking, real-time communication, dan advanced admin management tools untuk pengalaman berbelanja yang seamless.*

