<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use Inertia\Inertia;
use Inertia\Response;

class RewardController extends Controller
{
    public function index(): Response
    {
        $today = now()->toDateString();

        $rewards = Reward::query()
            ->where('is_active', true)
            ->where(function ($query) use ($today) {
                $query->whereNull('start_date')
                    ->orWhereDate('start_date', '<=', $today);
            })
            ->where(function ($query) use ($today) {
                $query->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', $today);
            })
            ->orderBy('points_required')
            ->get([
                'id',
                'reward_name',
                'reward_type',
                'points_required',
                'reward_value',
                'description',
                'start_date',
                'end_date',
            ]);

        return Inertia::render('Customer/Rewards', [
            'rewards' => $rewards,
        ]);
    }
}