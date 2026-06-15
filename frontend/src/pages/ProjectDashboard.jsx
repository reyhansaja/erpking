import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlayCircle, PauseCircle, CheckCircle2, Inbox, Info, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://erpking-backend-353150454444.asia-southeast1.run.app/api';

export default function ProjectDashboard({ projectId, user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [activeListTab, setActiveListTab] = useState('on_progress');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/projects/${projectId}/tasks`);
      setTasks(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tasks for dashboard:', err);
      setError('Gagal memuat data dashboard proyek.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[350px] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Menganalisis data proyek...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 flex flex-col items-center gap-2">
        <p className="font-semibold">{error}</p>
        <button
          onClick={fetchTasks}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const onProgressTasks = tasks.filter(t => t.status === 'on_progress');
  const holdTasks = tasks.filter(t => t.status === 'hold');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const onProgressPercent = totalTasks > 0 ? (onProgressTasks.length / totalTasks) * 100 : 0;
  const holdPercent = totalTasks > 0 ? (holdTasks.length / totalTasks) * 100 : 0;
  const donePercent = totalTasks > 0 ? (doneTasks.length / totalTasks) * 100 : 0;

  // SVG Donut Chart parameters
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.82
  const strokeWidthDefault = 18;
  const strokeWidthHover = 24;

  const segments = [
    {
      status: 'on_progress',
      count: onProgressTasks.length,
      percentage: onProgressPercent,
      color: '#6366f1', // Indigo
      label: 'On Progress',
      bgGradient: 'from-indigo-500 to-violet-600',
      icon: PlayCircle,
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      status: 'hold',
      count: holdTasks.length,
      percentage: holdPercent,
      color: '#f59e0b', // Amber
      label: 'Hold',
      bgGradient: 'from-amber-500 to-orange-600',
      icon: PauseCircle,
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      status: 'done',
      count: doneTasks.length,
      percentage: donePercent,
      color: '#10b981', // Emerald
      label: 'Done',
      bgGradient: 'from-emerald-500 to-teal-600',
      icon: CheckCircle2,
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  // Calculate slice properties for non-empty slices
  let accumulatedPercentage = 0;
  const activeSlices = segments
    .filter(seg => seg.count > 0)
    .map(seg => {
      const strokeLength = (seg.percentage / 100) * circumference;
      const strokeOffset = -(accumulatedPercentage / 100) * circumference;
      accumulatedPercentage += seg.percentage;
      return {
        ...seg,
        strokeLength,
        strokeOffset
      };
    });

  // Determine central display text based on hover or total
  let centerLabel = 'Total Tasks';
  let centerValue = totalTasks;
  let centerSubLabel = 'tasks';

  if (hoveredSlice) {
    const activeSeg = segments.find(s => s.status === hoveredSlice);
    if (activeSeg) {
      centerLabel = activeSeg.label;
      centerValue = activeSeg.count;
      centerSubLabel = `${activeSeg.percentage.toFixed(1)}%`;
    }
  }

  // Active tasks for the detail list
  const activeListTasks = tasks.filter(t => t.status === activeListTab);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">

      {/* Empty State */}
      {totalTasks === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center max-w-lg mx-auto flex flex-col items-center gap-4 shadow-sm">
          <div className="p-4 bg-gray-50 text-gray-400 rounded-full">
            <Inbox size={48} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">No Tasks Yet</h3>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              Belum ada tugas yang ditambahkan ke proyek ini. Silakan masuk ke tab <strong>Kanban Board</strong> untuk membuat tugas pertama Anda!
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card Total */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Tasks</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{totalTasks}</h3>
                </div>
                <div className="p-3 bg-white text-gray-600 rounded-xl shadow-sm">
                  <Inbox size={22} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-gray-400 font-medium">
                <span>Semua tugas di workspace</span>
              </div>
            </div>

            {/* Status Cards */}
            {segments.map(seg => {
              const Icon = seg.icon;
              return (
                <button
                  key={seg.status}
                  onClick={() => setActiveListTab(seg.status)}
                  className={`text-left w-full bg-white border ${activeListTab === seg.status ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-gray-100'} rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{seg.label}</p>
                      <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{seg.count}</h3>
                    </div>
                    <div className={`p-3 ${seg.bgColor} ${seg.textColor} rounded-xl shadow-sm`}>
                      <Icon size={22} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                    <span className={seg.textColor}>{seg.percentage.toFixed(1)}% dari total</span>
                    <span className="text-gray-400 flex items-center gap-0.5 hover:text-indigo-600 transition-colors">
                      Lihat Detail <ArrowRight size={12} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Donut Chart & Detailed Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Pie Chart Card (4 cols) */}
            <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center relative min-h-[400px]">
              <h3 className="text-lg font-bold text-gray-800 mb-6 w-full text-left border-b border-gray-50 pb-4 flex items-center gap-2">
                📊 Persentase Status Tugas
              </h3>

              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* SVG Donut Chart */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 200 200"
                  className="transform -rotate-90 select-none"
                >
                  {/* Background Circle if total tasks exist */}
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke="#f3f4f6"
                    strokeWidth={strokeWidthDefault}
                  />

                  {activeSlices.map((slice) => (
                    <circle
                      key={slice.status}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={hoveredSlice === slice.status ? strokeWidthHover : strokeWidthDefault}
                      strokeDasharray={`${slice.strokeLength} ${circumference}`}
                      strokeDashoffset={slice.strokeOffset}
                      strokeLinecap="round"
                      onMouseEnter={() => setHoveredSlice(slice.status)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      onClick={() => setActiveListTab(slice.status)}
                      style={{
                        transition: 'stroke-width 0.25s ease, opacity 0.25s ease',
                        cursor: 'pointer',
                        opacity: hoveredSlice && hoveredSlice !== slice.status ? 0.6 : 1
                      }}
                    />
                  ))}
                </svg>

                {/* Donut Hole Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider transition-all duration-200">
                    {centerLabel}
                  </span>
                  <span className="text-4xl font-black text-gray-800 mt-1 transition-all duration-200">
                    {centerValue}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 mt-0.5 px-2.5 py-0.5 bg-gray-50 rounded-full border border-gray-100 transition-all duration-200">
                    {centerSubLabel}
                  </span>
                </div>
              </div>

              {/* Legend with interactive highlight */}
              <div className="mt-8 grid grid-cols-3 gap-3 w-full border-t border-gray-50 pt-6">
                {segments.map(seg => (
                  <button
                    key={seg.status}
                    onMouseEnter={() => setHoveredSlice(seg.status)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    onClick={() => setActiveListTab(seg.status)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 border ${hoveredSlice === seg.status ? 'bg-gray-50 border-gray-200 scale-105 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }}></span>
                      <span>{seg.label}</span>
                    </div>
                    <span className="text-sm font-extrabold text-gray-900 mt-1">{seg.percentage.toFixed(0)}%</span>
                  </button>
                ))}
              </div>
            </div>

            {/* List Breakdown Card (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col min-h-[400px]">

              {/* Header Navigation */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  📋 Daftar Tugas &bull; {segments.find(s => s.status === activeListTab)?.label}
                </h3>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                  {activeListTasks.length} Tugas
                </span>
              </div>

              {/* Tab Selector */}
              <div className="flex gap-2 p-1.5 bg-gray-50 border border-gray-200/50 rounded-xl mb-6">
                {segments.map(seg => (
                  <button
                    key={seg.status}
                    onClick={() => setActiveListTab(seg.status)}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${activeListTab === seg.status ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {seg.label}
                  </button>
                ))}
              </div>

              {/* Task Cards Container */}
              <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-2 scrollbar-thin">
                {activeListTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 gap-2">
                    <Info size={28} />
                    <p className="text-sm font-medium">Tidak ada tugas dengan status ini.</p>
                  </div>
                ) : (
                  activeListTasks.map(task => (
                    <div key={task.id} className="p-4 border border-gray-100 rounded-2xl hover:border-indigo-100 hover:bg-indigo-50/10 transition-all duration-200">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-bold text-gray-800 text-sm leading-snug">{task.title}</h4>
                        <div className="flex -space-x-1.5 shrink-0">
                          {task.assignees?.map(a => (
                            <div
                              key={a.id}
                              className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] text-indigo-700 font-extrabold"
                              title={a.username}
                            >
                              {a.username.charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      </div>

                      {task.description && task.description.trim() !== '' && (
                        <p className="mt-2 text-xs text-gray-500 line-clamp-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          {task.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
