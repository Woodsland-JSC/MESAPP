<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
class ChiTietRong extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = 'chitietrong';
    protected $fillable = [
    'baseID',
    'ItemCode',
    'ItemName',
    'type',
    'Quantity',
    'QuyCach',
    'LYDO',
    'NextTeam',
    'CDay',
    'CRong',
    'CDai',
    'openQty',
    'loinhamay'
    ];
    // public function getCreatedAtAttribute($value)
    // {
    //     return Carbon::parse($value)->format('Y-m-d H:i:s');
    // }

    // public function getUpdatedAtAttribute($value)
    // {
    //     return Carbon::parse($value)->format('Y-m-d H:i:s');
    // }
}
