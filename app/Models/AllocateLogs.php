<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class AllocateLogs extends Model
{
    use HasFactory;
    protected $table = 'AllocateLogs';
    protected $fillable = [
        'BaseEntry',
        'ItemCode',
        'Qty',
        'Body',
        'DocNum',
        'DocEntry',
        'Status',
        'Type',
        'Factorys',
        'SPDich',
        'CDTT',
        'TO'
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
