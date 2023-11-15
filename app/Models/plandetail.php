<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class plandetail extends Model
{
    use HasFactory;
    protected $table = 'worker_dryings';
    protected $fillable = ['PlanID', 'pallet', 'size', 'Mass', 'Qty'];
    public function pallet()
    {
        return $this->belongsTo(plandryings::class, 'PlanID', 'PlanID');
    }
}
