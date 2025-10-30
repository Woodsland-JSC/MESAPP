<?php

namespace App\Services\mes;

use App\Models\planDryings;

class PlanDryingService
{
    public function getPlanDryingById($id){
        return planDryings::find($id);
    }
}
