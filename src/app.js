'use strict';

const express = require('express');
const evaluationsRouter = require('./routes/evaluations');

function createApp() {
  const app = express();

  app.use(express.json({
    strict: true,
  }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/evaluations', evaluationsRouter);

  app.use((err, _req, res, next) => {
    if (err instanceof SyntaxError && Object.prototype.hasOwnProperty.call(err, 'body')) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The request body is invalid.',
          details: [
            {
              field: 'body',
              message: 'Request body must be valid JSON.',
            },
          ],
        },
      });
    }
    return next(err);
  });

  return app;
}

module.exports = { createApp };
