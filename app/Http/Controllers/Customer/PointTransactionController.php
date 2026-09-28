<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\PointTransaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PointTransactionController extends Controller
{
    public function index(): Response
    {
        /** @var Customer $customer */
        $customer = Auth::guard('customer')->user();

        $pointTransactions = PointTransaction::query()
            ->where('customer_id', $customer->id)
            ->latest('created_at')
            ->paginate(10);

        return Inertia::render('Customer/PointHistory', [
            'pointTransactions' => $pointTransactions,
        ]);
    }
}
