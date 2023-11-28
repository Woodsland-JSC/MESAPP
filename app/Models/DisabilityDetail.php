<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class DisabilityDetail extends Model
{
    use HasFactory;
    protected $table = 'disability_rates_detail';
    protected $fillable = [
        'palletID',
        'SLPallet',
        'SLMau',
        'SLMO_TOP',
        'SLCong',
        'note',
        'created_by'
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
