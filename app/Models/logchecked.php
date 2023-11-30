<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class logchecked extends Model
{
    use HasFactory;
    protected $table = 'logchecked';
    protected $fillable = [
        'PlanID',
        'M1',
        'M2',
        'M3',
        'M4',
        'M5',
        'Q1',
        'Q2',
        'Q3',
        'Q4',
        'Q5',
        'Q6',
        'Q7',
        'Q8',
    ];
    public function getCreatedAtAttribute($value)
    {
        return Carbon::parse($value)->format('Y-m-d H:i:s');
    }

    public function getUpdatedAtAttribute($value)
    {
        return Carbon::parse($value)->format('Y-m-d H:i:s');
    }
}
