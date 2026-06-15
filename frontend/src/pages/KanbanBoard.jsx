import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Trash2, Edit3, Save, UserPlus, Mail } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://erpking-backend-353150454444.asia-southeast1.run.app/api';

const PRIORITY_CONFIG = {
  low: { label: 'Rendah', badge: 'bg-green-100 text-green-700' },
  medium: { label: 'Sedang', badge: 'bg-amber-100 text-amber-700' },
  high: { label: 'Tinggi', badge: 'bg-red-100 text-red-700' },
};

export default function KanbanBoard({ projectId, projectName, user }) {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskAssignees, setNewTaskAssignees] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDeadline, setEditDeadline] = useState('');

  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/projects/${projectId}/tasks`);
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API_URL}/projects/${projectId}/members`);
      setMembers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, [projectId]);

  const toggleAssignee = (member) => {
    setNewTaskAssignees(prev =>
      prev.find(a => a.id === member.id)
        ? prev.filter(a => a.id !== member.id)
        : [...prev, member]
    );
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await axios.post(`${API_URL}/projects/${projectId}/tasks`, {
        title: newTaskTitle,
        description: newTaskDescription,
        priority: newTaskPriority,
        deadline: newTaskDeadline || null,
        assigneeIds: newTaskAssignees,
        projectName: projectName || 'ERPKing',
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');
      setNewTaskDeadline('');
      setNewTaskAssignees([]);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`${API_URL}/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setTasks(tasks.map(t =>
      t.id === activeTask.id
        ? { ...t, title: editTitle, description: editDescription, priority: editPriority, deadline: editDeadline }
        : t
    ));
    setActiveTask(null);
    try {
      await axios.put(`${API_URL}/tasks/${activeTask.id}`, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        deadline: editDeadline || null,
      });
    } catch (error) {
      console.error(error);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Apakah kamu yakin ingin menghapus tugas ini?')) return;
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      setActiveTask(null);
      fetchTasks();
    } catch (error) {
      console.error(error);
      setTasks(tasks.filter(t => t.id !== taskId));
      setActiveTask(null);
    }
  };

  const openModal = (task) => {
    setActiveTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'medium');
    setEditDeadline(task.deadline ? task.deadline.split('T')[0] : '');
  };

  const columns = ['on_progress', 'hold', 'done'];
  const columnTitles = { on_progress: 'On Progress', hold: 'Hold', done: 'Done' };

  return (
    <div className="p-8 h-full relative">

      {/* Form Tambah Task — hanya superadmin */}
      {isSuperAdmin && (
        <div className="mb-8 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Plus size={16} className="text-indigo-600" /> Tambah Task Baru
          </h3>
          <form onSubmit={handleCreateTask} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Judul task..."
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">➖ Rendah</option>
                <option value="medium">🚩 Sedang</option>
                <option value="high">🔥 Tinggi</option>
              </select>
              <input
                type="date"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Deskripsi task..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[60px]"
            />

            {/* Assign Anggota */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <UserPlus size={13} /> Assign ke anggota (email akan dikirim):
              </p>
              <div className="flex flex-wrap gap-2">
                {members.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleAssignee(m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${newTaskAssignees.find(a => a.id === m.id)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                      }`}
                  >
                    {m.username}
                  </button>
                ))}
              </div>
              {newTaskAssignees.length > 0 && (
                <p className="text-xs text-indigo-500 mt-2 flex items-center gap-1">
                  <Mail size={12} /> Email notifikasi akan dikirim ke: {newTaskAssignees.map(a => a.username).join(', ')}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition font-semibold text-sm">
                <Plus size={18} /> Add Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid Kolom Kanban */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col} className="kanban-column flex flex-col flex-shrink-0 w-80">
            <h3 className="font-semibold text-gray-700 mb-4 px-2 uppercase tracking-wide text-sm">{columnTitles[col]}</h3>
            <div className="flex-1 space-y-3">
              {tasks.filter(t => t.status === col).map(task => (
                <div key={task.id} className="group border border-gray-100 hover:border-indigo-300 transition-all shadow-sm bg-white p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <button
                      onClick={() => openModal(task)}
                      className="font-medium text-gray-800 text-left break-words flex-1 hover:text-indigo-600 transition-colors"
                    >
                      {task.title}
                    </button>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="text-xs border-gray-200 rounded text-gray-500 bg-gray-50 focus:ring-0 cursor-pointer"
                    >
                      {columns.map(c => <option key={c} value={c}>{columnTitles[c]}</option>)}
                    </select>
                  </div>

                  {/* Priority badge */}
                  {task.priority && (
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2 ${PRIORITY_CONFIG[task.priority]?.badge}`}>
                      {PRIORITY_CONFIG[task.priority]?.label}
                    </span>
                  )}

                  {/* Deadline */}
                  {task.deadline && (
                    <p className="text-xs text-gray-400 mb-2">
                      📅 {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}

                  {task.description && task.description.trim() !== '' && (
                    <div
                      onClick={() => openModal(task)}
                      className="mt-2 text-xs text-amber-900 bg-amber-50/70 p-2.5 rounded-lg border border-amber-100 whitespace-pre-line cursor-pointer hover:bg-amber-100/50 transition-colors"
                    >
                      📌 <span className="font-bold">Info:</span>
                      <p className="mt-0.5 text-gray-700">{task.description}</p>
                    </div>
                  )}

                  {/* Assignees */}
                  <div className="flex -space-x-2 mt-3">
                    {task.assignees?.map(a => (
                      <div key={a.id} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs text-indigo-700 font-bold" title={a.username}>
                        {a.username.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edit Task */}
      {activeTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Edit3 size={18} className="text-indigo-600" /> Detail & Edit Tugas
              </h3>
              <button onClick={() => setActiveTask(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Judul</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Prioritas</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">➖ Rendah</option>
                    <option value="medium">🚩 Sedang</option>
                    <option value="high">🔥 Tinggi</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Deadline</label>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Deskripsi</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center gap-3">
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(activeTask.id)}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-red-100 transition text-sm font-semibold"
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button type="button" onClick={() => setActiveTask(null)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition text-sm">
                    Batal
                  </button>
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-indigo-700 transition text-sm font-semibold">
                    <Save size={16} /> Simpan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}