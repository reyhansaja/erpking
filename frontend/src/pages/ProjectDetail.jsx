import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, LayoutDashboard, Bug, Link as LinkIcon, MessageSquare } from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import GanttChart from './GanttChart';
import FeaturesBugs from './FeaturesBugs';
import ProjectChat from './ProjectChat';
import ProjectDashboard from './ProjectDashboard';

const API_URL = import.meta.env.VITE_API_URL || 'https://erpking-backend-353150454444.asia-southeast1.run.app/api';

export default function ProjectDetail({ user }) {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('kanban');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${API_URL}/projects/${id}`);
        setProject(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProject();
  }, [id]);

  if (!project) return <div className="p-8 text-center text-gray-500">Loading project...</div>;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Project Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-white sticky top-0 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link to="/" className="text-gray-400 hover:text-indigo-600 mb-2 inline-flex items-center gap-1 transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Projects
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{project.name}</h2>
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
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'chat'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <MessageSquare size={18} /> Project Chat
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50/50">
        {activeTab === 'dashboard' && <ProjectDashboard projectId={project.id} user={user} />}
        {activeTab === 'kanban' && <KanbanBoard projectId={project.id} user={user} />}
        {activeTab === 'bugs' && <FeaturesBugs projectId={project.id} user={user} />}
        {activeTab === 'gantt' && <GanttChart projectId={project.id} user={user} />}
        {activeTab === 'chat' && <ProjectChat projectId={project.id} user={user} />}
      </div>
    </div>
  );
};
