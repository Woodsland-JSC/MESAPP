<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JobSeeder extends Seeder
{
    public function run(): void
    {
        // Fake 50 jobs đang active
        for ($i = 0; $i < 50; $i++) {
            DB::table('jobs')->insert([
                'queue'       => 'default',
                'payload'     => json_encode([
                    'displayName' => 'App\Jobs\FakeApiJob',
                    'job' => 'Illuminate\Queue\CallQueuedHandler@call',
                    'data' => [
                        'api_url' => 'https://jsonplaceholder.typicode.com/posts/' . rand(1, 100),
                        'method'  => 'GET',
                    ],
                ]),
                'attempts'    => rand(0, 2),
                'available_at'=> now()->timestamp,
                'created_at'  => now()->timestamp,
            ]);
        }

        // Fake 50 failed_jobs
        for ($i = 0; $i < 50; $i++) {
            DB::table('failed_jobs')->insert([
                'uuid'       => (string) Str::uuid(),
                'connection' => 'database',
                'queue'      => 'default',
                'payload'    => json_encode([
                    'displayName' => 'App\Jobs\FakeApiJob',
                    'data' => [
                        'api_url' => 'https://jsonplaceholder.typicode.com/posts/' . rand(1, 100),
                        'method'  => 'POST',
                        'body'    => ['foo' => 'bar'],
                    ],
                ]),
                'exception'  => 'Fake exception: API timeout ' . rand(100, 999),
                'failed_at'  => now(),
            ]);
        }
    }
}
