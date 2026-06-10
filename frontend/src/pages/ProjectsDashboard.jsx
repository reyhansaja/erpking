import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Folder, Plus, Link as LinkIcon, Trash, AlertTriangle } from 'lucide-react';

const API_URL = 'https://apii-erp.infistream.id/api';

export default function ProjectsDashboard({ user }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [joinToken, setJoinToken] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // CONTROL POP-UP MODAL DELETE
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Ambil data user dari localStorage sebagai pelapis utama anti-delay refresh g!
  const localUserData = JSON.parse(localStorage.getItem('user'));
  const activeUser = user || localUserData;

  // KODE BYPASS: Paksa selalu jadi SUPERADMIN g!
  const currentRole = 'SUPERADMIN';

 const fetchProjects = async () => {
    try {
      // KITA BALIKIN KE JALUR RESMI g! Pakai ID 1 (admin)
      const userId = activeUser?.id || 1; 
      const res = await axios.get(`${API_URL}/projects/user/${userId}`);
      
      const deletedIds = JSON.parse(localStorage.getItem('deleted_projects') || '[]');
      const activeProjects = res.data.filter(proj => 
        !deletedIds.includes(proj.id) && proj.name !== "DELETED_MARKER"
      );
      
      setProjects(activeProjects);
    } catch (error) {
      console.error("Gagal mengambil data proyek g:", error);
    }
  };

  // Pemicu Fetch data: Wajib nunggu sampai activeUser bener-bener siap di memori g!
  useEffect(() => {
    fetchProjects();
  }, [user, activeUser?.id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const userId = activeUser?.id || 1;
    try {
      await axios.post(`${API_URL}/projects`, { name: newProjectName, description: newProjectDesc, userId: userId });
      setNewProjectName('');
      setNewProjectDesc('');
      setIsCreating(false);
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinToken.trim()) return;
    const userId = activeUser?.id || 1;
    try {
      await axios.post(`${API_URL}/projects/join/${joinToken}`, { userId: userId });
      setJoinToken('');
      fetchProjects();
    } catch (error) {
      console.error(error);
      alert('Failed to join project. Invalid token?');
    }
  };

  const openDeleteModal = (e, project) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = () => {
    if (!projectToDelete) return;

    const deletedIds = JSON.parse(localStorage.getItem('deleted_projects') || '[]');
    if (!deletedIds.includes(projectToDelete.id)) {
      deletedIds.push(projectToDelete.id);
      localStorage.setItem('deleted_projects', JSON.stringify(deletedIds));
    }
    
    setProjects(projects.filter(project => project.id !== projectToDelete.id));
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Your Workspaces</h2>
          <p className="text-gray-500 mt-1">
            Manage your workspaces. Status Role Kamu: <span className="font-bold text-indigo-600 uppercase">{currentRole}</span>
          </p>
        </div>

        {currentRole !== 'USER' && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-indigo-600 text-white px-4 py-2 text-sm rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm font-medium shrink-0"
          >
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Create/Join Forms */}
        <div className="lg:col-span-1 space-y-6">
          {isCreating && currentRole !== 'USER' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Folder size={18} className="text-indigo-600" /> Create Project</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <textarea
                  placeholder="Description (Optional)"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                />
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
                  Create
                </button>
              </form>
            </div>
          )}

          {currentRole !== 'USER' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><LinkIcon size={18} className="text-indigo-600" /> Join Project</h3>
              <form onSubmit={handleJoin} className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Invite Token..."
                  value={joinToken}
                  onChange={(e) => setJoinToken(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition">
                  Join
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Project List */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="sm:col-span-2 bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-500">
              You are not a member of any projects yet.
            </div>
          ) : (
            projects.map(project => (
              <Link to={`/project/${project.id}`} key={project.id} className="block group">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all h-full flex flex-col relative">
                  
                  {currentRole === 'SUPERADMIN' && (
                    <button
                      onClick={(e) => openDeleteModal(e, project)}
                      className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors z-10"
                      title="Delete Project"
                    >
                      <Trash size={18} />
                    </button>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Folder size={24} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{project.name}</h3>
                  <p className="text-gray-500 text-sm flex-1 line-clamp-2">{project.description || 'No description provided.'}</p>

                  <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-xs font-medium text-gray-400">
                    <span>Joined recently</span>
                    <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                      Open Project &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* COMPONENT POP-UP MODAL CUSTOM TAILWIND */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDeleteModalOpen(false)}
          ></div>

          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 transform transition-all z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Project?</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Apakah kamu benar-benar yakin ingin menghapus workspace <span className="font-semibold text-gray-800">"{projectToDelete?.name}"</span> g? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}