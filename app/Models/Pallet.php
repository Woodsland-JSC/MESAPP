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
        'palletSAP'
    ];
    // Sự kiện trước khi tạo mới record
    // protected static function boot()
    // {
    //     parent::boot();

    //     static::creating(function ($model) {
    //         DB::transaction(function () use ($model) {
    //             $current_week = now()->format('W');
    //             $current_year = now()->year;

    //             // Count the number of records for the current year and week
    //             $recordCount = static::whereYear('created_at', $current_year)
    //                 ->whereRaw('WEEK(created_at,1) = ?', [$current_week])
    //                 ->count() + 1;

    //             // Set the Code field
    //             $model->Code = substr($current_year, -2) . $current_week . '-' . str_pad($recordCount, 4, '0', STR_PAD_LEFT);
    //         });
    //     });
    // }
    public function details()
    {
        return $this->hasMany(pallet_details::class, 'palletID', 'palletID');
    }
}
