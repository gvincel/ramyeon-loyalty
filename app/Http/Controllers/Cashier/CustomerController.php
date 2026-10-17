<?php

namespace App\Http\Controllers\Cashier;

use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
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

    /**
     * Activate or deactivate a customer account.
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
            ->back()
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
            ->route('cashier.customers.index')
            ->with(
                'success',
                'Customer and associated records deleted successfully. Historical reports may be affected.'
            );
    }
}
