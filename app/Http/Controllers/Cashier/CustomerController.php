<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Display a paginated, searchable list of customers.
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
            'filters' => [
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
     * Activate or deactivate a customer.
     */
    public function toggleStatus(Customer $customer)
    {
        $customer->is_active = !$customer->is_active;
        $customer->save();

        return back()->with(
            'success',
            $customer->is_active
                ? 'Customer activated successfully.'
                : 'Customer deactivated successfully.'
        );
    }

    /**
     * Permanently delete a customer.
     */
   /**
 * Permanently delete a customer and their related records.
 */
/**
 * Permanently delete a customer and their related records.
 */
public function destroy(Customer $customer)
{
    // Delete QR code
    $customer->qrCode()->delete();

    // Delete point transactions FIRST
    $customer->pointTransactions()->delete();

    // Delete reward redemptions
    $customer->rewardRedemptions()->delete();

    // Now transactions can be safely deleted
    $customer->transactions()->delete();

    // Finally delete the customer
    $customer->delete();

    return back()->with(
        'success',
        'Customer and all related records deleted successfully.'
    );
}

}