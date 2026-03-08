# Colombian Electronic Invoicing App

A full-stack web application for Colombian electronic invoicing (Factura Electrónica Colombia), built to run easily on Replit.

## Tech Stack
- **Backend:** Node.js, Express, TypeScript, Drizzle ORM (replacing Prisma for better Replit integration), PostgreSQL (Replit's built-in db), JWT authentication.
- **Frontend:** React, Vite, TailwindCSS, wouter (React Router alternative), React Hook Form.

## Features
- **Authentication:** JWT-based login and registration.
- **Business Registration:** Setup DIAN resolution data.
- **Product Management:** Full CRUD operations.
- **Customer Management:** Full CRUD operations.
- **Invoice Generation:** Automatic numbering, mock CUFE generation (SHA256), XML and base64 PDF representation.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Sync the database schema:**
   *(Using Drizzle ORM instead of Prisma for native Replit support)*
   ```bash
   npm run db:push
   ```

3. **Seed the database (optional):**
   ```bash
   npx tsx script/seed.ts
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```

## Included Demo Data
If you ran the seed script, you can log in with:
- **Email:** demo@techsolutions.co
- **Password:** password123
