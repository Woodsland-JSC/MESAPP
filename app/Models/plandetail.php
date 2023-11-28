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
        return Carbon::parse($value)->format('Y-m-d H:i:s');
    }

    public function getUpdatedAtAttribute($value)
    {
        return Carbon::parse($value)->format('Y-m-d H:i:s');
    }

    public function pallet()
    {
        return $this->belongsTo(Pallet::class, 'pallet', 'palletID');
    }
}
