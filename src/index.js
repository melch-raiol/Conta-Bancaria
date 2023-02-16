const express = require('express');
const routes = require('./routes');
const validatePassword = require('./intermediaries');

const app = express();

app.use(express.json());
app.use(validatePassword);
app.use(routes);

app.listen(3000);