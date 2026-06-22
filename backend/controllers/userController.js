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
      
      const token = jwt.sign({ id: newUser.id, username: newUser.username, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });
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

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role || 'USER' }, token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  updateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const validRoles = ['SUPERADMIN', 'ADMIN', 'USER'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Role tidak valid. Gunakan: SUPERADMIN, ADMIN, atau USER' });
      }
      await User.updateRole(id, role);
      res.json({ success: true, message: `Role berhasil diubah menjadi ${role}` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.getById(id);
      if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  loginSSO: async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ error: 'Token is required' });

      // Verify the token using shared JWT_SECRET
      const decoded = jwt.verify(token, JWT_SECRET);

      let user = null;
      if (decoded.email) {
        user = await User.getByEmail(decoded.email);
      }
      
      if (!user && decoded.username) {
        user = await User.getByUsername(decoded.username);
      }

      // Auto-Provisioning: create user if not exists
      if (!user) {
        const defaultPasswordHash = await bcrypt.hash('infimech_sso_default_pass_123', 10);
        const username = decoded.username || 'sso_user_' + Math.floor(Math.random() * 10000);
        const email = decoded.email || `${username}@infimech-tech.com`;
        
        // Map Infimech-ERP roles to ERPKing roles (SUPERADMIN, ADMIN, USER)
        let role = 'USER';
        if (decoded.roleName === 'Superadmin') {
          role = 'SUPERADMIN';
        } else if (decoded.roleName === 'Admin' || decoded.roleName === 'Manajemen') {
          role = 'ADMIN';
        }

        user = await User.createWithRole(username, email, defaultPasswordHash, role);
      }

      // Generate local localToken for ERPKing
      const localToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || 'USER'
        },
        token: localToken
      });
    } catch (error) {
      console.error("SSO Verification Error:", error);
      res.status(401).json({ error: 'SSO Verification failed: ' + error.message });
    }
  }
};

module.exports = userController;
