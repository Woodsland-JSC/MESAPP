<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class inventorytransfer implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

     /**
     * Số lần thử lại tối đa.
     *
     * Nếu vượt quá số lần này, Laravel sẽ gọi hàm failed().
     */
    public $tries = 5;

    /**
     * Thời gian chờ (giây) giữa các lần retry.
     * Có thể là số hoặc mảng (vd: [10, 30, 60]).
     */
    public $backoff = 10;
    /**
     * Create a new job instance.
     */
    protected $body;
    public function __construct($body)
    {
        $this->body = $body;
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
        ])->post(UrlSAPServiceLayer() . '/b1s/v1/StockTransfers', $this->body);
        if (!$response->successful()) {
           throw new \Exception('Inventory transfer API failed: ' . $response->status() . ' - ' . $response->body());
        }
    }
     /**
     * Hàm này sẽ chạy khi job fail đủ 5 lần.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("🚫 Job InventoryTransfer đã thất bại sau {$this->tries} lần thử", [
            'error' => $exception->getMessage(),
            'body'  => $this->body,
        ]);
    }
}
