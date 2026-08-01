'use strict';

const fs = require('fs');
const path = require('path');

const OPENAPI_PATH = path.join(__dirname, '..', 'openapi.yaml');

function readInfoVersion(openapiPath = OPENAPI_PATH) {
  const text = fs.readFileSync(openapiPath, 'utf8');
  let inInfo = false;

  for (const line of text.split('\n')) {
    if (/^info:\s*$/.test(line)) {
      inInfo = true;
      continue;
    }

    if (inInfo && /^[^\s#]/.test(line)) {
      break;
    }

    const match = line.match(/^\s+version:\s*(?:&\w+\s+)?(\S+)/);
    if (inInfo && match) {
      return match[1];
    }
  }

  throw new Error(`info.version not found in ${openapiPath}`);
}

module.exports = {
  OPENAPI_PATH,
  readInfoVersion,
};
