<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Models\planDryings;

class UniqueOvenStatusRule implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Check if the old Oven has a status of 3
        $count = planDryings::where('Oven', $value)->where('Status', '!=', 2)->count();

        if ($count >= 1) {
            // Allow duplicate value for the Oven field
            $fail('Lò sấy đã được tạo kế hoạch sấy.');
        }
    }
}
