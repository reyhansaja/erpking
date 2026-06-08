import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Folder, Plus, Link as LinkIcon, Users } from 'lucide-react';

const API_URL = 'https://apii-erp.infistream.id/api';

export default function ProjectsDashboard({ user }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [joinToken, setJoinToken] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/projects/user/${user.id}`);
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user.id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await axios.post(`${API_URL}/projects`, { name: newProjectName, description: newProjectDesc, userId: user.id });
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
    try {
      await axios.post(`${API_URL}/projects/join/${joinToken}`, { userId: user.id });
      setJoinToken('');
      fetchProjects();
    } catch (error) {
      console.error(error);
      alert('Failed to join project. Invalid token?');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Your Projects</h2>
          <p className="text-gray-500 mt-1">Manage your workspaces and collaborate with your team.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm font-medium"
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Create/Join Forms */}
        <div className="lg:col-span-1 space-y-6">
          {isCreating && (
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

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><LinkIcon size={18} className="text-indigo-600" /> Join Project</h3>
            <form onSubmit={handleJoin} className="flex gap-2">
              <input
                type="text"
                placeholder="Invite Token..."
                value={joinToken}
                onChange={(e) => setJoinToken(e.target.value)}
                required
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition">
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Project List */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="sm:col-span-2 bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-500">
              You are not a member of any projects yet.<br />Create a new one or join via an invite link.
            </div>
          ) : (
            projects.map(project => (
              <Link to={`/project/${project.id}`} key={project.id} className="block group">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all h-full flex flex-col">
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
    </div>
  );
}
