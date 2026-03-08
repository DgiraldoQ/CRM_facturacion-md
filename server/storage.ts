import { db } from "./db";
import {
  users, businesses, products, customers, invoices, invoiceItems,
  type User, type Business, type Product, type Customer, type Invoice, type InvoiceItem
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User
  getUserByEmail(email: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  updateUserBusiness(userId: number, businessId: number): Promise<void>;

  // Business
  getBusiness(id: number): Promise<Business | undefined>;
  createBusiness(business: any): Promise<Business>;
  incrementBusinessResolutionNumber(id: number): Promise<number>;

  // Products
  getProducts(businessId: number): Promise<Product[]>;
  createProduct(product: any): Promise<Product>;
  updateProduct(id: number, product: any): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Customers
  getCustomers(businessId: number): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: any): Promise<Customer>;

  // Invoices
  getInvoices(businessId: number): Promise<Invoice[]>;
  getInvoice(id: number): Promise<(Invoice & { customer: Customer, items: (InvoiceItem & { product: Product })[] }) | undefined>;
  createInvoice(invoiceData: any, items: any[]): Promise<Invoice>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async createUser(user: any) {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }
  async updateUserBusiness(userId: number, businessId: number) {
    await db.update(users).set({ businessId }).where(eq(users.id, userId));
  }
  
  async getBusiness(id: number) {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }
  async createBusiness(business: any) {
    const [created] = await db.insert(businesses).values(business).returning();
    return created;
  }
  async incrementBusinessResolutionNumber(id: number) {
    const [business] = await db.update(businesses)
      .set({ currentNumber: db.raw('current_number + 1') })
      .where(eq(businesses.id, id))
      .returning();
    return business.currentNumber - 1;
  }

  async getProducts(businessId: number) {
    return db.select().from(products).where(eq(products.businessId, businessId));
  }
  async createProduct(product: any) {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }
  async updateProduct(id: number, productData: any) {
    const [updated] = await db.update(products).set(productData).where(eq(products.id, id)).returning();
    return updated;
  }
  async deleteProduct(id: number) {
    const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();
    return !!deleted;
  }

  async getCustomers(businessId: number) {
    return db.select().from(customers).where(eq(customers.businessId, businessId));
  }
  async getCustomer(id: number) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }
  async createCustomer(customer: any) {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async getInvoices(businessId: number) {
    return db.select().from(invoices).where(eq(invoices.businessId, businessId)).orderBy(desc(invoices.date));
  }
  async getInvoice(id: number) {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return undefined;
    const [customer] = await db.select().from(customers).where(eq(customers.id, invoice.customerId));
    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoice.id));
    
    const itemsWithProducts = await Promise.all(items.map(async item => {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      return { ...item, product };
    }));

    return { ...invoice, customer, items: itemsWithProducts };
  }
  async createInvoice(invoiceData: any, itemsData: any[]) {
    // Need a transaction ideally, but we can do sequentially for simplicity or use db.transaction
    return await db.transaction(async (tx) => {
      const [invoice] = await tx.insert(invoices).values(invoiceData).returning();
      
      const itemsToInsert = itemsData.map(item => ({
        ...item,
        invoiceId: invoice.id
      }));
      
      if (itemsToInsert.length > 0) {
        await tx.insert(invoiceItems).values(itemsToInsert);
      }
      
      return invoice;
    });
  }
}

export const storage = new DatabaseStorage();