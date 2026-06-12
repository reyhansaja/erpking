import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CheckCircle2, Circle, Plus, Trash2, Pencil, X, Check,
  ListTodo, Flag, Flame, Minus, ChevronDown
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://erpking-backend-353150454444.asia-southeast1.run.app/api';

const PRIORITY_CONFIG = {
  high: {
    label: 'Tinggi',
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-600',
    icon: <Flame size={14} />,
  },
  medium: {
    label: 'Sedang',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-600',
    icon: <Flag size={14} />,
  },
  low: {
    label: 'Rendah',
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-600',
    icon: <Minus size={14} />,
  },
};

const FILTERS = ['Semua', 'Aktif', 'Selesai'];

export default function TodoList({ user }) {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [filter, setFilter] = useState('Semua');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    try {
      const res = await axios.get(`${API_URL}/todos/${user.id}`);
      setTodos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [user.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/todos`, {
        userId: user.id,
        title: newTitle.trim(),
        priority: newPriority,
      });
      setTodos([res.data, ...todos]);
      setNewTitle('');
      setNewPriority('medium');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await axios.patch(`${API_URL}/todos/${id}/toggle`, { userId: user.id });
      setTodos(todos.map(t => t.id === id ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}?userId=${user.id}`);
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditPriority(todo.priority);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleSaveEdit = async (id) => {
    if (!editTitle.trim()) return;
    try {
      const res = await axios.put(`${API_URL}/todos/${id}`, {
        userId: user.id,
        title: editTitle.trim(),
        priority: editPriority,
        is_done: todos.find(t => t.id === id)?.is_done ?? false,
      });
      setTodos(todos.map(t => t.id === id ? res.data : t));
      cancelEdit();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = todos.filter(t => {
    if (filter === 'Aktif') return !t.is_done;
    if (filter === 'Selesai') return t.is_done;
    return true;
  });

  const doneCount = todos.filter(t => t.is_done).length;
  const progress = todos.length > 0 ? Math.round((doneCount / todos.length) * 100) : 0;

  return (
    <div className="p-8 h-full flex flex-col max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <ListTodo size={24} className="text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Todo List Personal</h2>
        </div>
        <p className="text-gray-500 ml-14">Kelola tugas pribadi kamu dengan mudah.</p>
      </div>

      {/* Progress Bar */}
      {todos.length > 0 && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-600">Progress Hari Ini</span>
            <span className="text-sm font-bold text-indigo-600">{doneCount} / {todos.length} selesai</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">{progress}% tercapai</p>
        </div>
      )}

      {/* Add Form */}
      <form onSubmit={handleAdd} className="mb-6">
        <div className="flex gap-3 items-stretch bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Tambah tugas baru..."
            className="flex-1 px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none text-sm bg-transparent"
          />
          {/* Priority select */}
          <div className="relative">
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value)}
              className={`appearance-none pl-3 pr-7 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer ${PRIORITY_CONFIG[newPriority].badge} ${PRIORITY_CONFIG[newPriority].border}`}
            >
              <option value="high">🔥 Tinggi</option>
              <option value="medium">🚩 Sedang</option>
              <option value="low">➖ Rendah</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={16} />
            Tambah
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
          >
            {f}
            {f === 'Semua' && todos.length > 0 && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {todos.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Todo Items */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Memuat...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ListTodo size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 font-medium">
              {filter === 'Semua' ? 'Belum ada tugas. Yuk tambahkan!' : `Tidak ada tugas ${filter.toLowerCase()}.`}
            </p>
          </div>
        ) : (
          filtered.map(todo => {
            const pCfg = PRIORITY_CONFIG[todo.priority] || PRIORITY_CONFIG.medium;
            const isEditing = editingId === todo.id;
            return (
              <div
                key={todo.id}
                className={`group flex items-start gap-3 bg-white rounded-2xl border p-4 shadow-sm transition-all duration-200 ${todo.is_done ? 'opacity-60 border-gray-100' : `border-gray-100 hover:border-indigo-200 hover:shadow-md`
                  }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(todo.id)}
                  className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                >
                  {todo.is_done
                    ? <CheckCircle2 size={22} className="text-indigo-500" />
                    : <Circle size={22} className="text-gray-300 hover:text-indigo-400 transition-colors" />
                  }
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        autoFocus
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(todo.id); if (e.key === 'Escape') cancelEdit(); }}
                        className="w-full px-3 py-1.5 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <div className="flex gap-2 items-center">
                        <select
                          value={editPriority}
                          onChange={e => setEditPriority(e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                          <option value="high">🔥 Tinggi</option>
                          <option value="medium">🚩 Sedang</option>
                          <option value="low">➖ Rendah</option>
                        </select>
                        <button onClick={() => handleSaveEdit(todo.id)} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 flex items-center gap-1 transition-colors">
                          <Check size={12} /> Simpan
                        </button>
                        <button onClick={cancelEdit} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={`text-sm font-medium leading-snug ${todo.is_done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {todo.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${pCfg.badge}`}>
                          {pCfg.icon}
                          {pCfg.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(todo.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(todo)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer summary */}
      {todos.length > 0 && (
        <div className="mt-4 text-center text-xs text-gray-400">
          {todos.filter(t => !t.is_done).length} tugas tersisa
        </div>
      )}
    </div>
  );
}
