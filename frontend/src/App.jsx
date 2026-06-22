import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Calendar as CalendarIcon, LogOut, FolderHeart, ListTodo, Shield, Menu, X } from 'lucide-react';
import axios from 'axios';
import ProjectsDashboard from './pages/ProjectsDashboard';
import ProjectDetail from './pages/ProjectDetail';
import PersonalCalendar from './pages/PersonalCalendar';
import Login from './pages/Login';
import TodoList from './pages/TodoList';
import RoleManagement from './pages/RoleManagement';

const API_URL = import.meta.env.VITE_API_URL || 'https://erpking-backend-353150454444.asia-southeast1.run.app/api';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

  // === HANDLE SSO TOKEN FROM URL ===
  // This runs first, even before checking if user is already logged in
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('token');
    if (!ssoToken) return;

    setSsoLoading(true);

    // Remove the token from URL immediately for security/cleanliness
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);

    axios.post(`${API_URL}/users/sso`, { token: ssoToken })
      .then(res => {
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      })
      .catch(err => {
        console.error("SSO Login failed:", err.response?.data?.error || err.message);
      })
      .finally(() => {
        setSsoLoading(false);
      });
  }, []);

  useEffect(() => {
    if (user?.id) {
      axios.get(`${API_URL}/users/${user.id}`)
        .then(res => {
          if (res.data.role !== user.role || res.data.username !== user.username || res.data.email !== user.email) {
            const updatedUser = { ...user, ...res.data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        })
        .catch(err => {
          console.error("Gagal memperbarui info user:", err);
        });
    }
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('deleted_projects');
    setUser(null);
  };

  const closeSidebar = () => setSidebarOpen(false);

  if (ssoLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5', marginBottom: '8px' }}>ERPKu</div>
          <div style={{ color: '#6b7280' }}>Logging you in automatically...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login setUser={setUser} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">

        {/* Overlay gelap saat sidebar terbuka di tablet */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Tombol hamburger — muncul hanya di tablet ke bawah */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 md:hidden bg-white border border-gray-200 rounded-lg p-2 shadow-md"
        >
          <Menu size={22} className="text-gray-700" />
        </button>

        {/* Sidebar Navigasi Kiri */}
        <div className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}>
          {/* Tombol tutup sidebar — hanya di tablet ke bawah */}
          <button
            onClick={closeSidebar}
            className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">ERPKu</h1>
            <p className="text-sm text-gray-500 mt-1">Hello, {user.username}</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link to="/" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              <FolderHeart size={20} />
              <span className="font-medium">Projects</span>
            </Link>
            <Link to="/calendar" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              <CalendarIcon size={20} />
              <span className="font-medium">Personal Calendar</span>
            </Link>
            <Link to="/todos" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              <ListTodo size={20} />
              <span className="font-medium">Todo List</span>
            </Link>
            <Link to="/role-management" onClick={closeSidebar} className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              <Shield size={20} className="text-indigo-600" />
              <span className="font-medium">Role Management</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors">
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<ProjectsDashboard user={user} />} />
            <Route path="/project/:id" element={<ProjectDetail user={user} />} />
            <Route path="/calendar" element={<PersonalCalendar user={user} />} />
            <Route path="/todos" element={<TodoList user={user} />} />
            <Route path="/role-management" element={<RoleManagement user={user} />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;