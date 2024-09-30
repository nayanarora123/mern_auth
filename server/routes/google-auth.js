const express = require('express');
const router = express.Router();
const passport = require('passport');
const { googleAuthenticateCB } = require('../controllers/authController');

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }), googleAuthenticateCB);

module.exports = router;
