function normalizeApp(input = {}) {
  return {
    ...input,
    status: input.status || "published",
    search_code: input.search_code?.trim().toUpperCase(),
    short_description: input.short_description || null,
    developer_name: input.developer_name || null,
    category_id: input.category_id || null,
  };
}

module.exports = { normalizeApp };
