const express = require('express');
const { register, login, loadUser, verifyAuth, logout, refreshToken } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/refresh-token', refreshToken);
router.get('/', verifyAuth, loadUser);

module.exports = router;
