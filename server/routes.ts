import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireAdmin, requireOperatorOrAdmin, requireBuyer, requireAdminKey, requireAdminKeyOrSession } from "./auth";
import {
  insertProductSchema,
  insertCategorySchema,
  insertCartItemSchema,
  insertContactSubmissionSchema,
  insertOrderSchema,
  insertChatRoomSchema,
  insertChatMessageSchema,
  insertChatParticipantSchema,
  insertMidtransConfigSchema,
} from "@shared/schema";
import { z } from "zod";
import midtransClient from "midtrans-client";

// Extended WebSocket interface for chat functionality
interface ExtendedWebSocket extends WebSocket {
  roomId?: string;
  sessionId?: string;
  userType?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for monitoring
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000
    });
  });

  // Setup authentication first
  setupAuth(app);

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, limit, offset } = req.query;

      // Validate query parameters
      let parsedLimit: number | undefined;
      let parsedOffset: number | undefined;

      if (limit) {
        parsedLimit = parseInt(limit as string);
        if (isNaN(parsedLimit) || parsedLimit < 0) {
          return res.status(400).json({ error: "Limit must be a positive number" });
        }
      }

      if (offset) {
        parsedOffset = parseInt(offset as string);
        if (isNaN(parsedOffset) || parsedOffset < 0) {
          return res.status(400).json({ error: "Offset must be a non-negative number" });
        }
      }

      const filters = {
        categoryId: category as string | undefined,
        search: search as string | undefined,
        limit: parsedLimit,
        offset: parsedOffset,
      };

      const products = await storage.getProducts(filters);
      
      // Get categories to map category names
      const categories = await storage.getCategories();
      const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
      
      // Add category names to products
      const productsWithCategoryNames = products.map(product => ({
        ...product,
        categoryName: categoryMap.get(product.categoryId) || 'Unknown Category'
      }));
      
      res.json(productsWithCategoryNames);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  // Cart routes
  // Get cart items for current session
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const cartItems = await storage.getCart(sessionId);

      // Ensure prices are returned as numbers and add product information
      const formattedItems = await Promise.all(cartItems.map(async item => {
        let price: number = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price);
        if (isNaN(price) || price < 0) {
          price = 0;
        }

        // Get product details for additional info
        const product = await storage.getProduct(item.productId);
        
        return {
          ...item,
          price: price,
          name: product?.name || 'Unknown Product',
          image: product?.imageUrl || '/placeholder-image.jpg',
          category: product ? await (async () => {
            const categories = await storage.getCategories();
            const category = categories.find(cat => cat.id === product.categoryId);
            return category?.name || 'Unknown Category';
          })() : 'Unknown Category'
        };
      }));

      res.json(formattedItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Gagal mengambil keranjang" });
    }
  });

  // Add item to cart
  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const { productId, quantity = 1 } = req.body;

      // Validate required fields
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      // Get product to ensure we have the correct price
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
      }

      let price: number = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
      
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ error: "Invalid product price" });
      }

      // Ensure price is sent as string to match schema
      const cartItemData = insertCartItemSchema.parse({
        productId,
        sessionId,
        quantity: parseInt(quantity.toString()) || 1,
        price: price.toString() // Convert to string for schema validation
      });

      const cartItem = await storage.addToCart(cartItemData);
      
      // Return cart item with proper price formatting
      const formattedCartItem = {
        ...cartItem,
        price: typeof cartItem.price === 'string' ? parseFloat(cartItem.price) : cartItem.price
      };

      res.status(201).json(formattedCartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ error: "Data keranjang tidak valid", details: error.errors });
      }
      console.error("Error adding to cart:", error);
      res.status(500).json({ error: "Gagal menambahkan ke keranjang" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const sessionId = req.sessionID;

      if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 0) {
        return res.status(400).json({ error: "Quantity must be a non-negative integer" });
      }

      if (quantity === 0) {
        const success = await storage.removeFromCart(sessionId, id);
        if (!success) {
          return res.status(404).json({ error: "Cart item not found or access denied" });
        }
        return res.json({ success });
      }

      const updatedItem = await storage.updateCartItem(sessionId, id, quantity);

      if (!updatedItem) {
        return res.status(404).json({ error: "Cart item not found or access denied" });
      }

      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sessionId = req.sessionID;

      const success = await storage.removeFromCart(sessionId, id);

      if (!success) {
        return res.status(404).json({ error: "Cart item not found or access denied" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const success = await storage.clearCart(sessionId);
      res.json({ success });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Contact form route
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(contactData);

      // In a real application, you might send an email here
      console.log("New contact submission:", submission);

      res.status(201).json({ 
        success: true, 
        message: "Thank you for your message. We'll get back to you soon!" 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error creating contact submission:", error);
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // Initialize Midtrans client with dynamic configuration
  const getMidtransConfig = async () => {
    const config = await storage.getMidtransConfig();
    
    // If no config in database, use environment variables as fallback
    if (!config) {
      return {
        environment: 'sandbox',
        serverKey: process.env.MIDTRANS_SERVER_KEY || '',
        clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
        isActive: true
      };
    }
    
    return config;
  };

  const createMidtransClient = async () => {
    const config = await getMidtransConfig();
    return new midtransClient.Snap({
      isProduction: config.environment === 'production',
      serverKey: config.serverKey,
      clientKey: config.clientKey
    });
  };

  // Public endpoint for getting Midtrans client configuration
  app.get("/api/payment/config", async (req, res) => {
    try {
      const config = await getMidtransConfig();
      
      // Only return safe client configuration
      const clientConfig = {
        environment: config.environment,
        clientKey: config.clientKey,
        isActive: config.isActive
      };
      
      res.json(clientConfig);
    } catch (error) {
      console.error("Error fetching payment config:", error);
      res.status(500).json({ error: "Failed to fetch payment configuration" });
    }
  });

  // Payment routes - require authentication for checkout
  app.post("/api/payment/create", requireAuth, async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const cartItems = await storage.getCartItems(sessionId);

      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: "Keranjang kosong" });
      }

      // Calculate total amount
      let grossAmount = 0;
      const itemDetails = [];

      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          const price = parseFloat(product.price);
          const totalPrice = price * item.quantity;
          grossAmount += totalPrice;

          // Truncate product name to max 50 chars for Midtrans
          const truncatedName = product.name.length > 50 
            ? product.name.substring(0, 47) + "..." 
            : product.name;

          itemDetails.push({
            id: product.id.substring(0, 50), // Ensure ID is not too long
            price: price,
            quantity: item.quantity,
            name: truncatedName
          });
        }
      }

      // Round gross amount to avoid floating point issues
      grossAmount = Math.round(grossAmount);

      // Create shorter order ID (max 50 chars for Midtrans)
      const shortSessionId = sessionId.substring(0, 8);
      const timestamp = Date.now().toString().substring(-8); // Last 8 digits
      const orderId = `ORD-${shortSessionId}-${timestamp}`;

      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: grossAmount
        },
        item_details: itemDetails,
        customer_details: {
          first_name: req.body.first_name || "Customer",
          last_name: req.body.last_name || "",
          email: req.body.email || "customer@example.com",
          phone: req.body.phone || "+62812345678"
        }
      };

      const snap = await createMidtransClient();
      
      // Log parameter untuk debugging
      console.log("Creating Midtrans transaction with parameter:", JSON.stringify(parameter, null, 2));
      
      const transaction = await snap.createTransaction(parameter);

      res.json({
        token: transaction.token,
        redirect_url: transaction.redirect_url,
        order_id: orderId
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('item_details Name too long')) {
          res.status(400).json({ error: "Nama produk terlalu panjang untuk sistem pembayaran" });
        } else if (error.message.includes('order_id too long')) {
          res.status(400).json({ error: "ID pesanan terlalu panjang" });
        } else if (error.message.includes('gross_amount is not equal')) {
          res.status(400).json({ error: "Total harga tidak sesuai dengan detail item" });
        } else if (error.message.includes('API error')) {
          res.status(400).json({ error: "Kesalahan konfigurasi pembayaran. Mohon hubungi admin." });
        } else {
          res.status(500).json({ error: `Gagal membuat pembayaran: ${error.message}` });
        }
      } else {
        res.status(500).json({ error: "Gagal membuat pembayaran" });
      }
    }
  });

  // Payment notification webhook
  app.post("/api/payment/notification", async (req, res) => {
    try {
      const notification = req.body;
      const snap = await createMidtransClient();

      const statusResponse = await snap.transaction.notification(notification);
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      console.log(`Payment notification: Order ${orderId}, Status: ${transactionStatus}, Fraud: ${fraudStatus}`);

      // Handle different payment statuses
      if (transactionStatus === 'capture') {
        if (fraudStatus === 'challenge') {
          // Set payment status to 'Challenge by FDS'
          console.log('Payment challenged by FDS');
        } else if (fraudStatus === 'accept') {
          // Set payment status to 'Success'
          console.log('Payment successful');
          // Clear cart for this session
          // Note: In production, you would need to associate order with session
        }
      } else if (transactionStatus === 'settlement') {
        // Payment successful
        console.log('Payment settled');
      } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
        // Payment failed
        console.log('Payment failed:', transactionStatus);
      } else if (transactionStatus === 'pending') {
        // Payment pending
        console.log('Payment pending');
      }

      res.json({ status: 'success' });
    } catch (error) {
      console.error('Payment notification error:', error);
      res.status(500).json({ error: 'Webhook error' });
    }
  });

  // Midtrans Configuration Admin Routes
  app.get("/api/admin/payment/config", requireAdmin, async (req, res) => {
    try {
      const config = await storage.getMidtransConfig();
      if (config) {
        // Don't expose the full server key in the response
        const safeConfig = {
          ...config,
          serverKey: config.serverKey ? config.serverKey.substring(0, 8) + '****' : ''
        };
        res.json(safeConfig);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching Midtrans config:", error);
      res.status(500).json({ error: "Failed to fetch payment configuration" });
    }
  });

  app.post("/api/admin/payment/config", requireAdmin, async (req, res) => {
    try {
      const configData = insertMidtransConfigSchema.parse(req.body);
      
      // Check if there's already an active configuration
      const existingConfig = await storage.getMidtransConfig();
      if (existingConfig) {
        // Update existing configuration
        const updated = await storage.updateMidtransConfig(existingConfig.id, configData);
        res.json(updated);
      } else {
        // Create new configuration
        const newConfig = await storage.createMidtransConfig(configData);
        res.status(201).json(newConfig);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid configuration data", details: error.errors });
      }
      console.error("Error saving Midtrans config:", error);
      res.status(500).json({ error: "Failed to save payment configuration" });
    }
  });

  app.post("/api/admin/payment/test", requireAdmin, async (req, res) => {
    try {
      const snap = await createMidtransClient();
      
      // Create a test transaction with minimal data
      const testParameter = {
        transaction_details: {
          order_id: `TEST-${Date.now()}`,
          gross_amount: 1000
        },
        item_details: [{
          id: 'test-item',
          price: 1000,
          quantity: 1,
          name: 'Test Item'
        }],
        customer_details: {
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          phone: '+6281234567890'
        }
      };

      const transaction = await snap.createTransaction(testParameter);
      
      if (transaction.token) {
        res.json({ 
          success: true, 
          message: "Midtrans connection successful",
          token: transaction.token.substring(0, 8) + '****' // Partial token for security
        });
      } else {
        res.status(500).json({ success: false, message: "Failed to create test transaction" });
      }
    } catch (error) {
      console.error("Midtrans test error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Midtrans connection failed: " + (error as Error).message 
      });
    }
  });

  // Admin/Operator routes for product management
  app.post("/api/admin/products", requireOperatorOrAdmin, async (req, res) => {
    try {
      console.log("Creating product with data:", JSON.stringify(req.body, null, 2));
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      console.log("Product created successfully:", product.id);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ error: "Data produk tidak valid", details: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Gagal membuat produk" });
    }
  });

  app.put("/api/admin/products/:id", requireOperatorOrAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Updating product", id, "with data:", JSON.stringify(req.body, null, 2));
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);

      if (!product) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
      }

      console.log("Product updated successfully:", product.id);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ error: "Data produk tidak valid", details: error.errors });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Gagal memperbarui produk" });
    }
  });

  app.delete("/api/admin/products/:id", requireOperatorOrAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProduct(id);

      if (!success) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
      }

      res.json({ success: true, message: "Produk berhasil dihapus" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Gagal menghapus produk" });
    }
  });

  // Admin routes for category management
  app.post("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid category data", details: error.errors });
      }
      if (error instanceof Error && error.message.includes('slug already exists')) {
        return res.status(409).json({ error: error.message });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid category data", details: error.errors });
      }
      if (error instanceof Error && error.message.includes('slug already exists')) {
        return res.status(409).json({ error: error.message });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCategory(id);

      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }

      res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot delete category')) {
        return res.status(409).json({ error: error.message });
      }
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Order management routes
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const { customerEmail, paymentStatus, orderStatus, limit, offset } = req.query;

      const filters = {
        customerEmail: customerEmail as string | undefined,
        paymentStatus: paymentStatus as string | undefined,
        orderStatus: orderStatus as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const orders = await storage.getOrders(filters);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Gagal mengambil data pesanan" });
    }
  });

  app.get("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);

      if (!order) {
        return res.status(404).json({ error: "Pesanan tidak ditemukan" });
      }

      // Get order items for this order
      const orderItems = await storage.getOrderItems(id);

      res.json({ ...order, items: orderItems });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Gagal mengambil data pesanan" });
    }
  });

  app.put("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const orderData = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(id, orderData);

      if (!order) {
        return res.status(404).json({ error: "Pesanan tidak ditemukan" });
      }

      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Data pesanan tidak valid", details: error.errors });
      }
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Gagal memperbarui pesanan" });
    }
  });

  // Chat API routes - Admin/Operator access to all rooms
  app.get("/api/chat/rooms", async (req, res) => {
    try {
      // Check if user is admin/operator
      if (req.user && (req.user.role === 'admin' || req.user.role === 'operator')) {
        const { status, priority, assignedTo } = req.query;

        let rooms = await storage.getChatRooms();

        // Filter by status
        if (status && typeof status === 'string') {
          rooms = rooms.filter(room => room.status === status);
        }

        // Filter by priority  
        if (priority && typeof priority === 'string') {
          rooms = rooms.filter(room => room.priority === priority);
        }

        // Filter by assigned operator/admin
        if (assignedTo && typeof assignedTo === 'string') {
          rooms = rooms.filter(room => room.assignedTo === assignedTo);
        }

        return res.json(rooms);
      }

      // For customers, return their own rooms
      const sessionId = req.sessionID;
      const rooms = await storage.getChatRooms();
      const myRooms = rooms.filter(room => room.customerSessionId === sessionId);
      res.json(myRooms);

    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ error: "Gagal mengambil daftar chat" });
    }
  });

  app.get("/api/admin/chat/rooms", requireOperatorOrAdmin, async (req, res) => {
    try {
      const { status, priority, assignedTo } = req.query;

      let rooms = await storage.getChatRooms();

      // Filter by status
      if (status && typeof status === 'string') {
        rooms = rooms.filter(room => room.status === status);
      }

      // Filter by priority  
      if (priority && typeof priority === 'string') {
        rooms = rooms.filter(room => room.priority === priority);
      }

      // Filter by assigned operator/admin
      if (assignedTo && typeof assignedTo === 'string') {
        rooms = rooms.filter(room => room.assignedTo === assignedTo);
      }

      res.json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ error: "Gagal mengambil daftar chat" });
    }
  });

  // Customer access to create chat room
  app.post("/api/chat/rooms", async (req, res) => {
    try {
      const sessionId = req.sessionID;

      const chatRoomData = insertChatRoomSchema.parse({
        ...req.body,
        customerSessionId: sessionId,
      });

      const room = await storage.createChatRoom(chatRoomData);
      res.status(201).json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Data chat tidak valid", details: error.errors });
      }
      console.error("Error creating chat room:", error);
      res.status(500).json({ error: "Gagal membuat ruang chat" });
    }
  });

  // Get customer's own chat rooms
  app.get("/api/chat/my-rooms", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const rooms = await storage.getChatRooms();
      const myRooms = rooms.filter(room => room.customerSessionId === sessionId);
      res.json(myRooms);
    } catch (error) {
      console.error("Error fetching customer chat rooms:", error);
      res.status(500).json({ error: "Gagal mengambil daftar chat" });
    }
  });



  app.get("/api/chat/rooms/:roomId", requireAdminKeyOrSession, async (req, res) => {
    try {
      const { roomId } = req.params;
      const sessionId = req.sessionID;

      const room = await storage.getChatRoom(roomId);

      if (!room) {
        return res.status(404).json({ error: "Chat room not found" });
      }

      // Admin key auth has access to all rooms, session auth only to own rooms
      const hasAccess = (req as any).isAdminKeyAuth || 
                       room.customerSessionId === sessionId || 
                       (req.user && req.user.role === 'admin');

      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(room);
    } catch (error) {
      console.error("Error fetching chat room:", error);
      res.status(500).json({ error: "Failed to fetch chat room" });
    }
  });

  app.get("/api/chat/rooms/:roomId/messages", async (req, res) => {
    try {
      const { roomId } = req.params;
      const sessionId = req.sessionID;

      // Verify access to room
      const room = await storage.getChatRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: "Chat room not found" });
      }

      // Admin/operator has access to all rooms, customers only to own rooms
      const hasAccess = room.customerSessionId === sessionId || 
                       (req.user && (req.user.role === 'admin' || req.user.role === 'operator'));

      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }

      const messages = await storage.getChatMessages(roomId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Admin/Operator assign chat room to themselves
  app.put("/api/admin/chat/rooms/:roomId/assign", requireOperatorOrAdmin, async (req, res) => {
    try {
      const { roomId } = req.params;
      const assignTo = req.user?.id || null;

      const room = await storage.getChatRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: "Ruang chat tidak ditemukan" });
      }

      // Update room assignment and status
      const updatedRoom = await storage.updateChatRoom(roomId, {
        assignedTo: assignTo,
        status: 'active',
        unreadByAdmin: false
      });

      res.json(updatedRoom);
    } catch (error) {
      console.error("Error assigning chat room:", error);
      res.status(500).json({ error: "Gagal mengassign ruang chat" });
    }
  });

  // Admin/Operator update chat room status/priority
  app.put("/api/admin/chat/rooms/:roomId", requireOperatorOrAdmin, async (req, res) => {
    try {
      const { roomId } = req.params;
      const { status, priority } = req.body;

      const room = await storage.getChatRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: "Ruang chat tidak ditemukan" });
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;

      const updatedRoom = await storage.updateChatRoom(roomId, updateData);
      res.json(updatedRoom);
    } catch (error) {
      console.error("Error updating chat room:", error);
      res.status(500).json({ error: "Gagal memperbarui ruang chat" });
    }
  });

  app.post("/api/chat/rooms/:roomId/messages", async (req, res) => {
    try {
      const { roomId } = req.params;
      const sessionId = req.sessionID;

      // Verify access to room
      const room = await storage.getChatRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: "Chat room not found" });
      }

      const hasAccess = room.customerSessionId === sessionId || 
                       (req.user && req.user.role === 'admin');

      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }

      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        chatRoomId: roomId,
        senderType: req.user?.role === 'admin' ? 'admin' : req.user?.role === 'operator' ? 'operator' : 'customer',
      });

      const message = await storage.createChatMessage(messageData);

      // Update room's last message timestamp
      await storage.updateChatRoomLastMessage(roomId);

      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
      }
      console.error("Error creating chat message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Admin Settings Routes
  app.get("/api/admin/settings", requireAdminKey, async (req, res) => {
    try {
      const settings = {
        environment: process.env.NODE_ENV || 'development',
        session: {
          secret: process.env.SESSION_SECRET ? '****' : 'auto-generated',
          maxAge: 24, // hours
          autoGenerate: !process.env.SESSION_SECRET
        },
        server: {
          status: 'online',
          port: process.env.PORT || 5000
        },
        database: {
          status: 'connected',
          type: 'PostgreSQL'
        }
      };
      res.json(settings);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/admin/settings/session", requireAdminKey, async (req, res) => {
    try {
      const { sessionMaxAge, autoGenerateSecret, sessionSecret } = req.body;
      
      // In a real application, you would save these to environment variables
      // or a configuration file. For this demo, we'll just acknowledge the save.
      console.log("Session settings update requested:", {
        maxAge: sessionMaxAge,
        autoGenerate: autoGenerateSecret,
        secretProvided: !!sessionSecret
      });
      
      // Note: In production, you would need to restart the server 
      // or implement hot-reload of session configuration
      
      res.json({ 
        success: true, 
        message: "Session settings saved. Server restart may be required for changes to take effect." 
      });
    } catch (error) {
      console.error("Error saving session settings:", error);
      res.status(500).json({ error: "Failed to save session settings" });
    }
  });

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  // Add WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active connections by room
  const roomConnections = new Map<string, Set<ExtendedWebSocket>>();

  wss.on('connection', function connection(ws: ExtendedWebSocket, request) {
    console.log('New WebSocket connection');

    ws.on('message', async function message(data) {
      try {
        const parsedMessage = JSON.parse(data.toString());

        switch (parsedMessage.type) {
          case 'join_room':
            const { roomId, sessionId, userType } = parsedMessage.payload;

            // Verify access to room
            const room = await storage.getChatRoom(roomId);
            if (!room) {
              ws.send(JSON.stringify({ type: 'error', payload: { message: 'Room not found' } }));
              return;
            }

            // Add connection to room
            if (!roomConnections.has(roomId)) {
              roomConnections.set(roomId, new Set());
            }

            ws.roomId = roomId;
            ws.sessionId = sessionId;
            ws.userType = userType;

            roomConnections.get(roomId)?.add(ws);

            ws.send(JSON.stringify({ 
              type: 'joined_room', 
              payload: { roomId, message: 'Successfully joined room' } 
            }));
            break;

          case 'send_message':
            if (!ws.roomId) {
              ws.send(JSON.stringify({ type: 'error', payload: { message: 'Not in a room' } }));
              return;
            }

            const messageData = {
              chatRoomId: ws.roomId,
              senderType: ws.userType || 'customer',
              senderName: parsedMessage.payload.senderName,
              message: parsedMessage.payload.message,
              messageType: 'text'
            };

            // Save message to database
            const savedMessage = await storage.createChatMessage(messageData);
            await storage.updateChatRoomLastMessage(ws.roomId);

            // Broadcast message to all users in the room
            const roomConnections_set = roomConnections.get(ws.roomId);
            if (roomConnections_set) {
              roomConnections_set.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'new_message',
                    payload: savedMessage
                  }));
                }
              });
            }
            break;

          case 'leave_room':
            if (ws.roomId) {
              const roomConnections_set = roomConnections.get(ws.roomId);
              roomConnections_set?.delete(ws);
              ws.roomId = undefined;
              ws.sessionId = undefined;
              ws.userType = undefined;
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid message format' } }));
      }
    });

    ws.on('close', function close() {
      // Clean up connection from all rooms
      if (ws.roomId) {
        const roomConnections_set = roomConnections.get(ws.roomId);
        roomConnections_set?.delete(ws);

        // Remove empty room sets
        if (roomConnections_set && roomConnections_set.size === 0) {
          roomConnections.delete(ws.roomId);
        }
      }
    });

    ws.on('error', function error(err) {
      console.error('WebSocket error:', err);
    });
  });

  return httpServer;
}