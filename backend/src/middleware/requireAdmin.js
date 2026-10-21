const { supabase } = require('../config/supabase');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

function requireAdmin(allowedRoles = ['admin', 'editor']) {
  return asyncHandler(async (request, response, next) => {
    const { data, error } = await supabase.from('admin_users').select('role,display_name').eq('user_id', request.user.id).maybeSingle();
    if (error) throw error;
    if (!data || !allowedRoles.includes(data.role)) throw new AppError(403, 'Administrator permission is required.');
    request.admin = { ...data, userId: request.user.id };
    next();
  });
}

module.exports = requireAdmin;
