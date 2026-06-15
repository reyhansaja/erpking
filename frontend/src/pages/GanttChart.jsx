import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://erpking-backend-353150454444.asia-southeast1.run.app/api';

const statusColor = {
  'Done':        { bar: '#22c55e', text: '#166534', bg: '#f0fdf4' },
  'On Progress': { bar: '#3b82f6', text: '#1e40af', bg: '#eff6ff' },
  'on_progress': { bar: '#3b82f6', text: '#1e40af', bg: '#eff6ff' }, // ✅ dari database
  'Hold':        { bar: '#f59e0b', text: '#92400e', bg: '#fffbeb' },
  'hold':        { bar: '#f59e0b', text: '#92400e', bg: '#fffbeb' },
};

export default function GanttChart({ projectId, user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch tasks langsung dari API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${API_URL}/tasks/${projectId}`);
        setTasks(res.data);
      } catch (err) {
        console.error('Gagal fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchTasks();
  }, [projectId]);

  const getProgress = (task) => {
    if (task.status === 'Done') return 100;
    if (task.status === 'Hold' || task.status === 'hold') return task.progress || 10;
    return task.progress || 40;
  };

  const handleDeadlineChange = async (taskId, deadline) => {
    try {
      await axios.put(`${API_URL}/tasks/${taskId}/deadline`, { deadline });
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, deadline } : t)
      );
    } catch (err) {
      console.error('Gagal update deadline:', err);
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-gray-400">Loading Gantt Chart...</div>
  );

  if (tasks.length === 0) return (
    <div className="p-8 text-center text-gray-400">Belum ada misi di project ini.</div>
  );

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Gantt Chart — Progress Misi</h3>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <th style={{ textAlign:'left', padding:'10px 14px', fontSize:12, color:'#6b7280', fontWeight:500 }}>Misi</th>
              <th style={{ padding:'10px 14px', fontSize:12, color:'#6b7280', fontWeight:500 }}>Status</th>
              <th style={{ padding:'10px 14px', fontSize:12, color:'#6b7280', fontWeight:500, minWidth:180 }}>Progress</th>
              <th style={{ padding:'10px 14px', fontSize:12, color:'#6b7280', fontWeight:500 }}>%</th>
              <th style={{ padding:'10px 14px', fontSize:12, color:'#6b7280', fontWeight:500 }}>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => {
              const pct = getProgress(task);
              const col = statusColor[task.status] || statusColor['on_progress'];
              return (
                <tr key={task.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                  className="hover:bg-gray-50 transition-colors">
                  <td style={{ padding:'12px 14px', fontSize:13, color:'#1f2937' }}>{task.title}</td>
                  <td style={{ padding:'12px 14px', textAlign:'center' }}>
                    <span style={{
                      fontSize:11, padding:'3px 10px', borderRadius:10,
                      background: col.bg, color: col.text, whiteSpace:'nowrap'
                    }}>
                      {task.status}
                    </span>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ background:'#f3f4f6', borderRadius:4, height:18, overflow:'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height:'100%', background: col.bar,
                        borderRadius:4, transition:'width 0.5s ease',
                        display:'flex', alignItems:'center', justifyContent:'flex-end',
                        paddingRight: pct > 15 ? 6 : 0
                      }}>
                        {pct > 20 && (
                          <span style={{ fontSize:10, color:'#fff', fontWeight:600 }}>{pct}%</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600, color: col.text, textAlign:'center' }}>
                    {pct}%
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <input
                      type="date"
                      defaultValue={task.deadline ? task.deadline.split('T')[0] : ''}
                      onChange={e => handleDeadlineChange(task.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}