
# 👨‍💻 Developer Guide - Hurtrock Music Store

**Copyright © 2024 Fajar Julyana. All rights reserved.**

## 📖 Panduan Lengkap untuk Developer

### 🎯 Overview

Hurtrock Music Store adalah aplikasi e-commerce full-stack yang dibangun dengan teknologi modern untuk menjual alat musik rock vintage dan modern. Aplikasi ini menggunakan React TypeScript untuk frontend, Express.js untuk backend, dan PostgreSQL sebagai database.

## 🏗️ Arsitektur Aplikasi

### **Tech Stack:**
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS + Shadcn/UI
- **Payment**: Midtrans Payment Gateway
- **Deployment**: Replit Cloud Platform

### **Struktur Folder:**
```
hurtrock-music-store/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/           # Utilities
│   │   └── pages/         # Page components
├── server/                 # Backend Express app
├── shared/                 # Shared schemas & types
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
ADMIN_KEY=your-admin-key

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

# Start development server
npm run dev
```

## 🗄️ Database Schema

### **Tables Structure:**

#### **Products Table:**
```sql
CREATE TABLE products (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category_id VARCHAR REFERENCES categories(id),
  stock INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Categories Table:**
```sql
CREATE TABLE categories (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Cart Items Table:**
```sql
CREATE TABLE cart_items (
  id VARCHAR PRIMARY KEY,
  session_id VARCHAR NOT NULL,
  product_id VARCHAR REFERENCES products(id),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Orders Table:**
```sql
CREATE TABLE orders (
  id VARCHAR PRIMARY KEY,
  session_id VARCHAR NOT NULL,
  total_amount INTEGER NOT NULL,
  status VARCHAR DEFAULT 'pending',
  customer_info JSONB,
  midtrans_order_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Drizzle Schema (shared/schema.ts):**
```typescript
import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  categoryId: text('category_id').references(() => categories.id),
  stock: integer('stock').default(0),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// ... other table definitions
```

## 🔧 Backend API Development

### **Server Structure (server/index.ts):**
```typescript
import express from 'express';
import session from 'express-session';
import { setupRoutes } from './routes';
import { setupVite } from './vite';

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false
}));

// Routes
setupRoutes(app);

// Vite development server
if (process.env.NODE_ENV === 'development') {
  setupVite(app);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### **API Endpoints:**

#### **Product Endpoints:**
```typescript
// GET /api/products - Get all products
app.get('/api/products', async (req, res) => {
  try {
    const allProducts = await db.select().from(products);
    res.json(allProducts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/admin/products - Create product (Admin only)
app.post('/api/admin/products', requireAdmin, async (req, res) => {
  const { name, description, price, categoryId } = req.body;
  
  try {
    const newProduct = await db.insert(products).values({
      id: crypto.randomUUID(),
      name,
      description,
      price,
      categoryId
    }).returning();
    
    res.json(newProduct[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});
```

#### **Payment Integration:**
```typescript
// POST /api/payment/create - Create Midtrans payment token
app.post('/api/payment/create', async (req, res) => {
  const { orderDetails, customerDetails } = req.body;
  
  try {
    const parameter = {
      transaction_details: {
        order_id: `ORDER-${Date.now()}`,
        gross_amount: orderDetails.totalAmount
      },
      customer_details: customerDetails,
      item_details: orderDetails.items
    };
    
    const token = await midtransClient.createTransaction(parameter);
    res.json({ token: token.token });
  } catch (error) {
    res.status(500).json({ error: 'Payment creation failed' });
  }
});
```

### **Admin Authentication:**
```typescript
// Middleware for admin authentication
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-key'];
  
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};
```

## ⚛️ Frontend Development

### **React Component Structure:**

#### **Main App Component:**
```typescript
// client/src/App.tsx
import { Switch, Route } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from './contexts/LocalizationContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}
```

#### **Product Card Component:**
```typescript
// client/src/components/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { formatCurrency } = useLocalization();
  
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader>
        <img 
          src={product.images?.[0] || '/placeholder.jpg'} 
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg"
        />
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-muted-foreground">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          <Button onClick={() => onAddToCart(product.id)}>
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### **State Management dengan TanStack Query:**
```typescript
// client/src/lib/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Get products
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      return response.json();
    }
  });
};

// Add to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string, quantity: number }) => {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};
```

### **Localization Context:**
```typescript
// client/src/contexts/LocalizationContext.tsx
const LocalizationContext = createContext<LocalizationContextType | null>(null);

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  
  const translations = {
    id: {
      shopNow: 'Belanja Sekarang',
      addToCart: 'Tambah ke Keranjang',
      // ... more translations
    },
    en: {
      shopNow: 'Shop Now',
      addToCart: 'Add to Cart',
      // ... more translations
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };
  
  return (
    <LocalizationContext.Provider value={{
      language,
      setLanguage,
      t: translations[language],
      formatCurrency
    }}>
      {children}
    </LocalizationContext.Provider>
  );
};
```

## 🎨 Styling Guidelines

### **Tailwind Configuration:**
```typescript
// tailwind.config.ts
export default {
  darkMode: ['class'],
  content: ['./client/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(25 85% 55%)', // Orange brand color
        background: 'hsl(25 15% 8%)', // Dark charcoal
        foreground: 'hsl(35 8% 92%)', // Light text
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
        rock: ['Rock Salt', 'cursive'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### **Component Styling Patterns:**
```typescript
// Consistent button styling
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
      },
    },
  }
);
```

## 🔐 Security Best Practices

### **Input Validation:**
```typescript
// Using Zod for schema validation
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
  stock: z.number().nonnegative().default(0)
});

// In route handler
app.post('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    // Process validated data...
  } catch (error) {
    return res.status(400).json({ error: 'Invalid input data' });
  }
});
```

### **SQL Injection Prevention:**
```typescript
// Using Drizzle ORM prevents SQL injection
const getProductsByCategory = async (categoryId: string) => {
  return await db
    .select()
    .from(products)
    .where(eq(products.categoryId, categoryId)); // Safe parameterized query
};
```

## 🧪 Testing Strategy

### **Unit Testing Setup:**
```typescript
// Jest configuration
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### **Component Testing:**
```typescript
// Testing React components
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../components/ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Guitar',
    price: 1000000,
    description: 'Electric guitar'
  };
  
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} onAddToCart={jest.fn()} />);
    
    expect(screen.getByText('Guitar')).toBeInTheDocument();
    expect(screen.getByText('Electric guitar')).toBeInTheDocument();
    expect(screen.getByText('Rp 1.000.000')).toBeInTheDocument();
  });
  
  it('calls onAddToCart when button is clicked', () => {
    const mockAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith('1');
  });
});
```

## 📊 Performance Optimization

### **React Optimization:**
```typescript
// Lazy loading components
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Memoization for expensive calculations
const ProductGrid = memo(({ products }: { products: Product[] }) => {
  const sortedProducts = useMemo(() => {
    return products.sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {sortedProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
});
```

### **Database Optimization:**
```typescript
// Efficient queries with Drizzle
const getProductsWithCategories = async () => {
  return await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      categoryName: categories.name
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(gt(products.stock, 0)); // Only in-stock products
};
```

## 🚀 Deployment di Replit

### **Production Configuration:**
```typescript
// server/index.ts - Production setup
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}
```

### **Environment Setup di Replit:**
1. **Database**: Gunakan Replit PostgreSQL
2. **Secrets**: Store environment variables di Replit Secrets
3. **Deployment**: Auto-deploy on git push

### **Build Commands:**
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && npm run build",
    "build:server": "tsc server/index.ts --outDir dist",
    "start": "node dist/server/index.js",
    "dev": "tsx server/index.ts"
  }
}
```

## 🔄 Git Workflow

### **Branch Strategy:**
```bash
main        # Production code
develop     # Development branch
feature/*   # Feature branches
hotfix/*    # Hotfix branches
```

### **Commit Convention:**
```bash
feat: add product search functionality
fix: resolve cart quantity update bug
docs: update API documentation
style: improve mobile responsive design
refactor: optimize database queries
test: add unit tests for payment flow
```

## 📈 Monitoring & Analytics

### **Error Logging:**
```typescript
// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});
```

### **Performance Monitoring:**
```typescript
// Request logging
import morgan from 'morgan';

app.use(morgan('combined', {
  stream: {
    write: (message) => console.log(message.trim())
  }
}));
```

## 🤝 Contributing Guidelines

### **Code Standards:**
1. **TypeScript**: Semua kode harus menggunakan TypeScript
2. **ESLint**: Ikuti aturan ESLint yang sudah dikonfigurasi
3. **Prettier**: Format kode dengan Prettier
4. **Tests**: Tulis tests untuk fitur baru
5. **Documentation**: Update dokumentasi untuk perubahan API

### **Pull Request Process:**
1. Create feature branch dari `develop`
2. Implement feature dengan tests
3. Update dokumentasi jika diperlukan
4. Submit PR ke `develop` branch
5. Code review dan approval
6. Merge ke `develop`

---

**Developed by Fajar Julyana**

*Panduan ini memberikan roadmap lengkap untuk mengembangkan dan memelihara Hurtrock Music Store. Selalu ikuti best practices dan jangan ragu untuk bertanya jika ada yang tidak jelas.*
