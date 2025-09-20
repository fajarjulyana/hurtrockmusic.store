import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication with role-based access
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"), // Nomor telepon user
  address: text("address"), // Alamat lengkap user
  city: text("city"), // Kota
  postalCode: text("postal_code"), // Kode pos
  province: text("province"), // Provinsi
  role: text("role").notNull().default("buyer"), // admin, operator, buyer
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories table for organizing products
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products table for instrument catalog
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"), // Max 5000 characters as requested
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  categoryId: varchar("category_id").references(() => categories.id).notNull(),
  imageUrl: text("image_url"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),
  isNew: boolean("is_new").default(false),
  isSale: boolean("is_sale").default(false),
  inStock: boolean("in_stock").default(true),
  stockQuantity: integer("stock_quantity").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cart items table for shopping cart persistence
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contact form submissions table
export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders table for tracking purchases
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: text("order_id").notNull().unique(),
  sessionId: text("session_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address"),
  fullShippingAddress: text("full_shipping_address"), // Complete address for printing
  shippingService: text("shipping_service"), // JNE, J&T, SiCepat, TIKI, etc
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed, cancelled
  orderStatus: text("order_status").notNull().default("processing"), // processing, shipped, delivered, cancelled
  trackingNumber: text("tracking_number"),
  midtransToken: text("midtrans_token"),
  processedBy: varchar("processed_by").references(() => users.id), // Admin/Operator who processed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  productName: text("product_name").notNull(),
  productPrice: decimal("product_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product images table (untuk multiple images per product)
export const productImages = pgTable("product_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text"),
  isPrimary: boolean("is_primary").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Midtrans configuration table for storing payment gateway settings
export const midtransConfig = pgTable("midtrans_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  environment: text("environment").notNull().default("sandbox"), // sandbox, production
  serverKey: text("server_key").notNull(),
  clientKey: text("client_key").notNull(),
  merchantId: text("merchant_id"),
  // Callback URLs untuk Midtrans integration
  finishRedirectUrl: text("finish_redirect_url"),
  unfinishRedirectUrl: text("unfinish_redirect_url"),
  errorRedirectUrl: text("error_redirect_url"),
  notificationUrl: text("notification_url"),
  recurringNotificationUrl: text("recurring_notification_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create insert schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export const insertProductImageSchema = createInsertSchema(productImages).omit({
  id: true,
  createdAt: true,
});

export const insertMidtransConfigSchema = createInsertSchema(midtransConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Chat rooms table for managing customer conversations (like Shopee/Tokopedia seller chat)
export const chatRooms = pgTable("chat_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id"),
  customerSessionId: text("customer_session_id").notNull(), // Session-based for anonymous customers
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  productId: varchar("product_id").references(() => products.id),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("waiting"), // waiting, active, resolved, closed
  priority: text("priority").notNull().default("normal"), // low, normal, high, urgent
  assignedTo: varchar("assigned_to").references(() => users.id), // Admin/Operator assigned to this chat
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  lastMessagePreview: text("last_message_preview"), // For quick preview in chat list
  unreadByAdmin: boolean("unread_by_admin").default(true),
  unreadByCustomer: boolean("unread_by_customer").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chat messages table for storing individual messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatRoomId: varchar("chat_room_id").references(() => chatRooms.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id), // User ID if authenticated
  senderType: text("sender_type").notNull(), // customer, admin, operator
  senderName: text("sender_name").notNull(),
  message: text("message").notNull(),
  messageType: text("message_type").notNull().default("text"), // text, image, file, system
  attachmentUrl: text("attachment_url"), // For file/image attachments
  isRead: boolean("is_read").default(false),
  isInternal: boolean("is_internal").default(false), // Internal notes between admin/operators
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat participants table for tracking who has access to each room
export const chatParticipants = pgTable("chat_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatRoomId: varchar("chat_room_id").references(() => chatRooms.id).notNull(),
  participantType: text("participant_type").notNull(), // customer, admin
  participantId: varchar("participant_id"), // user ID if registered
  participantSessionId: text("participant_session_id"), // session ID if anonymous
  participantName: text("participant_name").notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Roles table for dynamic role management
export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  permissions: jsonb("permissions").default('{}'),
  isSystemRole: boolean("is_system_role").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Note: orders and orderItems tables are already defined above with proper structure

export const insertRoleSchema = createInsertSchema(roles, {
  name: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100),
  description: z.string().optional(),
  permissions: z.record(z.any()).optional(),
  isActive: z.boolean().default(true)
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectRoleSchema = createSelectSchema(roles);

export const insertOrderSchema = createInsertSchema(orders, {
  orderStatus: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).default('pending'),
  totalAmount: z.string(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().optional(),
  fullShippingAddress: z.string().optional()
});

export const selectOrderSchema = createSelectSchema(orders);

export const insertOrderItemSchema = createInsertSchema(orderItems, {
  orderId: z.string(),
  productId: z.string(),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
  productPrice: z.string()
});

export const selectOrderItemSchema = createSelectSchema(orderItems);

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Chat schema validation
export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertChatParticipantSchema = createInsertSchema(chatParticipants).omit({
  id: true,
  joinedAt: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertProductImage = z.infer<typeof insertProductImageSchema>;
export type ProductImage = typeof productImages.$inferSelect;

export type InsertMidtransConfig = z.infer<typeof insertMidtransConfigSchema>;
export type MidtransConfig = typeof midtransConfig.$inferSelect;

export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertChatParticipant = z.infer<typeof insertChatParticipantSchema>;
export type ChatParticipant = typeof chatParticipants.$inferSelect;