<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UpdateUserPasswords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:update-passwords';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cập nhật mật khẩu cho các user đã chọn thành 123456 (băm bằng bcrypt)';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // Băm mật khẩu "123456"
        $hashedPassword = Hash::make('123456');

        // Danh sách username cần cập nhật
        $usernames = ['17Q097', '15Q272', '11T0501', '15Q101', '23Q1820'];

        // Thực hiện cập nhật trong bảng users
        $updated = DB::table('users')
            ->whereIn('username', $usernames)
            ->update(['password' => $hashedPassword]);

        // Thông báo kết quả
        if ($updated) {
            $this->info("Passwords updated successfully for {$updated} users.");
        } else {
            $this->warn("No matching users found.");
        }

        return 0;
    }
}
