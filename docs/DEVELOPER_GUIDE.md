
# Developer Guide - Hurtrock Music Store

**Copyright 2024 Fajar Julyana. All rights reserved.**

## Panduan Lengkap untuk Developer

### Overview

Hurtrock Music Store adalah aplikasi e-commerce full-stack yang dibangun dengan teknologi modern untuk menjual alat musik rock vintage dan modern. Aplikasi ini menggunakan React TypeScript untuk frontend, Express.js untuk backend, PostgreSQL sebagai database, sistem autentikasi berbasis session dengan role management, dan sistem order tracking terintegrasi.

## Arsitektur Aplikasi

### Tech Stack:
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: Session-based dengan Bcrypt
- **Styling**: Tailwind CSS + Shadcn/UI
- **Payment**: Midtrans Payment Gateway
- **State Management**: TanStack Query + React Context
- **Order Tracking**: Multi-carrier integration dengan URL generation
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
│   │   │   ├── admin.tsx  # Enhanced admin panel
│   │   │   ├── buyer-dashboard.tsx # Customer dashboard dengan tracking
│   │   │   └── ...        # Other pages
│   │   └── App.tsx        # Main app component
├── server/                 # Backend Express app
│   ├── auth.ts            # Authentication middleware
│   ├── index.ts           # Main server file
│   ├── routes.ts          # API routes dengan tracking endpoints
│   ├── storage.ts         # Database operations
│   └── vite.ts            # Vite dev server integration
├── shared/                 # Shared schemas & types
│   └── schema.ts          # Drizzle database schema dengan tracking tables
├── docs/                   # Documentation
│   ├── FLOWCHART.md       # Updated dengan tracking flows
│   ├── ADMIN_GUIDE.md     # Admin guide dengan order tracking
│   └── ...                # Other documentation
└── types/                  # TypeScript definitions
```

## Enhanced Database Schema

### **Complete Database Schema (dengan Tracking):**

Sistem menggunakan 12+ tabel dengan relasi lengkap dan fitur tracking:

#### **Core Tables:**
```sql
-- 1. Users (Authentication & Roles)
users: id, username, email, password, firstName, lastName, role, isActive, timestamps

-- 2. Categories (Product Organization)  
categories: id, name, description, slug, createdAt

-- 3. Products (Main Catalog)
products: id, name, description, price, originalPrice, categoryId, imageUrl, 
         stockQuantity, isNew, isSale, inStock, timestamps

-- 4. Orders (Enhanced dengan Tracking)
orders: id, orderId, sessionId, customerName, customerEmail, customerPhone,
       shippingAddress, totalAmount, paymentStatus, orderStatus, 
       trackingNumber, shippingService, midtransToken, processedBy, timestamps

-- 5. Order Items (Detailed Order Contents)
order_items: id, orderId, productId, productName, productPrice, quantity, createdAt
```

#### **New Tracking Tables:**
```sql
-- 6. Tracking Updates (Order Status History)
tracking_updates: id, orderId, oldStatus, newStatus, trackingNumber, 
                 shippingService, notes, updatedBy, createdAt

-- 7. Shipping Services (Carrier Configuration)
shipping_services: id, name, code, trackingUrlTemplate, isActive, createdAt
```

### **Actual Drizzle Schema (Enhanced):**
```typescript
// Enhanced orders table dengan tracking fields
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: text("order_id").unique().notNull(),
  sessionId: text("session_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  orderStatus: text("order_status").notNull().default("pending"),
  trackingNumber: text("tracking_number"), // New field
  shippingService: text("shipping_service"), // New field
  midtransToken: text("midtrans_token"),
  processedBy: varchar("processed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New: Tracking updates table
export const trackingUpdates = pgTable("tracking_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  oldStatus: text("old_status"),
  newStatus: text("new_status").notNull(),
  trackingNumber: text("tracking_number"),
  shippingService: text("shipping_service"),
  notes: text("notes"),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

## Enhanced API Development

### **New Tracking Endpoints:**

#### 1. Update Order Tracking (Admin Only):
```typescript
// PUT /api/admin/orders/:id/tracking
app.put("/api/admin/orders/:id/tracking", requireAdminKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingNumber, shippingService } = req.body;

    // Validation
    if (!trackingNumber || !shippingService) {
      return res.status(400).json({ 
        error: "Tracking number dan shipping service diperlukan" 
      });
    }

    // Validate tracking number format
    const trimmedTrackingNumber = trackingNumber.trim().toUpperCase();
    
    // Get current order
    const currentOrder = await storage.getOrder(id);
    if (!currentOrder) {
      return res.status(404).json({ error: "Pesanan tidak ditemukan" });
    }

    // Check if order can be updated
    if (currentOrder.orderStatus === 'cancelled') {
      return res.status(400).json({ 
        error: "Tidak dapat menambahkan tracking untuk pesanan yang dibatalkan" 
      });
    }

    // Update order dengan tracking info
    const updateData = {
      trackingNumber: trimmedTrackingNumber,
      shippingService,
      orderStatus: 'shipped' as const, // Auto-update ke shipped
      updatedAt: new Date()
    };

    const order = await storage.updateOrder(id, updateData);

    // Log tracking update
    await storage.logTrackingUpdate({
      orderId: id,
      oldStatus: currentOrder.orderStatus,
      newStatus: 'shipped',
      trackingNumber: trimmedTrackingNumber,
      shippingService,
      updatedBy: req.session.adminId
    });

    // Generate tracking URL
    const trackingUrl = generateTrackingUrl(trimmedTrackingNumber, shippingService);

    // Send notification (implement as needed)
    // await sendTrackingNotification(order, trackingUrl);

    res.json({
      ...order,
      trackingUrl,
      message: "Tracking berhasil diperbarui dan status diubah ke 'Shipped'"
    });
  } catch (error) {
    console.error("Error updating tracking:", error);
    res.status(500).json({ error: "Gagal memperbarui tracking" });
  }
});
```

#### 2. Tracking URL Generator:
```typescript
// Utility function untuk generate tracking URLs
export function generateTrackingUrl(trackingNumber: string, shippingService: string): string {
  const service = shippingService.toLowerCase();
  
  const trackingUrls = {
    'jne': `https://www.jne.co.id/id/tracking/trace?keyword=${trackingNumber}`,
    'pos indonesia': `https://www.posindonesia.co.id/app/trace?barcode=${trackingNumber}`,
    'tiki': `https://www.tiki.id/id/tracking?keyword=${trackingNumber}`,
    'sicepat': `https://www.sicepat.com/?action=track&keyword=${trackingNumber}`,
    'anteraja': `https://www.anteraja.com/cek-resi/${trackingNumber}`,
    'j&t': `https://jet.co.id/track/${trackingNumber}`,
    'ninja xpress': `https://www.ninjaxpress.co/en-id/tracking?id=${trackingNumber}`,
    'lion parcel': `https://www.lionparcel.com/en/shipment-tracking/?barcode=${trackingNumber}`,
    'sap express': `https://www.sapexpress.id/tracking?resi=${trackingNumber}`,
    'rpx': `https://www.rpxholding.com/tracking?resi=${trackingNumber}`,
    'id express': `https://www.idexpress.com/tracking/${trackingNumber}`,
    'wahana': `https://www.wahana.com/tracking?noresi=${trackingNumber}`
  };

  return trackingUrls[service] || `https://www.google.com/search?q=${trackingNumber}+${shippingService}`;
}
```

#### 3. Customer Order Tracking:
```typescript
// GET /api/buyer/orders/:id/tracking
app.get("/api/buyer/orders/:id/tracking", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    // Get order untuk user tersebut
    const order = await storage.getOrderByIdAndUser(id, userId);
    if (!order) {
      return res.status(404).json({ error: "Pesanan tidak ditemukan" });
    }

    // Return tracking info
    const trackingInfo = {
      orderStatus: order.orderStatus,
      trackingNumber: order.trackingNumber,
      shippingService: order.shippingService,
      trackingUrl: order.trackingNumber ? 
        generateTrackingUrl(order.trackingNumber, order.shippingService) : null,
      statusHistory: await storage.getTrackingHistory(id)
    };

    res.json(trackingInfo);
  } catch (error) {
    console.error("Error fetching tracking info:", error);
    res.status(500).json({ error: "Gagal mengambil info tracking" });
  }
});
```

### **Enhanced Storage Operations:**

#### Tracking-related Database Operations:
```typescript
// server/storage.ts - Enhanced dengan tracking operations

export class DatabaseStorage implements IStorage {
  // Update order dengan tracking info
  async updateOrder(id: string, updateData: Partial<Order>): Promise<Order | null> {
    try {
      const result = await db
        .update(orders)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(orders.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // Log tracking update untuk audit trail
  async logTrackingUpdate(updateData: {
    orderId: string;
    oldStatus: string;
    newStatus: string;
    trackingNumber?: string;
    shippingService?: string;
    notes?: string;
    updatedBy?: string;
  }): Promise<void> {
    try {
      await db.insert(trackingUpdates).values({
        ...updateData,
        id: crypto.randomUUID(),
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error logging tracking update:', error);
      throw error;
    }
  }

  // Get tracking history untuk order
  async getTrackingHistory(orderId: string): Promise<TrackingUpdate[]> {
    try {
      return await db
        .select()
        .from(trackingUpdates)
        .where(eq(trackingUpdates.orderId, orderId))
        .orderBy(desc(trackingUpdates.createdAt));
    } catch (error) {
      console.error('Error fetching tracking history:', error);
      return [];
    }
  }

  // Get order by ID dan user (untuk customer access)
  async getOrderByIdAndUser(orderId: string, userId: string): Promise<Order | null> {
    try {
      // Implementation depends on how you link orders to users
      // For session-based orders, you might need different approach
      const result = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.id, orderId),
            eq(orders.customerEmail, userId) // Adjust based on your auth system
          )
        )
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Error fetching user order:', error);
      return null;
    }
  }
}
```

## Frontend Development

### Enhanced Buyer Dashboard dengan Tracking:

#### Order Tracking Component:
```typescript
// client/src/pages/buyer-dashboard.tsx - Enhanced tracking component

function OrderTracking({ order }: { order: Order }) {
  const { formatCurrency } = useLocalization();

  const getTrackingUrl = (trackingNumber: string, shippingService: string): string => {
    const service = shippingService?.toLowerCase() || '';
    const trackingUrls = {
      'jne': `https://www.jne.co.id/id/tracking/trace?keyword=${trackingNumber}`,
      'pos indonesia': `https://www.posindonesia.co.id/app/trace?barcode=${trackingNumber}`,
      'tiki': `https://www.tiki.id/id/tracking?keyword=${trackingNumber}`,
      'sicepat': `https://www.sicepat.com/?action=track&keyword=${trackingNumber}`,
      'anteraja': `https://www.anteraja.com/cek-resi/${trackingNumber}`,
      'j&t': `https://jet.co.id/track/${trackingNumber}`,
      // Add more carriers as needed
    };

    return trackingUrls[service] || `https://www.google.com/search?q=${trackingNumber}+${shippingService}`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Order Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">Order #{order.orderId}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString('id-ID')}
          </p>
        </div>
        <Badge className={getStatusColor(order.orderStatus)}>
          {order.orderStatus.toUpperCase()}
        </Badge>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label>Total</Label>
          <div className="font-medium">{formatCurrency(parseFloat(order.totalAmount))}</div>
        </div>
        <div>
          <Label>Payment</Label>
          <div className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
            {order.paymentStatus.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Tracking Information */}
      {order.trackingNumber && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Label className="font-medium">Nomor Resi</Label>
            <Badge variant="outline">{order.shippingService || 'Kurir'}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-background px-2 py-1 rounded text-sm font-mono">
              {order.trackingNumber}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(getTrackingUrl(order.trackingNumber!, order.shippingService || ''), '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Lacak
            </Button>
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <div className="space-y-2">
        <Label>Status Timeline</Label>
        <div className="space-y-2">
          {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
            const isActive = order.orderStatus === status;
            const isCompleted = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.orderStatus) > index;
            
            return (
              <div key={status} className={`flex items-center gap-2 ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                <div className={`w-3 h-3 rounded-full border-2 ${isActive || isCompleted ? 'bg-current border-current' : 'border-current'}`} />
                <span className="text-sm capitalize">{status}</span>
                {isActive && <Badge variant="outline" className="text-xs">Current</Badge>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <Label>Alamat Pengiriman</Label>
        <div className="text-sm text-muted-foreground mt-1 p-2 bg-muted/30 rounded">
          {order.shippingAddress}
        </div>
      </div>
    </div>
  );
}
```

### Enhanced Admin Panel:

#### Tracking Input Modal:
```typescript
// Admin tracking input component
function TrackingInputModal({ order, isOpen, onClose, onUpdate }: TrackingInputModalProps) {
  const [trackingFormData, setTrackingFormData] = useState({
    trackingNumber: order.trackingNumber || '',
    shippingService: order.shippingService || 'JNE',
  });

  const shippingServices = [
    'JNE', 'POS Indonesia', 'TIKI', 'SiCepat', 'Anteraja', 'J&T',
    'Ninja Xpress', 'Lion Parcel', 'SAP Express', 'RPX', 'ID Express', 'Wahana'
  ];

  const handleSubmit = async () => {
    if (!trackingFormData.trackingNumber.trim()) {
      alert('Nomor resi wajib diisi');
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber: trackingFormData.trackingNumber.trim(),
          shippingService: trackingFormData.shippingService,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Tracking berhasil diperbarui!');
        onUpdate(result);
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memperbarui tracking');
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
      alert('Terjadi kesalahan: ' + error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Input Resi Pengiriman</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Order Info */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm font-medium">Order #{order.orderId}</div>
            <div className="text-sm text-muted-foreground">{order.customerName}</div>
          </div>

          {/* Tracking Number Input */}
          <div className="space-y-2">
            <Label htmlFor="trackingNumber">Nomor Resi *</Label>
            <Input
              id="trackingNumber"
              value={trackingFormData.trackingNumber}
              onChange={(e) => setTrackingFormData(prev => ({ 
                ...prev, 
                trackingNumber: e.target.value 
              }))}
              placeholder="Contoh: JNE12345678901234"
              className="font-mono"
            />
          </div>

          {/* Shipping Service Select */}
          <div className="space-y-2">
            <Label>Jasa Pengiriman *</Label>
            <Select
              value={trackingFormData.shippingService}
              onValueChange={(value) => setTrackingFormData(prev => ({ 
                ...prev, 
                shippingService: value 
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {shippingServices.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1"
              disabled={!trackingFormData.trackingNumber.trim()}
            >
              Simpan Resi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Testing Strategy

### API Testing untuk Tracking:
```typescript
// tests/tracking.test.ts
import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../server';

describe('Order Tracking API', () => {
  test('should update tracking number for order', async () => {
    const trackingData = {
      trackingNumber: 'JNE123456789',
      shippingService: 'JNE'
    };

    const response = await request(app)
      .put('/api/admin/orders/test-order-id/tracking')
      .send(trackingData)
      .expect(200);

    expect(response.body.trackingNumber).toBe(trackingData.trackingNumber);
    expect(response.body.orderStatus).toBe('shipped');
    expect(response.body.trackingUrl).toContain('jne.co.id');
  });

  test('should validate tracking number format', async () => {
    const invalidData = {
      trackingNumber: '',
      shippingService: 'JNE'
    };

    await request(app)
      .put('/api/admin/orders/test-order-id/tracking')
      .send(invalidData)
      .expect(400);
  });

  test('should generate correct tracking URL for different carriers', () => {
    const testCases = [
      { carrier: 'JNE', number: 'JNE123', expected: 'jne.co.id' },
      { carrier: 'TIKI', number: 'TIKI456', expected: 'tiki.id' },
      { carrier: 'SiCepat', number: 'SC789', expected: 'sicepat.com' }
    ];

    testCases.forEach(({ carrier, number, expected }) => {
      const url = generateTrackingUrl(number, carrier);
      expect(url).toContain(expected);
    });
  });
});
```

## Deployment di Replit

### Production Configuration:
```typescript
// Replit-specific configuration
const config = {
  port: process.env.PORT || 5000,
  host: '0.0.0.0', // Required untuk Replit
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
  },
  session: {
    secret: process.env.SESSION_SECRET || 'auto-generated-secret',
    secure: process.env.NODE_ENV === 'production'
  }
};

// Start server
app.listen(config.port, config.host, () => {
  console.log(`Server running on ${config.host}:${config.port}`);
});
```

### Replit Secrets Configuration:
```bash
# Required secrets di Replit
DATABASE_URL=postgresql://your-db-url
SESSION_SECRET=your-secure-secret
NODE_ENV=production

# Optional
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
```

## Performance Optimization

### Database Indexing untuk Tracking:
```sql
-- Add indexes untuk tracking queries
CREATE INDEX idx_orders_tracking ON orders(tracking_number) WHERE tracking_number IS NOT NULL;
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_tracking_updates_order_id ON tracking_updates(order_id);
```

### Frontend Performance:
```typescript
// Memoized tracking component
const OrderTrackingMemo = memo(({ order }: { order: Order }) => {
  const trackingUrl = useMemo(() => {
    return order.trackingNumber ? 
      generateTrackingUrl(order.trackingNumber, order.shippingService) : null;
  }, [order.trackingNumber, order.shippingService]);

  return (
    <OrderTracking order={order} trackingUrl={trackingUrl} />
  );
});
```

## Security Considerations

### Input Validation untuk Tracking:
```typescript
// Validation schemas
const trackingUpdateSchema = z.object({
  trackingNumber: z.string()
    .min(5, 'Tracking number minimal 5 karakter')
    .max(50, 'Tracking number maksimal 50 karakter')
    .regex(/^[A-Z0-9-]+$/, 'Format tracking number tidak valid'),
  shippingService: z.enum([
    'JNE', 'POS Indonesia', 'TIKI', 'SiCepat', 'Anteraja', 'J&T',
    'Ninja Xpress', 'Lion Parcel', 'SAP Express', 'RPX', 'ID Express', 'Wahana'
  ])
});
```

### Admin Authorization:
```typescript
// Enhanced admin middleware dengan tracking permissions
export const requireAdminKey = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers.authorization?.replace('Bearer ', '');
  
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  // Log admin action untuk audit
  console.log(`Admin action: ${req.method} ${req.path}`, {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  next();
};
```

**Developed by Fajar Julyana**

*Developer guide terbaru ini mencakup semua aspek pengembangan sistem dengan fokus khusus pada fitur order tracking, enhanced API endpoints, dan deployment di Replit platform untuk pengalaman development yang optimal.*
