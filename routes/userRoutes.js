const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/send-otp', userController.sendOTP);
router.delete('/:id', userController.deleteUser); 
router.get('/:id', userController.getUserById);
router.get('/', userController.getAllUsers);

module.exports = router;
