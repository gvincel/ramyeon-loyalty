<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\CustomerQrCode;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function findCustomer(Request $request)
    {
        $validated = $request->validate([
            'qr_token' => [
                'required',
                'string',
                'size:64',
                'regex:/^[a-f0-9]{64}$/',
            ],
        ]);

        $qrCode = CustomerQrCode::with('customer')
            ->where('qr_token', $validated['qr_token'])
            ->where('is_active', true)
            ->first();

        if (!$qrCode || !$qrCode->customer || !$qrCode->customer->is_active) {
            return response()->json([
                'message' => 'Invalid or inactive customer QR code.',
            ], 404);
        }

        return response()->json([
            'customer' => [
                'id' => $qrCode->customer->id,
                'customer_code' => $qrCode->customer->customer_code,
                'first_name' => $qrCode->customer->first_name,
                'last_name' => $qrCode->customer->last_name,
                'phone_number' => $qrCode->customer->phone_number,
                'points' => $qrCode->customer->points,
            ],
        ]);
    }
}