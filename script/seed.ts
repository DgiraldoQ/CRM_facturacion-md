import { db } from "../server/db";
import { users, businesses, products, customers } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Check if business exists to avoid duplicates on multiple runs
  const existingBusinesses = await db.select().from(businesses);
  if (existingBusinesses.length > 0) {
    console.log("Database already seeded!");
    return;
  }

  // 1. Create a demo business
  const [business] = await db.insert(businesses).values({
    name: "Tech Solutions SAS",
    nit: "900123456",
    dv: "1",
    address: "Calle 100 # 15-20",
    phone: "3001234567",
    email: "billing@techsolutions.co",
    regime: "COMMON",
    resolutionPrefix: "SET",
    resolutionNumber: "18760000001",
    resolutionFrom: "1",
    resolutionTo: "5000",
    resolutionExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year from now
    currentNumber: 1
  }).returning();
  console.log(`Created business: ${business.name}`);

  // 2. Create a demo user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const [user] = await db.insert(users).values({
    email: "demo@techsolutions.co",
    password: hashedPassword,
    businessId: business.id
  }).returning();
  console.log(`Created user: ${user.email} (password: password123)`);

  // 3. Create demo products
  const demoProducts = [
    { name: "Consulting Services (Hour)", price: 150000, ivaType: "STANDARD", stock: 100, businessId: business.id },
    { name: "Web Development Package", price: 5000000, ivaType: "STANDARD", stock: 10, businessId: business.id },
    { name: "Cloud Hosting (Year)", price: 800000, ivaType: "STANDARD", stock: 50, businessId: business.id },
    { name: "Support Ticket", price: 50000, ivaType: "REDUCED", stock: 500, businessId: business.id }
  ];
  
  await db.insert(products).values(demoProducts);
  console.log(`Created ${demoProducts.length} demo products`);

  // 4. Create demo customers
  const demoCustomers = [
    { name: "Acme Corp", nit: "800987654", dv: "3", address: "Carrera 7 # 72-10", phone: "3109876543", email: "accounts@acme.co", businessId: business.id },
    { name: "Globex Corporation", nit: "800111222", dv: "5", address: "Av El Dorado 80-20", phone: "3201112233", email: "finance@globex.co", businessId: business.id }
  ];

  await db.insert(customers).values(demoCustomers);
  console.log(`Created ${demoCustomers.length} demo customers`);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);