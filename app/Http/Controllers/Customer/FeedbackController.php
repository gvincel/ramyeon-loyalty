<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    /**
     * Display the customer feedback form.
     */
    public function create(): Response
    {
        return Inertia::render('Customer/Feedback');
    }

    /**
     * Store feedback submitted by the authenticated customer.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rating' => ['nullable', 'integer', 'between:1,5'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $customer = Auth::guard('customer')->user();

        abort_unless($customer, 403);

        Feedback::create([
            'customer_id' => $customer->getAuthIdentifier(),
            'rating' => $validated['rating'] ?? null,
            'message' => $validated['message'],
        ]);

        return back()->with('success', 'Thank you for your feedback!');
    }
}