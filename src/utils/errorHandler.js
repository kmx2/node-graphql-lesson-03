class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

const formatError = (error) => {
  if (error.originalError instanceof ValidationError) {
    return {
      message: error.message,
      code: 'VALIDATION_ERROR',
      status: 400
    };
  }
  if (error.originalError instanceof NotFoundError) {
    return {
      message: error.message,
      code: 'NOT_FOUND',
      status: 404
    };
  }
  return {
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    status: 500
  };
};

module.exports = {
  ValidationError,
  NotFoundError,
  formatError
};