<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class pallet_details extends Model
{

    use HasFactory;
    protected $table = 'pallet_details';
    protected $fillable = ['palletID', 'ItemCode', 'WhsCode', 'WhsCode2', 'BatchNum', 'Qty', 'CDai', 'CDay', 'CRong'];
}
