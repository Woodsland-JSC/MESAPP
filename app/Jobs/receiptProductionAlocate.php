<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use App\Models\AllocateLogs;

class receiptProductionAlocate implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    protected $body;
    protected $id;
    public function __construct($body, $id)
    {
        $this->body = $body;
        $this->id = $id;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $response = Http::withOptions([
            'verify' => false,
        ])->withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Authorization' => 'Basic ' . BasicAuthToken(),
        ])->post(UrlSAPServiceLayer() . '/b1s/v1/InventoryGenEntries', $this->body);
        if ($response->successful()) {
            $res = $response->json();
            AllocateLogs::where('id', $this->id)->update(
                [
                    'Status' => 1,
                    'DocNum' => $res['DocNum'],
                    'DocEntry' => $res['DocEntry']
                ]
            );
        }
    }
}
