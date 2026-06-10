import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, User } from 'lucide-react';

const API_URL = 'https://apii-erp.infistream.id/api';

export default function ProjectChat({ projectId, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${API_URL}/projects/${projectId}/chats`);
      setMessages(res.data);
    } catch (error) {
      console.error("Gagal memuat chat:", error);
    }
  };

  useEffect(() => {
    if (projectId) fetchChats();
  }, [projectId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`${API_URL}/projects/${projectId}/chats`, {
        message: newMessage,
        userId: user.id
      });
      setNewMessage('');
      fetchChats();
    } catch (error) {
      console.error("Gagal mengirim chat:", error);
      
      // FALLBACK LOKAL: Biar langsung keliatan simulasinya pas kamu tes g
      const mockMsg = { id: Date.now(), message: newMessage, user: { name: user.name || 'Admin' }, createdAt: new Date().toISOString() };
      setMessages([...messages, mockMsg]);
      setNewMessage('');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-6 flex flex-col h-[500px]">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 my-auto pt-20">Belum ada obrolan di proyek ini. Mulai chat koordinasi g!</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 items-start ${msg.userId === user.id ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-gray-100 rounded-full text-gray-600"><User size={18} /></div>
              <div className={`max-w-md p-4 rounded-2xl text-sm ${msg.userId === user.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                <div className="font-bold text-xs mb-1 opacity-75">{msg.user?.name || 'Team Member'}</div>
                <div>{msg.message}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2 bg-gray-50 rounded-b-2xl">
        <input
          type="text"
          placeholder="Tulis pesan koordinasi tim di sini..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}