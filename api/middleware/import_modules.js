const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../middleware/connection');
const jwt = require('jsonwebtoken');

module.exports = {
    express,
    router,
    bcrypt,
    db,
    jwt
}