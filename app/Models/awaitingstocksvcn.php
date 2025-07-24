<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class awaitingstocksvcn extends Model
{
    use HasFactory;
    protected $table = 'awaitingstocksvcn';
    protected $fillable = [
        'notiId',
        'SubItemCode',
        'AwaitingQty',
        'wareHouse',
    ];
    public $timestamps = false;
}
