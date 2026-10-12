<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\Reward;
use App\Models\RewardRedemption;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_reports(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.reports.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Reports')
        );
    }

    public function test_cashier_cannot_view_reports(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $this->actingAs($cashier)
            ->get(route('admin.reports.index'))
            ->assertForbidden();
    }

    public function test_guest_cannot_view_reports(): void
    {
        $this->get(route('admin.reports.index'))
            ->assertRedirect(route('login'));
    }

    public function test_cashier_cannot_export_reports(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $this->actingAs($cashier)
            ->get(route('admin.reports.export'))
            ->assertForbidden();
    }

    public function test_guest_cannot_export_reports(): void
    {
        $this->get(route('admin.reports.export'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_view_correct_report_calculations(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create();

        Transaction::create([
            'customer_id' => $customer->id,
            'cashier_id' => $admin->id,
            'receipt_number' => 'RC-REPORT01',
            'purchase_amount' => 500.00,
            'points_used' => 100,
            'amount_paid' => 400.00,
            'points_earned' => 4,
            'created_at' => now(),
        ]);

        Transaction::create([
            'customer_id' => $customer->id,
            'cashier_id' => $admin->id,
            'receipt_number' => 'RC-REPORT02',
            'purchase_amount' => 200.00,
            'points_used' => 0,
            'amount_paid' => 200.00,
            'points_earned' => 2,
            'created_at' => now(),
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.reports.index', ['period' => 'month']));

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Reports')
                ->where('totalSales', 600)
                ->where('totalTransactions', 2)
                ->where('averageTransaction', 300)
                ->where('pointsEarned', 6)
                ->where('pointsUsedForPurchases', 100)
                ->has('detailedTransactions.data', 2)
        );
    }

    public function test_custom_date_range_includes_only_matching_transactions(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create();

        foreach ([
            ['RC-BEFORE01', 100.00, 0, 100.00, 1, '2026-09-30 23:59:59'],
            ['RC-INSIDE001', 200.00, 0, 200.00, 2, '2026-10-01 12:00:00'],
            ['RC-INSIDE002', 300.00, 50, 250.00, 2, '2026-10-02 12:00:00'],
            ['RC-AFTER001', 400.00, 0, 400.00, 4, '2026-10-03 00:00:01'],
        ] as [$receipt, $purchase, $used, $paid, $earned, $date]) {
            Transaction::create([
                'customer_id' => $customer->id,
                'cashier_id' => $admin->id,
                'receipt_number' => $receipt,
                'purchase_amount' => $purchase,
                'points_used' => $used,
                'amount_paid' => $paid,
                'points_earned' => $earned,
                'created_at' => $date,
            ]);
        }

        $response = $this->actingAs($admin)->get(
            route('admin.reports.index', [
                'period' => 'custom',
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-02',
            ])
        );

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Reports')
                ->where('filters.period', 'custom')
                ->where('filters.start_date', '2026-10-01')
                ->where('filters.end_date', '2026-10-02')
                ->where('totalSales', 450)
                ->where('totalTransactions', 2)
                ->where('averageTransaction', 225)
                ->where('pointsEarned', 4)
                ->where('pointsUsedForPurchases', 50)
                ->has('detailedTransactions.data', 2)
        );
    }

    public function test_custom_date_range_requires_both_dates(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.reports.index', [
                'period' => 'custom',
                'start_date' => '2026-10-01',
            ]))
            ->assertSessionHasErrors('end_date');
    }

    public function test_custom_date_range_rejects_end_date_before_start_date(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.reports.index', [
                'period' => 'custom',
                'start_date' => '2026-10-03',
                'end_date' => '2026-10-01',
            ]))
            ->assertSessionHasErrors('end_date');
    }

    public function test_reports_rejects_invalid_period(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.reports.index', [
                'period' => 'invalid',
            ]))
            ->assertSessionHasErrors('period');
    }

    public function test_admin_can_export_transactions_as_csv(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create([
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'customer_code' => 'RC-TEST001',
        ]);

        Transaction::create([
            'customer_id' => $customer->id,
            'cashier_id' => $admin->id,
            'receipt_number' => 'RC-RECEIPT01',
            'purchase_amount' => 500.00,
            'points_used' => 100,
            'amount_paid' => 400.00,
            'points_earned' => 4,
            'created_at' => now()->startOfMonth()->addDays(2),
        ]);

        $response = $this->actingAs($admin)->get(
            route('admin.reports.export', ['period' => 'month'])
        );

        $response->assertOk();

        $response->assertDownload(
            'ramyeon-corner-report-' .
            now()->startOfMonth()->toDateString() .
            '-to-' .
            now()->endOfMonth()->toDateString() .
            '.csv'
        );

        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    public function test_csv_export_contains_only_transactions_in_selected_date_range(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create([
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'customer_code' => 'RC-TEST001',
        ]);

        foreach ([
            ['RC-BEFORE01', 100.00, 0, 100.00, 1, '2026-09-30 12:00:00'],
            ['RC-INSIDE001', 500.00, 100, 400.00, 4, '2026-10-01 12:00:00'],
            ['RC-AFTER001', 300.00, 0, 300.00, 3, '2026-10-03 12:00:00'],
        ] as [$receipt, $purchase, $used, $paid, $earned, $date]) {
            Transaction::create([
                'customer_id' => $customer->id,
                'cashier_id' => $admin->id,
                'receipt_number' => $receipt,
                'purchase_amount' => $purchase,
                'points_used' => $used,
                'amount_paid' => $paid,
                'points_earned' => $earned,
                'created_at' => $date,
            ]);
        }

        $response = $this->actingAs($admin)->get(
            route('admin.reports.export', [
                'period' => 'custom',
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-02',
            ])
        );

        $response->assertOk();

        $content = $response->streamedContent();

        $this->assertStringContainsString('"Customer Code"', $content);
        $this->assertStringContainsString('RC-INSIDE001', $content);
        $this->assertStringContainsString('Juan Dela Cruz', $content);
        $this->assertStringContainsString('RC-TEST001', $content);
        $this->assertStringContainsString('500.00', $content);
        $this->assertStringContainsString('400.00', $content);

        $this->assertStringNotContainsString('RC-BEFORE01', $content);
        $this->assertStringNotContainsString('RC-AFTER001', $content);
    }

    public function test_csv_export_neutralizes_spreadsheet_formulas_in_text_fields(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create([
            'first_name' => '=1+1',
            'last_name' => 'Customer',
            'customer_code' => '+CMD',
        ]);

        Transaction::create([
            'customer_id' => $customer->id,
            'cashier_id' => $admin->id,
            'receipt_number' => '=HYPERLINK("https://example.com")',
            'purchase_amount' => 100.00,
            'points_used' => 0,
            'amount_paid' => 100.00,
            'points_earned' => 1,
            'created_at' => now()->startOfMonth()->addDays(2),
        ]);

        $response = $this->actingAs($admin)->get(
            route('admin.reports.export', ['period' => 'month'])
        );

        $response->assertOk();

        $content = $response->streamedContent();

        $this->assertStringContainsString(
            "'=HYPERLINK(\"\"https://example.com\"\")",
            $content
        );
        $this->assertStringContainsString("'+CMD", $content);
        $this->assertStringContainsString("'=1+1 Customer", $content);
    }

    public function test_report_counts_only_completed_reward_redemptions(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create();

        $reward = Reward::create([
            'reward_name' => 'Free Coke Kasalo',
            'reward_type' => 'free_item',
            'points_required' => 500,
            'reward_value' => 0,
            'is_active' => true,
        ]);

        foreach ([
            ['completed', 500, '2026-10-01 12:00:00'],
            ['completed', 300, '2026-10-02 12:00:00'],
            ['cancelled', 200, '2026-10-02 13:00:00'],
        ] as [$status, $pointsUsed, $redeemedAt]) {
            RewardRedemption::create([
                'customer_id' => $customer->id,
                'reward_id' => $reward->id,
                'cashier_id' => $admin->id,
                'points_used' => $pointsUsed,
                'redeemed_at' => $redeemedAt,
                'status' => $status,
            ]);
        }

        $response = $this->actingAs($admin)->get(
            route('admin.reports.index', [
                'period' => 'custom',
                'start_date' => '2026-10-01',
                'end_date' => '2026-10-02',
            ])
        );

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Reports')
                ->where('rewardRedemptions', 2)
                ->where('pointsSpentOnRewards', 800)
                ->has('rewardBreakdown', 1)
                ->where('rewardBreakdown.0.redemption_count', 2)
                ->where('rewardBreakdown.0.points_used', 800)
        );
    }

}