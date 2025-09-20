import {
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type CartItem,
  type InsertCartItem,
  type ContactSubmission,
  type InsertContactSubmission,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type User,
  type InsertUser,
  type ChatRoom,
  type InsertChatMessage,
  type ChatParticipant,
  type InsertChatParticipant,
  type MidtransConfig,
  type InsertMidtransConfig,
  type Role,
  type InsertRole
} from "@shared/schema";
import { randomUUID } from "crypto";
import * as crypto from 'crypto';

// Storage interface for music store functionality
export interface IStorage {
  // Product methods
  getProduct(id: string): Promise<Product | undefined>;
  getProducts(filters?: { categoryId?: string; search?: string; limit?: number; offset?: number }): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Category methods
  getCategory(id: string): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Cart methods
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(sessionId: string, id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(sessionId: string, id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;
  getCart(sessionId: string): Promise<(CartItem & { name: string; image: string; category: string })[]>;

  // Contact form methods
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;

  // Order methods
  getOrder(id: string): Promise<Order | undefined>;
  getOrders(filters?: { customerEmail?: string; paymentStatus?: string; orderStatus?: string; limit?: number; offset?: number }): Promise<Order[]>;
  createOrder(orderData: any, cartItems?: CartItem[]): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;

  // Order item methods
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  getAllOrderItems(): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // User authentication methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Chat methods
  getChatRoom(id: string): Promise<ChatRoom | undefined>;
  getChatRooms(): Promise<ChatRoom[]>;
  getChatMessages(roomId: string): Promise<ChatMessage[]>;
  createChatRoom(chatRoom: InsertChatRoom): Promise<ChatRoom>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateChatRoom(id: string, updateData: Partial<InsertChatRoom>): Promise<ChatRoom | undefined>;
  updateChatRoomLastMessage(roomId: string): Promise<void>;

  // Midtrans configuration methods
  getMidtransConfig(): Promise<MidtransConfig | undefined>;
  createMidtransConfig(config: InsertMidtransConfig): Promise<MidtransConfig>;
  updateMidtransConfig(id: string, config: Partial<InsertMidtransConfig>): Promise<MidtransConfig | undefined>;

  // Role management methods
  getAllRoles(): Promise<Role[]>;
  getRole(id: string): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: string): Promise<boolean>;

  // User Management Methods
  getUsers(filters: {
    search?: string;
    role?: string;
    limit?: number;
    offset?: number;
  }): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  getUserOrders(email: string): Promise<Order[]>;
  updateUserProfile(id: string, updateData: Partial<User>): Promise<User | null>;
  updateUserStatus(id: string, isActive: boolean): Promise<User | null>;
  updateUserRole(id: string, role: string): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private categories: Map<string, Category>;
  private cartItems: Map<string, CartItem>;
  private contactSubmissions: Map<string, ContactSubmission>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private users: Map<string, User>;
  private chatRooms: Map<string, ChatRoom>;
  private chatMessages: Map<string, ChatMessage>;
  private chatParticipants: Map<string, ChatParticipant>;
  private midtransConfigs: Map<string, MidtransConfig>;
  private roles: Map<string, Role>;

  constructor() {
    this.products = new Map();
    this.categories = new Map();
    this.cartItems = new Map();
    this.contactSubmissions = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.users = new Map();
    this.chatRooms = new Map();
    this.chatMessages = new Map();
    this.chatParticipants = new Map();
    this.midtransConfigs = new Map();
    this.roles = new Map();

    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample categories directly
    const guitarCategoryId = randomUUID();
    const drumCategoryId = randomUUID();

    this.categories.set(guitarCategoryId, {
      id: guitarCategoryId,
      name: "Electric Guitars",
      description: "Premium electric guitars from legendary brands",
      slug: "electric-guitars",
      createdAt: new Date()
    });

    this.categories.set(drumCategoryId, {
      id: drumCategoryId,
      name: "Drum Kits",
      description: "Professional drum sets and percussion instruments",
      slug: "drum-kits",
      createdAt: new Date()
    });

    // Create sample products directly
    const now = new Date();
    const products = [
      {
        id: randomUUID(),
        name: "1959 Gibson Les Paul Standard Vintage Sunburst",
        description: "Authentic vintage Gibson Les Paul with incredible tone and sustain. A true rock legend's choice.",
        price: "2499.99",
        originalPrice: "2799.99",
        categoryId: guitarCategoryId,
        imageUrl: "/assets/generated_images/Vintage_guitars_collection_1895215a.png",
        rating: "4.8",
        reviewCount: 24,
        isNew: false,
        isSale: true,
        inStock: true,
        stockQuantity: 3,
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        name: "Pearl Export Series 5-Piece Drum Kit",
        description: "Professional quality drum kit perfect for studio recording and live performances.",
        price: "899.99",
        originalPrice: "1199.99",
        categoryId: drumCategoryId,
        imageUrl: "/assets/generated_images/Vintage_drum_kit_f4ce4b67.png",
        rating: "4.6",
        reviewCount: 89,
        isNew: false,
        isSale: true,
        inStock: true,
        stockQuantity: 5,
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        name: "Fender American Professional II Stratocaster",
        description: "Modern classic with timeless Stratocaster tone and feel. Made in USA with premium components.",
        price: "1799.99",
        originalPrice: null,
        categoryId: guitarCategoryId,
        imageUrl: "/assets/generated_images/Vintage_guitars_collection_1895215a.png",
        rating: "4.7",
        reviewCount: 67,
        isNew: false,
        isSale: false,
        inStock: true,
        stockQuantity: 8,
        createdAt: now,
        updatedAt: now
      },
      {
        id: randomUUID(),
        name: "DW Collector's Series Maple Drum Kit",
        description: "Premium maple shell construction with exceptional tone and projection. Professional touring grade.",
        price: "3299.99",
        originalPrice: null,
        categoryId: drumCategoryId,
        imageUrl: "/assets/generated_images/Vintage_drum_kit_f4ce4b67.png",
        rating: "4.9",
        reviewCount: 34,
        isNew: false,
        isSale: false,
        inStock: true,
        stockQuantity: 2,
        createdAt: now,
        updatedAt: now
      }
    ];

    products.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(filters?: { categoryId?: string; search?: string; limit?: number; offset?: number }): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (filters?.categoryId) {
      products = products.filter(p => p.categoryId === filters.categoryId);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    const offset = filters?.offset || 0;
    const limit = filters?.limit || products.length;

    return products.slice(offset, offset + limit);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const now = new Date();

    // Process image URL - if it's a data URL, keep it as is, otherwise validate
    let processedImageUrl = insertProduct.imageUrl ?? null;
    if (processedImageUrl && !processedImageUrl.startsWith('data:') && !processedImageUrl.startsWith('http') && !processedImageUrl.startsWith('/')) {
      processedImageUrl = null; // Invalid URL format
    }

    const product: Product = {
      ...insertProduct,
      description: insertProduct.description ?? null,
      originalPrice: insertProduct.originalPrice ?? null,
      imageUrl: processedImageUrl,
      rating: insertProduct.rating ?? "0",
      reviewCount: insertProduct.reviewCount ?? 0,
      isNew: insertProduct.isNew ?? false,
      isSale: insertProduct.isSale ?? false,
      inStock: insertProduct.inStock ?? true,
      stockQuantity: insertProduct.stockQuantity ?? 0,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    // Process image URL if provided
    let processedUpdateData = { ...updateData };
    if (updateData.imageUrl !== undefined) {
      if (updateData.imageUrl && !updateData.imageUrl.startsWith('data:') && !updateData.imageUrl.startsWith('http') && !updateData.imageUrl.startsWith('/')) {
        processedUpdateData.imageUrl = null; // Invalid URL format
      }
    }

    const updatedProduct: Product = {
      ...product,
      ...processedUpdateData,
      updatedAt: new Date()
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Category methods
  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(c => c.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    // Normalize slug first, then check uniqueness
    const normalizedSlug = this.normalizeSlug(insertCategory.slug);
    const existingCategory = Array.from(this.categories.values()).find(c => c.slug === normalizedSlug);
    if (existingCategory) {
      throw new Error('Category with this slug already exists');
    }

    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      description: insertCategory.description ?? null,
      slug: normalizedSlug,
      id,
      createdAt: new Date()
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    // Check slug uniqueness if slug is being updated
    if (updateData.slug) {
      const normalizedSlug = this.normalizeSlug(updateData.slug);
      if (normalizedSlug !== category.slug) {
        const existingCategory = Array.from(this.categories.values()).find(c => c.slug === normalizedSlug && c.id !== id);
        if (existingCategory) {
          throw new Error('Category with this slug already exists');
        }
      }
      updateData.slug = normalizedSlug;
    }

    const updatedCategory: Category = {
      ...category,
      ...updateData
    };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    // Check if category is being used by any products
    const productsInCategory = Array.from(this.products.values()).filter(p => p.categoryId === id);
    if (productsInCategory.length > 0) {
      throw new Error(`Cannot delete category: ${productsInCategory.length} products are using this category`);
    }

    return this.categories.delete(id);
  }

  private normalizeSlug(slug: string): string {
    return slug.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.sessionId === insertCartItem.sessionId && item.productId === insertCartItem.productId
    );

    if (existingItem) {
      // Update quantity
      const updated = await this.updateCartItem(insertCartItem.sessionId, existingItem.id, existingItem.quantity + insertCartItem.quantity);
      return updated || existingItem;
    }

    const id = randomUUID();
    const now = new Date();

    // Ensure price is properly set as string (database uses decimal)
    let price = insertCartItem.price;
    if (typeof price === 'number') {
      price = price.toString();
    } else if (typeof price !== 'string') {
      price = '0';
    }

    const cartItem: CartItem = {
      ...insertCartItem,
      price: price,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(sessionId: string, id: string, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem || cartItem.sessionId !== sessionId) return undefined;

    const updatedItem: CartItem = {
      ...cartItem,
      quantity,
      updatedAt: new Date()
    };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(sessionId: string, id: string): Promise<boolean> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem || cartItem.sessionId !== sessionId) return false;

    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const cartItems = Array.from(this.cartItems.entries()).filter(
      ([_, item]) => item.sessionId === sessionId
    );

    cartItems.forEach(([id]) => this.cartItems.delete(id));
    return true;
  }

  async getCart(sessionId: string): Promise<(CartItem & { name: string; image: string; category: string })[]> {
    const result = Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId).map(item => {
      const product = this.products.get(item.productId);
      const category = product ? this.categories.get(product.categoryId) : undefined;

      // Ensure price is consistent with database (string) but display as number
      let itemPrice = item.price;
      let numericPrice = typeof itemPrice === 'string' ? parseFloat(itemPrice) : itemPrice;
      if (isNaN(numericPrice)) {
        // Fallback to product price if cart item price is invalid
        const productPrice = product ? parseFloat(product.price) : 0;
        numericPrice = productPrice;
      }

      return {
        ...item,
        price: item.price, // Keep original price as string from database
        name: product?.name ?? 'Unknown Product',
        image: product?.imageUrl ?? '/placeholder-image.jpg',
        category: category?.name ?? 'Unknown Category'
      };
    });
    return result;
  }

  // Contact form methods
  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = randomUUID();
    const submission: ContactSubmission = {
      ...insertSubmission,
      id,
      createdAt: new Date()
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values());
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrders(filters?: { customerEmail?: string; paymentStatus?: string; orderStatus?: string; limit?: number; offset?: number }): Promise<Order[]> {
    let orders = Array.from(this.orders.values());

    if (filters?.customerEmail) {
      orders = orders.filter(o => o.customerEmail.toLowerCase().includes(filters.customerEmail!.toLowerCase()));
    }

    if (filters?.paymentStatus) {
      orders = orders.filter(o => o.paymentStatus === filters.paymentStatus);
    }

    if (filters?.orderStatus) {
      orders = orders.filter(o => o.orderStatus === filters.orderStatus);
    }

    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const offset = filters?.offset || 0;
    const limit = filters?.limit || orders.length;

    return orders.slice(offset, offset + limit);
  }

  async createOrder(orderData: any, cartItems?: CartItem[]): Promise<Order> {
    const id = orderData.id || randomUUID();
    const now = new Date();

    // Create order with proper data structure
    const order: Order = {
      id,
      orderId: orderData.orderId || id,
      sessionId: orderData.sessionId || 'unknown',
      customerName: orderData.customerName || orderData.customerData?.first_name || 'Unknown Customer',
      customerEmail: orderData.customerEmail || orderData.customerData?.email || 'unknown@example.com',
      customerPhone: orderData.customerPhone || orderData.customerData?.phone || null,
      shippingAddress: orderData.shippingAddress || orderData.customerData?.address || 'Alamat tidak tersedia',
      fullShippingAddress: orderData.fullShippingAddress || orderData.customerData?.address || null,
      shippingService: orderData.shippingService || null, // Added shippingService
      totalAmount: parseFloat(orderData.totalAmount?.toString() || '0'),
      orderStatus: orderData.orderStatus || 'processing',
      paymentStatus: orderData.paymentStatus || 'paid',
      trackingNumber: orderData.trackingNumber || null, // Added trackingNumber
      midtransToken: orderData.midtransToken || orderData.midtransOrderId || null,
      processedBy: null,
      createdAt: now,
      updatedAt: now
    };

    this.orders.set(id, order);

    // Create order items if cartItems provided
    if (cartItems && cartItems.length > 0) {
      for (const cartItem of cartItems) {
        const product = this.products.get(cartItem.productId);
        if (product) {
          const orderItem: OrderItem = {
            id: randomUUID(),
            orderId: id,
            productId: cartItem.productId,
            productName: product.name,
            quantity: cartItem.quantity,
            price: parseFloat(cartItem.price.toString()),
            total: parseFloat(cartItem.price.toString()) * cartItem.quantity,
            createdAt: now
          };
          this.orderItems.set(orderItem.id, orderItem);
        }
      }
    }

    return order;
  }

  async updateOrder(id: string, updateData: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder: Order = {
      ...order,
      ...updateData,
      updatedAt: new Date()
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order item methods
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async getAllOrderItems(): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values());
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const now = new Date();
    const orderItem: OrderItem = {
      ...insertOrderItem,
      id,
      createdAt: now
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // User authentication methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      ...insertUser,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      role: insertUser.role ?? 'buyer',
      isActive: insertUser.isActive ?? true,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return undefined;
    }

    const updatedUser: User = {
      ...existingUser,
      ...updateData,
      id, // Keep original ID
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Chat methods
  async getChatRoom(id: string): Promise<ChatRoom | undefined> {
    return this.chatRooms.get(id);
  }

  async getChatRooms(): Promise<ChatRoom[]> {
    return Array.from(this.chatRooms.values())
      .sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());
  }

  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.chatRoomId === roomId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createChatRoom(insertChatRoom: InsertChatRoom): Promise<ChatRoom> {
    const id = randomUUID();
    const now = new Date();
    const chatRoom: ChatRoom = {
      ...insertChatRoom,
      customerId: insertChatRoom.customerId ?? null,
      customerEmail: insertChatRoom.customerEmail ?? null,
      customerPhone: insertChatRoom.customerPhone ?? null,
      productId: insertChatRoom.productId ?? null,
      priority: insertChatRoom.priority ?? 'normal',
      assignedTo: insertChatRoom.assignedTo ?? null,
      lastMessagePreview: insertChatRoom.lastMessagePreview ?? null,
      unreadByAdmin: insertChatRoom.unreadByAdmin ?? true,
      unreadByCustomer: insertChatRoom.unreadByCustomer ?? false,
      status: insertChatRoom.status ?? 'waiting',
      lastMessageAt: insertChatRoom.lastMessageAt ?? now,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.chatRooms.set(id, chatRoom);
    return chatRoom;
  }

  async createChatMessage(insertChatMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const now = new Date();
    const chatMessage: ChatMessage = {
      ...insertChatMessage,
      senderId: insertChatMessage.senderId ?? null,
      messageType: insertChatMessage.messageType ?? 'text',
      attachmentUrl: insertChatMessage.attachmentUrl ?? null,
      isRead: insertChatMessage.isRead ?? false,
      isInternal: insertChatMessage.isInternal ?? false,
      id,
      createdAt: now
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async updateChatRoom(id: string, updateData: Partial<InsertChatRoom>): Promise<ChatRoom | undefined> {
    const room = this.chatRooms.get(id);
    if (!room) return undefined;

    const updatedRoom: ChatRoom = {
      ...room,
      ...updateData,
      updatedAt: new Date()
    };
    this.chatRooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async updateChatRoomLastMessage(roomId: string): Promise<void> {
    const room = this.chatRooms.get(roomId);
    if (room) {
      const updatedRoom: ChatRoom = {
        ...room,
        lastMessageAt: new Date(),
        updatedAt: new Date()
      };
      this.chatRooms.set(roomId, updatedRoom);
    }
  }

  // Midtrans configuration methods
  async getMidtransConfig(): Promise<MidtransConfig | undefined> {
    // Return the first active configuration
    return Array.from(this.midtransConfigs.values()).find(config => config.isActive);
  }

  async createMidtransConfig(insertConfig: InsertMidtransConfig): Promise<MidtransConfig> {
    const id = randomUUID();
    const now = new Date();
    const config: MidtransConfig = {
      ...insertConfig,
      environment: insertConfig.environment ?? 'sandbox',
      merchantId: insertConfig.merchantId ?? null,
      isActive: insertConfig.isActive ?? true,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.midtransConfigs.set(id, config);
    return config;
  }

  async updateMidtransConfig(id: string, updateData: Partial<InsertMidtransConfig>): Promise<MidtransConfig | undefined> {
    const config = this.midtransConfigs.get(id);
    if (!config) return undefined;

    const updatedConfig: MidtransConfig = {
      ...config,
      ...updateData,
      updatedAt: new Date()
    };
    this.midtransConfigs.set(id, updatedConfig);
    return updatedConfig;
  }

  // Role management methods
  async getAllRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async getRole(id: string): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    return Array.from(this.roles.values()).find(role => role.name === name);
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const id = randomUUID();
    const now = new Date();
    const role: Role = {
      ...insertRole,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(id: string, updateData: Partial<InsertRole>): Promise<Role | undefined> {
    const role = this.roles.get(id);
    if (!role) return undefined;

    const updatedRole: Role = {
      ...role,
      ...updateData,
      updatedAt: new Date()
    };
    this.roles.set(id, updatedRole);
    return updatedRole;
  }

  async deleteRole(id: string): Promise<boolean> {
    return this.roles.delete(id);
  }

  // User Management Methods
  async getUsers(filters: {
    search?: string;
    role?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<User[]> {
    let users = Array.from(this.users.values());

    if (filters.search) {
      const searchTermLower = filters.search.toLowerCase();
      users = users.filter(user =>
        user.username.toLowerCase().includes(searchTermLower) ||
        user.email.toLowerCase().includes(searchTermLower) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchTermLower)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTermLower))
      );
    }

    if (filters.role) {
      users = users.filter(user => user.role === filters.role);
    }

    // Sort by creation date (newest first)
    users.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const offset = filters.offset || 0;
    const limit = filters.limit || users.length;

    return users.slice(offset, offset + limit);
  }

  async getUserById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user || null;
  }

  async getUserOrders(email: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.customerEmail === email)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async updateUserProfile(id: string, updateData: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }
    const updatedUser: User = {
      ...user,
      ...updateData,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }
    const updatedUser: User = {
      ...user,
      isActive,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserRole(id: string, role: string): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }
    const updatedUser: User = {
      ...user,
      role,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}

// PostgreSQL implementation using Drizzle ORM
import { db } from './db';
import { eq, like, and, desc, sql, or, ilike } from "drizzle-orm";
import { products, categories, cartItems, contactSubmissions, orders, orderItems, users, chatRooms, chatMessages, chatParticipants, midtransConfig, roles } from "@shared/schema";

let isDatabaseConnected = true;
const memStorageFallback = new MemStorage();

export class DatabaseStorage implements IStorage {
  private db = db;

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, id));
      return product || undefined;
    } catch (error) {
      console.error('Database error in getProduct, using fallback:', error);
      return await memStorageFallback.getProduct(id);
    }
  }

  async getProducts(filters?: { categoryId?: string; search?: string; limit?: number; offset?: number }): Promise<Product[]> {
    try {
      const query = db.select().from(products);
      const conditions = [];

      if (filters?.categoryId) {
        conditions.push(eq(products.categoryId, filters.categoryId));
      }

      if (filters?.search) {
        conditions.push(
          sql`${products.name} ILIKE ${'%' + filters.search + '%'} OR ${products.description} ILIKE ${'%' + filters.search + '%'}`
        );
      }

      if (conditions.length > 0) {
        query.where(and(...conditions));
      }

      if (filters?.limit) {
        query.limit(filters.limit);
      }

      if (filters?.offset) {
        query.offset(filters.offset);
      }

      return await query;
    } catch (error) {
      console.error('Database error in getProducts, using fallback:', error);
      return await memStorageFallback.getProducts(filters);
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Category methods
  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategories(): Promise<Category[]> {
    try {
      return await db.select().from(categories);
    } catch (error) {
      console.error('Database error in getCategories, using fallback:', error);
      return await memStorageFallback.getCategories();
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateCategory(id: string, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    try {
      return await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
    } catch (error) {
      console.error('Database error in getCartItems, using fallback:', error);
      return await memStorageFallback.getCartItems(sessionId);
    }
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    try {
      // Ensure price is properly formatted
      let price = cartItem.price;
      let numericPrice: number;

      if (typeof price === 'string') {
        numericPrice = parseFloat(price);
      } else if (typeof price === 'number') {
        numericPrice = price;
      } else {
        numericPrice = 0;
      }

      if (isNaN(numericPrice) || numericPrice < 0) {
        throw new Error('Invalid price');
      }

      // Check if item already exists in cart
      const existingItems = await db
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.sessionId, cartItem.sessionId), eq(cartItems.productId, cartItem.productId)));

      if (existingItems.length > 0) {
        // Update existing item quantity
        const existingItem = existingItems[0];
        const [updatedItem] = await db
          .update(cartItems)
          .set({
            quantity: existingItem.quantity + cartItem.quantity,
            updatedAt: new Date()
          })
          .where(eq(cartItems.id, existingItem.id))
          .returning();
        return updatedItem;
      } else {
        // Insert new item
        const [item] = await db
          .insert(cartItems)
          .values({
            ...cartItem,
            price: numericPrice.toString(), // Store as string in DB
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        return item;
      }
    } catch (error) {
      console.error('Database error in addToCart:', error);
      throw error;
    }
  }

  async updateCartItem(sessionId: string, itemId: string, quantity: number): Promise<CartItem | undefined> {
    const [item] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.id, itemId)))
      .returning();
    return item || undefined;
  }

  async removeFromCart(sessionId: string, itemId: string): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.id, itemId)));
    return (result.rowCount || 0) > 0;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
    return (result.rowCount || 0) >= 0;
  }

  async getCart(sessionId: string): Promise<(CartItem & { name: string; image: string; category: string })[]> {
    try {
      const result = await db
        .select()
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(cartItems.sessionId, sessionId));

      // Map the result to the expected format
      return result.map(row => ({
        id: row.cart_items.id,
        sessionId: row.cart_items.sessionId,
        productId: row.cart_items.productId,
        quantity: row.cart_items.quantity,
        price: typeof row.cart_items.price === 'string' ? parseFloat(row.cart_items.price) : row.cart_items.price,
        createdAt: row.cart_items.createdAt,
        updatedAt: row.cart_items.updatedAt,
        name: row.products.name,
        image: row.products.imageUrl || '/placeholder-image.jpg',
        category: row.categories.name
      }));
    } catch (error) {
      console.error('Database error in getCart, using fallback:', error);
      return await memStorageFallback.getCart(sessionId);
    }
  }


  // Contact form methods
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [contact] = await db
      .insert(contactSubmissions)
      .values(submission)
      .returning();
    return contact;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    try {
      const [order] = await db.select().from(orders).where(eq(orders.id, id));
      return order || undefined;
    } catch (error) {
      console.error('Database error in getOrder, using fallback:', error);
      return await memStorageFallback.getOrder(id);
    }
  }

  async getOrders(filters?: { customerEmail?: string; paymentStatus?: string; orderStatus?: string; limit?: number; offset?: number }): Promise<Order[]> {
    try {
      const query = db.select().from(orders);
      const conditions = [];

      if (filters?.customerEmail) {
        conditions.push(eq(orders.customerEmail, filters.customerEmail));
      }

      if (filters?.paymentStatus) {
        conditions.push(eq(orders.paymentStatus, filters.paymentStatus));
      }

      if (filters?.orderStatus) {
        conditions.push(eq(orders.orderStatus, filters.orderStatus));
      }

      if (conditions.length > 0) {
        query.where(and(...conditions));
      }

      query.orderBy(desc(orders.createdAt));

      if (filters?.limit) {
        query.limit(filters.limit);
      }

      if (filters?.offset) {
        query.offset(filters.offset);
      }

      return await query;
    } catch (error) {
      console.error('Database error in getOrders, using fallback:', error);
      return await memStorageFallback.getOrders(filters);
    }
  }

  async createOrder(orderData: any, cartItems?: CartItem[]): Promise<Order> {
    try {
      // If called with old signature (single InsertOrder), handle it
      if (!cartItems && typeof orderData === 'object' && orderData.customerName) {
        const [order] = await db
          .insert(orders)
          .values(orderData)
          .returning();
        return order;
      }

      // New signature with order data and cart items
      const id = orderData.id || randomUUID();
      const now = new Date();

      const orderToInsert: any = {
        id,
        orderId: orderData.orderId || id,
        sessionId: orderData.sessionId || 'unknown',
        customerName: orderData.customerName || orderData.customerData?.first_name || 'Unknown Customer',
        customerEmail: orderData.customerEmail || orderData.customerData?.email || 'unknown@example.com',
        customerPhone: orderData.customerPhone || orderData.customerData?.phone || null,
        shippingAddress: orderData.shippingAddress || orderData.customerData?.address || 'Alamat tidak tersedia',
        fullShippingAddress: orderData.fullShippingAddress || orderData.customerData?.address || null,
        shippingService: orderData.shippingService || null,
        totalAmount: parseFloat(orderData.totalAmount?.toString() || '0'),
        orderStatus: orderData.orderStatus || 'processing',
        paymentStatus: orderData.paymentStatus || 'paid',
        trackingNumber: orderData.trackingNumber || null,
        midtransToken: orderData.midtransToken || orderData.midtransOrderId || null,
        processedBy: null,
        createdAt: now,
        updatedAt: now
      };

      const [order] = await db
        .insert(orders)
        .values(orderToInsert)
        .returning();

      // Create order items if cart items provided
      if (cartItems && cartItems.length > 0) {
        for (const cartItem of cartItems) {
          const product = await this.getProduct(cartItem.productId);
          if (product) {
            await db.insert(orderItems).values({
              id: randomUUID(),
              orderId: id,
              productId: cartItem.productId,
              productName: product.name,
              quantity: cartItem.quantity,
              price: parseFloat(cartItem.price.toString()),
              total: parseFloat(cartItem.price.toString()) * cartItem.quantity,
              createdAt: now
            });
          }
        }
      }

      return order;
    } catch (error) {
      console.error('Database error in createOrder:', error);
      // Fallback to memory storage
      return await memStorageFallback.createOrder(orderData, cartItems);
    }
  }

  async updateOrder(id: string, updateData: Partial<InsertOrder>): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  // Order item methods
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async getAllOrderItems(): Promise<OrderItem[]> {
    return await db.select().from(orderItems).orderBy(desc(orderItems.createdAt));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    return item;
  }

  // User authentication methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || undefined;
    } catch (error) {
      console.error('Database error in getUserByEmail, using fallback:', error);
      return await memStorageFallback.getUserByEmail(email);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Chat methods
  async getChatRoom(id: string): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return room || undefined;
  }

  async getChatRooms(): Promise<ChatRoom[]> {
    return await db.select().from(chatRooms).orderBy(desc(chatRooms.lastMessageAt));
  }

  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.chatRoomId, roomId));
  }

  async createChatRoom(insertChatRoom: InsertChatRoom): Promise<ChatRoom> {
    const [room] = await db
      .insert(chatRooms)
      .values(insertChatRoom)
      .returning();
    return room;
  }

  async createChatMessage(insertChatMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertChatMessage)
      .returning();
    return message;
  }

  async updateChatRoom(id: string, updateData: Partial<InsertChatRoom>): Promise<ChatRoom | undefined> {
    const [room] = await db
      .update(chatRooms)
      .set(updateData)
      .where(eq(chatRooms.id, id))
      .returning();
    return room || undefined;
  }

  async updateChatRoomLastMessage(roomId: string): Promise<void> {
    await db
      .update(chatRooms)
      .set({
        lastMessageAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(chatRooms.id, roomId));
  }

  // Midtrans configuration methods
  async getMidtransConfig(): Promise<MidtransConfig | undefined> {
    try {
      const [config] = await db
        .select()
        .from(midtransConfig)
        .where(eq(midtransConfig.isActive, true))
        .limit(1);
      return config || undefined;
    } catch (error) {
      console.error('Database error in getMidtransConfig, using fallback:', error);
      return await memStorageFallback.getMidtransConfig();
    }
  }

  async createMidtransConfig(insertConfig: InsertMidtransConfig): Promise<MidtransConfig> {
    try {
      const [config] = await db
        .insert(midtransConfig)
        .values(insertConfig)
        .returning();
      return config;
    } catch (error) {
      console.error('Database error in createMidtransConfig, using fallback:', error);
      return await memStorageFallback.createMidtransConfig(insertConfig);
    }
  }

  async updateMidtransConfig(id: string, updateData: Partial<InsertMidtransConfig>): Promise<MidtransConfig | undefined> {
    try {
      const [config] = await db
        .update(midtransConfig)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(midtransConfig.id, id))
        .returning();
      return config || undefined;
    } catch (error) {
      console.error('Database error in updateMidtransConfig, using fallback:', error);
      return await memStorageFallback.updateMidtransConfig(id, updateData);
    }
  }

  // Role management methods
  async getAllRoles(): Promise<Role[]> {
    try {
      const rolesList = await db.select().from(roles);
      return rolesList;
    } catch (error) {
      console.error('Database error in getAllRoles, using fallback:', error);
      return await memStorageFallback.getAllRoles();
    }
  }

  async getRole(id: string): Promise<Role | undefined> {
    try {
      const [role] = await db.select().from(roles).where(eq(roles.id, id));
      return role || undefined;
    } catch (error) {
      console.error('Database error in getRole, using fallback:', error);
      return await memStorageFallback.getRole(id);
    }
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    try {
      const [role] = await db.select().from(roles).where(eq(roles.name, name));
      return role || undefined;
    } catch (error) {
      console.error('Database error in getRoleByName, using fallback:', error);
      return await memStorageFallback.getRoleByName(name);
    }
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    try {
      const [role] = await db
        .insert(roles)
        .values(insertRole)
        .returning();
      return role;
    } catch (error) {
      console.error('Database error in createRole, using fallback:', error);
      return await memStorageFallback.createRole(insertRole);
    }
  }

  async updateRole(id: string, updateData: Partial<InsertRole>): Promise<Role | undefined> {
    try {
      const [role] = await db
        .update(roles)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(roles.id, id))
        .returning();
      return role || undefined;
    } catch (error) {
      console.error('Database error in updateRole, using fallback:', error);
      return await memStorageFallback.updateRole(id, updateData);
    }
  }

  async deleteRole(id: string): Promise<boolean> {
    try {
      const result = await db.delete(roles).where(eq(roles.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Database error in deleteRole, using fallback:', error);
      return await memStorageFallback.deleteRole(id);
    }
  }

  // User Management Methods
  async getUsers(filters: {
    search?: string;
    role?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<User[]> {
    let query = db.select().from(users);

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.where(
        or(
          ilike(users.username, searchTerm),
          ilike(users.email, searchTerm),
          ilike(users.firstName, searchTerm),
          ilike(users.lastName, searchTerm)
        )
      );
    }

    if (filters.role) {
      query = query.where(eq(users.role, filters.role));
    }

    query = query.orderBy(desc(users.createdAt));

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async getUserOrders(email: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.customerEmail, email))
      .orderBy(desc(orders.createdAt));
  }

  async updateUserProfile(id: string, updateData: Partial<User>): Promise<User | null> {
    const result = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User | null> {
    const result = await db
      .update(users)
      .set({
        isActive,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  }

  async updateUserRole(id: string, role: string): Promise<User | null> {
    const result = await db
      .update(users)
      .set({
        role,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      // Note: In a production environment, you might want to soft delete 
      // or archive user data instead of hard delete due to order history
      const result = await db.delete(users).where(eq(users.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}

// Try to use DatabaseStorage, fallback to MemStorage if database connection fails
let storage: IStorage;

try {
  storage = new DatabaseStorage();
  console.log('Using PostgreSQL database storage');
} catch (error) {
  console.warn('Database connection failed, falling back to memory storage:', error);
  storage = new MemStorage();
}

export { storage };