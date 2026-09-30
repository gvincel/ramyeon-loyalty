<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

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
}