<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Auth;
class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        return $request->expectsJson() ? null : route('handleAuth');
    }
    public function handle($request, Closure $next, ...$guards)
    {

        if ($token = $request->cookie('token')) {
            $request->headers->set('Authorization', 'Bearer ' . $token);
        }
        // Check if Authorization header is present and using Basic Auth
        if ($request->headers->has('Authorization') && preg_match('/Basic\s+(.*)$/i', $request->header('Authorization'), $matches)) {
            // Decode the base64-encoded credentials
            list($username, $password) = explode(':', base64_decode($matches[1]));
            // Authenticate user based on the provided username and password
            if (Auth::attempt(['username' => $username, 'password' => $password])) {
                // Authentication successful
                Auth::loginUsingId(Auth::user()->id);
            } else {
                // Authentication failed
                return response('Invalid credentials', 401);
            }
        }
            $this->authenticate($request, $guards);
        return $next($request);
    }
}
