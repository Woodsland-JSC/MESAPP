<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Log;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Cache;

class SapB1Service
{
    private $CACHE_KEY = 'sap_b1_session';
    private \GuzzleHttp\Client $client;

    public function __construct()
    {
        $this->client = new Client([
            'base_uri' => env('SAP_URL'),
            'verify'   => false,
            'timeout'  => 30,
        ]);
    }

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
            Log::info("SapB1Service::post - " . $th->getMessage());
            throw $th;
        }
    }

    /***
     * return \Illuminate\Http\Client\Response $response
     */
    public function delete($data, $endpoint)
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
            Log::info("SapB1Service::post - " . $th->getMessage());
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
                "Cancelled" => "tYES"
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
                "Cancelled" => "tYES"
            ]);

            return $response->json();
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    /***
     * MAINTAIN 2025-12-20
     */

    private function login()
    {
        try {
            $response = $this->client->post('/b1s/v1/Login', [
                'json' => [
                    'CompanyDB' => env('DB_NAME'),
                    'UserName'  => env('USER_SAPB1'),
                    'Password'  => env('PASSWORD_B1')
                ],
            ]);

            $setCookies = $response->getHeader('Set-Cookie');

            $cookies = [];

            foreach ($setCookies as $cookie) {
                if (str_starts_with($cookie, 'B1SESSION')) {
                    $cookies['B1SESSION'] = explode(';', explode('=', $cookie, 2)[1])[0];
                }

                if (str_starts_with($cookie, 'ROUTEID')) {
                    $cookies['ROUTEID'] = explode(';', explode('=', $cookie, 2)[1])[0];
                }
            }

            if (empty($cookies['B1SESSION'])) {
                throw new \Exception('SAP B1SESSION not found');
            }

            return $cookies;
        } catch (Exception $e) {
            dd($e);
            throw new Exception("Xác thực SAP Service có lỗi.");
        }
    }

    private function refresh()
    {
        Cache::forget($this->CACHE_KEY);
        return $this->getCookies();
    }

    private function convertCookie(array $cookies): string
    {
        $cookieHeader = collect($cookies)
            ->map(fn($v, $k) => "{$k}={$v}")
            ->implode('; ');

        return $cookieHeader;
    }

    private function getCookies()
    {
        /** @var array $cookies */
        $cookies = Cache::remember(
            $this->CACHE_KEY,
            now()->addMinutes(80),
            fn() => $this->login()
        );

        return $cookies;
    }

    public function b1s_post(string $endpoint, array $payload)
    {
        try {
            $cookies = $this->getCookies();
            $stringCookie = $this->convertCookie($cookies);
            $url = '/b1s/v1/' . $endpoint;

            $res = $this->client->post($url, [
                'headers' => [
                    'Cookie' => $stringCookie,
                ],
                'json' => $payload,
            ]);

            return $res;
        } catch (RequestException $e) {
            if ($e->getResponse()?->getStatusCode() == 301) {
                $cookies = $this->refresh();
                $stringCookie = $this->convertCookie($cookies);

                $res = $this->client->post($url, [
                    'headers' => [
                        'Cookie' => $stringCookie,
                    ],
                    'json' => $payload,
                ]);

                return $res;
            }
        } catch (Exception $e) {
            throw new Exception($e->getMessage() ?? "Xác thực SAP Service có lỗi.");
        }
    }
}
