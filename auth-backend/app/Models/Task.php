<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Task extends Model
{

  use HasFactory;

   protected $fillable = [
           'title',
           'description',
           'status',
           'client_id',
           'worker_id',
       ];

       public function client()
       {
           return $this->belongsTo(User::class, 'client_id');
       }

       public function worker()
       {
           return $this->belongsTo(User::class, 'worker_id');
       }
}
