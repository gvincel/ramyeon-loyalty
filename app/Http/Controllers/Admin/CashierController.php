<?php

namespace App\Http\Controllers\Admin;

use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class CashierController extends Controller
{
    /**
     * Display all cashier accounts.
     */
    public function index()
    {
        $cashiers = User::where('role', 'cashier')
            ->orderBy('name')
            ->get();

        return inertia('Admin/Cashiers/Index', [
            'cashiers' => $cashiers,
        ]);
    }

    /**
     * Create a new cashier account.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],

            'username' => [
                'required',
                'string',
                'max:50',
                'unique:users,username',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'same:confirm_password',
            ],

            'confirm_password' => [
                'required',
            ],
        ]);

        DB::transaction(function () use ($validated): void {
            $cashier = User::create([
                'name' => $validated['name'],
                'username' => $validated['username'],
                'email' => null,
                'password' => Hash::make($validated['password']),
                'role' => 'cashier',
                'is_active' => true,
            ]);

            app(AuditLogger::class)->record(
                'cashier.created',
                'Cashier account created.',
                $cashier,
            );
        });

        return back()->with('success', 'Cashier account created successfully.');
    }

    /**
     * Update a cashier account.
     */
    public function update(Request $request, User $cashier)
    {
        if ($cashier->role !== 'cashier') {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],

            'username' => [
                'required',
                'string',
                'max:50',
                Rule::unique('users', 'username')->ignore($cashier->id),
            ],
        ]);

        DB::transaction(function () use ($cashier, $validated): void {
            $cashier->update([
                'name' => $validated['name'],
                'username' => $validated['username'],
            ]);

            app(AuditLogger::class)->record(
                'cashier.updated',
                'Cashier account details updated.',
                $cashier,
                [
                    'changed_fields' => 'name,username',
                ],
            );
        });

        return back()->with('success', 'Cashier account updated successfully.');
    }

    /**
     * Activate or deactivate a cashier account.
     */
    public function toggleStatus(User $cashier)
    {
        if ($cashier->role !== 'cashier') {
            abort(404);
        }

        $previousStatus = $cashier->is_active ? 'active' : 'inactive';
        $newIsActive = ! $cashier->is_active;

        DB::transaction(function () use (
            $cashier,
            $previousStatus,
            $newIsActive,
        ): void {
            $cashier->update([
                'is_active' => $newIsActive,
            ]);

            app(AuditLogger::class)->record(
                $newIsActive ? 'cashier.activated' : 'cashier.deactivated',
                $newIsActive
                    ? 'Cashier account activated.'
                    : 'Cashier account deactivated.',
                $cashier,
                [
                    'previous_status' => $previousStatus,
                    'new_status' => $newIsActive ? 'active' : 'inactive',
                ],
            );
        });

        $status = $newIsActive ? 'activated' : 'deactivated';

        return back()->with(
            'success',
            "Cashier account {$status} successfully."
        );
    }
}