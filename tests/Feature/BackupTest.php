<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackupTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_reach_backup_controller(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $originalDefault = config('database.default');

        try {
            config([
                'database.default' => 'mysql',
                'database.connections.mysql.host' => '127.0.0.1',
                'database.connections.mysql.port' => '3306',
                'database.connections.mysql.database' => 'ramyeon_loyalty',
                'database.connections.mysql.username' => 'root',
                'database.connections.mysql.password' => '',
                'backup.mysqldump_path' => 'unavailable-mysqldump-test',
            ]);

            $response = $this->actingAs($admin)
                ->post(route('admin.backups.store'));

            $response->assertRedirect();

            $response->assertSessionHas(
                'error',
                'The database backup utility is unavailable. Please contact the system administrator.'
            );
        } finally {
            config(['database.default' => $originalDefault]);
        }
    }

    public function test_admin_cannot_create_backup_with_unsupported_database_connection(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $originalDefault = config('database.default');

        try {
            config(['database.default' => 'sqlite']);

            $response = $this->actingAs($admin)
                ->post(route('admin.backups.store'));

            $response->assertRedirect();

            $response->assertSessionHas(
                'error',
                'The database backup configuration is incomplete or unsupported.'
            );
        } finally {
            config(['database.default' => $originalDefault]);
        }
    }

    public function test_cashier_cannot_create_database_backup(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $this->actingAs($cashier)
            ->post(route('admin.backups.store'))
            ->assertForbidden();
    }

    public function test_guest_cannot_create_database_backup(): void
    {
        $this->post(route('admin.backups.store'))
            ->assertRedirect(route('login'));
    }
}
