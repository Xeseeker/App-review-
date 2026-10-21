function errorHandler(error, request, response, next) {
  if (error.code === '23505') error = { statusCode: 409, message: 'That value is already in use.' };
  if (error.code === '23503') error = { statusCode: 400, message: 'The selected related record does not exist.' };
  const status = error.statusCode || 500;
  if (status >= 500) console.error(error);
  response.status(status).json({ error: { message: status >= 500 && process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : error.message || 'An unexpected error occurred.', details: error.details } });
}

module.exports = errorHandler;
