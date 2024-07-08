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
        'loinhamay'
    ];

    public function getCDaiAttribute($value)
    {
        if (floor($value) == $value) {
            return (int) $value;
        } else {
            return number_format($value, 1);
        }
    }

    public function setCDaiAttribute($value)
    {
        $this->attributes['CDai'] = (float) $value; 
    }

    public function getCRongAttribute($value)
    {
        if (floor($value) == $value) {
            return (int) $value;
        } else {
            return number_format($value, 1);
        }
    }

    public function setCRongAttribute($value)
    {
        $this->attributes['CRong'] = (float) $value;
    }

    public function getCDayAttribute($value)
    {
        if (floor($value) == $value) {
            return (int) $value;
        } else {
            return number_format($value, 1);
        }
    }

    public function setCDayAttribute($value)
    {
        $this->attributes['CDay'] = (float) $value; 
    }
}
