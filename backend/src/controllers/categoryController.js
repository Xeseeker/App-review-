const { supabase } = require('../config/supabase');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const listCategories = asyncHandler(async (request, response) => {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  response.json({ data });
});
const createCategory = asyncHandler(async (request, response) => {
  const { data, error } = await supabase.from('categories').insert(request.body).select().single();
  if (error) throw error;
  response.status(201).json({ data });
});
const updateCategory = asyncHandler(async (request, response) => {
  const { data, error } = await supabase.from('categories').update(request.body).eq('id', request.params.id).select().maybeSingle();
  if (error) throw error;
  if (!data) throw new AppError(404, 'Category not found.');
  response.json({ data });
});
const deleteCategory = asyncHandler(async (request, response) => {
  const { count, error: countError } = await supabase.from('apps').select('*', { count: 'exact', head: true }).eq('category_id', request.params.id);
  if (countError) throw countError;
  if (count) throw new AppError(409, 'This category is used by one or more apps and cannot be deleted.');
  const { error } = await supabase.from('categories').delete().eq('id', request.params.id);
  if (error) throw error;
  response.status(204).send();
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
