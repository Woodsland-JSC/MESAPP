<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SanLuong extends Model
{
    use HasFactory;
    protected $table = 'sanluong'; // Replace 'your_table_name' with the actual table name

    protected $fillable = [
        'FatherCode',
        'ItemCode',
        'ItemName',
        'CompleQty',
        'RejectQty',
        'CDay',
        'CRong',
        'CDai',
        'Team',
        'CongDoan',
        'NexTeam',
        'status',
        'ObjType',
        'Reason',
        'DocEntry',
        'Type',
        'create_by',
        'LSX',
        'openQty',
    ];
}
