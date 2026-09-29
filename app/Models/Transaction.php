<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'customer_id',
        'cashier_id',
        'receipt_number',
        'purchase_amount',
        'points_used',
        'amount_paid',
        'points_earned',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'purchase_amount' => 'decimal:2',
            'points_used' => 'integer',
            'amount_paid' => 'decimal:2',
            'points_earned' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function pointTransactions()
    {
        return $this->hasMany(PointTransaction::class);
    }
}