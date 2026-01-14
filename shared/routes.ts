import { z } from 'zod';
import { insertSignalSchema, insertSettingsSchema, signals, settings } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  signals: {
    list: {
      method: 'GET' as const,
      path: '/api/signals',
      input: z.object({
        limit: z.coerce.number().optional(),
        pair: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof signals.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/signals',
      input: insertSignalSchema,
      responses: {
        201: z.custom<typeof signals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    generate: { // For manual signal generation
      method: 'POST' as const,
      path: '/api/signals/generate',
      input: z.object({
        pair: z.string(),
      }),
      responses: {
        200: z.custom<typeof signals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/settings',
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  market: {
    status: {
      method: 'GET' as const,
      path: '/api/market/status',
      responses: {
        200: z.object({
          session: z.enum(["Asian", "London", "New York", "Closed"]),
          isOpen: z.boolean(),
        }),
      },
    },
  }
};

// ============================================
// HELPER
// ============================================
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
