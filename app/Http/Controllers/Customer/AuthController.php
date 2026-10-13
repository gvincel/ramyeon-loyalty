<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerQrCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Customer/Login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'phone_number' => [
                'required',
                'digits:11',
                'starts_with:09',
            ],
            'password' => [
                'required',
                'string',
            ],
        ]);

        $remember = $request->boolean('remember');

        $customer = Customer::where(
            'phone_number',
            $credentials['phone_number']
        )->first();

        if (
            ! $customer ||
            ! Hash::check(
                $credentials['password'],
                $customer->password
            )
        ) {
            throw ValidationException::withMessages([
                'phone_number' => 'The phone number or password is incorrect.',
            ]);
        }

        if (! $customer->is_active) {
            throw ValidationException::withMessages([
                'phone_number' => 'Your account is inactive. Please contact the staff for assistance.',
            ]);
        }

        Auth::guard('customer')->login($customer, $remember);

        $request->session()->regenerate();

        return redirect()->intended(route('customer.dashboard'));
    }

    public function register(): Response
    {
        return Inertia::render('Customer/Register');
    }

    public function storeRegistration(Request $request): RedirectResponse
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
                'starts_with:09',
                'unique:customers,phone_number',
            ],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:100',
            ],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->numbers(),
            ],
        ]);

        DB::transaction(function () use ($validated): void {
            $customerCode = $this->generateCustomerCode();

            $customer = Customer::create([
                'customer_code' => $customerCode,
                'first_name' => trim($validated['first_name']),
                'last_name' => trim($validated['last_name']),
                'phone_number' => $validated['phone_number'],
                'email' => isset($validated['email'])
                    ? trim($validated['email'])
                    : null,
                'password' => $validated['password'],
                'points' => 0,
                'is_active' => true,
            ]);

            CustomerQrCode::create([
                'customer_id' => $customer->id,
                'qr_token' => bin2hex(random_bytes(32)),
                'is_active' => true,
                'created_at' => now(),
            ]);
        });

        return redirect()
            ->route('customer.login')
            ->with('success', 'Registration successful. You can now sign in.');
    }

    private function generateCustomerCode(): string
    {
        do {
            $customerCode = 'RC-' . strtoupper(Str::random(8));
        } while (
            Customer::where('customer_code', $customerCode)->exists()
        );

        return $customerCode;
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('customer')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('customer.login');
    }
}