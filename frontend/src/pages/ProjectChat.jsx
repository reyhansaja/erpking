import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, Plus, X, Image as ImageIcon, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://erpking-backend-353150454444.asia-southeast1.run.app/api';

export default function ProjectChat({ projectId, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // STATE BARU BUAT FITUR FILE & DRAG DROP g!
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
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
    const interval = setInterval(() => {
      if (projectId) fetchChats();
    }, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ================= EVENT HANDLERS BUAT DRAG & DROP =================
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Tangkap file pertama yang dijatuhin user
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      e.dataTransfer.clearData();
    }
  };

  // Handler kalau user milih file manual lewat tombol (+)
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  // ===================================================================

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return; // Boleh kirim kalau ada teks ATAU file

    // Karena mau kirim file, kita harus pakai FormData, bukan JSON biasa g!
    const formData = new FormData();
    formData.append('message', newMessage);
    formData.append('userId', user.id);
    if (selectedFile) {
      formData.append('file', selectedFile); 
    }

    // Reset inputan biar UI terasa cepat
    const msgTemp = newMessage;
    setNewMessage('');
    setSelectedFile(null);

    try {
      // Perhatikan headers-nya ganti jadi multipart/form-data
      await axios.post(`${API_URL}/projects/${projectId}/chats`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchChats();
    } catch (error) {
      console.error("Gagal mengirim chat:", error);
      // Fallback lokal (nggak nyimpen gambar kalau gagal server biar nggak pusing)
      const mockMsg = { 
        id: Date.now(), 
        message: msgTemp, 
        user_id: user.id,
        username: user.username || 'Saya',
        role: user.role || 'Admin',
        createdAt: new Date().toISOString() 
      };
      setMessages([...messages, mockMsg]);
    }
  };

  // FUNGSI RENDER FILE DALAM CHAT
  const renderAttachment = (fileUrl, fileType) => {
    if (!fileUrl) return null;
    
    // Cek apakah file adalah gambar
    if (fileType && fileType.startsWith('image/')) {
      return (
        <a href={fileUrl} target="_blank" rel="noreferrer">
          <img src={fileUrl} alt="attachment" className="mt-2 max-w-full rounded-xl border border-gray-200/50 shadow-sm max-h-60 object-contain hover:opacity-90 transition-opacity" />
        </a>
      );
    }
    // Cek apakah file adalah video
    if (fileType && fileType.startsWith('video/')) {
      return (
        <video controls className="mt-2 max-w-full rounded-xl border border-gray-200/50 shadow-sm max-h-60">
          <source src={fileUrl} type={fileType} />
          Browser kamu tidak mendukung pemutaran video ini g.
        </video>
      );
    }
    
    // Kalau dokumen biasa (PDF, Word, zip dll)
    return (
      <a href={fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-white/50 border border-gray-200 rounded-lg hover:bg-white transition-colors text-xs font-medium">
        <FileText size={16} className="text-indigo-500" />
        Unduh Lampiran Dokumen
      </a>
    );
  };

  return (
    <div 
      className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-6 flex flex-col h-[500px] relative overflow-hidden"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* OVERLAY DRAG & DROP (MUNCUL KALAU KURSOR BAWA FILE) */}
      {isDragging && (
        // ✅ SOLUSI: Menambahkan 'pointer-events-none' pada overlay container
        // agar browser mengabaikan element di dalamnya saat dragging, mencegah flickering.
        <div className="absolute inset-0 z-50 bg-indigo-50/90 backdrop-blur-sm flex flex-col items-center justify-center border-4 border-indigo-400 border-dashed rounded-2xl m-2 transition-all pointer-events-none">
          <div className="p-4 bg-white rounded-full shadow-lg mb-4 animate-bounce">
            <ImageIcon size={48} className="text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-indigo-900">Lepaskan File di Sini</h3>
          <p className="text-indigo-700 font-medium mt-1">Foto atau video akan langsung dikirim ke chat proyek g!</p>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 my-auto pt-20">Belum ada obrolan di proyek ini. Mulai chat koordinasi g!</div>
        ) : (
          messages.map(msg => {
            const isMe = msg.user_id === user?.id || msg.userId === user?.id;
            const senderName = msg.username || msg.user?.name || msg.user?.username || 'Team Member';
            const senderRole = msg.role || msg.user?.role || '';
            const displayName = senderRole ? `${senderName} - ${senderRole}` : senderName;

            return (
              <div key={msg.id} className={`flex gap-3 items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`p-2 rounded-full text-white flex-shrink-0 mb-1 ${isMe ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                  <User size={16} />
                </div>
                
                <div className={`max-w-[80%] md:max-w-md p-3.5 rounded-2xl text-sm shadow-sm ${
                  isMe ? 'bg-indigo-100 border border-indigo-200 text-indigo-950 rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                }`}>
                  <div className={`font-bold text-[11px] mb-1.5 uppercase tracking-wide ${isMe ? 'text-indigo-600 text-right' : 'text-gray-500 text-left'}`}>
                    {displayName}
                  </div>
                  
                  {/* Teks Pesan */}
                  {msg.message && <div className={isMe ? 'text-right' : 'text-left'}>{msg.message}</div>}
                  
                  {/* Panggil fungsi render attachment */}
                  {renderAttachment(msg.file_url, msg.file_type)}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} /> 
      </div>

      {/* PREVIEW FILE YANG MAU DIKIRIM (Muncul di atas form chat) */}
      {selectedFile && (
        <div className="px-4 py-3 border-t border-gray-100 bg-indigo-50 flex items-center justify-between animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
              <ImageIcon size={20} />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold text-gray-800 truncate">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setSelectedFile(null)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2 bg-white rounded-b-2xl items-center">
        
        {/* TOMBOL PLUS (+) BUAT PILIH FILE MANUAL g! */}
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 bg-gray-50 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-gray-200 transition-all shrink-0"
          title="Lampirkan File/Foto"
        >
          <Plus size={20} />
        </button>
        {/* Input file asli di-hide, diganti sama tombol Plus di atas */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          accept="image/*,video/*" // Batasi cuma gambar & video kalau mau
        />

        <input
          type="text"
          placeholder="Tulis pesan atau letakkan file di sini..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
        />
        
        <button 
          type="submit" 
          disabled={!newMessage.trim() && !selectedFile}
          className={`p-2.5 px-5 rounded-xl transition-all flex items-center gap-2 font-semibold shadow-sm ${
            (!newMessage.trim() && !selectedFile) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <Send size={18} /> Kirim
        </button>
      </form>
    </div>
  );
}