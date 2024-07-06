<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class notireceiptVCN extends Model
{
    use HasFactory;
    protected $table = 'notireceiptVCN';
    protected $fillable = [
    'ProdType',
    'FatherCode',
    'ItemCode',
    'ItemName',
    'CongDoan',
    'type',
    'text',
    'Quantity',
    'QuyCach',
    'LYDO',
    'team',
    'NextTeam',
    'SubItemCode',
    'SubItemName',
    'CDay',
    'CRong',
    'CDai',
    'confirm',
    'confirmBy',
    'confirm_at',
    'deleted',
    'deletedBy',
    'deleted_at',
    'openQty',
    'MaThiTruong',
    'ErrorData',
    'isQCConfirmed',
    'CreatedBy',
    'ProdType',
    'version',
    'isPushSAP'  ,
    'loinhamay'
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
