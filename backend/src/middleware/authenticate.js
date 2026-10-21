const { supabaseAuth } = require('../config/supabase');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (request, response, next) => {
  const header = request.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new AppError(401, 'A valid bearer token is required.');
  const { data, error } = await supabaseAuth.auth.getUser(header.slice(7));
  if (error || !data.user) throw new AppError(401, 'Your session is invalid or expired.');
  request.user = data.user;
  next();
});

module.exports = authenticate;
