<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerQrCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CustomerController extends Controller
{
    /**
     * Display a paginated, searchable list of customers.
     * Cashiers can view customers but cannot edit or manage them.
     */
    public function index(Request $request)
    {
        $search = trim((string) $request->input('search', ''));

        $customers = Customer::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('customer_code', 'like', "%{$search}%")
                      ->orWhere('phone_number', 'like', "%{$search}%");
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(15)
            ->withQueryString();

        return inertia('Cashier/Customers/Index', [
            'customers' => $customers,
            'filters'   => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display a single customer's details, including their QR code.
     */
    public function show(Customer $customer)
    {
        $customer->load('qrCode');

        return inertia('Cashier/Customers/Show', [
            'customer' => $customer,
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
            ->route('cashier.customers.register')
            ->with('success', 'Customer registered successfully.');
    }
}