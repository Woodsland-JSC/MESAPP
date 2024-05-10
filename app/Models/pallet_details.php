<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class pallet_details extends Model
{

    use HasFactory;
    protected $table = 'pallet_details';
    protected $fillable = ['palletID', 'ItemCode', 'ItemName', 'WhsCode', 'WhsCode2', 'BatchNum', 'Qty', 'CDai', 'CDay', 'CRong', 'CDay_Site', 'CRong_Site', 'CDai_Site', 'QuyCachSite', 'Qty_T'];

    public function pallet()
    {
        return $this->belongsTo(Pallet::class, 'palletID');
    }
}
