<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

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
     * Update an existing customer.
     */
    public function update(Request $request, Customer $customer)
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
                'unique:customers,phone_number,' . $customer->id,
            ],

            'email' => [
                'nullable',
                'email',
                'max:100',
            ],
        ]);

        $customer->update($validated);

        return redirect()
            ->route('admin.customers.index')
            ->with('success', 'Customer updated successfully.');
    }

    /**
     * Activate or deactivate an existing customer.
     */
    public function toggleStatus(Customer $customer)
    {
        $customer->update([
            'is_active' => !$customer->is_active,
        ]);

        return redirect()
            ->route('admin.customers.index')
            ->with(
                'success',
                $customer->is_active
                    ? 'Customer activated successfully.'
                    : 'Customer deactivated successfully.'
            );
    }
}