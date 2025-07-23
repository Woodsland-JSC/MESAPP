<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class awaitingstocks extends Model
{
    use HasFactory;
    protected $table = 'awaitingstocks';
    protected $fillable = [
        'notiId',
        'SubItemCode',
        'AwaitingQty',
        'wareHouse',
    ];
    public $timestamps = false;
}
