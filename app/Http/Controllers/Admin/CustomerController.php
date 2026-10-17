<?php

namespace App\Http\Controllers\Admin;

use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
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

        DB::transaction(function () use ($customer, $validated): void {
            $customer->update($validated);

            app(AuditLogger::class)->record(
                'customer.updated',
                'Customer record updated.',
                $customer,
                [
                    'changed_fields' => implode(',', array_keys($validated)),
                ],
            );
        });

        return redirect()
            ->route('admin.customers.index')
            ->with('success', 'Customer updated successfully.');
    }

    /**
     * Activate or deactivate an existing customer.
     */
    public function toggleStatus(Customer $customer)
    {
        $previousStatus = $customer->is_active ? 'active' : 'inactive';
        $newIsActive = ! $customer->is_active;

        DB::transaction(function () use (
            $customer,
            $previousStatus,
            $newIsActive,
        ): void {
            $customer->update([
                'is_active' => $newIsActive,
            ]);

            app(AuditLogger::class)->record(
                $newIsActive
                    ? 'customer.activated'
                    : 'customer.deactivated',
                $newIsActive
                    ? 'Customer activated.'
                    : 'Customer deactivated.',
                $customer,
                [
                    'previous_status' => $previousStatus,
                    'new_status' => $newIsActive ? 'active' : 'inactive',
                ],
            );
        });

        return redirect()
            ->route('admin.customers.index')
            ->with(
                'success',
                $customer->is_active
                    ? 'Customer activated successfully.'
                    : 'Customer deactivated successfully.'
            );
    }

    /**
     * Permanently delete a customer and their associated records.
     */
    public function destroy(Customer $customer)
    {
        $customer->deleteWithRelatedData();

        return redirect()
            ->route('admin.customers.index')
            ->with(
                'success',
                'Customer and associated records deleted successfully. Historical reports may be affected.'
            );
    }
}