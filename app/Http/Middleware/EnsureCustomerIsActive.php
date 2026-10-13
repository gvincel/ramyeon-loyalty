<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomerIsActive
{
    /**
     * Prevent inactive customers from accessing the loyalty portal.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $customer = Auth::guard('customer')->user();

        if (!$customer || !$customer->is_active) {
            Auth::guard('customer')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('customer.login')
                ->with('error', 'Your account is inactive. Please contact the staff for assistance.');
        }

        return $next($request);
    }
}