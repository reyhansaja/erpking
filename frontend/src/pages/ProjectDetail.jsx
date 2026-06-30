import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import KanbanBoard from './KanbanBoard';
import GanttChart from './GanttChart';
import FeaturesBugs from './FeaturesBugs';
import ProjectChat from './ProjectChat';
import ProjectDashboard from './ProjectDashboard';
import { ArrowLeft, LayoutDashboard, Bug, Link as LinkIcon, MessageSquare, Edit2, X, Save, UserPlus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://erpking-backend-353150454444.asia-southeast1.run.app/api';

export default function ProjectDetail({ user }) {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('kanban');
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [searchUser, setSearchUser] = useState('');

  // STATE BARU: Untuk nampung jumlah chat yang belum dibaca g!
  const [unreadCount, setUnreadCount] = useState(0);

  // STATE UNTUK FITUR EDIT PROJECT
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Pastikan ambil role yang bener buat hak akses
  const localUserData = JSON.parse(localStorage.getItem('user'));
  const activeUser = user || localUserData;
  const isSuperAdmin = activeUser?.role === 'SUPERADMIN';

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${API_URL}/projects/${id}`);
        setProject(res.data);
        
        // Isi form edit pake data aslinya pas awal load
        setEditName(res.data.name);
        setEditDesc(res.data.description || '');
      } catch (error) {
        console.error(error);
      }
    };
    fetchProject();
  }, [id]);

  // ==== EFEK BARU: Radar Pendeteksi Chat Masuk ====
  useEffect(() => {
    if (!id) return;
    
    const checkUnreadChats = async () => {
      try {
        const res = await axios.get(`${API_URL}/projects/${id}/chats`);
        const totalChatsInDB = res.data.length;
        const storageKey = `chat_viewed_count_${id}`;

        if (activeTab === 'chat') {
          localStorage.setItem(storageKey, totalChatsInDB.toString());
          setUnreadCount(0);
        } else {
          const viewedChats = parseInt(localStorage.getItem(storageKey) || '0');
          if (totalChatsInDB > viewedChats) {
            setUnreadCount(totalChatsInDB - viewedChats);
          }
        }
      } catch (err) {
        console.error("Gagal ngecek notif chat g:", err);
      }
    };

    checkUnreadChats();
    const interval = setInterval(checkUnreadChats, 5000);
    return () => clearInterval(interval);
  }, [id, activeTab]); 
  // =================================================

  // FUNGSI UNTUK SIMPAN PERUBAHAN NAMA PROJECT
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/projects/${id}`, {
        name: editName,
        description: editDesc
      });
      // Langsung update layar tanpa perlu nge-fetch ulang dari backend
      setProject({ ...project, name: editName, description: editDesc });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Gagal update project:", error);
      alert("Gagal menyimpan perubahan g!");
    }
  };

  const fetchMembersAndUsers = async () => {
  try {
    const [usersRes, membersRes] = await Promise.all([
      axios.get(`${API_URL}/projects/users/all`),
      axios.get(`${API_URL}/projects/${id}/members`)
    ]);
    setAllUsers(usersRes.data);
    setProjectMembers(membersRes.data);
  } catch (err) {
    console.error('Gagal fetch users:', err);
  }
};

const handleInviteUser = async (userId) => {
  try {
    await axios.post(`${API_URL}/projects/${id}/invite`, { userId });
    await fetchMembersAndUsers();
  } catch (err) {
    alert('Gagal mengundang user');
  }
};

const handleRemoveUser = async (userId) => {
  if (!confirm('Keluarkan user ini dari project?')) return;
  try {
    await axios.delete(`${API_URL}/projects/${id}/members/${userId}`);
    await fetchMembersAndUsers();
  } catch (err) {
    alert('Gagal mengeluarkan user');
  }
};

  if (!project) return <div className="p-8 text-center text-gray-500">Loading project...</div>;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Project Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-white sticky top-0 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* TOMBOL BACK YANG UDAH PINTAR g! */}
          <Link 
            to={project.folder_id ? `/?folder=${project.folder_id}` : "/"} 
            className="text-gray-400 hover:text-indigo-600 mb-2 inline-flex items-center gap-1 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to {project.folder_id ? 'Folder' : 'Projects'}
          </Link>
          
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{project.name}</h2>
            {/* TOMBOL EDIT PROJECT (Cuma Superadmin yg bisa liat) */}
            {isSuperAdmin && (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit Nama Project"
              >
                <Edit2 size={18} />
              </button>
            )}
            {isSuperAdmin && (
              <button
                onClick={() => { setIsInviteModalOpen(true); fetchMembersAndUsers(); }}
                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Undang User ke Project"
              >
                <UserPlus size={18} />
              </button>
            )}
          </div>
          {project.description && <p className="text-gray-500 mt-1">{project.description}</p>}
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
          <LinkIcon size={16} className="text-gray-400" />
          <div className="text-sm">
            <span className="text-gray-500">Invite Token: </span>
            <code className="text-indigo-600 font-mono font-bold select-all bg-indigo-50 px-2 py-0.5 rounded">{project.invite_token}</code>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 border-b border-gray-200 bg-gray-50">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'dashboard'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'kanban'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <LayoutDashboard size={18} /> Kanban Board
          </button>
          <button
            onClick={() => setActiveTab('bugs')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'bugs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Bug size={18} /> Features & Bugs
          </button>
          <button
            onClick={() => setActiveTab('gantt')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'gantt'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            📊 Gantt Chart
          </button>
          
          {/* TAB CHAT DENGAN FITUR RED DOT g! */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'chat'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center gap-1.5">
              <MessageSquare size={18} /> 
              <span>Project Chat</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50/50">
        {activeTab === 'dashboard' && <ProjectDashboard projectId={project.id} user={user} />}
        {activeTab === 'kanban' && <KanbanBoard projectId={project.id} projectName={project.name} user={user} />}
        {activeTab === 'bugs' && <FeaturesBugs projectId={project.id} user={user} />}
        {activeTab === 'gantt' && <GanttChart projectId={project.id} user={user} />}
        {activeTab === 'chat' && <ProjectChat projectId={project.id} user={user} />}
      </div>

      {/* MODAL EDIT PROJECT */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Edit2 size={18} className="text-indigo-600" /> Edit Detail Project
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nama Project</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Deskripsi</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition text-sm font-semibold">
                  Batal
                </button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-indigo-700 transition text-sm font-semibold shadow-sm">
                  <Save size={16} /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isInviteModalOpen && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <UserPlus size={18} className="text-green-600" /> Undang User ke Project
        </h3>
        <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Member yang sudah ada */}
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Member Saat Ini</div>
          <div className="flex flex-wrap gap-2">
            {projectMembers.map(m => (
              <div key={m.id} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full">
                {m.username}
                <button onClick={() => handleRemoveUser(m.id)} className="ml-1 text-red-400 hover:text-red-600">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Cari user */}
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Tambah User</div>
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchUser}
            onChange={e => setSearchUser(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
          />
          <div className="max-h-48 overflow-y-auto space-y-1">
            {allUsers
              .filter(u =>
                !projectMembers.find(m => m.id === u.id) &&
                (u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
                 u.email.toLowerCase().includes(searchUser.toLowerCase()))
              )
              .map(u => (
                <div key={u.id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{u.username}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                  <button
                    onClick={() => handleInviteUser(u.id)}
                    className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-600 transition"
                  >
                    + Undang
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};