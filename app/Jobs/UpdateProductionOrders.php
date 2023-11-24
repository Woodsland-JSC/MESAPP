<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use App\Models\Pallet;

class UpdateProductionOrders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    protected $docEntry;
    protected $palleId;
    public function __construct($docEntry, $palleId)
    {
        $this->docEntry = $docEntry;
        $this->palleId = $palleId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $body = [
            "ProductionOrderStatus" => "boposReleased"
        ];
        try {
            $response = Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'Authorization' => 'Basic ' . BasicAuthToken(),
            ])->patch(UrlSAPServiceLayer() . '/b1s/v1/ProductionOrders(' . $this->docEntry . ')', $body);

            // Check if the API call was successful (you may need to adjust this based on your API response)
            if ($response->successful()) {
                // Update the Pallet status to 2
                Pallet::where('palletID', $this->palleId)->update(['flag' => 2]);
            } else {
                // Update the Pallet status to -99 if the API call failed
                Pallet::where('palletID',  $this->palleId)->update(['flag' => -99]);
            }
        } catch (\Exception $e) {
            // Handle exceptions if any
            report($e);
            // Update the Pallet status to -99 in case of an exception
            Pallet::where('palletID', $this->palleId)->update(['flag' => -99]);
        }
    }
}
