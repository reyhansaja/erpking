import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'https://erpking-backend-353150454444.asia-southeast1.run.app/api';

const COLORS = {
    on_progress: '#6366f1',
    hold: '#f59e0b',
    done: '#10b981'
};

export default function Dashboard({ user }) {
    const [stats, setStats] = useState({ on_progress: 0, hold: 0, done: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_URL}/projects/stats/summary`);
                setStats(res.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const pieData = [
        { name: 'On Progress', value: stats.on_progress, color: COLORS.on_progress },
        { name: 'Hold', value: stats.hold, color: COLORS.hold },
        { name: 'Done', value: stats.done, color: COLORS.done },
    ].filter(d => d.value > 0);

    const barData = [
        { name: 'On Progress', value: stats.on_progress, fill: COLORS.on_progress },
        { name: 'Hold', value: stats.hold, fill: COLORS.hold },
        { name: 'Done', value: stats.done, fill: COLORS.done },
    ];

    const total = stats.on_progress + stats.hold + stats.done;

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h2>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {[
                    { label: 'Total Projects', value: total, color: 'text-gray-800' },
                    { label: 'On Progress', value: stats.on_progress, color: 'text-indigo-600' },
                    { label: 'Hold', value: stats.hold, color: 'text-amber-500' },
                    { label: 'Done', value: stats.done, color: 'text-emerald-500' },
                ].map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{card.label}</p>
                        <p className={`text-4xl font-extrabold mt-2 ${card.color}`}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Project Status Distribution</h3>
                    {pieData.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-10">No data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {pieData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Bar Chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Project Count by Status</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={barData} barSize={48}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {barData.map((entry, index) => (
                                    <Cell key={index} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}