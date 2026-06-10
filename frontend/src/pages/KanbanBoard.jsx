import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Trash2, Edit3, Save } from 'lucide-react';

const API_URL = 'https://apii-erp.infistream.id/api';

export default function KanbanBoard({ projectId, user }) {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  
  // State untuk mengontrol Modal Edit & Delete g
  const [activeTask, setActiveTask] = useState(null); 
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/projects/${projectId}/tasks`);
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await axios.post(`${API_URL}/projects/${projectId}/tasks`, { 
        title: newTaskTitle, 
        description: newTaskDescription 
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
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

// --- MISI EDIT: Update Judul & Notes Catatan (Optimistic Update) ---
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    
    // 1. UPDATE LAYAR DULUAN G! Biar UI instan, clean, dan teks ga ngilang nunggu server.
    setTasks(tasks.map(t => 
      t.id === activeTask.id 
        ? { ...t, title: editTitle, description: editDescription } 
        : t
    ));
    setActiveTask(null); // Langsung tutup modal pop-up

    try {
      // 2. Tembak ke database Cloud Run di belakang layar secara diam-diam
      await axios.put(`${API_URL}/tasks/${activeTask.id}`, {
        title: editTitle,
        description: editDescription
      });
      // Gak perlu fetchTasks() lagi di sini, karena layar udah kita update duluan di atas g!
    } catch (error) {
      console.error("Gagal mengupdate tugas ke database g:", error);
      // Kalau backend beneran eror/numbang, baru kita tarik ulang data aslinya
      fetchTasks(); 
    }
  };

  // --- MISI HAPUS: Musnahkan Tugas dari Database ---
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Apakah kamu yakin ingin menghapus tugas ini g?')) return;
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      setActiveTask(null); // Tutup modal jika sedang terbuka
      fetchTasks();
    } catch (error) {
      console.error("Gagal menghapus tugas:", error);
      
      // Fallback Visual Lokal g
      setTasks(tasks.filter(t => t.id !== taskId));
      setActiveTask(null);
    }
  };

  // Buka Modal dan isi form dengan data kartu yang diklik
  const openModal = (task) => {
    setActiveTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const columns = ['on_progress', 'hold', 'done'];
  const columnTitles = {
    'on_progress': 'On Progress',
    'hold': 'Hold',
    'done': 'Done'
  };

  return (
    <div className="p-8 h-full relative">
      {/* Form Input Tambah Tugas */}
      <div className="mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full space-y-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="New task title..."
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Tambahkan catatan info lanjutan / kekurangan tugas di sini g..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs min-h-[60px]"
            />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition font-semibold text-sm h-fit">
            <Plus size={18} /> Add Task
          </button>
        </form>
      </div>

      {/* Grid Kolom Kanban */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col} className="kanban-column flex flex-col flex-shrink-0 w-80">
            <h3 className="font-semibold text-gray-700 mb-4 px-2 uppercase tracking-wide text-sm">{columnTitles[col]}</h3>
            <div className="flex-1 space-y-3">
              {tasks.filter(t => t.status === col).map(task => (
                <div key={task.id} className="kanban-card group border border-gray-100 hover:border-indigo-300 transition-all shadow-sm bg-white p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    {/* Teks Judul dibungkus button agar bisa diklik g */}
                    <button 
                      onClick={() => openModal(task)}
                      className="font-medium text-gray-800 text-left break-words flex-1 hover:text-indigo-600 cursor-pointer transition-colors"
                      title="Klik untuk Edit / Hapus"
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

                  {/* Box Tampilan Note Catatan Kuning */}
                  {task.description && task.description.trim() !== '' && (
                    <div 
                      onClick={() => openModal(task)}
                      className="mt-2 text-xs text-amber-900 bg-amber-50/70 p-2.5 rounded-lg border border-amber-100 whitespace-pre-line cursor-pointer hover:bg-amber-100/50 transition-colors"
                    >
                      📌 <span className="font-bold">Info Lanjutan:</span>
                      <p className="mt-0.5 text-gray-700">{task.description}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4 text-gray-400 text-sm">
                    <div className="flex -space-x-2">
                      {task.assignees?.map(a => (
                        <div key={a.id} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs text-indigo-700 font-bold" title={a.username}>
                          {a.username.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL POP-UP EDIT & DELETE --- */}
      {activeTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full overflow-hidden">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Edit3 size={18} className="text-indigo-600" /> Detail & Edit Tugas
              </h3>
              <button 
                onClick={() => setActiveTask(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Modal */}
            <form onSubmit={handleUpdateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Judul Tugas</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Catatan Kekurangan / Notes</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Berikan notes detail kekurangan di sini g..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[100px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center gap-3">
                {/* Tombol Hapus Tugas */}
                <button
                  type="button"
                  onClick={() => handleDeleteTask(activeTask.id)}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-red-100 transition text-sm font-semibold"
                >
                  <Trash2 size={16} /> Hapus Tugas
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTask(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-indigo-700 transition text-sm font-semibold shadow-sm"
                  >
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
};