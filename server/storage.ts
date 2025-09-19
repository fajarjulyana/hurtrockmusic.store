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
  type InsertChatRoom,
  type ChatMessage,
  type InsertChatMessage,
  type ChatParticipant,
  type InsertChatParticipant
} from "@shared/schema";
import { randomUUID } from "crypto";

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

  // Contact form methods
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;

  // Order methods
  getOrder(id: string): Promise<Order | undefined>;
  getOrders(filters?: { customerEmail?: string; paymentStatus?: string; orderStatus?: string; limit?: number; offset?: number }): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;
  
  // Order item methods
  getOrderItems(orderId: string): Promise<OrderItem[]>;
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
    const cartItem: CartItem = { 
      ...insertCartItem, 
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

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const now = new Date();
    const order: Order = { 
      ...insertOrder,
      customerPhone: insertOrder.customerPhone ?? null,
      shippingAddress: insertOrder.shippingAddress ?? null,
      fullShippingAddress: insertOrder.fullShippingAddress ?? null,
      trackingNumber: insertOrder.trackingNumber ?? null,
      midtransToken: insertOrder.midtransToken ?? null,
      processedBy: insertOrder.processedBy ?? null,
      paymentStatus: insertOrder.paymentStatus ?? 'pending',
      orderStatus: insertOrder.orderStatus ?? 'processing',
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.orders.set(id, order);
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
}

export const storage = new MemStorage();