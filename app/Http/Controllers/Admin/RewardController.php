<?php

namespace App\Http\Controllers\Admin;

use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;
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
                'min:0.01',
                'max:99999999.99',
                'required_if:reward_type,discount',
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
            'redemption_limit' => [
                'nullable',
                'integer',
                'min:1',
                'max:1000',
            ],
        ]);

        if ($validated['reward_type'] === 'free_item') {
            $validated['reward_value'] = null;
        }

        DB::transaction(function () use ($validated): void {
            $reward = Reward::create($validated);

            app(AuditLogger::class)->record(
                'reward.created',
                'Reward created.',
                $reward,
                [
                    'points_required' => $reward->points_required,
                    'reward_type' => $reward->reward_type,
                ],
            );
        });

        return redirect()
            ->route('admin.rewards.index')
            ->with('success', 'Reward created successfully.');
    }

    public function update(Request $request, Reward $reward)
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
                'min:0.01',
                'max:99999999.99',
                'required_if:reward_type,discount',
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
            'redemption_limit' => [
                'nullable',
                'integer',
                'min:1',
                'max:1000',
            ],
        ]);

        if ($validated['reward_type'] === 'free_item') {
            $validated['reward_value'] = null;
        }

        DB::transaction(function () use ($reward, $validated): void {
            $reward->update($validated);

            app(AuditLogger::class)->record(
                'reward.updated',
                'Reward configuration updated.',
                $reward,
                [
                    'changed_fields' => implode(',', array_keys($validated)),
                ],
            );
        });

        return redirect()
            ->route('admin.rewards.index')
            ->with('success', 'Reward updated successfully.');
    }

    public function toggleStatus(Reward $reward)
    {
        $previousStatus = $reward->is_active ? 'active' : 'inactive';
        $newIsActive = ! $reward->is_active;

        DB::transaction(function () use (
            $reward,
            $previousStatus,
            $newIsActive,
        ): void {
            $reward->update([
                'is_active' => $newIsActive,
            ]);

            app(AuditLogger::class)->record(
                $newIsActive ? 'reward.activated' : 'reward.deactivated',
                $newIsActive ? 'Reward activated.' : 'Reward deactivated.',
                $reward,
                [
                    'previous_status' => $previousStatus,
                    'new_status' => $newIsActive ? 'active' : 'inactive',
                ],
            );
        });

        return redirect()
            ->route('admin.rewards.index')
            ->with(
                'success',
                $reward->is_active
                    ? 'Reward activated successfully.'
                    : 'Reward deactivated successfully.',
            );
    }
}