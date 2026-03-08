import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  businessId: integer("business_id"),
});

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nit: text("nit").notNull(),
  dv: text("dv").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  regime: text("regime").notNull(),
  resolutionPrefix: text("resolution_prefix").notNull(),
  resolutionNumber: text("resolution_number").notNull(),
  resolutionFrom: text("resolution_from").notNull(),
  resolutionTo: text("resolution_to").notNull(),
  resolutionExpiry: timestamp("resolution_expiry").notNull(),
  currentNumber: integer("current_number").notNull().default(1),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  ivaType: text("iva_type").notNull(), // STANDARD, REDUCED, ZERO, EXCLUDED
  stock: integer("stock").default(0),
  businessId: integer("business_id").notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nit: text("nit").notNull(),
  dv: text("dv").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  businessId: integer("business_id").notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  cufe: text("cufe").notNull(),
  xml: text("xml").notNull(),
  pdf: text("pdf").notNull(), // base64 string
  date: timestamp("date").defaultNow().notNull(),
  subtotal: integer("subtotal").notNull(),
  iva: integer("iva").notNull(),
  total: integer("total").notNull(),
  businessId: integer("business_id").notNull(),
  customerId: integer("customer_id").notNull(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, businessId: true });
export const insertBusinessSchema = createInsertSchema(businesses).omit({ id: true, currentNumber: true }).extend({
  resolutionExpiry: z.coerce.date(),
});
export const insertProductSchema = createInsertSchema(products).omit({ id: true, businessId: true }).extend({
  price: z.coerce.number(),
  stock: z.coerce.number().optional(),
});
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, businessId: true });
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ id: true, invoiceId: true });

export type User = typeof users.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;