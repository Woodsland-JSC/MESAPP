<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PalletLog extends Model
{
    protected $table = 'pallet_log';

    protected $fillable = [
        'type_log',
        'log_data',
        'palletId',
        'old_plan',
        'new_plan',
        'old_oven',
        'new_oven',
        'user_id',
        'created_at',
        'updated_at'
    ];
}
