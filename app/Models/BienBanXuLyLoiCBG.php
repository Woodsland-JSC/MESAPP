<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BienBanXuLyLoiCBG extends Model
{
    use HasFactory;

    protected $table = 'bien_ban_xu_ly_loi_cbg';
    protected $fillable = [
        'report_resolution_factory',
        'created_by',
        'id_GD',
        'id_QC'
    ];
}
