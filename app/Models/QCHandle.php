<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QCHandle extends Model
{
    use HasFactory;
    protected $table = 'QCHandle';
    protected $fillable = [
        'name',
        'type'
    ];
}
