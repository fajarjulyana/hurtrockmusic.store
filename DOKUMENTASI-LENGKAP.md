
# DOKUMENTASI LENGKAP - HURTROCK MUSIC STORE

**Copyright 2024 Fajar Julyana. All rights reserved.**

## DAFTAR ISI

1. [Overview Sistem](#1-overview-sistem)
2. [Arsitektur Aplikasi](#2-arsitektur-aplikasi)
3. [Teknologi dan Framework](#3-teknologi-dan-framework)
4. [Design System dan Style Guide](#4-design-system-dan-style-guide)
5. [Database Schema](#5-database-schema)
6. [API Documentation](#6-api-documentation)
7. [Frontend Components](#7-frontend-components)
8. [Backend Services](#8-backend-services)
9. [Authentication & Security](#9-authentication--security)
10. [Payment Integration](#10-payment-integration)
11. [Chat System](#11-chat-system)
12. [Admin Panel](#12-admin-panel)
13. [User Guide](#13-user-guide)
14. [Developer Guide](#14-developer-guide)
15. [Deployment Guide](#15-deployment-guide)
16. [Maintenance & Support](#16-maintenance--support)

---

## 1. OVERVIEW SISTEM

### 1.1 Deskripsi Aplikasi

Hurtrock Music Store adalah platform e-commerce full-stack yang dikhususkan untuk penjualan alat musik rock vintage dan modern. Aplikasi ini menggabungkan desain dark mode yang menawan dengan tema rock otentik, sistem pembayaran Midtrans yang terintegrasi, dan fitur pencarian canggih untuk memberikan pengalaman berbelanja yang optimal bagi musisi dan penggemar musik rock.

### 1.2 Tujuan dan Sasaran

**Tujuan Utama:**
- Menyediakan platform penjualan alat musik rock yang user-friendly
- Memberikan pengalaman berbelanja yang aman dan nyaman
- Menyediakan sistem manajemen toko yang komprehensif
- Memfasilitasi komunikasi langsung antara penjual dan pembeli

**Target Pengguna:**
- Musisi rock profesional dan pemula
- Kolektor alat musik vintage
- Studio musik dan band
- Penggemar musik rock dan vintage

### 1.3 Fitur Utama

**Untuk Pelanggan:**
- Katalog produk lengkap dengan kategori lengkap
- Sistem pencarian dan filter canggih
- Keranjang belanja berbasis session
- Pembayaran aman melalui Midtrans
- Live chat support
- Multi-bahasa (Indonesia/Inggris)
- Profile dan order management

**Untuk Admin:**
- Dashboard analytics komprehensif
- Manajemen produk dengan upload multiple images
- Manajemen kategori dan inventory
- Order management dengan PDF generation
- Live chat management
- User management dan analytics

---

## 2. ARSITEKTUR APLIKASI

### 2.1 Arsitektur High-Level

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLIENT        │    │     SERVER      │    │    DATABASE     │
│   (React)       │◄──►│   (Express)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ - React 18      │    │ - Node.js       │    │ - Drizzle ORM   │
│ - TypeScript    │    │ - TypeScript    │    │ - Neon DB       │
│ - Tailwind CSS  │    │ - Express.js    │    │ - Session Store │
│ - TanStack      │    │ - WebSocket     │    │ - Full-text     │
│   Query         │    │ - Session Auth  │    │   Search        │
│ - Shadcn/UI     │    │ - Midtrans      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2.2 Struktur Folder

```
hurtrock-music-store/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Page Components
│   │   ├── hooks/          # Custom React Hooks
│   │   ├── contexts/       # React Context Providers
│   │   ├── lib/            # Utility Functions
│   │   └── i18n/           # Internationalization
├── server/                 # Backend Express Server
│   ├── index.ts            # Server Entry Point
│   ├── routes.ts           # API Route Definitions
│   ├── auth.ts             # Authentication Logic
│   ├── db.ts               # Database Connection
│   └── storage.ts          # File Storage Logic
├── shared/                 # Shared Types & Schema
│   └── schema.ts           # Database Schema Definitions
├── docs/                   # Documentation Files
└── types/                  # TypeScript Type Definitions
```

---

## 3. TEKNOLOGI DAN FRAMEWORK

### 3.1 Frontend Stack

**Core Technologies:**
- **React 18.2.0** - Library UI dengan TypeScript support
- **TypeScript 5.0+** - Static type checking untuk development safety
- **Vite 4.4.5** - Build tool dengan HMR dan fast reload
- **Wouter 2.12.1** - Lightweight client-side routing

**UI Framework:**
- **Tailwind CSS 3.3.3** - Utility-first CSS framework
- **Shadcn/UI 0.4.1** - Accessible component library berbasis Radix UI
- **Lucide React 0.263.1** - Icon library dengan 1000+ SVG icons
- **Framer Motion 10.16.4** - Animation library untuk smooth transitions

**State Management:**
- **TanStack Query 4.29.7** - Server state management dengan caching
- **React Context** - Global state untuk user dan cart management
- **React Hook Form 7.45.1** - Form management dengan validation

### 3.2 Backend Stack

**Core Technologies:**
- **Node.js 18+** - JavaScript runtime environment
- **Express.js 4.18.2** - Web framework untuk RESTful API
- **TypeScript 5.0+** - Type safety untuk backend development
- **Drizzle ORM 0.28.5** - Modern ORM dengan type safety

**Database & Storage:**
- **PostgreSQL 15+** - Relational database dengan Neon hosting
- **Drizzle Kit** - Database migration dan schema management
- **Connect PG Simple** - PostgreSQL session store

**Authentication & Security:**
- **Express Session 1.17.3** - Session-based authentication
- **Bcrypt 5.1.0** - Password hashing dengan salt rounds
- **Zod 3.21.4** - Runtime type validation

**Payment Integration:**
- **Midtrans Client 1.3.1** - Payment gateway integration
- **Midtrans Snap** - Hosted payment page solution

### 3.3 Development Tools

**Build & Development:**
- **ESBuild** - Fast JavaScript bundler
- **PostCSS** - CSS processing dengan Autoprefixer
- **TSX** - TypeScript execution environment
- **Nodemon** - Development server dengan auto-reload

**Code Quality:**
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript Compiler** - Type checking

---

## 4. DESIGN SYSTEM DAN STYLE GUIDE

### 4.1 Color Palette

**Primary Colors:**
```css
--primary: 25 85% 55%          /* #F97316 - Orange Brand */
--primary-foreground: 0 0% 98%  /* #FAFAFA - White Text */
```

**Secondary Colors:**
```css
--secondary: 25 85% 45%        /* #EA580C - Darker Orange */
--secondary-foreground: 0 0% 9% /* #171717 - Dark Text */
```

**Background Colors:**
```css
--background: 0 0% 3.9%        /* #0A0A0A - Deep Black */
--foreground: 0 0% 98%         /* #FAFAFA - Light Text */
--card: 0 0% 3.9%              /* #0A0A0A - Card Background */
--card-foreground: 0 0% 98%    /* #FAFAFA - Card Text */
```

**Accent & Muted Colors:**
```css
--accent: 25 75% 50%           /* #F56500 - Orange Accent */
--accent-foreground: 0 0% 9%   /* #171717 - Accent Text */
--muted: 0 0% 14.9%            /* #262626 - Muted Background */
--muted-foreground: 0 0% 63.9% /* #A3A3A3 - Muted Text */
```

**Border & Input Colors:**
```css
--border: 0 0% 14.9%           /* #262626 - Border Color */
--input: 0 0% 14.9%            /* #262626 - Input Background */
--ring: 25 85% 55%             /* #F97316 - Focus Ring */
```

**Status Colors:**
```css
--destructive: 0 84% 60%       /* #EF4444 - Error/Delete */
--destructive-foreground: 0 0% 98% /* #FAFAFA - Error Text */
```

### 4.2 Typography

**Font Families:**
- **Primary**: Inter - Clean, readable sans-serif untuk body text
- **Display**: Bebas Neue - Bold, impactful font untuk headings
- **Monospace**: Fira Code - Untuk code blocks dan technical content

**Font Sizes & Weights:**
```css
/* Headings */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; } /* 36px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; } /* 24px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; } /* 20px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; } /* 18px */

/* Body Text */
.text-base { font-size: 1rem; line-height: 1.5rem; } /* 16px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; } /* 14px */
.text-xs { font-size: 0.75rem; line-height: 1rem; } /* 12px */

/* Font Weights */
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### 4.3 Spacing System

**Padding & Margin Scale:**
```css
.p-1 { padding: 0.25rem; }    /* 4px */
.p-2 { padding: 0.5rem; }     /* 8px */
.p-3 { padding: 0.75rem; }    /* 12px */
.p-4 { padding: 1rem; }       /* 16px */
.p-6 { padding: 1.5rem; }     /* 24px */
.p-8 { padding: 2rem; }       /* 32px */
.p-12 { padding: 3rem; }      /* 48px */
.p-16 { padding: 4rem; }      /* 64px */
```

### 4.4 Component Specifications

**Button Styles:**
```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
  color: #FAFAFA;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #F97316;
  border: 1px solid #F97316;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.btn-secondary:hover {
  background: rgba(249, 115, 22, 0.1);
}
```

**Card Styles:**
```css
.card {
  background: #0A0A0A;
  border: 1px solid #262626;
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: all 0.2s ease-in-out;
}

.card:hover {
  border-color: #F97316;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.1);
}
```

### 4.5 Responsive Breakpoints

```css
/* Mobile First Approach */
/* Mobile: Default (0px+) */
/* Tablet: 768px+ */
@media (min-width: 768px) { ... }

/* Desktop: 1024px+ */
@media (min-width: 1024px) { ... }

/* Large Desktop: 1280px+ */
@media (min-width: 1280px) { ... }

/* XL Desktop: 1536px+ */
@media (min-width: 1536px) { ... }
```

### 4.6 Design Principles

**1. Dark Mode First:**
- Dominasi warna gelap untuk menciptakan suasana venue musik
- Orange sebagai aksen utama untuk kontras yang striking
- Gradasi halus untuk depth dan dimensi

**2. Rock Aesthetic:**
- Typography bold dan impactful
- Imagery yang menampilkan instrumen vintage
- Texture dan effects yang mencerminkan era rock klasik

**3. User Experience:**
- Navigation yang intuitif dan accessible
- Fast loading dengan optimized images
- Responsive design yang seamless di semua device

**4. Brand Consistency:**
- Orange brand color digunakan konsisten
- Logo dan imagery yang koheren
- Voice dan tone yang sesuai dengan target audience

---

## 5. DATABASE SCHEMA

### 5.1 Tables Overview

**Core Tables:**
- `users` - User account information
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Order transactions
- `order_items` - Order line items
- `sessions` - Session storage

**Support Tables:**
- `chat_rooms` - Chat conversation management
- `chat_messages` - Chat message history
- `product_views` - Product view analytics
- `search_logs` - Search query analytics

### 5.2 Detailed Schema

**Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  role VARCHAR(20) DEFAULT 'customer', -- 'customer' | 'admin'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Products Table:**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  image_url VARCHAR(500),
  images JSONB DEFAULT '[]'::jsonb, -- Multiple images
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'inactive'
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  search_vector TSVECTOR, -- Full-text search
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Full-text search index
CREATE INDEX products_search_idx ON products USING GIN(search_vector);
```

**Categories Table:**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Orders Table:**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  total_amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending',
  midtrans_order_id VARCHAR(100),
  midtrans_payment_url TEXT,
  customer_data JSONB, -- Customer information
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Order Items Table:**
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(12,2) NOT NULL, -- Price at time of order
  product_name VARCHAR(255) NOT NULL, -- Snapshot of product name
  created_at TIMESTAMP DEFAULT now()
);
```

### 5.3 Indexes and Performance

**Performance Indexes:**
```sql
-- Product searches
CREATE INDEX products_category_idx ON products(category_id);
CREATE INDEX products_status_idx ON products(status);
CREATE INDEX products_price_idx ON products(price);
CREATE INDEX products_created_idx ON products(created_at);

-- Order management
CREATE INDEX orders_user_idx ON orders(user_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_created_idx ON orders(created_at);

-- Session performance
CREATE INDEX sessions_expire_idx ON sessions(expire);
```

---

## 6. API DOCUMENTATION

### 6.1 Authentication Endpoints

**POST /api/auth/login**
```typescript
// Request
{
  username: string;
  password: string;
}

// Response
{
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  }
}
```

**POST /api/auth/register**
```typescript
// Request
{
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

// Response
{
  success: boolean;
  message: string;
  user?: User;
}
```

**POST /api/auth/logout**
```typescript
// Response
{
  success: boolean;
  message: string;
}
```

### 6.2 Product Endpoints

**GET /api/products**
```typescript
// Query Parameters
{
  category?: string;
  search?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Response
Product[]
```

**GET /api/products/:id**
```typescript
// Response
Product | { message: string }
```

**POST /api/products** (Admin Only)
```typescript
// Request
{
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl?: string;
  images?: string[];
}

// Response
{
  success: boolean;
  message: string;
  product?: Product;
}
```

### 6.3 Cart Endpoints

**GET /api/cart**
```typescript
// Response
CartItem[]

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}
```

**POST /api/cart**
```typescript
// Request
{
  productId: string;
  quantity: number;
}

// Response
{
  success: boolean;
  message: string;
  cart?: CartItem[];
}
```

**DELETE /api/cart/:productId**
```typescript
// Response
{
  success: boolean;
  message: string;
  cart?: CartItem[];
}
```

### 6.4 Order Endpoints

**POST /api/orders**
```typescript
// Request
{
  items: {
    productId: string;
    quantity: number;
  }[];
  customerData: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
}

// Response
{
  success: boolean;
  message: string;
  paymentUrl?: string;
  orderId?: string;
}
```

**GET /api/orders** (Authenticated)
```typescript
// Response
Order[]
```

**GET /api/orders/:id** (Admin/Owner)
```typescript
// Response
Order | { message: string }
```

---

## 7. FRONTEND COMPONENTS

### 7.1 Core Components

**Header Component:**
```typescript
interface HeaderProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// Features:
- Responsive navigation with mobile menu
- Search bar with debounced input
- Category filtering
- Cart indicator with item count
- Language toggle (ID/EN)
- User authentication status
```

**ProductCard Component:**
```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  viewMode: 'grid' | 'list';
}

// Features:
- Multiple image support with carousel
- Price formatting with currency
- Stock status indicator
- Add to cart functionality
- Rating display
- Responsive layout (grid/list)
```

**ShoppingCart Component:**
```typescript
interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

// Features:
- Slide-out cart panel
- Quantity adjustment controls
- Real-time total calculation
- Empty state handling
- Checkout integration
```

### 7.2 Advanced Components

**ProductGrid Component:**
```typescript
interface ProductGridProps {
  products: Product[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onAddToCart: (product: Product) => void;
}

// Features:
- Responsive grid layout (1-4 columns)
- Loading skeleton states
- Empty state with suggestions
- Infinite scroll capability
- Performance optimization with React.memo
```

**MidtransPayment Component:**
```typescript
interface MidtransPaymentProps {
  cartItems: CartItem[];
  onPaymentSuccess: (orderId: string) => void;
  onPaymentError: (error: string) => void;
}

// Features:
- Customer data collection form
- Midtrans Snap integration
- Payment status handling
- Error handling and retry logic
- Order confirmation
```

### 7.3 UI Components (Shadcn/UI)

**Button Variants:**
- Primary: Orange gradient with hover effects
- Secondary: Outline style with orange accent
- Ghost: Transparent with subtle hover
- Destructive: Red for delete/cancel actions

**Form Components:**
- Input: Dark background with orange focus ring
- Textarea: Multi-line input with auto-resize
- Select: Dropdown with search functionality
- Checkbox/Radio: Custom styled with brand colors

**Layout Components:**
- Card: Container with subtle border and hover effects
- Dialog: Modal with backdrop blur
- Sheet: Slide-out panels for mobile
- Tabs: Navigation with active state indicators

---

## 8. BACKEND SERVICES

### 8.1 Server Architecture

**Entry Point (server/index.ts):**
```typescript
// Server setup with middleware
- Express application initialization
- CORS configuration for cross-origin requests
- Session middleware with PostgreSQL store
- JSON body parser with size limits
- Static file serving for uploads
- WebSocket server for real-time chat
- Route mounting and error handling
```

**Route Handler (server/routes.ts):**
```typescript
// API endpoint definitions
- Authentication routes (/api/auth/*)
- Product management (/api/products/*)
- Category management (/api/categories/*)
- Cart operations (/api/cart/*)
- Order processing (/api/orders/*)
- Chat functionality (/api/chat/*)
- File upload handling (/api/upload/*)
```

### 8.2 Authentication Service

**Session Management:**
```typescript
// Configuration
{
  store: new (require('connect-pg-simple')(session))(sessionConfig),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}
```

**Password Security:**
```typescript
// Bcrypt implementation
const saltRounds = 12;

// Hash password during registration
const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, saltRounds);
};

// Verify password during login
const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};
```

### 8.3 Database Service

**Connection Management:**
```typescript
// Drizzle ORM configuration
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const client = neon(process.env.DATABASE_URL!);
export const db = drizzle(client);
```

**Query Optimization:**
```typescript
// Prepared statements for performance
const getProductsByCategory = db
  .select()
  .from(products)
  .where(eq(products.categoryId, placeholder('categoryId')))
  .prepare();

// Full-text search implementation
const searchProducts = db
  .select()
  .from(products)
  .where(
    sql`search_vector @@ to_tsquery('english', ${placeholder('query')})`
  )
  .prepare();
```

### 8.4 Payment Service

**Midtrans Integration:**
```typescript
import { Snap } from 'midtrans-client';

const snap = new Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!
});

// Create payment transaction
const createTransaction = async (orderData: OrderData) => {
  const parameter = {
    transaction_details: {
      order_id: orderData.orderId,
      gross_amount: orderData.totalAmount
    },
    customer_details: orderData.customerData,
    item_details: orderData.items,
    credit_card: {
      secure: true
    }
  };

  return await snap.createTransaction(parameter);
};
```

---

## 9. AUTHENTICATION & SECURITY

### 9.1 Authentication Flow

**User Registration:**
1. Client sends registration data to `/api/auth/register`
2. Server validates input using Zod schema
3. Check for existing username/email
4. Hash password using bcrypt (12 salt rounds)
5. Store user in database
6. Create session and return user data

**User Login:**
1. Client sends credentials to `/api/auth/login`
2. Server validates input format
3. Query user by username/email
4. Compare password with stored hash
5. Create session with user data
6. Return authentication status

**Session Management:**
- Session-based authentication (not JWT)
- PostgreSQL session store for scalability
- 7-day session expiry with rolling refresh
- Secure cookies (httpOnly, secure in production)
- CSRF protection through same-origin policy

### 9.2 Security Measures

**Input Validation:**
```typescript
import { z } from 'zod';

// Product validation schema
const productSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string().uuid()
});
```

**SQL Injection Prevention:**
- Drizzle ORM with prepared statements
- Input sanitization and validation
- Parameterized queries only

**XSS Protection:**
- Content Security Policy headers
- HTML sanitization for user input
- Escape special characters in output

**Authentication Middleware:**
```typescript
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

---

## 10. PAYMENT INTEGRATION

### 10.1 Midtrans Configuration

**Environment Setup:**
```env
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_ENVIRONMENT=sandbox # or production
```

**Client Integration:**
```typescript
// Load Midtrans Snap script
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
  script.setAttribute('data-client-key', process.env.VITE_MIDTRANS_CLIENT_KEY!);
  document.head.appendChild(script);
}, []);
```

### 10.2 Payment Flow

**Order Creation Process:**
1. User fills checkout form with customer data
2. Cart items are validated and prices confirmed
3. Order record is created in database
4. Midtrans transaction is created via API
5. Payment URL/token is returned to client
6. Snap payment popup is displayed

**Payment Completion:**
1. User completes payment in Midtrans popup
2. Midtrans calls webhook (if configured)
3. Client receives success callback
4. Order status is updated to 'paid'
5. Inventory is decremented
6. Cart is cleared
7. Confirmation email is sent (planned)

### 10.3 Supported Payment Methods

**Electronic Wallet:**
- GoPay
- OVO
- DANA
- ShopeePay

**Bank Transfer:**
- BCA Virtual Account
- BRI Virtual Account
- BNI Virtual Account
- Mandiri Virtual Account

**Credit Card:**
- Visa
- Mastercard
- JCB
- AMEX

**Retail Outlets:**
- Indomaret
- Alfamart

---

## 11. CHAT SYSTEM

### 11.1 Real-time Architecture

**WebSocket Implementation:**
```typescript
// Server-side WebSocket setup
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
const clients = new Map<string, WebSocket>();

wss.on('connection', (ws, req) => {
  const roomId = extractRoomId(req.url);
  clients.set(roomId, ws);
  
  ws.on('message', async (data) => {
    const message = JSON.parse(data.toString());
    await saveChatMessage(message);
    broadcastToRoom(roomId, message);
  });
});
```

**Client-side Integration:**
```typescript
// React hook for WebSocket connection
const useChat = (roomId: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080?room=${roomId}`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    setSocket(ws);
    
    return () => ws.close();
  }, [roomId]);

  const sendMessage = (content: string) => {
    if (socket) {
      const message = {
        roomId,
        content,
        timestamp: new Date().toISOString(),
        sender: 'user'
      };
      socket.send(JSON.stringify(message));
    }
  };

  return { messages, sendMessage };
};
```

### 11.2 Chat Features

**Customer Side:**
- Floating chat widget with minimizable interface
- Real-time message delivery and read receipts
- File attachment support (images, documents)
- Chat history persistence
- Typing indicators
- Emoji support

**Admin Side:**
- Centralized chat dashboard in admin panel
- Multiple chat room management
- Customer information display
- Quick response templates
- Chat assignment to different admin users
- Chat analytics and metrics

### 11.3 Database Schema

**Chat Rooms:**
```sql
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id),
  admin_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'closed'
  last_message TEXT,
  last_activity TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);
```

**Chat Messages:**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- 'text' | 'image' | 'file'
  file_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 12. ADMIN PANEL

### 12.1 Dashboard Overview

**Analytics Dashboard:**
- Total sales revenue with period comparison
- Order count and status distribution
- Popular products and categories
- Customer growth metrics
- Real-time notifications for new orders
- Recent activity feed

**Key Performance Indicators:**
```typescript
interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  popularCategories: Array<{
    name: string;
    orderCount: number;
    revenue: number;
  }>;
}
```

### 12.2 Product Management

**Product CRUD Operations:**
- Create new products with multiple image uploads
- Edit existing products with validation
- Bulk product operations (activate/deactivate)
- Stock management with low stock alerts
- Category assignment and management
- SEO optimization fields

**Advanced Features:**
- Product import/export via CSV
- Batch image processing and optimization
- Duplicate product detection
- Product performance analytics
- Related product suggestions
- Inventory tracking with alerts

**Image Management:**
```typescript
// Multiple image upload handling
const handleImageUpload = async (files: FileList) => {
  const uploadPromises = Array.from(files).map(async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/upload/product-image', {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  });
  
  const results = await Promise.all(uploadPromises);
  return results.map(r => r.imageUrl);
};
```

### 12.3 Order Management

**Order Processing Workflow:**
1. New Order Notification
2. Payment Verification
3. Inventory Allocation
4. Pick & Pack Process
5. Shipping Label Generation
6. Tracking Update
7. Delivery Confirmation
8. Customer Feedback Collection

**Order Status Management:**
```typescript
type OrderStatus = 
  | 'pending'     // Awaiting payment
  | 'paid'        // Payment confirmed
  | 'processing'  // Being prepared
  | 'shipped'     // Out for delivery
  | 'delivered'   // Successfully delivered
  | 'cancelled'   // Order cancelled
  | 'refunded';   // Money refunded

const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  await db.update(orders)
    .set({ 
      status, 
      updatedAt: new Date()
    })
    .where(eq(orders.id, orderId));
    
  // Send notification to customer
  await sendOrderStatusNotification(orderId, status);
};
```

**PDF Label Generation:**
```typescript
import jsPDF from 'jspdf';

const generateShippingLabel = (order: Order) => {
  const pdf = new jsPDF();
  
  // Header
  pdf.setFontSize(20);
  pdf.text('HURTROCK MUSIC STORE', 20, 30);
  
  // Order information
  pdf.setFontSize(12);
  pdf.text(`Order #: ${order.orderNumber}`, 20, 50);
  pdf.text(`Date: ${formatDate(order.createdAt)}`, 20, 60);
  
  // Customer information
  pdf.text('Ship To:', 20, 80);
  pdf.text(order.customerData.name, 20, 90);
  pdf.text(order.shippingAddress, 20, 100);
  
  // Items
  pdf.text('Items:', 20, 120);
  order.items.forEach((item, index) => {
    const y = 130 + (index * 10);
    pdf.text(`${item.productName} x ${item.quantity}`, 25, y);
  });
  
  return pdf.output('blob');
};
```

### 12.4 User Management

**Customer Management:**
- View customer profiles and order history
- Customer segmentation and analytics
- Communication history and notes
- Account status management (active/suspended)
- Customer support ticket integration

**Admin User Management:**
- Role-based access control (Super Admin, Admin, Support)
- Permission matrix for different operations
- Admin activity logging and audit trail
- Two-factor authentication setup
- Session management and security

---

## 13. USER GUIDE

### 13.1 Getting Started

**Untuk Pelanggan Baru:**

1. **Akses Website:**
   - Buka browser dan kunjungi website Hurtrock Music Store
   - Website responsive dan optimal di desktop, tablet, maupun mobile

2. **Eksplorasi Produk:**
   - Browse kategori alat musik yang tersedia
   - Gunakan fitur pencarian untuk menemukan produk spesifik
   - Filter berdasarkan harga, rating, dan kategori

3. **Membuat Akun:**
   - Klik tombol "Register" di pojok kanan atas
   - Isi form registrasi dengan data yang valid
   - Verifikasi email (jika fitur ini diaktifkan)
   - Login dengan kredensial yang sudah dibuat

### 13.2 Shopping Experience

**Pencarian dan Filter:**
- **Search Bar**: Ketik nama produk atau kata kunci
- **Category Filter**: Pilih kategori spesifik (Gitar, Bass, Drum, dll)
- **Price Range**: Set rentang harga sesuai budget
- **Sort Options**: Urutkan berdasarkan nama, harga, rating, atau tanggal
- **View Mode**: Pilih tampilan grid atau list

**Product Detail:**
- **Multiple Images**: Lihat produk dari berbagai sudut
- **Detailed Description**: Spesifikasi lengkap dan informasi teknis
- **Stock Status**: Ketersediaan produk real-time
- **Customer Reviews**: Rating dan review dari pembeli lain
- **Related Products**: Rekomendasi produk sejenis

### 13.3 Shopping Cart & Checkout

**Keranjang Belanja:**
- **Add to Cart**: Klik tombol "Add to Cart" pada produk
- **Quantity Adjustment**: Ubah jumlah item di dalam keranjang
- **Remove Items**: Hapus item yang tidak diinginkan
- **Price Calculation**: Total harga otomatis terhitung
- **Session Persistence**: Keranjang tersimpan meski refresh halaman

**Proses Checkout:**
1. **Review Cart**: Pastikan semua item dan jumlah benar
2. **Customer Information**: Isi data lengkap untuk pengiriman
3. **Payment Method**: Pilih metode pembayaran melalui Midtrans
4. **Confirmation**: Review order sekali lagi
5. **Payment**: Selesaikan pembayaran di Midtrans
6. **Order Confirmation**: Terima konfirmasi dan tracking number

### 13.4 Account Management

**Profile Management:**
- **Personal Info**: Update nama, email, nomor telepon
- **Address Book**: Simpan alamat pengiriman favorit
- **Password Change**: Ubah password secara berkala untuk keamanan

**Order History:**
- **Past Orders**: Lihat semua pesanan sebelumnya
- **Order Status**: Track status pengiriman real-time
- **Reorder**: Pesan ulang produk favorit dengan satu klik
- **Order Details**: Download invoice atau receipt

### 13.5 Customer Support

**Live Chat:**
- **Floating Widget**: Widget chat tersedia di pojok kanan bawah
- **Real-time Support**: Chat langsung dengan tim customer service
- **Chat History**: Riwayat percakapan tersimpan untuk referensi
- **File Sharing**: Kirim gambar atau dokumen jika diperlukan

**Kontak Alternatif:**
- **Email**: support@hurtrockstore.com
- **WhatsApp**: +62821-1555-8035
- **Phone**: 0821-1555-8035
- **Jam Support**: Senin-Jumat 09:00-17:00 WIB

---

## 14. DEVELOPER GUIDE

### 14.1 Development Environment Setup

**Prerequisites:**
```bash
# Required software versions
Node.js >= 18.0.0
npm >= 9.0.0
PostgreSQL >= 13.0
Git >= 2.30.0
```

**Project Setup:**
```bash
# 1. Clone repository
git clone <repository-url>
cd hurtrock-music-store

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env
# Edit .env with your configuration

# 4. Database setup
npm run db:push
npm run db:seed  # Optional: populate with sample data

# 5. Start development server
npm run dev
```

**Environment Variables:**
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/hurtrock_db

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_ENVIRONMENT=sandbox

# Application Configuration
NODE_ENV=development
PORT=5000
```

### 14.2 Project Structure Deep Dive

**Frontend Architecture:**
```
client/src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── Header.tsx      # Navigation component
│   ├── ProductCard.tsx # Product display component
│   └── ShoppingCart.tsx # Cart functionality
├── pages/              # Page components
│   ├── admin.tsx       # Admin dashboard
│   ├── auth-page.tsx   # Login/Register
│   └── not-found.tsx   # 404 page
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Authentication logic
│   └── use-toast.ts    # Toast notifications
├── contexts/           # React Context providers
│   └── LocalizationContext.tsx # i18n support
├── lib/                # Utility functions
│   ├── utils.ts        # Helper functions
│   └── queryClient.ts  # TanStack Query setup
└── i18n/               # Internationalization
    └── config.ts       # Language configurations
```

**Backend Architecture:**
```
server/
├── index.ts           # Application entry point
├── routes.ts          # API route definitions  
├── auth.ts           # Authentication middleware
├── db.ts             # Database connection setup
├── storage.ts        # File storage utilities
└── vite.ts           # Vite integration for SSR
```

### 14.3 Development Workflows

**Adding New Features:**
```bash
# 1. Create feature branch
git checkout -b feature/new-feature-name

# 2. Implement changes
# - Add database schema changes if needed
# - Implement backend API endpoints
# - Create/update frontend components
# - Add proper TypeScript types

# 3. Testing
npm run test        # Run unit tests
npm run e2e         # Run end-to-end tests
npm run lint        # Check code quality
npm run type-check  # TypeScript validation

# 4. Commit and push
git add .
git commit -m "feat: add new feature description"
git push origin feature/new-feature-name

# 5. Create pull request
# Review code, run CI/CD pipeline, merge when approved
```

**Database Migrations:**
```bash
# 1. Modify schema in shared/schema.ts
# 2. Generate migration
npm run db:generate

# 3. Review generated migration file
# 4. Apply migration
npm run db:push

# 5. Update seed data if necessary
npm run db:seed
```

### 14.4 Code Standards

**TypeScript Guidelines:**
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` type usage
- Use proper generic types for reusability
- Implement proper error handling

**React Best Practices:**
- Use functional components with hooks
- Implement proper state management
- Optimize re-renders with React.memo
- Use proper dependency arrays in useEffect
- Handle loading and error states

**API Design:**
- Follow RESTful conventions
- Use proper HTTP status codes
- Implement consistent error responses
- Add request/response validation
- Document all endpoints

**Security Guidelines:**
- Validate all user inputs
- Use prepared statements for database queries
- Implement proper authentication checks
- Sanitize data before storage/display
- Use HTTPS in production

### 14.5 Testing Strategy

**Unit Testing:**
```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../components/ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Guitar',
    price: 1000000,
    imageUrl: 'test.jpg'
  };

  it('should display product information', () => {
    render(<ProductCard product={mockProduct} onAddToCart={jest.fn()} />);
    
    expect(screen.getByText('Test Guitar')).toBeInTheDocument();
    expect(screen.getByText('Rp 1,000,000')).toBeInTheDocument();
  });

  it('should call onAddToCart when button is clicked', () => {
    const mockAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });
});
```

**API Testing:**
```typescript
// Example API endpoint test
import request from 'supertest';
import { app } from '../server/index';

describe('Products API', () => {
  it('should return products list', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should create new product with admin auth', async () => {
    const productData = {
      name: 'New Guitar',
      price: 2000000,
      categoryId: 'category-id'
    };

    const response = await request(app)
      .post('/api/products')
      .send(productData)
      .set('Authorization', 'Bearer admin-token')
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.product.name).toBe('New Guitar');
  });
});
```

---

## 15. DEPLOYMENT GUIDE

### 15.1 Production Environment Setup

**Platform Requirements:**
- **Hosting**: Replit (recommended) atau VPS dengan Node.js support
- **Database**: PostgreSQL 13+ (Neon Database recommended)
- **CDN**: CloudFlare untuk static assets (optional)
- **Monitoring**: Uptimerobot untuk uptime monitoring

**Environment Configuration:**
```env
# Production Environment Variables
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database - Production
DATABASE_URL=postgresql://user:pass@prod-db-host:5432/hurtrock_prod

# Session - Production (strong secret)
SESSION_SECRET=super-secure-production-secret-at-least-32-chars

# Midtrans - Production
MIDTRANS_SERVER_KEY=your-production-server-key
MIDTRANS_CLIENT_KEY=your-production-client-key
MIDTRANS_ENVIRONMENT=production

# Security
CORS_ORIGIN=https://yourdomain.com
TRUST_PROXY=true
```

### 15.2 Build and Deployment Process

**Build Process:**
```bash
# 1. Install production dependencies
npm ci --omit=dev

# 2. Build frontend assets
npm run build

# 3. Run database migrations
npm run db:push

# 4. Start production server
npm start
```

**Deployment on Replit:**
```bash
# 1. Configure .replit file
[deployment]
run = "npm start"
deploymentTarget = "cloudrun"

[packager]
language = "nodejs"

[packager.features]
packageSearch = true
guessImports = true

# 2. Set environment variables in Replit Secrets
# 3. Deploy using Replit deployment feature
```

### 15.3 Performance Optimization

**Frontend Optimization:**
- Code splitting dengan React lazy loading
- Image optimization dan lazy loading
- Bundle size analysis dan tree shaking
- Service worker untuk caching (planned)
- CDN untuk static assets

**Backend Optimization:**
- Database query optimization
- Response caching dengan Redis (planned)
- Gzip compression untuk responses
- Connection pooling untuk database
- Rate limiting untuk API endpoints

**Database Optimization:**
```sql
-- Essential indexes for production
CREATE INDEX CONCURRENTLY products_search_gin ON products USING GIN(search_vector);
CREATE INDEX CONCURRENTLY products_category_status ON products(category_id, status);
CREATE INDEX CONCURRENTLY orders_user_created ON orders(user_id, created_at);
CREATE INDEX CONCURRENTLY sessions_expire ON sessions(expire);

-- Query performance monitoring
EXPLAIN ANALYZE SELECT * FROM products WHERE search_vector @@ to_tsquery('guitar');
```

### 15.4 Monitoring and Logging

**Application Monitoring:**
```typescript
// Basic monitoring middleware
const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    
    // Log slow queries (>1000ms)
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};
```

**Error Tracking:**
```typescript
// Global error handler
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service (Sentry, LogRocket, etc.)
  }

  res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

### 15.5 Security Hardening

**Production Security Checklist:**
- [ ] HTTPS certificates installed and configured
- [ ] Security headers implemented (HSTS, CSP, etc.)
- [ ] Rate limiting on all API endpoints
- [ ] SQL injection prevention (using ORM)
- [ ] XSS protection and content sanitization
- [ ] CSRF protection enabled
- [ ] Session security (secure cookies, HttpOnly)
- [ ] Input validation on all endpoints
- [ ] Error handling (no sensitive info in responses)
- [ ] Database connection encryption
- [ ] Regular security updates for dependencies

**Security Headers:**
```typescript
// Security middleware
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://app.sandbox.midtrans.com", "https://app.midtrans.com"]
    }
  }
}));
```

---

## 16. MAINTENANCE & SUPPORT

### 16.1 Regular Maintenance Tasks

**Daily Tasks:**
- Monitor application uptime dan performance
- Check error logs untuk issues
- Verify payment processing
- Monitor disk space dan memory usage
- Backup verification

**Weekly Tasks:**
- Review security logs
- Update dependencies (patch versions)
- Database performance analysis
- Clean up old session data
- Monitor user feedback dan support tickets

**Monthly Tasks:**
- Security audit dan vulnerability assessment
- Database optimization dan reindexing
- Performance benchmarking
- Backup retention policy review
- User analytics dan business metrics review

### 16.2 Backup Strategy

**Database Backup:**
```bash
# Daily automated backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_${DATE}.sql
gzip backup_${DATE}.sql

# Upload to cloud storage (AWS S3, Google Cloud, etc.)
# Keep last 30 days of daily backups
# Keep last 12 months of weekly backups
```

**Application Backup:**
```bash
# Configuration files backup
tar -czf config_backup_$(date +%Y%m%d).tar.gz \
  .env.production \
  package.json \
  package-lock.json \
  tsconfig.json \
  tailwind.config.ts

# User uploads backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

### 16.3 Troubleshooting Guide

**Common Issues dan Solutions:**

**1. Database Connection Issues:**
```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT version();"

# Check connection pool
SELECT count(*) FROM pg_stat_activity WHERE datname = 'your_database';

# Reset connections if needed
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'your_database' AND pid <> pg_backend_pid();
```

**2. High Memory Usage:**
```typescript
// Monitor memory usage
process.on('exit', () => {
  const memUsage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`
  });
});

// Clean up intervals and listeners
setInterval(() => {
  if (global.gc) {
    global.gc();
  }
}, 60000);
```

**3. Slow Query Performance:**
```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Analyze slow queries
SELECT query, mean_time, calls, total_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Optimize with proper indexes
EXPLAIN (ANALYZE, BUFFERS) your_slow_query_here;
```

### 16.4 Support Procedures

**Customer Support Workflow:**

1. **Ticket Classification:**
   - **Priority 1**: Payment issues, site down
   - **Priority 2**: Login problems, order issues
   - **Priority 3**: Feature requests, general inquiries

2. **Response Time SLA:**
   - **Priority 1**: 1 hour response, 4 hour resolution
   - **Priority 2**: 4 hour response, 24 hour resolution
   - **Priority 3**: 24 hour response, 72 hour resolution

3. **Escalation Process:**
   - Level 1: Customer Service Representative
   - Level 2: Technical Support Specialist
   - Level 3: Developer/System Administrator

**Support Tools dan Resources:**
- **Ticketing System**: Freshdesk atau Zendesk integration
- **Knowledge Base**: FAQ dan troubleshooting guides
- **Remote Access**: TeamViewer untuk technical support
- **Monitoring Dashboard**: Real-time system health
- **Communication**: Slack untuk internal coordination

### 16.5 Disaster Recovery Plan

**Recovery Time Objectives:**
- **RTO** (Recovery Time Objective): 4 hours maximum
- **RPO** (Recovery Point Objective): 24 hours maximum data loss

**Disaster Scenarios dan Responses:**

**1. Database Failure:**
```bash
# Immediate response
1. Switch to read-only mode
2. Assess extent of data loss
3. Restore from latest backup
4. Verify data integrity
5. Resume normal operations
6. Post-mortem analysis

# Prevention
- Daily automated backups
- Database replication (master/slave)
- Regular backup restoration testing
```

**2. Server Failure:**
```bash
# Immediate response
1. Activate backup server
2. Update DNS records
3. Restore application from backup
4. Configure environment variables
5. Test critical functionality
6. Monitor performance

# Prevention
- Load balancer with multiple servers
- Automated deployment scripts
- Health checks dan failover
```

**3. Security Breach:**
```bash
# Immediate response
1. Isolate affected systems
2. Change all passwords and secrets
3. Analyze breach extent
4. Notify affected customers
5. Implement additional security measures
6. Monitor for further attacks

# Prevention
- Regular security audits
- Intrusion detection system
- Security awareness training
- Incident response procedures
```

---

## PENUTUP

Dokumentasi ini mencakup semua aspek sistem Hurtrock Music Store, mulai dari arsitektur teknis hingga panduan operasional. Sistem ini dibangun dengan teknologi modern dan best practices untuk memberikan pengalaman terbaik bagi pengguna dan administrator.

**Key Success Factors:**
- **User Experience**: Interface yang intuitif dan responsive
- **Performance**: Optimasi di semua level aplikasi
- **Security**: Implementasi keamanan yang comprehensive
- **Scalability**: Arsitektur yang dapat berkembang
- **Maintainability**: Code yang clean dan well-documented

**Future Enhancements:**
- Progressive Web App (PWA) implementation
- Advanced analytics dan business intelligence
- Machine learning untuk product recommendations
- Mobile app development (React Native)
- Multi-vendor marketplace capability
- Advanced inventory management
- CRM integration
- Marketing automation

**Contact Information:**
- **Developer**: Fajar Julyana
- **Email**: developer@hurtrockstore.com
- **Documentation Version**: 1.0.0
- **Last Updated**: December 2024

**Copyright Notice:**
© 2024 Fajar Julyana. All rights reserved. This documentation and the associated software are proprietary and confidential. Unauthorized reproduction or distribution is prohibited.

---

*"Rock your music journey with the finest instruments from Hurtrock Music Store!"*
