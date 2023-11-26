<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class plandetail extends Model
{
    use HasFactory;
    protected $table = 'plan_detail';
    protected $fillable = ['PlanID', 'pallet', 'size', 'Mass', 'Qty'];
    public function getCreatedAtAttribute($value)
    {
        // Convert the timestamp to the desired format
        return Carbon::parse($value)->format('Y-m-d H:i:s');
    }
    public function getUpdatedAtAttribute($value)
    {
        // Convert the timestamp to the desired format
        return Carbon::parse($value)->format('Y-m-d H:i:s');
    }
    public function detail()
    {
        return $this->belongsTo(plandryings::class, 'PlanID', 'PlanID');
    }
}
