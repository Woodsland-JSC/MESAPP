<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{

    use HasFactory;
    protected $table = 'warehouse';
    protected $fillable = ['WhsCode', 'WhsName', 'branch', 'flag','FAC'];
}
