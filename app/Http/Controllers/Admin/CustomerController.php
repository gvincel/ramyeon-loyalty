<?php

namespace App\Http\Controllers\Admin;

use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->input('search', ''));
        $status = (string) $request->input('status', 'all');
        if (! in_array($status, ['all', 'active', 'inactive'], true)) {
            $status = 'all';
        }

        $query = Customer::with('qrCode')
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('customer_code', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($status === 'active', fn ($q) => $q->where('is_active', true))
            ->when($status === 'inactive', fn ($q) => $q->where('is_active', false))
            ->orderBy('last_name')
            ->orderBy('first_name');

        $customers = $query->paginate(20)->withQueryString();

        $stats = Customer::query()
            ->toBase()
            ->selectRaw('COUNT(*) as total_customers')
            ->selectRaw('COALESCE(SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END), 0) as active_customers')
            ->selectRaw('COALESCE(SUM(points), 0) as total_points')
            ->first();

        $total = (int) $stats->total_customers;
        $active = (int) $stats->active_customers;

        return inertia('Admin/Customers/Index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'stats' => [
                'total_customers' => $total,
                'active_customers' => $active,
                'inactive_customers' => $total - $active,
                'total_points' => (int) $stats->total_points,
            ],
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'phone_number' => [
                'required',
                'digits:11',
                'regex:/^09\d{9}$/',
                'unique:customers,phone_number,' . $customer->id,
            ],
            'email' => ['nullable', 'email', 'max:100'],
        ]);

        DB::transaction(function () use ($customer, $validated): void {
            $customer->update($validated);

            app(AuditLogger::class)->record(
                'customer.updated',
                'Customer record updated.',
                $customer,
                ['changed_fields' => implode(',', array_keys($validated))],
            );
        });

        return redirect()
            ->route('admin.customers.index')
            ->with('success', 'Customer updated successfully.');
    }

    public function toggleStatus(Customer $customer)
    {
        $previousStatus = $customer->is_active ? 'active' : 'inactive';
        $newIsActive = ! $customer->is_active;

        DB::transaction(function () use ($customer, $previousStatus, $newIsActive): void {
            $customer->update(['is_active' => $newIsActive]);

            app(AuditLogger::class)->record(
                $newIsActive ? 'customer.activated' : 'customer.deactivated',
                $newIsActive ? 'Customer activated.' : 'Customer deactivated.',
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
                    : 'Customer deactivated successfully.',
            );
    }

    public function destroy(Customer $customer)
    {
        $customer->deleteWithRelatedData();

        return redirect()
            ->route('admin.customers.index')
            ->with(
                'success',
                'Customer and associated records deleted successfully. Historical reports may be affected.',
            );
    }
}