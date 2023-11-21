<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class plandetail extends Model
{
    use HasFactory;
    protected $table = 'plan_detail';
    protected $fillable = ['PlanID', 'pallet', 'size', 'Mass', 'Qty'];
    public function detail()
    {
        return $this->belongsTo(plandryings::class, 'PlanID', 'PlanID');
    }
}
