
# 👨‍💻 Developer Guide - Hurtrock Music Store

**Copyright © 2024 Fajar Julyana. All rights reserved.**

## 📖 Panduan Lengkap untuk Developer

### 🎯 Overview

Hurtrock Music Store adalah aplikasi e-commerce full-stack yang dibangun dengan teknologi modern untuk menjual alat musik rock vintage dan modern. Aplikasi ini menggunakan React TypeScript untuk frontend, Express.js untuk backend, PostgreSQL sebagai database, dan sistem autentikasi berbasis session dengan role management.

## 🏗️ Arsitektur Aplikasi

### **Tech Stack:**
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: Session-based dengan Bcrypt
- **Styling**: Tailwind CSS + Shadcn/UI
- **Payment**: Midtrans Payment Gateway
- **State Management**: TanStack Query + React Context
- **Deployment**: Replit Cloud Platform

### **Struktur Folder:**
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

## 🚀 Setup Development Environment

### **1. Prerequisites:**
```bash
# Required tools
Node.js 18+
PostgreSQL 14+
Git
```

### **2. Environment Variables:**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost/hurtrock_db

# Midtrans
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key

# Security
SESSION_SECRET=your-session-secret

# Environment
NODE_ENV=development
```

### **3. Installation Steps:**
```bash
# Clone repository
git clone [repository-url]
cd hurtrock-music-store

# Install dependencies
npm install

# Setup database
npm run db:push

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

## 🗄️ Database Schema

### **Enhanced Schema dengan Authentication:**

#### **Users Table:**
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL, -- Bcrypt hashed
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Sessions Table:**
```sql
CREATE TABLE sessions (
  session_id VARCHAR PRIMARY KEY,
  session_data TEXT NOT NULL,
  user_id VARCHAR REFERENCES users(id),
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Drizzle Schema (shared/schema.ts):**
```typescript
import { pgTable, text, integer, boolean, timestamp, decimal, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role').default('customer').$type<'admin' | 'customer'>(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const sessions = pgTable('sessions', {
  sessionId: text('session_id').primaryKey(),
  sessionData: text('session_data').notNull(),
  userId: text('user_id').references(() => users.id),
  expires: timestamp('expires').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const products = pgTable('products', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  categoryId: text('category_id').references(() => categories.id),
  stock: integer('stock').default(0),
  isFeatured: boolean('is_featured').default(false),
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// ... other table definitions with user relations
```

## 🔧 Backend API Development

### **Authentication System:**

#### **Password Hashing (server/auth.ts):**
```typescript
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

#### **Authentication Middleware:**
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

### **Enhanced API Endpoints:**

#### **Authentication Endpoints:**
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

// POST /api/logout - User logout
app.post('/api/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// GET /api/user - Get current user
app.get('/api/user', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});
```

#### **Protected User Endpoints:**
```typescript
// GET /api/profile - Get user profile
app.get('/api/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, req.user!.id)).limit(1);

    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// PUT /api/profile - Update user profile
app.put('/api/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  const updateProfileSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email()
  });

  try {
    const { firstName, lastName, email } = updateProfileSchema.parse(req.body);

    // Check if email is already taken by another user
    if (email !== req.user!.email) {
      const existingUser = await db.select().from(users).where(eq(users.email, email));
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    const updatedUser = await db.update(users)
      .set({
        firstName,
        lastName,
        email,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.user!.id))
      .returning();

    res.json({
      user: {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        firstName: updatedUser[0].firstName,
        lastName: updatedUser[0].lastName,
        role: updatedUser[0].role
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Profile update failed' });
  }
});

// GET /api/orders - Get user orders
app.get('/api/orders', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userOrders = await db.select()
      .from(orders)
      .where(eq(orders.userId, req.user!.id))
      .orderBy(desc(orders.createdAt));

    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});
```

#### **Enhanced Admin Endpoints:**
```typescript
// GET /api/admin/dashboard - Admin dashboard statistics
app.get('/api/admin/dashboard', requireAuth, requireAdmin, async (req, res) => {
  try {
    const stats = await Promise.all([
      // Total products
      db.select({ count: sql<number>`count(*)` }).from(products),
      // Total orders
      db.select({ count: sql<number>`count(*)` }).from(orders),
      // Total customers
      db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'customer')),
      // Total revenue
      db.select({ 
        total: sql<number>`coalesce(sum(total_amount), 0)` 
      }).from(orders).where(eq(orders.paymentStatus, 'paid'))
    ]);

    res.json({
      totalProducts: stats[0][0].count,
      totalOrders: stats[1][0].count,
      totalCustomers: stats[2][0].count,
      totalRevenue: stats[3][0].total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/admin/users - Get all users
app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt
    }).from(users);

    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// PUT /api/admin/users/:id - Update user role/status
app.put('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  const updateUserSchema = z.object({
    role: z.enum(['admin', 'customer']).optional(),
    isActive: z.boolean().optional()
  });

  try {
    const { role, isActive } = updateUserSchema.parse(req.body);
    const userId = req.params.id;

    const updateData: any = { updatedAt: new Date() };
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data' });
    }
    res.status(500).json({ message: 'User update failed' });
  }
});
```

## ⚛️ Frontend Development

### **Authentication Context:**

#### **Auth Context (client/src/hooks/useAuth.tsx):**
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

#### **Protected Route Component:**
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

### **Enhanced State Management:**

#### **Auth-aware API Queries:**
```typescript
// client/src/lib/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';

// User profile query
export const useUserProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/profile', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    enabled: !!user
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (profileData: UpdateProfileData) => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    }
  });
};

// User orders query
export const useUserOrders = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/orders', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: !!user
  });
};

// Admin dashboard query
export const useAdminDashboard = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      return response.json();
    },
    enabled: user?.role === 'admin'
  });
};
```

## 🎨 Enhanced UI Components

### **Authentication Pages:**

#### **Login/Register Page:**
```typescript
// client/src/pages/auth-page.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Login' : 'Register'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
                <Input
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </>
            )}
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

#### **Enhanced Header with Auth:**
```typescript
// client/src/components/Header.tsx
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { User, LogOut, Settings, ShoppingBag } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Hurtrock Music Store</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  {user.firstName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  My Orders
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline">
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
```

## 🔐 Enhanced Security Implementation

### **Session Configuration:**
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

### **Input Validation Schemas:**
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

## 📊 Enhanced Performance Optimization

### **Database Optimization:**
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

### **React Performance Optimization:**
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

## 🧪 Testing Strategy

### **API Testing:**
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

## 🚀 Deployment Strategy

### **Production Checklist:**
- [x] Environment variables configured
- [x] Database migrations applied
- [x] Session store configured
- [x] HTTPS enabled
- [x] Security headers configured
- [x] Error logging implemented
- [x] Performance monitoring setup

### **Replit Deployment:**
```bash
# Build for production
npm run build

# Start production server
npm start
```

---

**Developed by Fajar Julyana**

*Developer guide ini memberikan roadmap lengkap untuk mengembangkan fitur-fitur advanced dalam Hurtrock Music Store dengan fokus pada keamanan, performa, dan user experience yang optimal.*
