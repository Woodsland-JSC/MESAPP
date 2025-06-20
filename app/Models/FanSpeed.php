<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\planDryings;

class FanSpeed extends Model
{
    use HasFactory;
    protected $table = 'fan_speeds';

    protected $fillable = [
        'PlanID',
        'fan_speed_1',
        'fan_speed_2',
        'fan_speed_3',
        'fan_speed_4',
        'fan_speed_5',
        'fan_speed_6',
        'fan_speed_7',
        'fan_speed_8',
        'created_at',
        'updated_at',
        'created_by',
    ];

    public function planDrying()
    {
        return $this->belongsTo(planDryings::class);
    }
}
