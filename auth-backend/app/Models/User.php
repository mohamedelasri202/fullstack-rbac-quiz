<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable ,HasApiTokens;

   protected $fillable = [
           'name',
           'email',
           'password',
           'role',
       ];
       protected $hidden = [
               'password',
               'remember_token',
           ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
 protected function casts(): array
     {
         return [
             'email_verified_at' => 'datetime',
             'password' => 'hashed',
         ];
     }
 public function isAdmin(): bool
         {
             return $this->role === 'admin';
         }


 public function isClient(): bool
             {
                 return $this->role === 'client';
             }
 public function isWorker(): bool
     {
         return $this->role === 'worker';
     }

 public function clientTasks()
     {
         return $this->hasMany(Task::class, 'client_id');
     }

 public function workerTasks()
     {
         return $this->hasMany(Task::class, 'worker_id');
     }
}
