import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, MessageSquare, Link as LinkIcon, X } from 'lucide-react';

const API_URL = 'https://apii-erp.infistream.id/api';

export default function KanbanBoard({ projectId, user }) {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeTask, setActiveTask] = useState(null); // For modal

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/projects/${projectId}/tasks`);
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await axios.post(`${API_URL}/projects/${projectId}/tasks`, { title: newTaskTitle, description: '' });
      setNewTaskTitle('');
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`${API_URL}/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };



  const columns = ['on_progress', 'hold', 'done'];
  const columnTitles = {
    'on_progress': 'On Progress',
    'hold': 'Hold',
    'done': 'Done'
  };

  return (
    <div className="p-8 h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 sr-only">Task Board</h2>
        <form onSubmit={handleCreateTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New task title..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
            <Plus size={18} /> Add Task
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => (
          <div key={col} className="kanban-column flex flex-col">
            <h3 className="font-semibold text-gray-700 mb-4 px-2 uppercase tracking-wide text-sm">{columnTitles[col]}</h3>
            <div className="flex-1 space-y-3">
              {tasks.filter(t => t.status === col).map(task => (
                <div key={task.id} className="kanban-card group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">{task.title}</h4>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="text-xs border-gray-200 rounded text-gray-500 bg-gray-50 focus:ring-0"
                    >
                      {columns.map(c => <option key={c} value={c}>{columnTitles[c]}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-between items-center mt-4 text-gray-400 text-sm">
                    <div className="flex -space-x-2">
                      {task.assignees?.map(a => (
                        <div key={a.id} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs text-indigo-700 font-bold" title={a.username}>
                          {a.username.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
