<?php

namespace App\Models;

use App\Services\AuditLogger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\DB;

class Customer extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'customer_code',
        'first_name',
        'last_name',
        'phone_number',
        'email',
        'password',
        'points',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
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

    public function pointTransactions()
    {
        return $this->hasMany(PointTransaction::class);
    }

    /**
     * Permanently delete a customer and their associated records.
     *
     * Feedback is retained and anonymized by the existing foreign key.
     */
    public function deleteWithRelatedData(): void
    {
        DB::transaction(function (): void {
            $customer = static::query()
                ->whereKey($this->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            // Delete dependent records before their parent records.
            $customer->pointTransactions()->delete();
            $customer->rewardRedemptions()->delete();
            $customer->transactions()->delete();
            $customer->qrCode()->delete();

            // Finally, delete the customer.
            $customer->delete();

            app(AuditLogger::class)->record(
                'customer.deleted',
                'Customer and associated records deleted.',
                $customer,
            );
        });
    }
}