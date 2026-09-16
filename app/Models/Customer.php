<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_code',
        'first_name',
        'last_name',
        'phone_number',
        'email',
        'points',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'points' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function qrCode()
    {
        return $this->hasOne(CustomerQrCode::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function rewardRedemptions()
    {
        return $this->hasMany(RewardRedemption::class);
    }
}