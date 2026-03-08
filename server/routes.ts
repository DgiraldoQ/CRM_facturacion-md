import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.SESSION_SECRET || "super-secret-key-fallback";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Middleware to authenticate JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(401).json({ message: "Invalid token" });
      req.user = user;
      next();
    });
  };

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const { email, password } = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "User already exists", field: "email" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ email, password: hashedPassword });
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      res.status(201).json({ token, user });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      res.status(200).json({ token, user });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get(api.auth.me.path, authenticateToken, async (req: any, res: any) => {
    const user = await storage.getUser(req.user.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.status(200).json(user);
  });

  // Business
  app.get(api.business.get.path, authenticateToken, async (req: any, res: any) => {
    const user = await storage.getUser(req.user.userId);
    if (!user?.businessId) return res.status(200).json(null);
    const business = await storage.getBusiness(user.businessId);
    res.status(200).json(business || null);
  });

  app.post(api.business.create.path, authenticateToken, async (req: any, res: any) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) return res.status(401).json({ message: "User not found" });
      
      const input = api.business.create.input.parse(req.body);
      const business = await storage.createBusiness(input);
      await storage.updateUserBusiness(user.id, business.id);
      
      res.status(201).json(business);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Products
  app.get(api.products.list.path, authenticateToken, async (req: any, res: any) => {
    const user = await storage.getUser(req.user.userId);
    if (!user?.businessId) return res.status(200).json([]);
    const products = await storage.getProducts(user.businessId);
    res.status(200).json(products);
  });

  app.post(api.products.create.path, authenticateToken, async (req: any, res: any) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user?.businessId) return res.status(400).json({ message: "No business configured" });
      
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct({ ...input, businessId: user.businessId });
      res.status(201).json(product);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.put(api.products.update.path, authenticateToken, async (req: any, res: any) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      if (!product) return res.status(404).json({ message: "Not found" });
      res.status(200).json(product);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete(api.products.delete.path, authenticateToken, async (req: any, res: any) => {
    const success = await storage.deleteProduct(Number(req.params.id));
    if (!success) return res.status(404).json({ message: "Not found" });
    res.status(204).send();
  });

  // Customers
  app.get(api.customers.list.path, authenticateToken, async (req: any, res: any) => {
    const user = await storage.getUser(req.user.userId);
    if (!user?.businessId) return res.status(200).json([]);
    const customers = await storage.getCustomers(user.businessId);
    res.status(200).json(customers);
  });

  app.post(api.customers.create.path, authenticateToken, async (req: any, res: any) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user?.businessId) return res.status(400).json({ message: "No business configured" });
      
      const input = api.customers.create.input.parse(req.body);
      const customer = await storage.createCustomer({ ...input, businessId: user.businessId });
      res.status(201).json(customer);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Invoices
  app.get(api.invoices.list.path, authenticateToken, async (req: any, res: any) => {
    const user = await storage.getUser(req.user.userId);
    if (!user?.businessId) return res.status(200).json([]);
    const invoices = await storage.getInvoices(user.businessId);
    res.status(200).json(invoices);
  });

  app.get(api.invoices.get.path, authenticateToken, async (req: any, res: any) => {
    const invoice = await storage.getInvoice(Number(req.params.id));
    if (!invoice) return res.status(404).json({ message: "Not found" });
    res.status(200).json(invoice);
  });

  app.get(api.invoices.pdf.path, authenticateToken, async (req: any, res: any) => {
    const invoice = await storage.getInvoice(Number(req.params.id));
    if (!invoice) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ pdf: invoice.pdf });
  });

  app.post(api.invoices.create.path, authenticateToken, async (req: any, res: any) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user?.businessId) return res.status(400).json({ message: "No business configured" });
      const business = await storage.getBusiness(user.businessId);
      if (!business) return res.status(400).json({ message: "Business not found" });

      const input = api.invoices.create.input.parse(req.body);
      
      // Handle customer
      let customerId = input.customerId;
      if (!customerId && input.customer) {
        const newCustomer = await storage.createCustomer({ ...input.customer, businessId: user.businessId });
        customerId = newCustomer.id;
      }
      if (!customerId) return res.status(400).json({ message: "Customer is required" });
      
      const customer = await storage.getCustomer(customerId);
      if (!customer) return res.status(400).json({ message: "Customer not found" });

      // Calculate totals
      let subtotal = 0;
      let totalIva = 0;
      
      const itemsToInsert = [];
      const productsList = await storage.getProducts(user.businessId);
      for (const item of input.items) {
        const product = productsList.find(p => p.id === item.productId);
        if (!product) continue;
        
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        let ivaRate = 0;
        if (product.ivaType === "STANDARD") ivaRate = 0.19;
        else if (product.ivaType === "REDUCED") ivaRate = 0.05;
        
        totalIva += itemTotal * ivaRate;
        itemsToInsert.push({
          productId: product.id,
          quantity: item.quantity,
          price: item.price
        });
      }
      
      const total = subtotal + totalIva;

      // 1. Generate Invoice Number
      const currentNum = await storage.incrementBusinessResolutionNumber(business.id);
      const invoiceNumber = `${business.resolutionPrefix}${currentNum}`;

      // 2. Generate CUFE (Mock SHA256)
      const dateStr = new Date().toISOString();
      const cufeString = `${invoiceNumber}${dateStr}${total}${customer.nit}`;
      const cufe = crypto.createHash('sha256').update(cufeString).digest('hex');

      // 3. Generate XML (Mock)
      const xml = `<Invoice><Number>${invoiceNumber}</Number><CUFE>${cufe}</CUFE><Total>${total}</Total></Invoice>`;

      // 4. Generate PDF
      const pdfBase64 = "data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCj4+CiAgPj4KICAvQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqCjw8CiAgL1R5cGUgL0ZvbnQKICAvU3VidHlwZSAvVHlwZTUKICAvQmFzZUZvbnQgL1RpbWVzLVJvbWFuCj4+CmVuZG9iagoKNSAwIG9iago8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgpUagoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzOTYgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9GCg=="; 

      // Save Invoice
      const invoiceData = {
        number: invoiceNumber,
        cufe,
        xml,
        pdf: pdfBase64,
        date: new Date(),
        subtotal,
        iva: totalIva,
        total,
        businessId: business.id,
        customerId: customer.id
      };

      const invoice = await storage.createInvoice(invoiceData, itemsToInsert);
      
      res.status(201).json(invoice);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  return httpServer;
}