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
    personable: randomRating(),
    technical: randomRating(),
  };
}

module.exports = {
  createRandomRatings,
};
