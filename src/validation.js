'use strict';

function validationError(details) {
  return {
    error: {
      code: 'VALIDATION_ERROR',
      message: 'The request body is invalid.',
      details,
    },
  };
}

function validateEvaluationRequest(body) {
  const details = [];

  if (body === undefined || body === null) {
    details.push({
      field: 'body',
      message: 'Request body is required.',
    });
    return validationError(details);
  }

  if (typeof body !== 'object' || Array.isArray(body)) {
    details.push({
      field: 'body',
      message: 'Request body must be a JSON object.',
    });
    return validationError(details);
  }

  const keys = Object.keys(body);
  for (const key of keys) {
    if (key !== 'body') {
      details.push({
        field: key,
        message: `Unknown property '${key}' is not allowed.`,
      });
    }
  }

  if (!Object.prototype.hasOwnProperty.call(body, 'body')) {
    details.push({
      field: 'body',
      message: 'body is required.',
    });
  } else if (typeof body.body !== 'string') {
    details.push({
      field: 'body',
      message: 'body must be a string.',
    });
  } else if (body.body.length < 20 || body.body.length > 255) {
    details.push({
      field: 'body',
      message: 'body must contain between 20 and 255 characters.',
    });
  }

  if (details.length > 0) {
    return validationError(details);
  }

  return null;
}

module.exports = {
  validateEvaluationRequest,
};
