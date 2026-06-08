import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'https://apii-erp.infistream.id/api';
const SOCKET_URL = 'https://apii-erp.infistream.id/';

export default function ProjectChat({ projectId, user }) {
  const [chats, setChats] = useState([]);
  const [newChat, setNewChat] = useState('');
  const chatEndRef = useRef(null);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${API_URL}/projects/${projectId}/chats`);
      setChats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchChats();

    const socket = io(SOCKET_URL);

    socket.emit('join_project', projectId);

    socket.on('new_chat', (chat) => {
      setChats((prevChats) => [...prevChats, chat]);
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const sendChat = async (e) => {
    e.preventDefault();
    if (!newChat.trim()) return;
    try {
      await axios.post(`${API_URL}/projects/${projectId}/chats`, {
        userId: user.id,
        message: newChat
      });
      setNewChat('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white max-w-4xl mx-auto shadow-sm border-x border-gray-100">
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-4">
        {chats.map(chat => (
          <div key={chat.id} className={`flex ${chat.user_id === user.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${chat.user_id === user.id ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
              <div className="text-xs opacity-70 mb-1 font-medium">{chat.username}</div>
              <div>{chat.message}</div>
            </div>
          </div>
        ))}
        {chats.length === 0 && <div className="text-center text-gray-400 mt-10">No messages yet. Say hello to your team!</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <form onSubmit={sendChat} className="flex gap-2">
          <input
            type="text"
            value={newChat}
            onChange={(e) => setNewChat(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-medium shadow-sm">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

