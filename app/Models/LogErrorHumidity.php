<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class LogErrorHumidity extends Model
{
    use HasFactory;
    protected $table = 'log_error_humidity';

    protected $fillable = [
        'ItemCode',
        'CDay',
        'CRong',
        'CDai',
        'Quantity',
        'QuantityT',
        'Warehouse',
        'ToWarehouse',
        'Team',
        'CreatedBy',
        'EntryId',
        'ExitId',
        'Factory'
    ];
}
