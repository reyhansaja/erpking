const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_erp_key';

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  createUser: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const newUser = await User.create(username, email, password);
      
      const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ user: newUser, token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.getByEmail(email);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController;
