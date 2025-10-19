<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\notireceiptVCN;

class DisassemblyOrder extends Model
{
    use HasFactory;

    protected $table = 'disassembly_order';
    protected $fillable = [
        'order_number',
        'SubItemCode',
        'Qty',
        'isClosed',
        'team',
        'CreatedBy',
        'created_at',
    ];

    public function notireceiptVCN()
    {
        return $this->hasMany(notireceiptVCN::class);
    }

}
