'use strict';

const evaluations = new Map();

function create(evaluation) {
  evaluations.set(evaluation['eval-id'], evaluation);
  return evaluation;
}

function get(id) {
  return evaluations.get(id) ?? null;
}

function remove(id) {
  return evaluations.delete(id);
}

function clear() {
  evaluations.clear();
}

module.exports = {
  create,
  get,
  remove,
  clear,
};
