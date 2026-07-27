'use strict';

const { randomUUID } = require('node:crypto');
const express = require('express');
const store = require('../store');
const { createRandomRatings } = require('../ratings');
const { validateEvaluationRequest } = require('../validation');

const router = express.Router();

function notFoundError() {
  return {
    error: {
      code: 'NOT_FOUND',
      message: 'Evaluation not found.',
    },
  };
}

function createEvalId() {
  return `eval-${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

router.post('/', (req, res) => {
  const error = validateEvaluationRequest(req.body);
  if (error) {
    return res.status(400).json(error);
  }

  const evaluation = {
    'eval-id': createEvalId(),
    ...createRandomRatings(),
  };

  store.create(evaluation);
  return res.status(201).json(evaluation);
});

router.get('/:id', (req, res) => {
  const evaluation = store.get(req.params.id);
  if (!evaluation) {
    return res.status(404).json(notFoundError());
  }
  return res.status(200).json(evaluation);
});

router.delete('/:id', (req, res) => {
  const removed = store.remove(req.params.id);
  if (!removed) {
    return res.status(404).json(notFoundError());
  }
  return res.status(204).send();
});

module.exports = router;
