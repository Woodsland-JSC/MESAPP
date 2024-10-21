<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class SyncSLDGToSAP implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    protected $ItemCode;
    protected $Qty;
    protected $Branch;
    protected $Date;
    /**
     * Create a new job instance.
     */
    public function __construct( $ItemCode, $Qty, $Branch, $Date)
    {
        $this->ItemCode = $ItemCode;
        $this->Qty = $Qty;
        $this->Branch = $Branch;
        $this->Date = $Date;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $body= [
            "U_ItemCode" => $this->ItemCode,
            "U_Branch" => $this->Branch,
            "U_Qty" => $this->Qty,
            "U_DocDate" => $this->Date
        ];
        $response = Http::withOptions([
            'verify' => false,
        ])->withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Authorization' => 'Basic ' . BasicAuthToken(),
        ])->post(UrlSAPServiceLayer() . '/b1s/v1/U_SLDG', $body);
    }
}
