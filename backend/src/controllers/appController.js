const crypto = require("crypto");
const path = require("path");
const { supabase } = require("../config/supabase");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { publicAppFields, adminAppFields } = require("../utils/appFields");
const { normalizeApp } = require("../utils/appNormalizer");

function appQuery() {
  return supabase.from("apps");
}

const listApps = asyncHandler(async (request, response) => {
  const { page, limit, category, search, sort } = request.query;
  let query = appQuery()
    .select(publicAppFields, { count: "exact" })
    .eq("status", "published");
  if (category) query = query.eq("category_id", category);
  if (search)
    query = query.ilike("name", `%${search.replace(/[%_]/g, "\\$&")}%`);
  if (sort === "name") query = query.order("name", { ascending: true });
  else query = query.order("created_at", { ascending: sort === "oldest" });
  const from = (page - 1) * limit;
  const { data, error, count } = await query.range(from, from + limit - 1);
  if (error) throw error;
  response.json({
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    },
  });
});

const searchApp = asyncHandler(async (request, response) => {
  const code = request.query.code.trim().toUpperCase();
  const { data, error } = await appQuery()
    .select(publicAppFields)
    .eq("status", "published")
    .eq("search_code", code)
    .maybeSingle();
  if (error) throw error;
  if (!data)
    throw new AppError(404, "No published app was found for that code.");
  response.json({ data });
});

const getPublicApp = asyncHandler(async (request, response) => {
  if (
    !crypto.randomUUID ||
    !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(request.params.id)
  )
    throw new AppError(404, "App not found.");
  const { data, error } = await appQuery()
    .select(publicAppFields)
    .eq("status", "published")
    .eq("id", request.params.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new AppError(404, "App not found.");
  response.json({ data });
});

const listAdminApps = asyncHandler(async (request, response) => {
  const { page = 1, limit = 50, search = "" } = request.query;
  const from = (page - 1) * limit;
  let query = appQuery()
    .select(adminAppFields, { count: "exact" })
    .order("created_at", { ascending: false });
  if (search)
    query = query.ilike("name", `%${search.replace(/[%_]/g, "\\$&")}%`);
  const { data, error, count } = await query.range(
    from,
    from + Number(limit) - 1,
  );
  if (error) throw error;
  response.json({
    data,
    pagination: { page: Number(page), limit: Number(limit), total: count || 0 },
  });
});

const getAdminApp = asyncHandler(async (request, response) => {
  const { data, error } = await appQuery()
    .select(adminAppFields)
    .eq("id", request.params.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new AppError(404, "App not found.");
  response.json({ data });
});

const createApp = asyncHandler(async (request, response) => {
  const payload = {
    ...normalizeApp(request.body),
    created_by: request.user.id,
  };
  const { data, error } = await supabase
    .from("apps")
    .insert(payload)
    .select(adminAppFields)
    .single();
  if (error) throw error;
  response.status(201).json({ data });
});

const updateApp = asyncHandler(async (request, response) => {
  const { data, error } = await supabase
    .from("apps")
    .update(normalizeApp(request.body))
    .eq("id", request.params.id)
    .select(adminAppFields)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new AppError(404, "App not found.");
  response.json({ data });
});

const updateStatus = asyncHandler(async (request, response) => {
  const { data, error } = await supabase
    .from("apps")
    .update({ status: request.body.status })
    .eq("id", request.params.id)
    .select(adminAppFields)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new AppError(404, "App not found.");
  response.json({ data });
});

const deleteApp = asyncHandler(async (request, response) => {
  const { data: app, error: lookupError } = await supabase
    .from("apps")
    .select("poster_url")
    .eq("id", request.params.id)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (!app) throw new AppError(404, "App not found.");
  const { error } = await supabase
    .from("apps")
    .delete()
    .eq("id", request.params.id);
  if (error) throw error;
  if (app.poster_url) {
    const marker = "/storage/v1/object/public/app-posters/";
    const storagePath = app.poster_url.split(marker)[1];
    if (storagePath)
      await supabase.storage.from("app-posters").remove([storagePath]);
  }
  response.status(204).send();
});

const uploadPoster = asyncHandler(async (request, response) => {
  const { data: app, error: lookupError } = await supabase
    .from("apps")
    .select("poster_url")
    .eq("id", request.params.id)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (!app) throw new AppError(404, "App not found.");
  const extension =
    path.extname(request.file.originalname).toLowerCase() ||
    { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" }[
      request.file.mimetype
    ];
  const objectPath = `${request.params.id}/${crypto.randomUUID()}${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("app-posters")
    .upload(objectPath, request.file.buffer, {
      contentType: request.file.mimetype,
      upsert: false,
    });
  if (uploadError) throw uploadError;
  const { data: publicUrl } = supabase.storage
    .from("app-posters")
    .getPublicUrl(objectPath);
  const { data, error: updateError } = await supabase
    .from("apps")
    .update({ poster_url: publicUrl.publicUrl })
    .eq("id", request.params.id)
    .select(adminAppFields)
    .single();
  if (updateError) {
    await supabase.storage.from("app-posters").remove([objectPath]);
    throw updateError;
  }
  if (app.poster_url) {
    const oldPath = app.poster_url.split(
      "/storage/v1/object/public/app-posters/",
    )[1];
    if (oldPath) await supabase.storage.from("app-posters").remove([oldPath]);
  }
  response.json({ data });
});

module.exports = {
  listApps,
  searchApp,
  getPublicApp,
  listAdminApps,
  getAdminApp,
  createApp,
  updateApp,
  updateStatus,
  deleteApp,
  uploadPoster,
};
