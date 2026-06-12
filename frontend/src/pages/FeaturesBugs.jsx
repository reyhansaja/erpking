import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://erpking-backend-353150454444.asia-southeast1.run.app/api';

export default function FeaturesBugs({ projectId }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('FEATURE'); // Pilihan: FEATURE atau BUG

  // Ambil data catatan dari backend
  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}/projects/${projectId}/bug-notes`);
      setNotes(res.data);
    } catch (error) {
      console.error("Gagal mengambil catatan:", error);
    }
  };

  useEffect(() => {
    if (projectId) fetchNotes();
  }, [projectId]);

  // Handle buat catatan baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await axios.post(`${API_URL}/projects/${projectId}/bug-notes`, {
        title,
        content,
        type
      });
      setTitle('');
      setContent('');
      fetchNotes(); // Refresh daftar catatan
    } catch (error) {
      console.error("Gagal membuat catatan:", error);
      
      // OPTIMISTIC FALLBACK: Jika backend Cloud Run kamu belum siap/deployed, 
      // kita simpan di lokal dulu biar kamu bisa langsung ngetes tampilannya g!
      const mockNewNote = { id: Date.now(), title, content, type, createdAt: new Date().toISOString() };
      setNotes([mockNewNote, ...notes]);
      setTitle('');
      setContent('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Kolom Kiri: Form Input Note */}
      <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
          <Plus size={20} className="text-indigo-600" /> Add Project Note
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Note Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="FEATURE">💡 Feature Info / Update</option>
              <option value="BUG">⚠️ Bug Note / Issue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
            <input
              type="text"
              placeholder="E.g., Perbaikan skema warna tombol..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Details / Content</label>
            <textarea
              placeholder="Tulis informasi detail lanjutan di sini g..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-sm">
            Save Note
          </button>
        </form>
      </div>

      {/* Kolom Kanan: Daftar Informasi Note Card */}
      <div className="lg:col-span-2 space-y-4">
        {notes.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-400 font-medium">
            Belum ada informasi atau catatan lanjutan di proyek ini g.
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4 items-start hover:shadow-md transition-all">
              <div className={`p-3 rounded-xl ${note.type === 'BUG' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                {note.type === 'BUG' ? <AlertCircle size={22} /> : <FileText size={22} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-800 text-lg">{note.title}</h4>
                  <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${note.type === 'BUG' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {note.type}
                  </span>
                </div>
                <p className="text-gray-600 mt-2 text-sm whitespace-pre-line bg-gray-50 p-3 rounded-xl border border-gray-50">{note.content}</p>
                <div className="mt-3 text-xs text-gray-400">
                  Posted on {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};