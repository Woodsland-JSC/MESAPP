<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class humidityDetails extends Model
{
    use HasFactory;
    protected $table = 'humiditys_detail';
    protected $fillable = [
        'PlanID',
        'ref_id',
        'value',
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
