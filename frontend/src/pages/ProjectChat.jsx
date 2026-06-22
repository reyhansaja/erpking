import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://erpking-backend-353150454444.asia-southeast1.run.app/api';

export default function ProjectChat({ projectId, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Fitur Auto-Scroll ke bawah ala WA g!
  const messagesEndRef = useRef(null); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    
    // (Opsional) Auto-refresh tiap 5 detik biar kayak real-time
    const interval = setInterval(() => {
      if (projectId) fetchChats();
    }, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  // Setiap kali messages berubah, scroll ke bawah
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      
      // FALLBACK LOKAL: Biar aman kalau backend delay
      const mockMsg = { 
        id: Date.now(), 
        message: newMessage, 
        user_id: user.id, // Samain sama logika backend
        username: user.username || 'Saya',
        role: user.role || 'Admin',
        createdAt: new Date().toISOString() 
      };
      setMessages([...messages, mockMsg]);
      setNewMessage('');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-6 flex flex-col h-[500px]">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 my-auto pt-20">Belum ada obrolan di proyek ini. Mulai chat koordinasi g!</div>
        ) : (
          messages.map(msg => {
            // LOGIKA KANAN-KIRI: Cek apakah ID pengirim = ID user yg login
            const isMe = msg.user_id === user?.id || msg.userId === user?.id;
            
            // LOGIKA NAMA - ROLE
            const senderName = msg.username || msg.user?.name || msg.user?.username || 'Team Member';
            const senderRole = msg.role || msg.user?.role || '';
            const displayName = senderRole ? `${senderName} - ${senderRole}` : senderName;

            return (
              <div key={msg.id} className={`flex gap-3 items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`p-2 rounded-full text-white flex-shrink-0 mb-1 ${isMe ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                  <User size={16} />
                </div>
                
                {/* Bubble Chat */}
                <div className={`max-w-[80%] md:max-w-md p-3.5 rounded-2xl text-sm shadow-sm ${
                  isMe 
                    ? 'bg-indigo-100 border border-indigo-200 text-indigo-950 rounded-br-none' // Bubble Kanan (Kita)
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none' // Bubble Kiri (Teman)
                }`}>
                  <div className={`font-bold text-[11px] mb-1.5 uppercase tracking-wide ${isMe ? 'text-indigo-600 text-right' : 'text-gray-500 text-left'}`}>
                    {displayName}
                  </div>
                  <div className={isMe ? 'text-right' : 'text-left'}>{msg.message}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} /> {/* Jangkar buat scroll ke bawah */}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2 bg-white rounded-b-2xl">
        <input
          type="text"
          placeholder="Tulis pesan koordinasi tim di sini..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
        />
        <button type="submit" className="bg-indigo-600 text-white p-2.5 px-5 rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 font-semibold shadow-sm">
          <Send size={18} /> Kirim
        </button>
      </form>
    </div>
  );
}