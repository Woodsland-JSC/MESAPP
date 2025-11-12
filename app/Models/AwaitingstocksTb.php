<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class AwaitingstocksTb extends Model
{
    use HasFactory;
    protected $table = 'awaitingstocks_tb';
    protected $fillable = [
        'notiId',
        'SubItemCode',
        'AwaitingQty',
        'wareHouse',
        'team',
    ];
    public $timestamps = false;
}
