<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WaitConfirmQcVcn extends Model
{
    use HasFactory;
    protected $table = 'wait_confirm_qc_vcn';
    protected $fillable = [
        'noti_id', 
        'quantity', 
        'loai_loi', 
        'huong_xu_ly',
        'to_loi',
        'to_chuyen_ve',
        'confirm_id',
        'confirm_at',
        'created_by',
        'sub_item_code',
        'warehouse',
        'note'
    ];

    public function getNoti(){
        return $this->belongsTo(notireceiptVCN::class, 'noti_id', 'id');
    }
}
