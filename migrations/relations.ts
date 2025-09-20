import { relations } from "drizzle-orm/relations";
import { users, chatRooms, products, chatParticipants, orders, orderItems, productImages, cartItems, categories, chatMessages } from "./schema";

export const chatRoomsRelations = relations(chatRooms, ({one, many}) => ({
	user: one(users, {
		fields: [chatRooms.assignedTo],
		references: [users.id]
	}),
	product: one(products, {
		fields: [chatRooms.productId],
		references: [products.id]
	}),
	chatParticipants: many(chatParticipants),
	chatMessages: many(chatMessages),
}));

export const usersRelations = relations(users, ({many}) => ({
	chatRooms: many(chatRooms),
	orders: many(orders),
	chatMessages: many(chatMessages),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	chatRooms: many(chatRooms),
	orderItems: many(orderItems),
	productImages: many(productImages),
	cartItems: many(cartItems),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
}));

export const chatParticipantsRelations = relations(chatParticipants, ({one}) => ({
	chatRoom: one(chatRooms, {
		fields: [chatParticipants.chatRoomId],
		references: [chatRooms.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	user: one(users, {
		fields: [orders.processedBy],
		references: [users.id]
	}),
	orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
}));

export const productImagesRelations = relations(productImages, ({one}) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.id]
	}),
}));

export const cartItemsRelations = relations(cartItems, ({one}) => ({
	product: one(products, {
		fields: [cartItems.productId],
		references: [products.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	products: many(products),
}));

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	chatRoom: one(chatRooms, {
		fields: [chatMessages.chatRoomId],
		references: [chatRooms.id]
	}),
	user: one(users, {
		fields: [chatMessages.senderId],
		references: [users.id]
	}),
}));