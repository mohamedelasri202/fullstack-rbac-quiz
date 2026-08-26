<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            $tasks = Task::with(['client:id,name,email', 'worker:id,name,email'])->get();
        } elseif ($user->isClient()) {
            $tasks = Task::with('worker:id,name,email')->where('client_id', $user->id)->get();
        } else {
            $tasks = Task::with('client:id,name,email')->where('worker_id', $user->id)->get();
        }

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin() && ! $user->isClient()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'worker_id' => 'nullable|exists:users,id',
            'client_id' => 'nullable|exists:users,id',
        ]);

        $task = new Task();
        $task->title = $validated['title'];
        $task->description = $validated['description'] ?? null;
        $task->status = 'pending';

        if ($user->isAdmin()) {
            $task->client_id = $validated['client_id'] ?? $user->id;
            $task->worker_id = $validated['worker_id'] ?? null;
        } else {
            $task->client_id = $user->id;
            $task->worker_id = null;
        }

        $task->save();
        return response()->json($task, 201);
    }

    public function show(Task $task)
    {
        $this->authorize('view', $task);
        return response()->json($task->load(['client:id,name,email', 'worker:id,name,email']));
    }

    public function update(Request $request, Task $task)
    {
        $this->authorize('update', $task);
        $user = $request->user();

        if ($user->isWorker()) {
            $validated = $request->validate([
                'status' => 'required|in:pending,in_progress,completed',
            ]);
            $task->update(['status' => $validated['status']]);
        } elseif ($user->isClient()) {
            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
            ]);
            $task->update($validated);
        } elseif ($user->isAdmin()) {
            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'sometimes|in:pending,in_progress,completed',
                'worker_id' => 'nullable|exists:users,id',
            ]);
            $task->update($validated);
        }

        return response()->json($task);
    }

    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }
}
