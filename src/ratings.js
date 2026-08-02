'use strict';

const { randomInt } = require('node:crypto');

function randomRating() {
  return randomInt(1, 6);
}

function createRandomRatings() {
  return {
    usefulness: randomRating(),
    importance: randomRating(),
    credibility: randomRating(),
    reality: randomRating(),
  };
}

module.exports = {
  createRandomRatings,
};
