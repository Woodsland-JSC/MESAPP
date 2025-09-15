<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class UpdatePalletSAP implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    protected $id;
    protected $result;
    public function __construct($id, $result)
    {
        $this->id = $id;
        $this->result = $result;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $body = [
            "U_Status" => $this->result
        ];
        $response = Http::withOptions([
            'verify' => false,
        ])->withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Authorization' => 'Basic ' . BasicAuthToken(),
        ])->patch(UrlSAPServiceLayer() . '/b1s/v1/Pallet(' . $this->id . ')', $body);
        // if (!$response->successful()) {
        //   throw new \Exception('Inventory transfer API failed: ' . $response->status() . ' - ' . $response->body());
       // }
    }
}
