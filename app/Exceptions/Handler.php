<?php

namespace App\Exceptions;

use GuzzleHttp\Psr7\Request;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Http\Request as Requests;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Spatie\Permission\Exceptions\UnauthorizedException;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->renderable(function (NotFoundHttpException $e, Requests $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'url not found.',
                    'code' => 404
                ], 404);
            }
        });
        $this->renderable(function (AccessDeniedHttpException $e, Requests $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Forbidden.',
                    'code' => 403
                ], 403);
            }
        });
        $this->renderable(function (UnauthorizedException $e, Requests $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Forbidden.',
                    'code' => 403
                ], 403);
            }
        });
        $this->renderable(function (AuthenticationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Invalid session',
                ], Response::HTTP_METHOD_NOT_ALLOWED); // 405
            }
        });
    }
}
