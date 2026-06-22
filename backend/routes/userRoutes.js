const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.post('/sso', userController.loginSSO);
router.get('/:id', userController.getUserById);
router.put('/:id/role', userController.updateUserRole);

module.exports = router;
