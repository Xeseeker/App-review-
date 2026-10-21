const { z } = require('zod');

const searchCode = z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{2,40}$/, 'Use 2–40 uppercase letters, numbers, or hyphens.');
const playStoreUrl = z.string().url().max(2048).refine((value) => {
  const url = new URL(value);
  return url.protocol === 'https:' && ['play.google.com', 'market.android.com'].includes(url.hostname) && url.pathname === '/store/apps/details' && url.searchParams.has('id');
}, 'Enter an official Google Play app listing URL.');

const appInput = z.object({
  name: z.string().trim().min(1).max(160),
  search_code: searchCode,
  description: z.string().trim().min(1).max(5000),
  short_description: z.string().trim().max(280).nullable().optional(),
  play_store_url: playStoreUrl,
  developer_name: z.string().trim().max(160).nullable().optional(),
  category_id: z.coerce.number().int().positive().nullable().optional(),
  status: z.enum(['draft', 'published', 'unpublished']).optional(),
  featured: z.boolean().optional()
});

const appUpdate = appInput.partial();
const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.string().trim().max(80).optional(),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(['newest', 'oldest', 'name']).default('newest')
});
const categoryInput = z.object({ name: z.string().trim().min(1).max(80), slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80), description: z.string().trim().max(500).nullable().optional() });

module.exports = { appInput, appUpdate, categoryInput, listQuery, searchCode };
