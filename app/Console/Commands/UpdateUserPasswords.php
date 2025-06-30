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
    protected $signature = 'user:update-password {id : ID của user cần cập nhật mật khẩu}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cập nhật mật khẩu thành 123456 (băm bằng bcrypt) cho 1 user dựa trên ID';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $userId = $this->argument('id');
        $hashedPassword = Hash::make('123456');

        $updated = DB::table('users')
            ->where('id', $userId)
            ->update(['password' => $hashedPassword]);

        if ($updated) {
            $this->info("Cập nhật mật khẩu thành công cho user ID {$userId}.");
        } else {
            $this->warn("Không tìm thấy user với ID {$userId}.");
        }

        return 0;
    }
}
