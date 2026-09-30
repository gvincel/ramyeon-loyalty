<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\RewardRedemption;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RedemptionHistoryController extends Controller
{
    public function index(): Response
    {
        /** @var Customer $customer */
        $customer = Auth::guard('customer')->user();

        $redemptions = RewardRedemption::query()
            ->with('reward')
            ->where('customer_id', $customer->id)
            ->latest('redeemed_at')
            ->paginate(10);

        return Inertia::render('Customer/RedemptionHistory', [
            'redemptions' => $redemptions,
        ]);
    }
}