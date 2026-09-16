<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use App\Models\Transaction;
use App\Models\RewardRedemption;

#[Fillable([
    'name',
    'username',
    'email',
    'password',
    'role',
    'is_active',
])]

#[Hidden([
    'password',
    'remember_token',
])]

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'cashier_id');
    }

    public function rewardRedemptions()
    {
        return $this->hasMany(
            RewardRedemption::class,
            'cashier_id'
        );
    }
}