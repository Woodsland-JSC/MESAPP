<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class receiptProduction implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    protected $body;
    protected $ponum;
    public function __construct($body, $ponum)
    {
        $this->body = $body;
        $this->ponum = $ponum;
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
            $data = [
                "ProductionOrderStatus" => "boposClosed"
            ];
            // close
            Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'Authorization' => 'Basic ' . BasicAuthToken(),
            ])->patch(UrlSAPServiceLayer() . '/b1s/v1/ProductionOrders(' . $this->ponum  . ')', $data);
        } else {
            $res = $response->json();
            // Job sẽ được queue worker thử lại
            throw new \Exception($res['error']);
        }
    }
}
