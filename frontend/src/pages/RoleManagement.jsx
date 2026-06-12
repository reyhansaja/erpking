import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://erpking-backend-353150454444.asia-southeast1.run.app/api';

export default function RoleManagement({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Cek apakah user yang login adalah SUPERADMIN
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data);
    } catch (err) {
      setError('Gagal memuat daftar user. Periksa koneksi ke server.');
      console.error('Gagal fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!isSuperAdmin) {
      showToast('Hanya SUPERADMIN yang dapat mengubah role user.', 'error');
      return;
    }
    if (userId === user?.id) {
      showToast('Kamu tidak bisa mengubah role dirimu sendiri.', 'error');
      return;
    }

    try {
      setUpdatingId(userId);
      await axios.put(`${API_URL}/users/${userId}/role`, { role: newRole });
      // Update state lokal setelah berhasil
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast(`Role berhasil diubah menjadi ${newRole}!`, 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Gagal mengubah role.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-50/50 min-h-full">
      {/* Toast Notifikasi */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold transition-all animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Shield className="text-indigo-600" size={32} /> Role Management Center
        </h2>
        <p className="text-gray-500 mt-1">
          Berikan hak akses dan atur tingkatan user.{' '}
          {!isSuperAdmin && (
            <span className="text-amber-600 font-semibold text-sm">
              ⚠️ Hanya SUPERADMIN yang dapat mengubah role.
            </span>
          )}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Daftar Anggota Tim</span>
          <button
            onClick={fetchUsers}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-gray-400">
            <Loader2 size={22} className="animate-spin text-indigo-500" />
            <span className="font-medium">Memuat data user...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-8 text-red-600 bg-red-50 border-t border-red-100">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((u) => (
              <div key={u.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/50 transition">
                <div>
                  <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    {u.username}
                    {u.id === user?.id && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">KAMU</span>
                    )}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border uppercase ${
                    u.role === 'SUPERADMIN' ? 'bg-red-50 text-red-700 border-red-100' :
                    u.role === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-gray-50 text-gray-600 border-gray-100'
                  }`}>
                    {u.role || 'USER'}
                  </span>

                  <div className="relative">
                    {updatingId === u.id ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400 px-3 py-1.5">
                        <Loader2 size={14} className="animate-spin" />
                        Menyimpan...
                      </div>
                    ) : (
                      <select
                        value={u.role || 'USER'}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={!isSuperAdmin || u.id === user?.id}
                        className={`text-xs border-gray-200 rounded-xl text-gray-600 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 py-1.5 px-3 font-medium transition-all ${
                          !isSuperAdmin || u.id === user?.id
                            ? 'opacity-40 cursor-not-allowed'
                            : 'cursor-pointer hover:border-indigo-300'
                        }`}
                      >
                        <option value="SUPERADMIN">👑 SUPERADMIN</option>
                        <option value="ADMIN">🛠️ ADMIN</option>
                        <option value="USER">👥 USER</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};