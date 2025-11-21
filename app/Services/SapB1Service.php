<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Log;
use GuzzleHttp\Client;


class SapB1Service
{
    public function batch($payload, $boundary)
    {
        try {
            $client = new Client([
                'base_uri' => UrlSAPServiceLayer(),
                'verify' => false,
                'http_errors' => true
            ]);

            $res = $client->post('/b1s/v1/$batch', [
                'headers' => [
                    'Content-Type' => "multipart/mixed; boundary=$boundary",
                    'Accept' => 'multipart/mixed',
                    "B1S-CaseInsensitive" => "true",
                    'Authorization' => 'Basic ' . BasicAuthToken(),
                ],
                'body' => $payload
            ]);

            Log::info('SapB1Service::batch - ' . $res->getBody()->getContents());

            $status = $res->getStatusCode();

            if ($status == 202) {
                $bodyData = $res->getBody()->getContents();
                preg_match('/--batchresponse_[^\s]+/', $bodyData, $boundaryMatch);

                if (!empty($boundaryMatch)) {
                    $boundary = $boundaryMatch[0];

                    // Tách từng phần
                    $parts = explode($boundary, $bodyData);

                    foreach ($parts as $part) {
                        if (strpos($part, '{') !== false) {
                            $jsonStart = strpos($part, '{');
                            $jsonStr = substr($part, $jsonStart);
                            $json = json_decode($jsonStr, true);
                            if (isset($json['error'])) {
                                $error = $json['error'];
                                throw new Exception('SAP Batch Error: ' . $error['message']['value']);
                            }
                        }
                    }
                }
            }

            return new \Illuminate\Http\Client\Response($res);
        } catch (Exception $th) {
            throw new Exception("SapB1Service::batch - " . $th->getMessage());
        }
    }

    /***
     * return \Illuminate\Http\Client\Response $response
     */
    public function post($data, $endpoint)
    {
        try {
            $url = UrlSAPServiceLayer() . '/b1s/v1/' . $endpoint;
            $response = Http::withOptions([
                'verify' => false,

            ])->withHeaders([
                'Content-Type' => "application/json",
                'Accept' => 'application/json',
                'Authorization' => 'Basic ' . BasicAuthToken(),
            ])->post($url, $data);

            return $response;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function cancelInventoryGenExits($docEntry)
    {
        try {
            $url = UrlSAPServiceLayer() . '/b1s/v1/InventoryGenExits' . '(' . $docEntry . ')';
            $response = Http::withOptions([
                'verify' => false,

            ])->withHeaders([
                'Content-Type' => "application/json",
                'Accept' => 'application/json',
                'Authorization' => 'Basic ' . BasicAuthToken(),
            ])->patch($url, [
                "Cancel" => "tYES"
            ]);

            return $response->json();
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function cancelInventoryGenEntries($docEntry)
    {
        try {
            $url = UrlSAPServiceLayer() . '/b1s/v1/InventoryGenEntries' . '(' . $docEntry . ')';
            $response = Http::withOptions([
                'verify' => false,

            ])->withHeaders([
                'Content-Type' => "application/json",
                'Accept' => 'application/json',
                'Authorization' => 'Basic ' . BasicAuthToken(),
            ])->patch($url, [
                "Cancel" => "tYES"
            ]);

            return $response->json();
        } catch (\Throwable $th) {
            throw $th;
        }
    }
}
