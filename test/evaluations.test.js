'use strict';

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');
const { readInfoVersion } = require('../src/openapi-version');
const store = require('../src/store');

const API_VERSION = readInfoVersion();

const VALID_BODY = 'Cursor agents execute commands in an isolated environment.';

function assertRating(value) {
  assert.equal(typeof value, 'number');
  assert.ok(Number.isInteger(value));
  assert.ok(value >= 1 && value <= 5);
}

describe('Evaluation Mock API', () => {
  let app;

  beforeEach(() => {
    store.clear();
    app = createApp();
  });

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'ok' });
  });

  it('GET /version returns API version', async () => {
    const res = await request(app).get('/version');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { version: API_VERSION });
  });

  it('POST /evaluations creates an evaluation and GET returns the same', async () => {
    const createRes = await request(app)
      .post('/evaluations')
      .send({ body: VALID_BODY });

    assert.equal(createRes.status, 201);
    assert.equal(typeof createRes.body['eval-id'], 'string');
    assert.match(createRes.body['eval-id'], /^eval-/);
    assertRating(createRes.body.usefulness);
    assertRating(createRes.body.importance);
    assertRating(createRes.body.credibility);
    assertRating(createRes.body.personable);

    const getRes = await request(app).get(`/evaluations/${createRes.body['eval-id']}`);
    assert.equal(getRes.status, 200);
    assert.deepEqual(getRes.body, createRes.body);
  });

  it('POST /evaluations rejects body shorter than 20 characters', async () => {
    const res = await request(app)
      .post('/evaluations')
      .send({ body: 'too short' });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.details.some((d) => d.field === 'body'));
  });

  it('POST /evaluations rejects body longer than 255 characters', async () => {
    const res = await request(app)
      .post('/evaluations')
      .send({ body: 'a'.repeat(256) });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /evaluations rejects unknown properties', async () => {
    const res = await request(app)
      .post('/evaluations')
      .send({ body: VALID_BODY, extra: true });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.details.some((d) => d.field === 'extra'));
  });

  it('GET /evaluations/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/evaluations/eval-unknown');
    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  it('DELETE /evaluations/:id returns 404 for unknown id', async () => {
    const res = await request(app).delete('/evaluations/eval-unknown');
    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  it('DELETE /evaluations/:id removes evaluation so GET returns 404', async () => {
    const createRes = await request(app)
      .post('/evaluations')
      .send({ body: VALID_BODY });

    const id = createRes.body['eval-id'];
    const deleteRes = await request(app).delete(`/evaluations/${id}`);
    assert.equal(deleteRes.status, 204);
    assert.equal(deleteRes.text, '');

    const getRes = await request(app).get(`/evaluations/${id}`);
    assert.equal(getRes.status, 404);
  });
});
