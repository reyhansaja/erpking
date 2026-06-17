import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://erpking-backend-353150454444.asia-southeast1.run.app/api';

const getProgressFromStatus = (task) => {
  if (task.status === 'Done' || task.status === 'done') return 100;
  if (task.status === 'Hold' || task.status === 'hold') return 10;
  if (task.status === 'On Progress' || task.status === 'on_progress') return 50;
  return task.progress || 0;
};

const statusLabel = {
  'Done': { label: 'Done', color: '#22c55e', bg: '#f0fdf4', text: '#166534' },
  'On Progress': { label: 'On Progress', color: '#3b82f6', bg: '#eff6ff', text: '#1e40af' },
  'on_progress': { label: 'On Progress', color: '#3b82f6', bg: '#eff6ff', text: '#1e40af' },
  'Hold': { label: 'Hold', color: '#f59e0b', bg: '#fffbeb', text: '#92400e' },
  'hold': { label: 'Hold', color: '#f59e0b', bg: '#fffbeb', text: '#92400e' },
};

export default function GanttChart({ projectId, user }) {
  const [tasks, setTasks] = useState([]);
  const [savedTasks, setSavedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks/${projectId}`);
      const all = res.data;
      // Pisahkan: done+tersimpan vs belum tersimpan
      const saved = all.filter(t => t.status === 'Done' && t.saved_to_gantt);
      const active = all.filter(t => !(t.status === 'Done' && t.saved_to_gantt));
      setSavedTasks(saved);
      setTasks(active);
    } catch (err) {
      console.error('Gagal fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchTasks();
  }, [projectId]);

 const handleDeadlineChange = async (taskId, deadline) => {
  try {
    await axios.put(`${API_URL}/tasks/${taskId}`, { deadline });
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, deadline } : t)
    );
  } catch (err) {
    console.error('Gagal update deadline:', err);
  }
};

  const handleSaveToGantt = async (task) => {
    try {
      await axios.put(`${API_URL}/tasks/${task.id}`, {
        status: task.status,
        saved_to_gantt: true
      });
      await fetchTasks();
    } catch (err) {
      console.error('Gagal simpan ke Gantt:', err);
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-gray-400">Loading Gantt Chart...</div>
  );

  return (
    <div className="p-6 space-y-8">

      {/* ── TABEL PROGRESS AKTIF ── */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Timeline Progress Misi</h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ textAlign:'left', padding:'10px 14px', fontSize:12, color:'#6b7280', fontWeight:500 }}>Misi</th>
                <th style={{ padding:'10px 14px', fontSize:12, color:'#6b7280', fontWeight:500 }}>PJ</th>
                <th style={{ padding:'10px 14px', fontSize:12, color:'#6b7280', fontWeight:500 }}>Status</th>
                <th style={{ padding:'10px 14px', fontSize:12, color:'#6b7280', fontWeight:500, minWidth:180 }}>Progress</th>
                <th style={{ padding:'10px 14px', fontSize:12, color:'#6b7280', fontWeight:500 }}>%</th>
                <th style={{ padding:'10px 14px', fontSize:12, color:'#6b7280', fontWeight:500 }}>Deadline</th>
                <th style={{ padding:'10px 14px', fontSize:12, color:'#6b7280', fontWeight:500 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding:'24px', textAlign:'center', color:'#9ca3af', fontSize:13 }}>
                    Semua misi sudah tersimpan di Gantt ✅
                  </td>
                </tr>
              )}
              {tasks.map(task => {
                const pct = getProgressFromStatus(task);
                const s = statusLabel[task.status] || statusLabel['on_progress'];
                const isDone = task.status === 'Done';
                return (
                  <tr key={task.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                    className="hover:bg-gray-50 transition-colors">
                    <td style={{ padding:'12px 14px', fontSize:13, color:'#1f2937', fontWeight: isDone ? 500 : 400 }}>
                      {isDone && <span style={{ color:'#22c55e', marginRight:6 }}>✓</span>}
                      {task.title}
                    </td>
                    <td style={{ padding:'12px 14px', fontSize:12, color:'#6b7280', textAlign:'center' }}>
                      {task.assignees?.map(a => (
                        <span key={a.id} style={{
                          display:'inline-block', background:'#e0e7ff', color:'#3730a3',
                          borderRadius:10, padding:'1px 7px', fontSize:11, marginRight:2
                        }}>{a.username}</span>
                      ))}
                    </td>
                    <td style={{ padding:'12px 14px', textAlign:'center' }}>
                      <span style={{
                        fontSize:11, padding:'3px 10px', borderRadius:10,
                        background: s.bg, color: s.text, whiteSpace:'nowrap'
                      }}>{s.label}</span>
                    </td>
                    <td style={{ padding:'12px 14px' }}>
                      <div style={{ background:'#f3f4f6', borderRadius:6, height:20, overflow:'hidden', position:'relative' }}>
                        <div style={{
                          width:`${pct}%`, height:'100%', background: s.color,
                          borderRadius:6, transition:'width 0.5s ease',
                          display:'flex', alignItems:'center', justifyContent:'flex-end',
                          paddingRight: pct > 15 ? 6 : 0
                        }}>
                          {pct > 20 && <span style={{ fontSize:10, color:'#fff', fontWeight:600 }}>{pct}%</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600, color: s.text, textAlign:'center' }}>
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
                    <td style={{ padding:'12px 14px', textAlign:'center' }}>
                      {isDone && (
                        <button
                          onClick={() => handleSaveToGantt(task)}
                          style={{
                            background:'#22c55e', color:'#fff', border:'none',
                            borderRadius:8, padding:'5px 12px', fontSize:11,
                            fontWeight:600, cursor:'pointer'
                          }}
                        >
                          Simpan ↓
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── GANTT TERSIMPAN ── */}
      {savedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">✅ Misi Selesai — Tersimpan di Gantt</h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:680 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #e5e7eb', background:'#f0fdf4' }}>
                  <th style={{ textAlign:'left', padding:'10px 14px', fontSize:12, color:'#166534', fontWeight:500 }}>Misi</th>
                  <th style={{ padding:'10px 14px', fontSize:12, color:'#166534', fontWeight:500 }}>PJ</th>
                  <th style={{ padding:'10px 14px', fontSize:12, color:'#166534', fontWeight:500, minWidth:180 }}>Progress</th>
                  <th style={{ padding:'10px 14px', fontSize:12, color:'#166534', fontWeight:500 }}>Deadline</th>
                  <th style={{ padding:'10px 14px', fontSize:12, color:'#166534', fontWeight:500 }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {savedTasks.map(task => (
                  <tr key={task.id} style={{ borderBottom:'1px solid #f0fdf4' }}
                    className="hover:bg-green-50 transition-colors">
                    <td style={{ padding:'12px 14px', fontSize:13, color:'#166534', fontWeight:500 }}>
                      <span style={{ color:'#22c55e', marginRight:6, fontSize:15 }}>✓</span>
                      {task.title}
                    </td>
                    <td style={{ padding:'12px 14px', fontSize:12, color:'#6b7280', textAlign:'center' }}>
                      {task.assignees?.map(a => (
                        <span key={a.id} style={{
                          display:'inline-block', background:'#dcfce7', color:'#166534',
                          borderRadius:10, padding:'1px 7px', fontSize:11, marginRight:2
                        }}>{a.username}</span>
                      ))}
                    </td>
                    <td style={{ padding:'12px 14px' }}>
                      <div style={{ background:'#dcfce7', borderRadius:6, height:20, overflow:'hidden' }}>
                        <div style={{
                          width:'100%', height:'100%', background:'#22c55e',
                          borderRadius:6, display:'flex', alignItems:'center',
                          justifyContent:'flex-end', paddingRight:6
                        }}>
                          <span style={{ fontSize:10, color:'#fff', fontWeight:700 }}>100%</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'12px 14px', fontSize:12, color:'#6b7280', whiteSpace:'nowrap' }}>
                      {task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID', {
                        day:'numeric', month:'short', year:'numeric'
                      }) : '-'}
                    </td>
                    <td style={{ padding:'12px 14px', textAlign:'center' }}>
                      <button
                        onClick={() => setSelectedTask(task)}
                        style={{
                          background:'#f0fdf4', color:'#166534', border:'1px solid #86efac',
                          borderRadius:8, padding:'4px 12px', fontSize:11,
                          fontWeight:500, cursor:'pointer'
                        }}
                      >
                        Lihat ↗
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL DETAIL TASK ── */}
      {selectedTask && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:50
        }} onClick={() => setSelectedTask(null)}>
          <div style={{
            background:'#fff', borderRadius:16, padding:28, maxWidth:480, width:'90%',
            boxShadow:'0 20px 60px rgba(0,0,0,0.15)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <span style={{
                  background:'#f0fdf4', color:'#166534', fontSize:11,
                  padding:'2px 8px', borderRadius:10, fontWeight:500
                }}>✓ Done · 100%</span>
                <h3 style={{ fontSize:17, fontWeight:600, color:'#1f2937', marginTop:8 }}>
                  {selectedTask.title}
                </h3>
              </div>
              <button onClick={() => setSelectedTask(null)}
                style={{ background:'none', border:'none', fontSize:20, color:'#9ca3af', cursor:'pointer' }}>✕</button>
            </div>

            {selectedTask.description && (
              <div style={{ background:'#f9fafb', borderRadius:10, padding:'12px 14px', marginBottom:14 }}>
                <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4 }}>Catatan / Deskripsi</div>
                <div style={{ fontSize:13, color:'#374151', lineHeight:1.6 }}>{selectedTask.description}</div>
              </div>
            )}

            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {selectedTask.assignees?.length > 0 && (
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4 }}>Penanggung Jawab</div>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                    {selectedTask.assignees.map(a => (
                      <span key={a.id} style={{
                        background:'#e0e7ff', color:'#3730a3',
                        borderRadius:10, padding:'2px 8px', fontSize:12
                      }}>{a.username}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedTask.deadline && (
                <div>
                  <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4 }}>Deadline</div>
                  <div style={{ fontSize:13, color:'#374151', fontWeight:500 }}>
                    {new Date(selectedTask.deadline).toLocaleDateString('id-ID', {
                      day:'numeric', month:'long', year:'numeric'
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}