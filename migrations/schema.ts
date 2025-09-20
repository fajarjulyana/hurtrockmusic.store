import { pgTable, foreignKey, varchar, text, timestamp, boolean, unique, numeric, integer, uuid, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const chatRooms = pgTable("chat_rooms", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	customerId: varchar("customer_id"),
	customerSessionId: text("customer_session_id").notNull(),
	customerName: text("customer_name").notNull(),
	customerEmail: text("customer_email"),
	customerPhone: text("customer_phone"),
	productId: varchar("product_id"),
	subject: text().notNull(),
	status: text().default('waiting').notNull(),
	priority: text().default('normal').notNull(),
	assignedTo: varchar("assigned_to"),
	lastMessageAt: timestamp("last_message_at", { mode: 'string' }).defaultNow(),
	lastMessagePreview: text("last_message_preview"),
	unreadByAdmin: boolean("unread_by_admin").default(true),
	unreadByCustomer: boolean("unread_by_customer").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.id],
			name: "chat_rooms_assigned_to_users_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "chat_rooms_product_id_products_id_fk"
		}),
]);

export const chatParticipants = pgTable("chat_participants", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	chatRoomId: varchar("chat_room_id").notNull(),
	participantType: text("participant_type").notNull(),
	participantId: varchar("participant_id"),
	participantSessionId: text("participant_session_id"),
	participantName: text("participant_name").notNull(),
	lastSeenAt: timestamp("last_seen_at", { mode: 'string' }).defaultNow(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.chatRoomId],
			foreignColumns: [chatRooms.id],
			name: "chat_participants_chat_room_id_chat_rooms_id_fk"
		}),
]);

export const orders = pgTable("orders", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	orderId: text("order_id").notNull(),
	sessionId: text("session_id").notNull(),
	customerName: text("customer_name").notNull(),
	customerEmail: text("customer_email").notNull(),
	customerPhone: text("customer_phone"),
	shippingAddress: text("shipping_address"),
	fullShippingAddress: text("full_shipping_address"),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	paymentStatus: text("payment_status").default('pending').notNull(),
	orderStatus: text("order_status").default('processing').notNull(),
	trackingNumber: text("tracking_number"),
	midtransToken: text("midtrans_token"),
	processedBy: varchar("processed_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.processedBy],
			foreignColumns: [users.id],
			name: "orders_processed_by_users_id_fk"
		}),
	unique("orders_order_id_unique").on(table.orderId),
]);

export const orderItems = pgTable("order_items", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	orderId: varchar("order_id").notNull(),
	productId: varchar("product_id").notNull(),
	productName: text("product_name").notNull(),
	productPrice: numeric("product_price", { precision: 10, scale:  2 }).notNull(),
	quantity: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_product_id_products_id_fk"
		}),
]);

export const contactSubmissions = pgTable("contact_submissions", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	subject: text().notNull(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const midtransConfig = pgTable("midtrans_config", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	environment: text().default('sandbox').notNull(),
	serverKey: text("server_key").notNull(),
	clientKey: text("client_key").notNull(),
	merchantId: text("merchant_id"),
	finishRedirectUrl: text("finish_redirect_url"),
	unfinishRedirectUrl: text("unfinish_redirect_url"),
	errorRedirectUrl: text("error_redirect_url"),
	notificationUrl: text("notification_url"),
	recurringNotificationUrl: text("recurring_notification_url"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const productImages = pgTable("product_images", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	productId: varchar("product_id").notNull(),
	imageUrl: text("image_url").notNull(),
	altText: text("alt_text"),
	isPrimary: boolean("is_primary").default(false),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_images_product_id_products_id_fk"
		}),
]);

export const categories = pgTable("categories", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	slug: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("categories_slug_unique").on(table.slug),
]);

export const cartItems = pgTable("cart_items", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	sessionId: text("session_id").notNull(),
	productId: varchar("product_id").notNull(),
	quantity: integer().notNull(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "cart_items_product_id_products_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	username: text().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	role: text().default('buyer').notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);

export const roles = pgTable("roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	displayName: varchar("display_name", { length: 100 }).notNull(),
	description: text(),
	permissions: jsonb().default({}),
	isSystemRole: boolean("is_system_role").default(false),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("roles_name_unique").on(table.name),
]);

export const products = pgTable("products", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	originalPrice: numeric("original_price", { precision: 10, scale:  2 }),
	categoryId: varchar("category_id").notNull(),
	imageUrl: text("image_url"),
	rating: numeric({ precision: 2, scale:  1 }).default('0'),
	reviewCount: integer("review_count").default(0),
	isNew: boolean("is_new").default(false),
	isSale: boolean("is_sale").default(false),
	inStock: boolean("in_stock").default(true),
	stockQuantity: integer("stock_quantity").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "products_category_id_categories_id_fk"
		}),
]);

export const chatMessages = pgTable("chat_messages", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	chatRoomId: varchar("chat_room_id").notNull(),
	senderId: varchar("sender_id"),
	senderType: text("sender_type").notNull(),
	senderName: text("sender_name").notNull(),
	message: text().notNull(),
	messageType: text("message_type").default('text').notNull(),
	attachmentUrl: text("attachment_url"),
	isRead: boolean("is_read").default(false),
	isInternal: boolean("is_internal").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.chatRoomId],
			foreignColumns: [chatRooms.id],
			name: "chat_messages_chat_room_id_chat_rooms_id_fk"
		}),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "chat_messages_sender_id_users_id_fk"
		}),
]);
