const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controller/User');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register',  validateRegister, registerUser);

router.post('/login', validateLogin, loginUser);

router.get('/profile', protect, getUserProfile);


router.put('/profile/:userId', protect, updateUserProfile);


module.exports = router;
