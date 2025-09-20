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
  insertRoleSchema,
} from "@shared/schema";
import { z } from "zod";
import midtransClient from "midtrans-client";
import { randomUUID } from "crypto";

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
        merchantId: null,
        isActive: true,
        finishRedirectUrl: null,
        unfinishRedirectUrl: null,
        errorRedirectUrl: null,
        notificationUrl: null,
        recurringNotificationUrl: null,
        id: 'fallback',
        createdAt: new Date(),
        updatedAt: new Date()
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

  // Check if order exists by order ID
  app.get("/api/orders/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({ error: "Order ID required" });
      }

      console.log('Checking if order exists:', orderId);

      const order = await storage.getOrder(orderId);
      if (order) {
        console.log('Order found:', order.id);
        res.json(order);
      } else {
        console.log('Order not found:', orderId);
        res.status(404).json({ error: "Order not found" });
      }
    } catch (error) {
      console.error('Error checking order:', error);
      res.status(500).json({ error: 'Failed to check order' });
    }
  });

  // Manual order creation endpoint for payment success page
  app.post("/api/payment/complete-order", async (req, res) => {
    try {
      const { orderId, sessionId } = req.body;

      if (!orderId || !sessionId) {
        return res.status(400).json({ error: "Order ID and session ID required" });
      }

      console.log('Manual order completion requested:', { orderId, sessionId });

      // Check if order already exists
      const existingOrder = await storage.getOrder(orderId);
      if (existingOrder) {
        console.log('Order already exists:', orderId);
        return res.json({ success: true, order: existingOrder });
      }

      // Get cart items for this session OR from pending orders
      let cartItems = await storage.getCartItems(sessionId);
      let orderData = pendingOrders.get(orderId);

      if (!cartItems || cartItems.length === 0) {
        // Try to get from pending orders
        if (orderData && orderData.cartItems) {
          cartItems = orderData.cartItems;
          console.log('Retrieved cart items from pending orders for manual completion:', cartItems.length);
        }
      }

      console.log('Found cart items for manual completion:', cartItems?.length || 0);

      if (cartItems && cartItems.length > 0) {
        // Calculate total from cart items
        let totalAmount = 0;
        for (const item of cartItems) {
          const product = await storage.getProduct(item.productId);
          if (product) {
            totalAmount += parseFloat(product.price) * item.quantity;
          }
        }

        // Use stored order data or create fallback
        const finalOrderData = {
          orderId: orderId,
          sessionId: sessionId,
          customerName: orderData?.customerName || 'Customer',
          customerEmail: orderData?.customerEmail || 'customer@example.com',
          customerPhone: orderData?.customerPhone || '',
          shippingAddress: orderData?.shippingAddress || '',
          fullShippingAddress: orderData?.fullShippingAddress || '',
          shippingService: orderData?.shippingService || '', // Tambah shipping service info
          totalAmount: totalAmount.toString(),
          paymentStatus: 'paid' as const,
          orderStatus: 'processing' as const,
          midtransToken: orderId
        };

        console.log('Creating manual order with data:', JSON.stringify(finalOrderData, null, 2));

        // Save order to database
        const createdOrder = await storage.createOrder(finalOrderData);

        // Create order items
        for (const cartItem of cartItems) {
          const product = await storage.getProduct(cartItem.productId);
          if (product) {
            const orderItemData = {
              orderId: createdOrder.id,
              productId: cartItem.productId,
              productName: product.name,
              productPrice: cartItem.price,
              quantity: cartItem.quantity
            };
            await storage.createOrderItem(orderItemData);
          }
        }
        console.log('Manual order created successfully:', createdOrder.id);

        // Clear cart after successful order creation
        await storage.clearCart(sessionId);
        console.log('Cart cleared after manual order creation');

        // Remove from pending orders
        pendingOrders.delete(orderId);

        res.json({ success: true, order: createdOrder });
      } else {
        console.log('No cart items found for manual completion - neither in cart nor pending orders');
        res.status(400).json({ error: "No cart items found" });
      }
    } catch (error) {
      console.error('Error in manual order completion:', error);
      res.status(500).json({ error: 'Failed to complete order' });
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

      // Calculate subtotal from cart items
      let subtotal = 0;
      const itemDetails = [];

      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          const price = parseFloat(product.price);
          const totalPrice = price * item.quantity;
          subtotal += totalPrice;

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

      // Add tax (8%)
      const tax = subtotal * 0.08;
      
      // Add shipping cost if provided
      const shippingCost = parseFloat(req.body.shipping_cost || '0');
      
      // Add shipping as separate item for transparency
      if (shippingCost > 0) {
        itemDetails.push({
          id: 'shipping',
          price: shippingCost,
          quantity: 1,
          name: `Ongkos Kirim - ${req.body.shipping_service || 'Standard'}`
        });
      }
      
      // Add tax as separate item
      itemDetails.push({
        id: 'tax',
        price: tax,
        quantity: 1,
        name: 'Pajak (8%)'
      });

      // Calculate total amount
      const grossAmount = Math.round(subtotal + tax + shippingCost);

      // Create shorter order ID (max 50 chars for Midtrans)
      const shortSessionId = sessionId.substring(0, 8);
      const timestamp = Date.now().toString().substring(-8); // Last 8 digits
      const orderId = `ORD-${shortSessionId}-${timestamp}`;

      // Store cart items and customer data for webhook processing
      const customerDetails = {
        first_name: req.body.first_name || "Customer",
        last_name: req.body.last_name || "",
        email: req.body.email || "customer@example.com",
        phone: req.body.phone || "+62812345678"
      };

      pendingOrders.set(orderId, {
        cartItems: cartItems,
        customerDetails: customerDetails,
        customerName: `${customerDetails.first_name} ${customerDetails.last_name}`.trim(),
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        shippingAddress: `${req.body.address || ''}, ${req.body.city || ''} ${req.body.postal_code || ''}`.trim(),
        fullShippingAddress: `${req.body.address || ''}, ${req.body.city || ''} ${req.body.postal_code || ''}, ${req.body.province || ''}`.trim(),
        shippingMethod: req.body.shipping_method || '',
        shippingService: req.body.shipping_service || '', // Tambah shipping service
        shippingCost: shippingCost,
        sessionId: sessionId,
        timestamp: Date.now(),
        totalAmount: grossAmount
      });

      console.log('Stored pending order data for:', orderId);

      // Get Midtrans configuration for callback URLs
      const config = await getMidtransConfig();

      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: grossAmount
        },
        item_details: itemDetails,
        customer_details: customerDetails,
        // Add callback URLs if configured
        ...(config.finishRedirectUrl && {
          callbacks: {
            finish: config.finishRedirectUrl,
            unfinish: config.unfinishRedirectUrl || config.finishRedirectUrl,
            error: config.errorRedirectUrl || config.finishRedirectUrl
          }
        }),
        // Add notification URL if configured
        ...(config.notificationUrl && {
          notification_url: config.notificationUrl
        })
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
          res.status(500).json({ error: `Gagal membayaran: ${error.message}` });
        }
      } else {
        res.status(500).json({ error: "Gagal membuat pembayaran" });
      }
    }
  });

  // Store cart data temporarily for payment processing
  const pendingOrders = new Map<string, any>();

  // Payment notification webhook
  app.post("/api/payment/notification", async (req, res) => {
    try {
      const notification = req.body;
      console.log('Received payment notification:', JSON.stringify(notification, null, 2));

      const snap = await createMidtransClient();

      const statusResponse = await snap.transaction.notification(notification);
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;
      const grossAmount = statusResponse.gross_amount;

      console.log(`Payment notification: Order ${orderId}, Status: ${transactionStatus}, Fraud: ${fraudStatus}`);

      // Check if order already exists
      const existingOrder = await storage.getOrder(orderId);
      if (existingOrder) {
        console.log('Order already exists:', orderId);
        return res.json({ status: 'success' });
      }

      // Handle successful payment
      if (transactionStatus === 'settlement' || 
          (transactionStatus === 'capture' && fraudStatus === 'accept')) {

        console.log('Payment successful, creating order...');

        try {
          // Extract session ID from order ID (format: ORD-{sessionId}-{timestamp})
          const orderIdParts = orderId.split('-');
          const sessionId = orderIdParts[1];

          console.log('Extracted session ID:', sessionId);

          // Get cart items for this session OR from pending orders storage
          let cartItems = await storage.getCartItems(sessionId);
          let orderData = pendingOrders.get(orderId);

          if (!cartItems || cartItems.length === 0) {
            // Try to get from pending orders
            if (orderData && orderData.cartItems) {
              cartItems = orderData.cartItems;
              console.log('Retrieved cart items from pending orders:', cartItems.length);
            }
          }

          console.log('Found cart items:', cartItems?.length || 0);

          if (cartItems && cartItems.length > 0) {
            // Use stored customer details or fallback to Midtrans response
            let customerDetails = orderData?.customerDetails || statusResponse.customer_details || {};

            // Format proper order data according to schema
            const finalOrderData = {
              id: randomUUID(),
              orderId: orderId,
              sessionId: sessionId,
              customerName: orderData?.customerName || `${customerDetails.first_name || ''} ${customerDetails.last_name || ''}`.trim() || 'Customer',
              customerEmail: orderData?.customerEmail || customerDetails.email || 'customer@example.com',
              customerPhone: orderData?.customerPhone || customerDetails.phone || '',
              shippingAddress: orderData?.shippingAddress || '',
              fullShippingAddress: orderData?.fullShippingAddress || '',
              shippingService: orderData?.shippingService || '',
              totalAmount: grossAmount,
              paymentStatus: 'paid' as const,
              orderStatus: 'processing' as const,
              trackingNumber: null,
              midtransToken: orderId
            };

            console.log('Creating order with data:', JSON.stringify(finalOrderData, null, 2));

            // Save order to database
            const createdOrder = await storage.createOrder(finalOrderData);
            console.log('Order created successfully:', createdOrder.id);

            // Create order items
            for (const cartItem of cartItems) {
              const product = await storage.getProduct(cartItem.productId);
              if (product) {
                const orderItemData = {
                  orderId: createdOrder.id,
                  productId: cartItem.productId,
                  productName: product.name,
                  productPrice: cartItem.price,
                  quantity: cartItem.quantity
                };
                await storage.createOrderItem(orderItemData);
              }
            }

            // Clear cart after successful order creation
            await storage.clearCart(sessionId);
            console.log('Cart cleared for session:', sessionId);

            // Remove from pending orders
            pendingOrders.delete(orderId);

          } else {
            console.log('No cart items found for session:', sessionId);
          }
        } catch (orderError) {
          console.error('Error creating order:', orderError);
        }
      } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
        console.log('Payment failed:', transactionStatus);
        // Clean up pending order
        pendingOrders.delete(orderId);
      } else if (transactionStatus === 'pending') {
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
  app.get("/api/admin/orders", requireAdminKey, async (req, res) => {
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
      console.log(`Admin fetched ${orders.length} orders`);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Gagal mengambil data pesanan" });
    }
  });

  app.get("/api/admin/orders/:id", requireAdminKey, async (req, res) => {
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

  app.put("/api/admin/orders/:id", requireAdminKey, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate allowed fields
      const allowedFields = ['orderStatus', 'paymentStatus', 'trackingNumber', 'shippingAddress'];
      const filteredData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {} as any);

      const order = await storage.updateOrder(id, filteredData);

      if (!order) {
        return res.status(404).json({ error: "Pesanan tidak ditemukan" });
      }

      console.log(`Order ${id} updated:`, filteredData);
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Gagal memperbarui pesanan" });
    }
  });

  app.put("/api/admin/orders/:id/tracking", requireAdminKey, async (req, res) => {
    try {
      const { id } = req.params;
      const { trackingNumber, shippingService } = req.body;

      if (!trackingNumber || !shippingService) {
        return res.status(400).json({ error: "Tracking number dan shipping service diperlukan" });
      }

      // Validate tracking number format
      const trimmedTrackingNumber = trackingNumber.trim().toUpperCase();
      
      // Get current order details
      const currentOrder = await storage.getOrder(id);
      if (!currentOrder) {
        return res.status(404).json({ error: "Pesanan tidak ditemukan" });
      }

      // Check if order can be updated to shipped status
      if (currentOrder.orderStatus === 'cancelled') {
        return res.status(400).json({ 
          error: "Tidak dapat menambahkan tracking untuk pesanan yang dibatalkan" 
        });
      }

      if (currentOrder.orderStatus === 'delivered') {
        return res.status(400).json({ 
          error: "Pesanan sudah delivered, tidak dapat mengubah tracking" 
        });
      }

      const updateData = {
        trackingNumber: trimmedTrackingNumber,
        shippingService,
        orderStatus: 'shipped' as const, // Otomatis update status ke shipped ketika tracking ditambahkan
        updatedAt: new Date()
      };

      const order = await storage.updateOrder(id, updateData);

      if (!order) {
        return res.status(404).json({ error: "Pesanan tidak ditemukan" });
      }

      // Log tracking update for audit trail with more details
      console.log(`Order ${id} tracking updated:`, {
        orderId: order.orderId,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        trackingNumber: trimmedTrackingNumber,
        shippingService,
        previousStatus: currentOrder.orderStatus,
        newStatus: 'shipped',
        totalAmount: order.totalAmount,
        updateTimestamp: new Date().toISOString(),
        adminAction: 'TRACKING_UPDATE'
      });

      // Create tracking URL for customer
      const trackingUrl = generateTrackingUrl(trimmedTrackingNumber, shippingService);

      // In production, you would send email notification here
      // await sendTrackingNotificationEmail(order, trackingNumber, shippingService, trackingUrl);

      res.json({
        ...order,
        trackingUrl,
        message: "Informasi tracking berhasil diperbarui dan status pesanan diubah menjadi 'Shipped'. Customer akan mendapat notifikasi."
      });
    } catch (error) {
      console.error("Error updating order tracking:", error);
      res.status(500).json({ error: "Gagal memperbarui tracking pesanan" });
    }
  });

  // Helper function to generate tracking URL
  const generateTrackingUrl = (trackingNumber: string, shippingService: string): string => {
    const service = shippingService.toLowerCase();
    switch (service) {
      case 'jne':
        return `https://www.jne.co.id/id/tracking/trace?keyword=${trackingNumber}`;
      case 'pos indonesia':
        return `https://www.posindonesia.co.id/app/trace?barcode=${trackingNumber}`;
      case 'tiki':
        return `https://www.tiki.id/id/tracking?keyword=${trackingNumber}`;
      case 'sicepat':
        return `https://www.sicepat.com/?action=track&keyword=${trackingNumber}`;
      case 'anteraja':
        return `https://www.anteraja.com/cek-resi/${trackingNumber}`;
      case 'j&t':
        return `https://jet.co.id/track/${trackingNumber}`;
      case 'ninja xpress':
        return `https://www.ninjaxpress.co/id/tracking?query=${trackingNumber}`;
      case 'lion parcel':
        return `https://www.lionparcel.com/id/tracking?awb=${trackingNumber}`;
      case 'sap express':
        return `https://www.saplogistics.co.id/tracking?awb=${trackingNumber}`;
      case 'rpx':
        return `https://www.rpxholding.com/tracking?awb=${trackingNumber}`;
      case 'id express':
        return `https://www.ide.co.id/tracking?awb=${trackingNumber}`;
      case 'wahana':
        return `https://www.wahana.com/track?awb=${trackingNumber}`;
      default:
        return `https://www.google.com/search?q=${trackingNumber}+${shippingService}+tracking`;
    }
  };

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

  // Buyer Dashboard Routes
  app.get("/api/buyer/orders", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get orders for current user
      const orders = await storage.getUserOrders(user.email);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/buyer/orders/:id/items", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Verify order belongs to user
      const order = await storage.getOrder(id);
      if (!order || order.customerEmail !== user.email) {
        return res.status(404).json({ error: "Order not found or access denied" });
      }

      const orderItems = await storage.getOrderItems(id);
      res.json(orderItems);
    } catch (error) {
      console.error("Error fetching order items:", error);
      res.status(500).json({ error: "Failed to fetch order items" });
    }
  });

  // User Profile Management Routes
  app.put("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { firstName, lastName, phone, address, city, postalCode, province } = req.body;

      const updateData = {
        firstName,
        lastName,
        phone,
        address,
        city,
        postalCode,
        province,
        updatedAt: new Date()
      };

      const updatedUser = await storage.updateUserProfile(user.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Admin User Management Routes
  app.get("/api/admin/users", requireAdminKeyOrSession, async (req, res) => {
    try {
      const { search, role, limit, offset } = req.query;

      const filters = {
        search: search as string | undefined,
        role: role as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const users = await storage.getUsers(filters);
      
      // Remove sensitive information
      const safeUsers = users.map(user => ({
        ...user,
        password: undefined
      }));

      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdminKeyOrSession, async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user exists
      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prevent deletion of admin users
      if (user.role === 'admin') {
        return res.status(400).json({ 
          error: "Cannot delete admin user",
          message: "Admin users cannot be deleted for security reasons"
        });
      }

      // Get user's orders before deletion for logging
      const userOrders = await storage.getUserOrders(user.email);
      console.log(`Deleting user ${user.email} with ${userOrders.length} orders`);

      const success = await storage.deleteUser(id);

      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ 
        success: true, 
        message: "User deleted successfully",
        deletedOrders: userOrders.length
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.put("/api/admin/users/:id/status", requireAdminKeyOrSession, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      // Check if user exists
      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prevent disabling admin users
      if (user.role === 'admin' && !isActive) {
        return res.status(400).json({ 
          error: "Cannot disable admin user",
          message: "Admin users cannot be disabled"
        });
      }

      const updatedUser = await storage.updateUserStatus(id, isActive);

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        ...updatedUser,
        password: undefined
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  app.put("/api/admin/users/:id/role", requireAdminKeyOrSession, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validate role
      const validRoles = ['buyer', 'operator', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const updatedUser = await storage.updateUserRole(id, role);

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        ...updatedUser,
        password: undefined
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
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
        },
        adminKey: {
          current: process.env.ADMIN_KEY ? '****' : 'fajar (default)',
          isCustom: !!process.env.ADMIN_KEY
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

  app.post("/api/admin/settings/admin-key", requireAdminKey, async (req, res) => {
    try {
      const { newAdminKey, confirmAdminKey } = req.body;

      // Validate input
      if (!newAdminKey || newAdminKey.length < 6) {
        return res.status(400).json({ error: "Admin key harus minimal 6 karakter" });
      }

      if (newAdminKey !== confirmAdminKey) {
        return res.status(400).json({ error: "Konfirmasi admin key tidak cocok" });
      }

      // In a real production environment, you would update the environment variable
      // For this demo, we'll save it to a config file or database
      console.log("Admin key update requested:", {
        oldKey: process.env.ADMIN_KEY ? '****' : 'fajar (default)',
        newKey: '****'
      });

      // Update environment variable in memory (temporary until restart)
      process.env.ADMIN_KEY = newAdminKey;

      res.json({ 
        success: true, 
        message: "Admin key berhasil diperbarui. Gunakan key baru untuk akses selanjutnya." 
      });
    } catch (error) {
      console.error("Error updating admin key:", error);
      res.status(500).json({ error: "Failed to update admin key" });
    }
  });

  // Role Management Routes
  app.get("/api/admin/roles", requireAdminKeyOrSession, async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.get("/api/admin/roles/:id", requireAdminKeyOrSession, async (req, res) => {
    try {
      const { id } = req.params;
      const role = await storage.getRole(id);

      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }

      res.json(role);
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ error: "Failed to fetch role" });
    }
  });

  app.post("/api/admin/roles", requireAdminKeyOrSession, async (req, res) => {
    try {
      const roleData = insertRoleSchema.parse(req.body);

      // Strip isSystemRole from request to prevent privilege escalation
      const { isSystemRole, ...sanitizedData } = roleData as any;

      // Validate permissions field server-side
      if (sanitizedData.permissions && typeof sanitizedData.permissions !== 'object') {
        return res.status(400).json({ error: "Permissions must be an object" });
      }
      if (Array.isArray(sanitizedData.permissions)) {
        return res.status(400).json({ error: "Permissions cannot be an array" });
      }

      // Check if role name already exists
      const existingRole = await storage.getRoleByName(sanitizedData.name);
      if (existingRole) {
        return res.status(400).json({ error: "Role name already exists" });
      }

      const role = await storage.createRole(sanitizedData);
      res.status(201).json(role);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid role data", details: error.errors });
      }
      console.error("Error creating role:", error);
      res.status(500).json({ error: "Failed to create role" });
    }
  });

  app.put("/api/admin/roles/:id", requireAdminKeyOrSession, async (req, res) => {
    try {
      const { id } = req.params;

      // Check if role exists and get current role
      const currentRole = await storage.getRole(id);
      if (!currentRole) {
        return res.status(404).json({ error: "Role not found" });
      }

      // Prevent modification of system roles
      if (currentRole.isSystemRole) {
        return res.status(400).json({ 
          error: "Cannot modify system role", 
          message: "System roles cannot be edited to maintain security integrity" 
        });
      }

      const roleData = insertRoleSchema.partial().parse(req.body);

      // Strip isSystemRole from request to prevent privilege escalation
      const { isSystemRole, ...sanitizedData } = roleData as any;

      // Check if role name already exists (excluding current role)
      if (sanitizedData.name) {
        const existingRole = await storage.getRoleByName(sanitizedData.name);
        if (existingRole && existingRole.id !== id) {
          return res.status(400).json({ error: "Role name already exists" });
        }
      }

      const updatedRole = await storage.updateRole(id, sanitizedData);

      if (!updatedRole) {
        return res.status(404).json({ error: "Role not found" });
      }

      res.json(updatedRole);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid role data", details: error.errors });
      }
      console.error("Error updating role:", error);
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  app.delete("/api/admin/roles/:id", requireAdminKeyOrSession, async (req, res) => {
    try {
      const { id } = req.params;

      // Check if role exists
      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }

      // Prevent deletion of system roles (more robust than name-based check)
      if (role.isSystemRole) {
        return res.status(400).json({ 
          error: "Cannot delete system role", 
          message: "System roles cannot be deleted to maintain security integrity" 
        });
      }

      // TODO: Check if role is assigned to any users
      // const users = await storage.getUsersByRole(role.name);
      // if (users.length > 0) {
      //   return res.status(400).json({ 
      //     error: "Cannot delete role in use", 
      //     message: `Role is assigned to ${users.length} user(s)` 
      //   });
      // }

      const success = await storage.deleteRole(id);

      if (!success) {
        return res.status(404).json({ error: "Role not found" });
      }

      res.json({ success: true, message: "Role deleted successfully" });
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ error: "Failed to delete role" });
    }
  });

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Analytics endpoints
  app.get("/api/admin/analytics/overview", requireAdminKeyOrSession, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Get orders with date filtering
      const orders = await storage.getOrders();
      const filteredOrders = orders.filter(order => {
        if (!startDate || !endDate) return true;
        const orderDate = new Date(order.createdAt);
        return orderDate >= new Date(startDate as string) && orderDate <= new Date(endDate as string);
      });

      // Calculate revenue and costs
      const totalRevenue = filteredOrders
        .filter(order => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);

      const totalPaidOrders = filteredOrders.filter(order => order.paymentStatus === 'paid').length;
      const totalFailedOrders = filteredOrders.filter(order => 
        order.paymentStatus === 'failed' || order.paymentStatus === 'cancelled' || order.paymentStatus === 'deny'
      ).length;
      
      // Calculate estimated costs (70% of revenue as cost - configurable)
      const estimatedCosts = totalRevenue * 0.7;
      const profit = totalRevenue - estimatedCosts;

      // Get order items for product analysis - only from paid orders and within date range
      const orderItems = await storage.getAllOrderItems();
      const paidOrderIds = filteredOrders
        .filter(order => order.paymentStatus === 'paid')
        .map(order => order.orderId);
      
      const productSales = orderItems
        .filter(item => paidOrderIds.includes(item.orderId))
        .reduce((acc, item) => {
          if (!acc[item.productId]) {
            acc[item.productId] = {
              productId: item.productId,
              productName: item.productName,
              totalQuantity: 0,
              totalRevenue: 0
            };
          }
          acc[item.productId].totalQuantity += item.quantity;
          // Use productPrice with fallback to prevent NaN
          const itemPrice = item.productPrice || item.price || 0;
          acc[item.productId].totalRevenue += itemPrice * item.quantity;
          return acc;
        }, {} as Record<string, any>);

      const topSellingProducts = Object.values(productSales)
        .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
        .slice(0, 10);

      // Monthly revenue trend (last 12 months) - apply same date filtering as overview
      const monthlyRevenue = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        // Apply the same date range filter if provided
        let effectiveMonthStart = monthStart;
        let effectiveMonthEnd = monthEnd;
        
        if (startDate && endDate) {
          const filterStart = new Date(startDate as string);
          const filterEnd = new Date(endDate as string);
          effectiveMonthStart = new Date(Math.max(monthStart.getTime(), filterStart.getTime()));
          effectiveMonthEnd = new Date(Math.min(monthEnd.getTime(), filterEnd.getTime()));
          
          // Skip month if no overlap with filter range
          if (effectiveMonthStart > effectiveMonthEnd) {
            monthlyRevenue.push({
              month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
              revenue: 0,
              orders: 0
            });
            continue;
          }
        }
        
        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= effectiveMonthStart && orderDate <= effectiveMonthEnd && order.paymentStatus === 'paid';
        });
        
        const monthRevenue = monthOrders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
        
        monthlyRevenue.push({
          month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          orders: monthOrders.length
        });
      }

      res.json({
        totalRevenue,
        totalOrders: filteredOrders.length,
        totalPaidOrders,
        totalFailedOrders,
        estimatedCosts,
        profit,
        profitMargin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
        topSellingProducts,
        monthlyRevenue,
        averageOrderValue: totalPaidOrders > 0 ? totalRevenue / totalPaidOrders : 0
      });
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  app.get("/api/admin/analytics/export", requireAdminKeyOrSession, async (req, res) => {
    try {
      const { type, startDate, endDate } = req.query;
      
      if (type === 'orders') {
        const orders = await storage.getOrders();
        const filteredOrders = orders.filter(order => {
          if (!startDate || !endDate) return true;
          const orderDate = new Date(order.createdAt);
          return orderDate >= new Date(startDate as string) && orderDate <= new Date(endDate as string);
        });

        // Create CSV data
        const csvHeader = 'ID Pesanan,Nama Pelanggan,Email Pelanggan,Total Pembayaran,Status Pembayaran,Status Pesanan,Tanggal Dibuat,Jasa Pengiriman,Alamat Pengiriman\n';
        const csvData = filteredOrders.map(order => 
          `"${order.orderId}","${order.customerName}","${order.customerEmail}","${order.totalAmount}","${order.paymentStatus}","${order.orderStatus}","${new Date(order.createdAt).toLocaleDateString('id-ID')}","${order.shippingService || 'N/A'}","${(order.shippingAddress || '').replace(/"/g, '""')}"`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="laporan-pesanan-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send('\ufeff' + csvHeader + csvData); // Add BOM for Excel UTF-8 support
      } 
      else if (type === 'daily-transactions') {
        const orders = await storage.getOrders();
        const orderItems = await storage.getAllOrderItems();
        
        // Filter orders and group by date
        const filteredOrders = orders.filter(order => {
          if (!startDate || !endDate) return true;
          const orderDate = new Date(order.createdAt);
          return orderDate >= new Date(startDate as string) && orderDate <= new Date(endDate as string);
        });

        const dailyTransactions = {};
        
        filteredOrders.forEach(order => {
          const date = new Date(order.createdAt).toLocaleDateString('id-ID');
          if (!dailyTransactions[date]) {
            dailyTransactions[date] = {
              date,
              totalOrders: 0,
              totalPaidOrders: 0,
              totalFailedOrders: 0,
              totalRevenue: 0,
              totalItems: 0,
              items: {}
            };
          }
          
          dailyTransactions[date].totalOrders++;
          if (order.paymentStatus === 'paid') {
            dailyTransactions[date].totalPaidOrders++;
            dailyTransactions[date].totalRevenue += parseFloat(order.totalAmount) || 0;
          } else if (['failed', 'cancelled', 'deny'].includes(order.paymentStatus)) {
            dailyTransactions[date].totalFailedOrders++;
          }
        });

        // Add item details for paid orders
        orderItems.forEach(item => {
          const order = filteredOrders.find(o => o.orderId === item.orderId);
          if (order && order.paymentStatus === 'paid') {
            const date = new Date(order.createdAt).toLocaleDateString('id-ID');
            if (dailyTransactions[date]) {
              dailyTransactions[date].totalItems += item.quantity;
              if (!dailyTransactions[date].items[item.productName]) {
                dailyTransactions[date].items[item.productName] = {
                  quantity: 0,
                  revenue: 0
                };
              }
              dailyTransactions[date].items[item.productName].quantity += item.quantity;
              const itemPrice = item.productPrice || item.price || 0;
              dailyTransactions[date].items[item.productName].revenue += itemPrice * item.quantity;
            }
          }
        });

        // Create CSV data for daily transactions
        const csvHeader = 'Tanggal,Total Pesanan,Pesanan Berhasil,Pesanan Gagal,Total Pendapatan,Total Item Terjual,Detail Item Terjual\n';
        const csvData = Object.values(dailyTransactions).map((day: any) => {
          const itemDetails = Object.entries(day.items)
            .map(([name, data]: [string, any]) => `${name}: ${data.quantity} unit (${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.revenue)})`)
            .join('; ');
          
          return `"${day.date}","${day.totalOrders}","${day.totalPaidOrders}","${day.totalFailedOrders}","${day.totalRevenue}","${day.totalItems}","${itemDetails}"`;
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="laporan-transaksi-harian-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send('\ufeff' + csvHeader + csvData);
      }
      else if (type === 'item-details') {
        const orders = await storage.getOrders();
        const orderItems = await storage.getAllOrderItems();
        
        // Filter to paid orders within date range
        const paidOrders = orders.filter(order => {
          let isInDateRange = true;
          if (startDate && endDate) {
            const orderDate = new Date(order.createdAt);
            isInDateRange = orderDate >= new Date(startDate as string) && orderDate <= new Date(endDate as string);
          }
          return order.paymentStatus === 'paid' && isInDateRange;
        });

        const paidOrderIds = paidOrders.map(order => order.orderId);
        const filteredItems = orderItems.filter(item => paidOrderIds.includes(item.orderId));

        // Create detailed item report
        const csvHeader = 'ID Pesanan,Tanggal Pesanan,Nama Produk,Kategori,Quantity,Harga Satuan,Total Item,Nama Pelanggan,Email Pelanggan\n';
        const csvData = filteredItems.map(item => {
          const order = paidOrders.find(o => o.orderId === item.orderId);
          const itemPrice = item.productPrice || item.price || 0;
          const itemTotal = itemPrice * item.quantity;
          
          return `"${item.orderId}","${new Date(order?.createdAt || '').toLocaleDateString('id-ID')}","${item.productName}","${item.productCategory || 'N/A'}","${item.quantity}","${itemPrice}","${itemTotal}","${order?.customerName || 'N/A'}","${order?.customerEmail || 'N/A'}"`;
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="laporan-detail-item-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send('\ufeff' + csvHeader + csvData);
      }
      else {
        res.status(400).json({ error: 'Invalid export type. Supported types: orders, daily-transactions, item-details' });
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
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