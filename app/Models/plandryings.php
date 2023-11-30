<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class plandryings extends Model
{
    use HasFactory;
    protected $primaryKey = 'PlanID';
    protected $table = 'planDryings';
    protected $fillable = [
        'PlanID', 'Code',
        'Oven', 'Reason',
        'Method', 'Mass',
        'TotalPallet', 'PlanDate',
        'Status', 'Checked',
        'Review', 'Disabilities',
        'Time', 'CheckedBy',
        'ReviewBy', 'RunBy',
        'CompletedBy', 'CreateBy',
        'CT1', 'CT2',
        'CT3', 'CT4',
        'CT5', 'CT6',
        'CT7', 'CT8',
        'CT9', 'CT10',
        'CT11', 'CT12',
        'DateChecked', 'NoCheck',
        'result'
    ];
    // Sự kiện trước khi tạo mới record
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            DB::transaction(function () use ($model) {
                $current_week = now()->format('W');
                $current_year = now()->year;

                // Count the number of records for the current year and week
                $recordCount = static::whereYear('created_at', $current_year)
                    ->whereRaw('WEEK(created_at,1) = ?', [$current_week])
                    ->count() + 1;

                // Set the Code field
                $model->Code = $current_year . $current_week . '-' . str_pad($recordCount, 4, '0', STR_PAD_LEFT);
            });
        });
    }
    public function getCreatedAtAttribute($value)
    {
        // Convert the timestamp to the desired format
        return Carbon::parse($value)->format('Y-m-d H:i:s');
    }
    public function getUpdatedAtAttribute($value)
    {
        // Convert the timestamp to the desired format
        return Carbon::parse($value)->format('Y-m-d H:i:s');
    }
    public function worker()
    {
        return $this->hasMany(worker::class, 'PlanID', 'PlanID');
    }
    public function details()
    {
        return $this->hasMany(plandetail::class, 'PlanID', 'PlanID');
    }
}
