import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';

const API_URL = 'https://apii-erp.infistream.id/api';

export default function FeaturesBugs({ projectId }) {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [type, setType] = useState('bug');

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}/projects/${projectId}/bug-notes`);
      setNotes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await axios.post(`${API_URL}/projects/${projectId}/bug-notes`, { type, content });
      setContent('');
      fetchNotes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.put(`${API_URL}/bug-notes/${id}/toggle`);
      fetchNotes();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 sr-only">Features & Bugs Tracker</h2>
        <p className="text-gray-500">Click on an item to mark it as completed (crossed out).</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <form onSubmit={handleCreate} className="flex gap-4 items-start">
          <div className="flex-1">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe the feature or bug..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700"
          >
            <option value="bug">🐛 Bug</option>
            <option value="feature">✨ Feature</option>
          </select>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-medium shadow-sm">
            <Plus size={20} /> Add
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {notes.map(note => (
          <div
            key={note.id}
            onClick={() => handleToggle(note.id)}
            className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all duration-300 hover:shadow-md ${note.is_crossed_out
                ? 'bg-gray-50 border-gray-200 opacity-60'
                : 'bg-white border-gray-100 shadow-sm'
              }`}
          >
            <div className={`p-2 rounded-lg ${note.type === 'bug' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {note.type === 'bug' ? '🐛' : '✨'}
            </div>
            <div className={`flex-1 text-lg ${note.is_crossed_out ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}`}>
              {note.content}
            </div>
            {note.is_crossed_out && (
              <div className="text-sm font-semibold text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
                Done
              </div>
            )}
          </div>
        ))}
        {notes.length === 0 && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
            No notes yet. Add a feature or report a bug above!
          </div>
        )}
      </div>
    </div>
  );
}
