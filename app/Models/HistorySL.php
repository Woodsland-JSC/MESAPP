<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistorySL extends Model
{
    use HasFactory;
    protected $table = 'historySL';
    protected $fillable = [
        'LSX',
        'itemchild',
        'to',
        'quantity',
        'ObjType',
        'DocEntry',
        'LL',
        'HXL',
        'source',
        'TOChuyenVe',
        'SPDich',
        'isQualityCheck',
        'notiId',
    ];

}
