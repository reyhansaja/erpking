import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { X, Clock } from 'lucide-react';

const API_URL = 'https://apii-erp.infistream.id/api';

export default function PersonalCalendar({ user }) {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newReminder, setNewReminder] = useState({ title: '', description: '' });

  const fetchReminders = async () => {
    try {
      const res = await axios.get(`${API_URL}/reminders/${user.id}`);
      const formattedEvents = res.data.map(r => ({
        id: r.id,
        title: r.title,
        date: r.reminder_date,
        extendedProps: { description: r.description }
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user.id]);

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setIsModalOpen(true);
  };

  const handleSaveReminder = async (e) => {
    e.preventDefault();
    if (!newReminder.title.trim()) return;
    try {
      await axios.post(`${API_URL}/reminders`, {
        userId: user.id,
        title: newReminder.title,
        description: newReminder.description,
        reminderDate: selectedDate
      });
      setNewReminder({ title: '', description: '' });
      setIsModalOpen(false);
      fetchReminders();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Personal Calendar</h2>
        <p className="text-gray-500 mt-1">Click any date to add a personal reminder.</p>
      </div>

      <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <style>{`
          .fc-theme-standard td, .fc-theme-standard th { border-color: #f3f4f6; }
          .fc-col-header-cell { padding: 12px 0; background-color: #f9fafb; font-weight: 600; color: #4b5563; }
          .fc-daygrid-day-number { padding: 8px; color: #374151; font-weight: 500; }
          .fc-event { border-radius: 6px; padding: 2px 4px; font-size: 0.8em; border: none; background-color: #4f46e5; }
          .fc-button-primary { background-color: #4f46e5 !important; border-color: #4f46e5 !important; }
          .fc-button-primary:hover { background-color: #4338ca !important; border-color: #4338ca !important; }
        `}</style>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          dateClick={handleDateClick}
          height="100%"
          eventDisplay="block"
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Clock className="text-indigo-600" />
                Add Reminder
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveReminder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 font-mono text-sm border border-gray-200">
                  {selectedDate}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="E.g., Meeting with client"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px] resize-y"
                  placeholder="Additional details..."
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
