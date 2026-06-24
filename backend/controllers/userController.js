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

      // Verifikasi token dari web induk
      const decoded = jwt.verify(token, JWT_SECRET);

      // ==== PERBAIKAN LOGIKA PENCARIAN AKUN (BONGKAR PAYLOAD AGRESIF) ====
      // Jaga-jaga kalau payload dari web induk bersarang di dalam objek 'user' atau 'data'
      const tokenPayload = decoded.user || decoded.data || decoded;
      
      const targetEmail = tokenPayload.email || tokenPayload.user_email;
      const targetUsername = tokenPayload.username || tokenPayload.name || tokenPayload.user_name;

      let user = null;

      // 1. Cek berdasarkan Email (Ini yang paling utama biar nyambung g!)
      if (targetEmail) {
        user = await User.getByEmail(targetEmail);
      }
      
      // 2. Kalau email belum ketemu/kosong dari sana, coba pakai Username
      if (!user && targetUsername) {
        user = await User.getByUsername(targetUsername);
      }

      // 3. Auto-Provisioning: Kalau beneran belum pernah login sama sekali, baru kita buatkan akunnya
      if (!user) {
        const defaultPasswordHash = await bcrypt.hash('infimech_sso_default_pass_123', 10);
        
        // Pastikan nama gak acak lagi kalau dari induk udah ngasih nama
        const username = targetUsername || 'sso_user_' + Math.floor(Math.random() * 10000);
        const email = targetEmail || `${username}@infimech-tech.com`;
        
        // Map Infimech-ERP roles to ERPKing roles (SUPERADMIN, ADMIN, USER)
        let role = 'USER';
        const incomingRole = tokenPayload.roleName || tokenPayload.role || '';
        
        if (incomingRole === 'Superadmin' || incomingRole === 'SUPERADMIN') {
          role = 'SUPERADMIN';
        } else if (incomingRole === 'Admin' || incomingRole === 'Manajemen' || incomingRole === 'ADMIN') {
          role = 'ADMIN';
        }

        user = await User.createWithRole(username, email, defaultPasswordHash, role);
      }
      // ===================================================================

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