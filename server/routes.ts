import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireAdmin, requireAdminKey, requireAdminKeyOrSession } from "./auth";
import {
  insertProductSchema,
  insertCategorySchema,
  insertCartItemSchema,
  insertContactSubmissionSchema,
  insertOrderSchema,
  insertChatRoomSchema,
  insertChatMessageSchema,
  insertChatParticipantSchema,
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
      res.json(products);
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
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const cartItems = await storage.getCartItems(sessionId);
      
      // Enrich cart items with product details
      const enrichedItems = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product,
          };
        })
      );
      
      res.json(enrichedItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = req.sessionID;
      
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        sessionId,
      });
      
      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error adding to cart:", error);
      res.status(500).json({ error: "Failed to add item to cart" });
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

  // Initialize Midtrans client
  const snap = new midtransClient.Snap({
    isProduction: false, // Set to true for production
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
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
          
          itemDetails.push({
            id: product.id,
            price: price,
            quantity: item.quantity,
            name: product.name
          });
        }
      }

      const orderId = `ORDER-${sessionId}-${Date.now()}`;
      
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

      const transaction = await snap.createTransaction(parameter);
      
      res.json({
        token: transaction.token,
        redirect_url: transaction.redirect_url,
        order_id: orderId
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ error: "Gagal membuat pembayaran" });
    }
  });

  // Payment notification webhook
  app.post("/api/payment/notification", async (req, res) => {
    try {
      const notification = req.body;
      
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

  // Admin routes for product management
  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Data produk tidak valid", details: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Gagal membuat produk" });
    }
  });

  app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      
      if (!product) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Data produk tidak valid", details: error.errors });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Gagal memperbarui produk" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
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

  // Chat API routes
  app.get("/api/chat/rooms", requireAdminKey, async (req, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ error: "Failed to fetch chat rooms" });
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
      const hasAccess = req.isAdminKeyAuth || 
                       room.customerSessionId === sessionId || 
                       (req.user && req.user.isAdmin);
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(room);
    } catch (error) {
      console.error("Error fetching chat room:", error);
      res.status(500).json({ error: "Failed to fetch chat room" });
    }
  });

  app.get("/api/chat/rooms/:roomId/messages", requireAdminKeyOrSession, async (req, res) => {
    try {
      const { roomId } = req.params;
      const sessionId = req.sessionID;
      
      // Verify access to room
      const room = await storage.getChatRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: "Chat room not found" });
      }
      
      // Admin key auth has access to all rooms, session auth only to own rooms
      const hasAccess = req.isAdminKeyAuth || 
                       room.customerSessionId === sessionId || 
                       (req.user && req.user.isAdmin);
      
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
        return res.status(400).json({ error: "Invalid chat room data", details: error.errors });
      }
      console.error("Error creating chat room:", error);
      res.status(500).json({ error: "Failed to create chat room" });
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
                       (req.user && req.user.isAdmin);
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        chatRoomId: roomId,
        senderType: req.user?.isAdmin ? 'admin' : 'customer',
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