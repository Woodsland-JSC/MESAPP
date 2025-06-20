<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\planDryings;

class ActualThickness extends Model
{
    use HasFactory;
    protected $table = 'actual_thicknesses';

    protected $fillable = [
        'PlanID',
        'sample_1',
        'sample_2',
        'sample_3',
        'sample_4',
        'sample_5',
        'created_at',
        'created_by',
    ];

    public function planDrying()
    {
        return $this->belongsTo(planDryings::class);
    }
}
