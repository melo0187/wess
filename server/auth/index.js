'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../config/environment');
var User = require('../sqldb').User;

// Passport Configuration
require('./local/passport').setup(User, config);

var router = express.Router();

router.use('/local', require('./local'));

module.exports = router;
