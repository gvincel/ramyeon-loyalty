<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $customer = Auth::guard('customer')->user();

        /** @var \App\Models\Customer $customer */
        $qrCode = $customer->qrCode()
            ->where('is_active', true)
            ->first();

        return Inertia::render('Customer/Dashboard', [
            'customer' => [
                'id' => $customer->id,
                'customer_code' => $customer->customer_code,
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'phone_number' => $customer->phone_number,
                'email' => $customer->email,
                'points' => $customer->points,
                'qr_token' => $qrCode?->qr_token,
            ],
        ]);
    }
}