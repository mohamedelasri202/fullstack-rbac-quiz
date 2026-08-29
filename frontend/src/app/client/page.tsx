'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  worker?: { id: number; name: string; email: string };
}

export default function ClientDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Task State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchTasks = useCallback(async () => {
    const res = await api.get('/tasks');
    setTasks(res.data);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else if (user.role !== 'client') router.push('/');
      else fetchTasks();
    }
  }, [user, isLoading, router, fetchTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/tasks', { title, description });
      setTasks((prev) => [...prev, res.data]);
      setTitle('');
      setDescription('');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      const res = await api.put(`/tasks/${editingTask.id}`, {
        title: editTitle,
        description: editDescription,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, ...res.data } : t))
      );
      setEditingTask(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update task.');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading client dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Submit New Request</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm"
                  placeholder="Task requirement"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm"
                  placeholder="Detailed instructions..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Your Submitted Requests</h2>
          {tasks.length === 0 ? (
            <div className="bg-white p-6 text-center rounded-xl border border-slate-200 text-slate-500">
              You have not submitted any tasks yet.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{task.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{task.description || 'No description'}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Assigned Worker: <span className="font-medium text-slate-600">{task.worker?.name ? `${task.worker.name} (${task.worker.email})` : 'Pending assignment'}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      task.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.status}
                    </span>
                    <button
                      onClick={() => openEditModal(task)}
                      className="px-3 py-1 text-xs border border-indigo-200 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EDIT MODAL */}
        {editingTask && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Request</h3>
              <form onSubmit={handleUpdateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="px-4 py-2 border rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
                  >
                    Update Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}