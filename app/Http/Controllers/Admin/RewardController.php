<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use Illuminate\Http\Request;

class RewardController extends Controller
{
    public function index()
    {
        $rewards = Reward::latest()->get();

        return inertia('Admin/Rewards/Index', [
            'rewards' => $rewards,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'reward_name' => [
                'required',
                'string',
                'max:100',
            ],
            'reward_type' => [
                'required',
                'in:discount,free_item',
            ],
            'points_required' => [
                'required',
                'integer',
                'min:1',
            ],
            'reward_value' => [
                'nullable',
                'numeric',
                'min:0',
                'max:99999999.99',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'start_date' => [
                'nullable',
                'date',
            ],
            'end_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],
            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        Reward::create($validated);

        return redirect()
            ->route('admin.rewards.index')
            ->with('success', 'Reward created successfully.');
    }
}