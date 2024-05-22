<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class historySLVCN extends Model
{
    use HasFactory;
    protected $table = 'historySLVCN';
    protected $fillable = [
        'LSX',
        'itemchild',
        'to',
        'quantity',
        'ObjType',
        'DocEntry',
        'LL',
        'HXL',
        'SPDich',
        'isQualityCheck',
        'notiId',
    ];
}
