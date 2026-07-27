'use strict';

const { createApp } = require('./app');

const PORT = Number(process.env.PORT) || 8080;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Evaluation Mock API listening on port ${PORT}`);
});
