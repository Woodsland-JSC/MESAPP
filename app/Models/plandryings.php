<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class plandryings extends Model
{
    use HasFactory;
    protected $primaryKey = 'PlanID';
    protected $table = 'plandryings';
    protected $fillable = [
        'PlanID',
        'Code',
        'Oven',
        'Reason',
        'Method',
        'Mass',
        'TotalPallet',
        'PlanDate',
        'Status',
        'Checked',
        'Review',
        'Disabilities',
        'CreateBy'
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
                    ->whereRaw('WEEK(created_at) = ?', [$current_week])
                    ->count() + 1;

                // Set the Code field
                $model->Code = $current_year . $current_week . '-' . str_pad($recordCount, 4, '0', STR_PAD_LEFT);
            });
        });
    }

    public function incrementingWeekId()
    {
        if ($this->created_at->format('W') !== now()->format('W') || $this->created_at->year !== now()->year) {
            $this->created_at = now();
            $this->current_week_start_id = 1;
        } else {
            $this->current_week_start_id++;
        }

        return $this->current_week_start_id;
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
