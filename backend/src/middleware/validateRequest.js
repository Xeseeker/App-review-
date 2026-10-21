const AppError = require('../utils/AppError');

function validate(schema, target) {
  return (request, response, next) => {
    const result = schema.safeParse(request[target]);
    if (!result.success) {
      return next(new AppError(400, 'Validation failed.', result.error.flatten()));
    }
    request[target] = result.data;
    next();
  };
}

module.exports = { validate };
