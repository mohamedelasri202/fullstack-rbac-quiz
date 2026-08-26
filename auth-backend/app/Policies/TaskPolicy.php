<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // Filtering handled in Controller index query
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Task $task): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        if ($user->isClient()) {
            return $task->client_id === $user->id;
        }
        if ($user->isWorker()) {
            return $task->worker_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isClient();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        if ($user->isClient()) {
            return $task->client_id === $user->id;
        }
        if ($user->isWorker()) {
            return $task->worker_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        return $user->isAdmin();
    }
}
