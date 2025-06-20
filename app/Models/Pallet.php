<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Pallet extends Model
{
    use HasFactory;
    protected $primaryKey = 'palletID';
    protected $table = 'pallets';
    protected $fillable = [
        'palletID',
        'Code',
        'LoaiGo',
        'MaLo',
        'LyDo',
        'QuyCach',
        'factory',
        'PalletType',
        'NgayNhap',
        'status',
        'is_active',
        'branch',
        'DocNum',
        'DocEntry',
        'flag',
        'issue_number',
        'receipt_number',
        'CreateBy',
        'palletSAP',
        'LoadedBy',
        'LoadedIntoKilnDate',
        'RanBy',
        'RanDate',
        'CompletedBy',
        'CompletedDate',
        'stacking_time',
        'employee',
        'activeStatus',
    ];

    public function details()
    {
        return $this->hasMany(pallet_details::class, 'palletID', 'palletID');
    }
}
