<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the customer registration page.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Validate and register a new customer.
     */
    public function store(Request $request): RedirectResponse
    {
        // Normalize safe text fields before validation.
        $request->merge([
            'name' => is_string($request->input('name'))
                ? trim($request->input('name'))
                : $request->input('name'),

            'email' => is_string($request->input('email'))
                ? Str::lower(trim($request->input('email')))
                : $request->input('email'),
        ]);

        // Laravel automatically returns field-specific errors
        // when validation fails.
        $validated = $request->validate([
            'name' => [
                'bail',
                'required',
                'string',
                'max:255',
                "regex:~\A(?=.*\p{L})[\p{L}\p{M} .'-]+\z~u",
            ],

            'email' => [
                'bail',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email'),
            ],

            'password' => [
                'bail',
                'required',
                'string',
                'confirmed',
                'min:12',
                'max:128',
                'not_regex:/\A\s+\z/u',
            ],
        ]);

        // The User model's "hashed" cast securely hashes
        // the password when it is assigned.
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        // Preserve the existing registration event and login flow.
        event(new Registered($user));

        Auth::login($user);

        // Regenerate the session ID after authentication.
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }
}
