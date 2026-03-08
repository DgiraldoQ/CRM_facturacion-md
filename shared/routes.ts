import { z } from 'zod';
import { 
  insertUserSchema, 
  insertBusinessSchema, 
  insertProductSchema, 
  insertCustomerSchema, 
  users, 
  businesses, 
  products, 
  customers, 
  invoices,
  invoiceItems
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  unauthorized: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema.pick({ email: true, password: true }),
      responses: {
        201: z.object({ token: z.string(), user: z.custom<typeof users.$inferSelect>() }),
        400: errorSchemas.validation,
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: insertUserSchema.pick({ email: true, password: true }),
      responses: {
        200: z.object({ token: z.string(), user: z.custom<typeof users.$inferSelect>() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  business: {
    get: {
      method: 'GET' as const,
      path: '/api/business' as const,
      responses: {
        200: z.custom<typeof businesses.$inferSelect>().nullable(),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/business' as const,
      input: insertBusinessSchema,
      responses: {
        201: z.custom<typeof businesses.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      responses: { 200: z.array(z.custom<typeof products.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/products' as const,
      input: insertProductSchema,
      responses: { 201: z.custom<typeof products.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id' as const,
      input: insertProductSchema.partial(),
      responses: { 200: z.custom<typeof products.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound }
    }
  },
  customers: {
    list: {
      method: 'GET' as const,
      path: '/api/customers' as const,
      responses: { 200: z.array(z.custom<typeof customers.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/customers' as const,
      input: insertCustomerSchema,
      responses: { 201: z.custom<typeof customers.$inferSelect>(), 400: errorSchemas.validation }
    }
  },
  invoices: {
    list: {
      method: 'GET' as const,
      path: '/api/invoices' as const,
      responses: { 200: z.array(z.custom<typeof invoices.$inferSelect>()) }
    },
    get: {
      method: 'GET' as const,
      path: '/api/invoices/:id' as const,
      responses: { 
        200: z.custom<typeof invoices.$inferSelect & { customer: typeof customers.$inferSelect, items: (typeof invoiceItems.$inferSelect & { product: typeof products.$inferSelect })[] }>(), 
        404: errorSchemas.notFound 
      }
    },
    pdf: {
      method: 'GET' as const,
      path: '/api/invoices/:id/pdf' as const,
      responses: { 200: z.object({ pdf: z.string() }), 404: errorSchemas.notFound }
    },
    create: {
      method: 'POST' as const,
      path: '/api/invoices' as const,
      input: z.object({
        customerId: z.coerce.number().optional(), // if empty, they must provide customer data
        customer: insertCustomerSchema.optional(),
        items: z.array(z.object({
          productId: z.coerce.number(),
          quantity: z.coerce.number(),
          price: z.coerce.number() 
        }))
      }),
      responses: {
        201: z.custom<typeof invoices.$inferSelect>(),
        400: errorSchemas.validation
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}