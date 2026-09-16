<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin account
        User::updateOrCreate(
            ['email' => 'admin@ramyeon.test'],
            [
                'name' => 'System Administrator',
                'username' => null,
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        // Cashier account
        User::updateOrCreate(
            ['username' => 'cashier01'],
            [
                'name' => 'Cashier 01',
                'email' => null,
                'password' => Hash::make('password'),
                'role' => 'cashier',
                'is_active' => true,
            ]
        );
    }
}