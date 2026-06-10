import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, Calendar as CalendarIcon, LogOut, FolderHeart, ListTodo, Shield } from 'lucide-react';
import ProjectsDashboard from './pages/ProjectsDashboard';
import ProjectDetail from './pages/ProjectDetail';
import PersonalCalendar from './pages/PersonalCalendar';
import Login from './pages/Login';
import TodoList from './pages/TodoList';
import RoleManagement from './pages/RoleManagement';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

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
        {/* Sidebar Navigasi Kiri */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">ERPKu</h1>
            <p className="text-sm text-gray-500 mt-1">Hello, {user.username}</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              <FolderHeart size={20} />
              <span className="font-medium">Projects</span>
            </Link>
            <Link to="/calendar" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              <CalendarIcon size={20} />
              <span className="font-medium">Personal Calendar</span>
            </Link>
            <Link to="/todos" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              <ListTodo size={20} />
              <span className="font-medium">Todo List</span>
            </Link>
            
            {/* LINK MENU ROLE MANAGEMENT */}
            <Link to="/role-management" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
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

// EKSPOR TUNGGAL DI SINI (Sama seperti struktur aslimu g!)
export default App