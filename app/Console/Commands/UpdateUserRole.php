<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateUserRole extends Command
{
    /**
     * Tên và chữ ký của lệnh.
     *
     * @var string
     */
    protected $signature = 'db:update-roles';

    /**
     * Mô tả của lệnh.
     *
     * @var string
     */
    protected $description = 'Cập nhật roles và model_has_roles trong database';

    /**
     * Thực hiện lệnh.
     *
     * @return int
     */
    public function handle()
    {
        // Danh sách cập nhật
        $updates = [
            ['ids' => [366, 367, 368, 369, 370, 371, 372, 382, 396, 397, 399, 400, 401, 402, 403, 404, 405, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 432, 433, 435, 436, 437, 439, 440, 441, 442, 443, 587, 588, 589, 590, 591, 592, 593, 594, 597, 598, 599], 'role' => 6],
            ['ids' => [181, 199, 215, 233, 249, 263, 286, 289, 303, 375, 379, 386, 394, 428, 603], 'role' => 5],
            ['ids' => [304, 389, 645], 'role' => 3],
            ['ids' => [317, 363, 643], 'role' => 4],
            ['ids' => [391, 393, 438], 'role' => 2],
            ['ids' => range(647, 667), 'role' => 11],
            ['ids' => [596], 'role' => 15],
            ['ids' => [601, 602, 604, 605], 'role' => 13],
            ['ids' => [646, 1], 'role' => 1],
            ['ids' => [174, 175, 177, 178, 179, 180, 183, 184, 189, 192, 193, 194, 196, 197, 198, 
            202, 204, 206, 208, 209, 210, 212, 213, 214, 216, 217, 218, 219, 220, 221, 
            223, 224, 227, 230, 231, 232, 235, 238, 240, 241, 242, 243, 244, 246, 247, 
            248, 250, 252, 253, 254, 255, 256, 257, 259, 260, 262, 264, 266, 269, 270, 
            271, 272, 273, 276, 277, 278, 279, 280, 281, 282, 283, 285, 288, 291, 294, 
            297, 298, 301, 305, 307, 311, 313, 315, 324, 325, 328, 329, 330, 331, 332, 
            335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 347, 348, 349, 350, 
            354, 355, 356, 357, 358, 359, 360, 361, 362, 373, 374, 376, 377, 380, 381, 
            383, 385, 387, 388, 390, 392, 426, 427, 429, 430, 431, 606, 607, 608, 613, 
            614, 618, 619, 620, 621, 624, 625, 626, 627, 641, 642, 644], 'role' => 8]
        ];

        $this->info('Bắt đầu cập nhật roles...');

        DB::table('model_has_roles')->delete();
        
        foreach ($updates as $update) {
            DB::table('users')->whereIn('id', $update['ids'])->update(['role' => $update['role']]);
            DB::table('model_has_roles')->insert(
                array_map(function ($id) use ($update) {
                    return [
                        'model_id' => $id,
                        'role_id' => $update['role'],
                        'model_type' => 'App\Models\User'
                    ];
                }, $update['ids'])
            );
        }

        $this->info('Cập nhật roles thành công.');
        return 0;
    }
}