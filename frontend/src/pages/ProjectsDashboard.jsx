import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { Folder, Plus, Link as LinkIcon, Trash, AlertTriangle, ChevronDown, FolderPlus, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://erpking-backend-353150454444.asia-southeast1.run.app/api';

export default function ProjectsDashboard({ user }) {
  // STATE DATA
  const [projects, setProjects] = useState([]);
  const [folders, setFolders] = useState([]);

  // STATE INPUT FORM
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [joinToken, setJoinToken] = useState('');

  // STATE UI CONTROLS
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(true);

  // STATE DRAG AND DROP ENHANCEMENTS
  const [draggedProjectId, setDraggedProjectId] = useState(null); // Efek visual saat ditarik
  const [dragOverFolderId, setDragOverFolderId] = useState(null); // Highlight folder
  const [dragOverRoot, setDragOverRoot] = useState(false); // Highlight tombol back saat mau dikeluarin

  // STATE MODAL
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const location = useLocation();
  const localUserData = JSON.parse(localStorage.getItem('user'));
  const activeUser = user || localUserData;
  const currentRole = activeUser?.role || 'USER';

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = activeUser?.id;
      if (!userId) return;

      const resProj = await axios.get(`${API_URL}/projects/user/${userId}`);
      const deletedIds = JSON.parse(localStorage.getItem('deleted_projects') || '[]');
      const activeProjects = resProj.data.filter(proj =>
        !deletedIds.includes(proj.id) && proj.name !== "DELETED_MARKER"
      );

      const projectsWithTasks = await Promise.all(
        activeProjects.map(async (proj) => {
          try {
            const taskRes = await axios.get(`${API_URL}/projects/${proj.id}/tasks`);
            return { ...proj, tasks: taskRes.data };
          } catch {
            return { ...proj, tasks: [] };
          }
        })
      );
      setProjects(projectsWithTasks);

      try {
        const resFolders = await axios.get(`${API_URL}/folders/user/${userId}`);
        setFolders(resFolders.data);
      } catch (err) {
        console.warn("API Folders belum merespon g:", err);
      }
    } catch (error) {
      console.error("Gagal mengambil data proyek:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeUser?.id) fetchData();
    else setLoading(false);
  }, [activeUser?.id]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const folderIdParam = searchParams.get('folder');
    
    if (folderIdParam && folders.length > 0) {
      const targetFolder = folders.find(f => f.id.toString() === folderIdParam);
      if (targetFolder) {
        setCurrentFolder(targetFolder);
      }
    }
  }, [location.search, folders]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim() || !activeUser?.id) return;
    try {
      await axios.post(`${API_URL}/projects`, {
        name: newProjectName,
        description: newProjectDesc,
        userId: activeUser.id,
        folderId: currentFolder ? currentFolder.id : null
      });
      setNewProjectName('');
      setNewProjectDesc('');
      setIsCreatingProject(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim() || !activeUser?.id) return;
    try {
      await axios.post(`${API_URL}/folders`, {
        name: newFolderName,
        userId: activeUser.id
      });
      setNewFolderName('');
      setIsCreatingFolder(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinToken.trim() || !activeUser?.id) return;
    try {
      await axios.post(`${API_URL}/projects/join/${joinToken}`, { userId: activeUser.id });
      setJoinToken('');
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to join project. Invalid token?');
    }
  };

  // ================= DRAG AND DROP HANDLERS =================
  const onDragStart = (e, projectId) => {
    e.dataTransfer.setData('projectId', projectId);
    // Timeout kecil agar efek transparan cuma kena di kartu asli, bukan di 'hantu' kursornya
    setTimeout(() => setDraggedProjectId(projectId), 0);
  };

  const onDragLeave = () => {
    setDragOverFolderId(null);
  };

  const onDragEnd = () => {
    setDraggedProjectId(null);
    setDragOverFolderId(null);
    setDragOverRoot(false);
  };

  const onDragOverFolder = (e, folderId) => {
    e.preventDefault();
    setDragOverFolderId(folderId);
  };

  const onDrop = async (e, folderId) => {
    e.preventDefault();
    setDragOverFolderId(null);
    setDragOverRoot(false);
    
    const draggedId = e.dataTransfer.getData('projectId');
    if (!draggedId) return;

    // Optimistic UI Update (FolderId = null berarti keluar dari folder)
    setProjects(prev => prev.map(p =>
      p.id.toString() === draggedId ? { ...p, folder_id: folderId } : p
    ));

    try {
      await axios.put(`${API_URL}/projects/${draggedId}/move`, { folderId });
    } catch (error) {
      console.error("Gagal mindahin project g:", error);
      fetchData(); // Rollback jika error
    }
  };

  // Auto-scroll global kalau kursor nyentuh pinggir layar pas lagi drag
  const handleGlobalDragOver = (e) => {
    e.preventDefault();
    const scrollThreshold = 100; // Jarak dari pinggir (px) untuk mulai scroll
    const scrollSpeed = 20;

    if (e.clientY < scrollThreshold) {
      window.scrollBy(0, -scrollSpeed);
    } else if (window.innerHeight - e.clientY < scrollThreshold) {
      window.scrollBy(0, scrollSpeed);
    }
  };
  // =========================================================

  const openDeleteModal = (e, project) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await axios.delete(`${API_URL}/projects/${projectToDelete.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
    } catch (err) {
      console.error('Gagal menghapus project:', err);
      alert('Gagal menghapus project. Silakan coba lagi.');
    } finally {
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const displayedProjects = projects.filter(p =>
    currentFolder ? p.folder_id === currentFolder.id : !p.folder_id
  );

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[300px] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Memuat workspace kamu...</p>
      </div>
    );
  }

  return (
    <div 
      className="p-8 max-w-6xl mx-auto relative min-h-screen" 
      onClick={() => setIsDropdownOpen(false)}
      onDragOver={handleGlobalDragOver} // Mengaktifkan Auto-scroll Global
    >

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div className="w-full md:w-auto">
          {currentFolder ? (
            // HEADER BERUBAH JADI DROP ZONE UNTUK KELUAR FOLDER g!
            <div 
              className={`flex items-center gap-4 p-3 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                dragOverRoot ? 'border-indigo-500 bg-indigo-50/80 scale-[1.02] shadow-sm' : 'border-transparent'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOverRoot(true); }}
              onDragLeave={() => setDragOverRoot(false)}
              onDrop={(e) => onDrop(e, null)}
            >
              <button 
                onClick={() => setCurrentFolder(null)} 
                className="p-2.5 bg-white shadow-sm hover:shadow-md rounded-full transition-all text-gray-600 hover:text-indigo-600"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <Folder className="text-indigo-600" size={28} /> {currentFolder.name}
                </h2>
                <p className="text-gray-500 mt-1 transition-colors duration-300">
                  {dragOverRoot 
                    ? <span className="font-bold text-indigo-600 flex items-center gap-1"><ArrowLeft size={16}/> Lepas di sini untuk mengeluarkan project!</span> 
                    : 'Isi folder workspace kamu g.'}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Your Workspaces</h2>
              <p className="text-gray-500 mt-1">
                Manage your workspaces. Status Role Kamu: <span className="font-bold text-indigo-600 uppercase">{currentRole}</span>
              </p>
            </div>
          )}
        </div>

        {currentRole !== 'USER' && (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
              className="bg-indigo-600 text-white px-5 py-2.5 text-sm rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm font-semibold shrink-0"
            >
              <Plus size={18} /> New <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* DROPDOWN MENU */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-2">
                <button
                  onClick={() => { setIsCreatingProject(true); setIsCreatingFolder(false); setIsDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 font-medium"
                >
                  <Plus size={16} /> New Project
                </button>
                {!currentFolder && (
                  <button
                    onClick={() => { setIsCreatingFolder(true); setIsCreatingProject(false); setIsDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 font-medium"
                  >
                    <FolderPlus size={16} /> New Folder
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

        {/* SIDEBAR FORMS */}
        <div className="lg:col-span-1 space-y-6">
          {isCreatingFolder && currentRole !== 'USER' && !currentFolder && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FolderPlus size={18} className="text-indigo-600" /> Create Folder</h3>
              <form onSubmit={handleCreateFolder} className="space-y-4">
                <input type="text" placeholder="Folder Name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm">Create Folder</button>
              </form>
            </div>
          )}

          {isCreatingProject && currentRole !== 'USER' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Folder size={18} className="text-indigo-600" /> Create Project</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <input type="text" placeholder="Project Name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <textarea placeholder="Description (Optional)" value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]" />
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm">Create {currentFolder ? 'in Folder' : ''}</button>
              </form>
            </div>
          )}

          {currentRole !== 'USER' && !currentFolder && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><LinkIcon size={18} className="text-indigo-600" /> Join Project</h3>
              <form onSubmit={handleJoin} className="flex flex-col gap-2">
                <input type="text" placeholder="Invite Token..." value={joinToken} onChange={(e) => setJoinToken(e.target.value)} required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button type="submit" className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition shadow-sm">Join</button>
              </form>
            </div>
          )}
        </div>

        {/* LIST FOLDERS & PROJECTS */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Render Folders */}
          {!currentFolder && folders.map(folder => (
            <div
              key={`folder-${folder.id}`}
              onClick={() => setCurrentFolder(folder)}
              onDragOver={(e) => onDragOverFolder(e, folder.id)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, folder.id)}
              className={`bg-indigo-50 cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 h-full flex flex-col justify-center items-center shadow-sm group hover:bg-indigo-100 
                ${dragOverFolderId === folder.id ? 'border-indigo-500 bg-indigo-100 scale-105 shadow-md' : 'border-indigo-100 border-dashed'}`}
            >
              <Folder size={48} className="text-indigo-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg font-bold text-indigo-900">{folder.name}</h3>
              <p className={`text-xs mt-2 font-medium bg-white px-3 py-1 rounded-full shadow-sm transition-colors ${dragOverFolderId === folder.id ? 'text-indigo-600' : 'text-indigo-600/70'}`}>
                {dragOverFolderId === folder.id ? 'Lepas di sini!' : 'Buka / Drop Project'}
              </p>
            </div>
          ))}

          {/* Render Projects */}
          {displayedProjects.length === 0 && folders.length === 0 ? (
            <div className="sm:col-span-2 bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-500 h-max flex flex-col items-center justify-center gap-3">
              <FolderPlus size={40} className="text-gray-300" />
              <p>Kosong. Belum ada project atau folder di sini.</p>
            </div>
          ) : (
            displayedProjects.map(project => {
              // DATA PIE CHART
              const done = project.tasks?.filter(t => t.status === 'done' || t.status === 'Done').length || 0;
              const onProgress = project.tasks?.filter(t => t.status === 'on_progress' || t.status === 'On Progress').length || 0;
              const hold = project.tasks?.filter(t => t.status === 'hold' || t.status === 'Hold').length || 0;
              const total = project.tasks?.length || 0;
              const chartData = [
                { name: 'Done', value: done, color: '#10b981' },
                { name: 'On Progress', value: onProgress, color: '#6366f1' },
                { name: 'Hold', value: hold, color: '#f59e0b' },
              ].filter(d => d.value > 0);

              return (
                <div
                  key={project.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, project.id)}
                  onDragEnd={onDragEnd}
                  // EFEK VISUAL SAAT KARTU DITARIK g!
                  className={`block group cursor-grab active:cursor-grabbing relative h-full transition-all duration-300 ease-in-out ${
                    draggedProjectId === project.id ? 'opacity-40 scale-95 border-indigo-300 shadow-none' : 'opacity-100 scale-100'
                  }`}
                >
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all h-full flex flex-col relative pointer-events-none">
                    {/* Pointer events none sementara ditambahkan ke konten dalam saat drag agar ghost image rapi */}
                    <div className="pointer-events-auto h-full flex flex-col">
                      
                      {currentRole === 'SUPERADMIN' && (
                        <button onClick={(e) => openDeleteModal(e, project)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors z-10" title="Delete Project">
                          <Trash size={18} />
                        </button>
                      )}

                      <Link to={`/project/${project.id}`} className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Folder size={24} />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-700 transition-colors">{project.name}</h3>
                        <p className="text-gray-500 text-sm flex-1 line-clamp-2">{project.description || 'No description provided.'}</p>

                        {/* MINI PIE CHART */}
                        {total > 0 && (
                          <div className="mt-4 flex items-center gap-4">
                            <ResponsiveContainer width={80} height={80}>
                              <PieChart>
                                <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={22} outerRadius={36} strokeWidth={0}>
                                  {chartData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} tasks`]} />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col gap-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>Done: {done}/{total}</span>
                              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>On Progress: {onProgress}</span>
                              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>Hold: {hold}</span>
                            </div>
                          </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-xs font-medium text-gray-400">
                          <div className="flex flex-col gap-1">
                            <span>Drag to Move / Click to Open</span>
                            <select
                              value={project.status || 'on_progress'}
                              onClick={(e) => e.preventDefault()}
                              onChange={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const newStatus = e.target.value;
                                
                                setProjects(prev => prev.map(p =>
                                  p.id === project.id ? { ...p, status: newStatus } : p
                                ));
                                try {
                                  await axios.patch(`${API_URL}/projects/${project.id}/status`, {
                                    status: newStatus
                                  });
                                } catch (err) {
                                  console.error('Gagal update status:', err);
                                  fetchData(); // Rollback otomatis
                                }
                              }}
                              className={`text-xs font-semibold px-2 py-1 rounded-md border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-300 w-fit mt-1
                                ${project.status === 'done' ? 'bg-emerald-50 text-emerald-600' :
                                  project.status === 'hold' ? 'bg-amber-50 text-amber-600' :
                                  'bg-indigo-50 text-indigo-600'}`}
                            >
                              <option value="on_progress">🔵 On Progress</option>
                              <option value="hold">🟡 Hold</option>
                              <option value="done">🟢 Done</option>
                            </select>
                          </div>
                          <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Open &rarr;</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL HAPUS */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 transform transition-all z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0"><AlertTriangle size={24} /></div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Project?</h3>
                <p className="text-sm text-gray-500 mt-2">Apakah kamu benar-benar yakin ingin menghapus workspace <span className="font-semibold text-gray-800">"{projectToDelete?.name}"</span>? Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition">Cancel</button>
              <button onClick={confirmDeleteProject} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}