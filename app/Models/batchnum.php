<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class batchnum extends Model
{

    use HasFactory;
    protected $table = 'BatchNums';
    protected $fillable = ['palletID', 'ItemCode', 'BatchNumber', 'Quantity'];
}
