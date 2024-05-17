<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class notireceipt extends Model
{
    use HasFactory;
    protected $table = 'notireceipt';
    protected $fillable = [
        'text',
        'Quantity',
        'deleted',
        'baseID',
        'SPDich',
        'SubItemName',
        'SubItemCode',
        'QuyCach',
        'LyDo',
        'team',
        'type',
        'confirm',
        'confirmBy',
        'confirm_at',
        'deleteBy',
        'deleted_at',
        'ObjType',
        'DocEntry',
        'openQty',
        'MaThiTruong',
        'ErrorData',
    ];
    public function getCreatedAtAttribute($value)
    {
        return Carbon::parse($value)->format('Y-m-d H:i:s');
    }

    public function getUpdatedAtAttribute($value)
    {
        return Carbon::parse($value)->format('Y-m-d H:i:s');
    }
}
