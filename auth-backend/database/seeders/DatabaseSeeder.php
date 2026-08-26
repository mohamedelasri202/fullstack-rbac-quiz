<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $client1 = User::create([
            'name' => 'Client One',
            'email' => 'client1@example.com',
            'password' => Hash::make('password123'),
            'role' => 'client',
        ]);

        $client2 = User::create([
            'name' => 'Client Two',
            'email' => 'client2@example.com',
            'password' => Hash::make('password123'),
            'role' => 'client',
        ]);

        $worker1 = User::create([
            'name' => 'Worker One',
            'email' => 'worker1@example.com',
            'password' => Hash::make('password123'),
            'role' => 'worker',
        ]);

        $worker2 = User::create([
            'name' => 'Worker Two',
            'email' => 'worker2@example.com',
            'password' => Hash::make('password123'),
            'role' => 'worker',
        ]);

        Task::create([
            'title' => 'Client 1 Task Assigned to Worker 1',
            'description' => 'Fix header navigation bug',
            'status' => 'pending',
            'client_id' => $client1->id,
            'worker_id' => $worker1->id,
        ]);

        Task::create([
            'title' => 'Client 2 Task Assigned to Worker 2',
            'description' => 'Database indexing',
            'status' => 'in_progress',
            'client_id' => $client2->id,
            'worker_id' => $worker2->id,
        ]);
    }
}
