<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Disability extends Model
{
    use HasFactory;
    protected $table = 'disability_rates';
    protected $fillable = [
        'palletID',
        'TotalMau',
        'TLMoTop',
        'TLCong',
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
