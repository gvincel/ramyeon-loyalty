<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerQrCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CustomerController extends Controller
{
    /**
     * Display all customers.
     */
    public function index()
    {
        $customers = Customer::with('qrCode')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return inertia('Admin/Customers/Index', [
            'customers' => $customers,
        ]);
    }

    /**
     * Store a new customer.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => [
                'required',
                'string',
                'max:50',
            ],

            'last_name' => [
                'required',
                'string',
                'max:50',
            ],

            'phone_number' => [
                'required',
                'digits:11',
                'regex:/^09\d{9}$/',
                'unique:customers,phone_number',
            ],

            'email' => [
                'nullable',
                'email',
                'max:100',
            ],
        ]);

        $customerCode = 'RC-' . strtoupper(Str::random(8));

        while (Customer::where('customer_code', $customerCode)->exists()) {
            $customerCode = 'RC-' . strtoupper(Str::random(8));
        }

        DB::transaction(function () use ($validated, $customerCode) {
            $customer = Customer::create([
                'customer_code' => $customerCode,
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'phone_number' => $validated['phone_number'],
                'email' => $validated['email'] ?? null,
            ]);

            CustomerQrCode::create([
                'customer_id' => $customer->id,
                'qr_token' => bin2hex(random_bytes(32)),
                'is_active' => true,
                'created_at' => now(),
            ]);
        });

        return redirect()
            ->route('admin.customers.index')
            ->with('success', 'Customer added successfully.');
    }
}