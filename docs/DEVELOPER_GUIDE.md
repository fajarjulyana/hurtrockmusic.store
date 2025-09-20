# Developer Guide - Hurtrock Music Store

**Copyright 2024 Fajar Julyana. All rights reserved.**

## Panduan Lengkap untuk Developer

### Overview

Hurtrock Music Store adalah aplikasi e-commerce full-stack yang dibangun dengan teknologi modern untuk menjual alat musik rock vintage dan modern. Aplikasi ini menggunakan React TypeScript untuk frontend, Express.js untuk backend, PostgreSQL sebagai database, dan sistem autentikasi berbasis session dengan role management.

## Arsitektur Aplikasi

### Tech Stack:
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: Session-based dengan Bcrypt
- **Styling**: Tailwind CSS + Shadcn/UI
- **Payment**: Midtrans Payment Gateway
- **State Management**: TanStack Query + React Context
- **Deployment**: Replit Cloud Platform

### Struktur Folder:
```
hurtrock-music-store/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Shadcn/UI components
│   │   │   └── ...         # Custom components
│   │   ├── contexts/       # React contexts (Auth, Localization)
│   │   ├── hooks/          # Custom hooks (useAuth, useToast)
│   │   ├── lib/           # Utilities & helpers
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app component
├── server/                 # Backend Express app
│   ├── auth.ts            # Authentication middleware
│   ├── index.ts           # Main server file
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── vite.ts            # Vite dev server integration
├── shared/                 # Shared schemas & types
│   └── schema.ts          # Drizzle database schema
├── docs/                   # Documentation
└── types/                  # TypeScript definitions
```

## Setup Development Environment

### 1. Prerequisites:
```bash
# Untuk Replit (Recommended)
- Akun Replit aktif
- Browser modern

# Untuk Development Lokal
- Node.js 18+
- PostgreSQL 14+
- Git
```

### 2. ✨ Auto-Configuration Setup

**Sistem ini menggunakan konfigurasi otomatis dan tidak memerlukan setup manual .env file!**

#### **Environment Variables (Auto-Generated):**
```env
# Database - Otomatis tersedia di Replit
DATABASE_URL=postgresql://postgres:password@helium/heliumdb?sslmode=disable

# Session Secret - Auto-generated saat startup
SESSION_SECRET=[auto-generated-secure-string]

# Environment - Auto-detected
NODE_ENV=development|production

# Midtrans Configuration - Disimpan di database (bukan env vars)
# Konfigurasi via Admin Panel setelah startup
```

### 3. **Installation Steps - Zero Config:**

#### **Replit (Recommended - One Command Setup):**
```bash
# Hanya satu perintah - sistem auto-configure semua!
npm run dev

# Sistem akan otomatis:
# 1. Install dependencies
# 2. Setup PostgreSQL database + schema
# 3. Generate secure session secret
# 4. Create default admin account
# 5. Start server di port 5000
```

#### **Development Lokal:**
```bash
# 1. Clone repository
git clone [repository-url]
cd hurtrock-music-store

# 2. Setup environment (minimal)
echo "DATABASE_URL=postgresql://user:password@localhost/hurtrock_db" > .env

# 3. Auto-install dan setup
npm install
npm run db:push    # Setup database schema otomatis
npm run dev        # Auto-create admin & start server
```

### 4. **Verifikasi Auto-Setup:**
```bash
# Cek database tables (12 tables harus ada)
psql -d hurtrock_db -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Cek admin account sudah dibuat
psql -d hurtrock_db -c "SELECT username, email, role FROM users WHERE role = 'admin';"

# Output yang diharapkan:
# username | email              | role
# admin    | admin@hurtrock.com | admin
```

## Database Schema - Auto-Generated Tables

### **Complete Database Schema (12 Tables):**

Sistem otomatis membuat 12 tabel dengan relasi lengkap:

#### **Core Tables:**
```sql
-- 1. Users (Authentication & Roles)
users: id, username, email, password, firstName, lastName, role, isActive, timestamps

-- 2. Categories (Product Organization)  
categories: id, name, description, slug, createdAt

-- 3. Products (Main Catalog)
products: id, name, description, price, originalPrice, categoryId, imageUrl, rating, 
         reviewCount, isNew, isSale, inStock, stockQuantity, timestamps

-- 4. Product Images (Multiple Images per Product)
product_images: id, productId, imageUrl, altText, isPrimary, sortOrder, createdAt
```

#### **E-commerce Tables:**
```sql
-- 5. Cart Items (Session-based Shopping Cart)
cart_items: id, sessionId, productId, quantity, price, timestamps

-- 6. Orders (Purchase Tracking)
orders: id, orderId, sessionId, customerName, customerEmail, customerPhone,
       shippingAddress, totalAmount, paymentStatus, orderStatus, 
       trackingNumber, midtransToken, processedBy, timestamps

-- 7. Order Items (Detailed Order Contents)
order_items: id, orderId, productId, productName, productPrice, quantity, createdAt

-- 8. Contact Submissions (Customer Inquiries)
contact_submissions: id, name, email, subject, message, createdAt
```

#### **Payment & Communication Tables:**
```sql
-- 9. Midtrans Config (Dynamic Payment Configuration)
midtrans_config: id, environment, serverKey, clientKey, merchantId, isActive, timestamps

-- 10. Chat Rooms (Customer Support System)
chat_rooms: id, customerId, customerSessionId, customerName, customerEmail,
           customerPhone, productId, subject, status, priority, assignedTo,
           lastMessageAt, lastMessagePreview, unreadByAdmin, unreadByCustomer, timestamps

-- 11. Chat Messages (Real-time Messaging)
chat_messages: id, chatRoomId, senderId, senderType, senderName, message,
              messageType, attachmentUrl, isRead, isInternal, createdAt

-- 12. Chat Participants (Access Management)
chat_participants: id, chatRoomId, participantType, participantId, 
                  participantSessionId, participantName, lastSeenAt, joinedAt
```

### **Actual Drizzle Schema (shared/schema.ts):**
```typescript
// Implementasi sebenarnya dengan tipe data yang tepat
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("buyer"), // admin, operator, buyer
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const midtransConfig = pgTable("midtrans_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  environment: text("environment").notNull().default("sandbox"),
  serverKey: text("server_key").notNull(),
  clientKey: text("client_key").notNull(),
  merchantId: text("merchant_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Complete schema dengan semua relasi dan constraints
// Lihat shared/schema.ts untuk implementasi lengkap
```

### **Key Features Schema:**
- **UUIDs**: Semua primary keys menggunakan UUID untuk security
- **Role System**: admin, operator, buyer dengan proper permissions
- **Session-based Cart**: Persistent shopping cart tanpa require login
- **Dynamic Payment Config**: Midtrans settings disimpan di DB, bukan env vars
- **Multi-image Products**: Hingga 5 gambar per produk dengan sort order
- **Real-time Chat**: WebSocket-enabled customer support system
- **Order Tracking**: Complete order lifecycle management

## Backend API Development

### **Auto-Initialization Authentication System:**

Sistem authentication menggunakan **scrypt** (Node.js built-in) dan **Passport.js** dengan auto-setup:

#### **Password Security (server/auth.ts):**
```typescript
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Auto-generated secure password hashing
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Timing-safe password comparison
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Auto-create default admin saat startup
async function createDefaultAdminAccount() {
  const adminUser = await storage.getUserByEmail('admin@hurtrock.com');
  if (!adminUser) {
    console.log('Creating default admin account...');
    await storage.createUser({
      email: 'admin@hurtrock.com',
      username: 'admin',
      password: await hashPassword('admin123'),
      firstName: 'Admin',
      lastName: 'Hurtrock',
      role: 'admin',
      isActive: true
    });
    console.log('Default admin account created: admin@hurtrock.com / admin123');
  }
}
```

#### **Passport.js Configuration:**
```typescript
// Auto-configured passport strategy dengan role support
passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: 'Email atau password salah' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
```
```

#### Authentication Middleware:
```typescript
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'customer';
  };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const user = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);

    if (!user[0] || !user[0].isActive) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    req.user = {
      id: user[0].id,
      email: user[0].email,
      role: user[0].role
    };

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Authentication error' });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

### Enhanced API Endpoints:

#### Authentication Endpoints:
```typescript
// POST /api/register - User registration
app.post('/api/register', async (req, res) => {
  const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1)
  });

  try {
    const { email, password, firstName, lastName } = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await db.insert(users).values({
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'customer'
    }).returning();

    // Create session
    req.session.userId = newUser[0].id;

    res.json({
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        firstName: newUser[0].firstName,
        lastName: newUser[0].lastName,
        role: newUser[0].role
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Registration failed' });
  }
});

// POST /api/login - User login
app.post('/api/login', async (req, res) => {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
  });

  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user[0]) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Check if user is active
    if (!user[0].isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Create session
    req.session.userId = user[0].id;

    res.json({
      user: {
        id: user[0].id,
        email: user[0].email,
        firstName: user[0].firstName,
        lastName: user[0].lastName,
        role: user[0].role
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data' });
    }
    res.status(500).json({ message: 'Login failed' });
  }
});
```

## Frontend Development

### Authentication Context:

#### Auth Context (client/src/hooks/useAuth.tsx):
```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'customer';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    setUser(data.user);
  };

  const register = async (registerData: RegisterData) => {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(registerData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    setUser(data.user);
  };

  const logout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### Protected Route Component:
```typescript
// client/src/lib/protected-route.tsx
import { useAuth } from '../hooks/useAuth';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <div>Please login to access this page</div>;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <div>Admin access required</div>;
  }

  return <>{children}</>;
};
```

## Enhanced Security Implementation

### Session Configuration:
```typescript
// server/index.ts
import session from 'express-session';
import pgSession from 'connect-pg-simple';

const pgStore = pgSession(session);

app.use(session({
  store: new pgStore({
    pool: pgPool,
    tableName: 'sessions'
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
}));
```

### Input Validation Schemas:
```typescript
// shared/schemas.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50)
});

export const updateProfileSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50)
});

export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
  stock: z.number().nonnegative().default(0)
});
```

## Enhanced Performance Optimization

### Database Optimization:
```typescript
// Optimized queries with proper indexing
const getProductsWithCategories = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  return await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      categoryName: categories.name,
      imageUrl: products.imageUrl
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(
      gt(products.stock, 0),
      eq(products.isActive, true)
    ))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(products.createdAt));
};
```

### React Performance Optimization:
```typescript
// Memoized components for better performance
import { memo, useMemo } from 'react';

const ProductGrid = memo(({ products, onAddToCart }: ProductGridProps) => {
  const sortedProducts = useMemo(() => {
    return products.sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {sortedProducts.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
});
```

## Testing Strategy

### API Testing:
```typescript
// tests/auth.test.ts
import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../server';

describe('Authentication API', () => {
  test('should register new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User'
    };

    const response = await request(app)
      .post('/api/register')
      .send(userData)
      .expect(200);

    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.role).toBe('customer');
  });

  test('should login with valid credentials', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'Test123!'
    };

    const response = await request(app)
      .post('/api/login')
      .send(loginData)
      .expect(200);

    expect(response.body.user.email).toBe(loginData.email);
  });

  test('should reject invalid credentials', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    await request(app)
      .post('/api/login')
      .send(loginData)
      .expect(401);
  });
});
```

## Deployment Strategy

### Production Checklist:
- Environment variables configured
- Database migrations applied
- Session store configured
- HTTPS enabled
- Security headers configured
- Error logging implemented
- Performance monitoring setup

### Replit Deployment:
```bash
# Build for production
npm run build

# Start production server
npm start
```

**Developed by Fajar Julyana**

*Developer guide ini memberikan roadmap lengkap untuk mengembangkan fitur-fitur advanced dalam Hurtrock Music Store dengan fokus pada keamanan, performa, dan user experience yang optimal.*
