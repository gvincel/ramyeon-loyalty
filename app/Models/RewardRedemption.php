<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RewardRedemption extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'customer_id',
        'reward_id',
        'cashier_id',
        'points_used',
        'redeemed_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'points_used' => 'integer',
            'redeemed_at' => 'datetime',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function reward()
    {
        return $this->belongsTo(Reward::class);
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }
}