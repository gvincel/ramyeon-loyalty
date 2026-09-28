<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(): Response
    {
        /** @var Customer $customer */
        $customer = Auth::guard('customer')->user();

        $transactions = Transaction::query()
            ->where('customer_id', $customer->id)
            ->latest('created_at')
            ->paginate(10);

        return Inertia::render('Customer/Transactions', [
            'transactions' => $transactions,
        ]);
    }
}