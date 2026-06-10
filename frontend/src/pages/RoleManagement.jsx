import React, { useState } from 'react';
import { Shield } from 'lucide-react';

export default function RoleManagement() {
  // Data simulasi user agar langsung fungsional pada umumnya g
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', email: 'admin@gmail.com', role: 'SUPERADMIN' },
    { id: 2, username: 'reyhan', email: 'reyhan@gmail.com', role: 'ADMIN' },
    { id: 3, username: 'ekoyu', email: 'ekoyu@gmail.com', role: 'USER' },
    { id: 4, username: 'loka_dev', email: 'loka@gmail.com', role: 'USER' },
  ]);

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    alert(`Berhasil mengubah role user menjadi ${newRole} g!`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-50/50 min-h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Shield className="text-indigo-600" size={32} /> Role Management Center
        </h2>
        <p className="text-gray-500 mt-1">Berikan hak akses dan atur tingkatan user (Superadmin, Admin, User) pada umumnya.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Daftar Anggota Tim</span>
        </div>

        <div className="divide-y divide-gray-100">
          {users.map((u) => (
            <div key={u.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/50 transition">
              <div>
                <h4 className="font-bold text-gray-800 text-base">{u.username}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border uppercase ${
                  u.role === 'SUPERADMIN' ? 'bg-red-50 text-red-700 border-red-100' :
                  u.role === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-gray-50 text-gray-600 border-gray-100'
                }`}>
                  {u.role}
                </span>

                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="text-xs border-gray-200 rounded-xl text-gray-600 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 py-1.5 px-3 cursor-pointer font-medium"
                >
                  <option value="SUPERADMIN">👑 SUPERADMIN</option>
                  <option value="ADMIN">🛠️ ADMIN</option>
                  <option value="USER">👥 USER</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};