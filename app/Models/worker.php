<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class worker extends Model
{
    use HasFactory;
    protected $table = 'worker_dryings';
    protected $fillable = ['PlanID', 'UserID'];
    public function pallet()
    {
        return $this->belongsTo(planDryings::class, 'PlanID', 'PlanID');
    }
}
