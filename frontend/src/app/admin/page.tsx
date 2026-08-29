'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'worker';
}

interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  client_id: number;
  worker_id: number | null;
  client?: UserItem;
  worker?: UserItem;
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'tasks'>('users');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'worker'>('all');

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('password123');
  const [newUserRole, setNewUserRole] = useState<'client' | 'worker'>('worker');

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskClientId, setNewTaskClientId] = useState<string>('');
  const [newTaskWorkerId, setNewTaskWorkerId] = useState<string>('');

  // Editing User Modal State
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<'admin' | 'client' | 'worker'>('worker');

  // Editing Task Modal State
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskStatus, setEditTaskStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [editTaskWorkerId, setEditTaskWorkerId] = useState<string>('');

  const loadUsers = useCallback(async (filter: 'all' | 'client' | 'worker') => {
    const url = filter === 'all' ? '/users' : `/users?role=${filter}`;
    const res = await api.get(url);
    setUsers(res.data);
  }, []);

  const loadTasks = useCallback(async () => {
    const res = await api.get('/tasks');
    setTasks(res.data);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else if (user.role !== 'admin') router.push('/');
      else {
        loadUsers(roleFilter);
        loadTasks();
      }
    }
  }, [user, isLoading, router, roleFilter, loadUsers, loadTasks]);

  // User Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post('/users', {
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword,
      role: newUserRole,
    });
    setUsers((prev) => [...prev, res.data]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('password123');
  };

  const openEditUser = (targetUser: UserItem) => {
    setEditingUser(targetUser);
    setEditUserName(targetUser.name);
    setEditUserEmail(targetUser.email);
    setEditUserRole(targetUser.role);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const res = await api.put(`/users/${editingUser.id}`, {
      name: editUserName,
      email: editUserEmail,
      role: editUserRole,
    });
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? res.data : u)));
    setEditingUser(null);
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await api.delete(`/users/${id}`);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Task Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskClientId) {
      alert('Please select a client');
      return;
    }
    const payload: any = {
      title: newTaskTitle,
      description: newTaskDescription,
      client_id: Number(newTaskClientId),
    };
    if (newTaskWorkerId) {
      payload.worker_id = Number(newTaskWorkerId);
    }
    const res = await api.post('/tasks', payload);
    setTasks((prev) => [...prev, res.data]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskClientId('');
    setNewTaskWorkerId('');
    loadTasks();
  };

  const openEditTask = (targetTask: TaskItem) => {
    setEditingTask(targetTask);
    setEditTaskTitle(targetTask.title);
    setEditTaskDescription(targetTask.description || '');
    setEditTaskStatus(targetTask.status);
    setEditTaskWorkerId(targetTask.worker_id ? String(targetTask.worker_id) : '');
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    const payload: any = {
      title: editTaskTitle,
      description: editTaskDescription,
      status: editTaskStatus,
      worker_id: editTaskWorkerId ? Number(editTaskWorkerId) : null,
    };
    const res = await api.put(`/tasks/${editingTask.id}`, payload);
    setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? { ...t, ...res.data } : t)));
    setEditingTask(null);
    loadTasks();
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading admin console...</div>;

  const workers = users.filter((u) => u.role === 'worker');
  const clients = users.filter((u) => u.role === 'client');

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Administration Console</h1>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Users Management
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'tasks' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tasks Matrix
            </button>
          </div>
        </div>

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Register New User</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 bg-white"
                  >
                    <option value="worker">Worker</option>
                    <option value="client">Client</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
                >
                  Create User
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Filter Role:</span>
                {(['all', 'client', 'worker'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                      roleFilter === r ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="p-4 font-medium text-slate-900">{u.name}</td>
                        <td className="p-4 text-slate-600">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium uppercase ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'client' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openEditUser(u)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Edit
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-xs text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Create & Assign Task</h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800"
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800"
                    placeholder="Task details..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Assign Client</label>
                  <select
                    required
                    value={newTaskClientId}
                    onChange={(e) => setNewTaskClientId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 bg-white"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Assign Worker (Optional)</label>
                  <select
                    value={newTaskWorkerId}
                    onChange={(e) => setNewTaskWorkerId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 bg-white"
                  >
                    <option value="">-- Unassigned --</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.email})</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
                >
                  Create Task
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Task</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Assigned Worker</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="p-4">
                        <p className="font-medium text-slate-900">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.description}</p>
                      </td>
                      <td className="p-4 text-slate-600">{task.client?.name || `Client #${task.client_id}`}</td>
                      <td className="p-4 text-slate-600">{task.worker?.name || <span className="text-slate-400 italic">Unassigned</span>}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          task.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditTask(task)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EDIT USER MODAL */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Edit User: {editingUser.name}</h3>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Role</label>
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="client">Client</option>
                    <option value="worker">Worker</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 border rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT TASK MODAL */}
        {editingTask && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Task #{editingTask.id}</h3>
              <form onSubmit={handleUpdateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editTaskTitle}
                    onChange={(e) => setEditTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editTaskDescription}
                    onChange={(e) => setEditTaskDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Status</label>
                  <select
                    value={editTaskStatus}
                    onChange={(e) => setEditTaskStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Reassign Worker</label>
                  <select
                    value={editTaskWorkerId}
                    onChange={(e) => setEditTaskWorkerId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 bg-white"
                  >
                    <option value="">-- Unassigned --</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.email})</option>
                    ))}
                  </select>
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
                    Save Changes
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