<?php

use App\Http\Controllers\Admin\CashierController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Cashier\CustomerController as CashierCustomerController;
use App\Http\Controllers\Cashier\DashboardController as CashierDashboardController;
use App\Http\Controllers\Cashier\RegisterQrController;
use App\Http\Controllers\Admin\RewardController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Customer\AuthController as CustomerAuthController;
use App\Http\Controllers\Customer\RewardController as CustomerRewardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
});

/*
|--------------------------------------------------------------------------
| Customer Authentication Routes
|--------------------------------------------------------------------------
|
| These routes are separate from the Admin/Cashier authentication system
| and use the "customer" authentication guard.
|
*/

Route::middleware('guest:customer')->group(function () {
    Route::get('/loyalty/login', [CustomerAuthController::class, 'create'])
        ->name('customer.login');

    Route::post('/loyalty/login', [CustomerAuthController::class, 'store'])
        ->name('customer.login.store');

    Route::get('/loyalty/register', [CustomerAuthController::class, 'register'])
        ->name('customer.register');

    Route::post('/loyalty/register', [CustomerAuthController::class, 'storeRegistration'])
        ->middleware('throttle:5,1')
        ->name('customer.register.store');
});

Route::middleware('auth:customer')->group(function () {
    Route::get('/loyalty/dashboard', [
        \App\Http\Controllers\Customer\DashboardController::class,
        'index',
    ])->name('customer.dashboard');

    Route::get('/loyalty/rewards', [
        CustomerRewardController::class,
        'index',
    ])->name('customer.rewards');

    Route::get('/loyalty/transactions', [
        \App\Http\Controllers\Customer\TransactionController::class,
        'index',
    ])->name('customer.transactions');

    Route::get('/loyalty/point-history', [
        \App\Http\Controllers\Customer\PointTransactionController::class,
        'index',
    ])->name('customer.point-history');

    Route::get('/loyalty/redemption-history', [
        \App\Http\Controllers\Customer\RedemptionHistoryController::class,
        'index',
    ])->name('customer.redemption-history');

    Route::post('/loyalty/logout', [CustomerAuthController::class, 'destroy'])
        ->name('customer.logout');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Only authenticated users with the "admin" role can access these routes.
|
*/

Route::middleware(['auth', 'role:admin'])->group(function () {

    Route::get('/admin/dashboard', [DashboardController::class, 'index'])
        ->name('admin.dashboard');

    Route::get('/admin/cashiers', [CashierController::class, 'index'])
        ->name('admin.cashiers.index');

    Route::post('/admin/cashiers', [CashierController::class, 'store'])
        ->name('admin.cashiers.store');

    Route::put('/admin/cashiers/{cashier}', [CashierController::class, 'update'])
        ->name('admin.cashiers.update');

    Route::patch('/admin/cashiers/{cashier}/status', [CashierController::class, 'toggleStatus'])
        ->name('admin.cashiers.toggle-status');

    Route::get('/admin/customers', [CustomerController::class, 'index'])
    ->name('admin.customers.index');

    Route::put('/admin/customers/{customer}', [CustomerController::class, 'update'])
    ->name('admin.customers.update');

    Route::patch('/admin/customers/{customer}/status', [CustomerController::class, 'toggleStatus'])
    ->name('admin.customers.toggle-status');

    Route::get('/admin/rewards', [RewardController::class, 'index'])
    ->name('admin.rewards.index');

    Route::post('/admin/rewards', [RewardController::class, 'store'])
    ->name('admin.rewards.store');

    Route::put('/admin/rewards/{reward}', [RewardController::class, 'update'])
    ->name('admin.rewards.update');

    Route::patch('/admin/rewards/{reward}/toggle-status', [RewardController::class, 'toggleStatus'])
    ->name('admin.rewards.toggle-status');

});

/*
|--------------------------------------------------------------------------
| Cashier Routes
|--------------------------------------------------------------------------
|
| Only authenticated users with the "cashier" role can access these routes.
|
*/

Route::middleware(['auth', 'role:cashier'])->group(function () {

    Route::get('/cashier/dashboard', [
        CashierDashboardController::class,
        'index',
    ])->name('cashier.dashboard');

    Route::get('/cashier/customers', [
        CashierCustomerController::class,
        'index',
    ])->name('cashier.customers.index');

    Route::get('/cashier/customers/{customer}', [
        CashierCustomerController::class,
        'show',
    ])->whereNumber('customer')->name('cashier.customers.show');

    Route::get('/cashier/register-qr', [
        RegisterQrController::class,
        'index',
    ])->name('cashier.register-qr');

    Route::get('/cashier/qr-scanner', function () {
        return Inertia::render('Cashier/QRScanner');
    })->name('cashier.qr-scanner');

    Route::get('/cashier/transactions', [
        \App\Http\Controllers\Cashier\TransactionController::class,
        'index',
    ])->name('cashier.transactions.index');

    Route::post('/cashier/transactions/find-customer', [
        \App\Http\Controllers\Cashier\TransactionController::class,
        'findCustomer',
    ])->name('cashier.transactions.find-customer');

    Route::post('/cashier/transactions/find-customer-by-code', [
        \App\Http\Controllers\Cashier\TransactionController::class,
        'findCustomerByCode',
    ])->name('cashier.transactions.find-customer-by-code');

    Route::post('/cashier/transactions', [
        \App\Http\Controllers\Cashier\TransactionController::class,
        'store',
    ])->name('cashier.transactions.store');

    Route::post('/cashier/rewards/available', [
        \App\Http\Controllers\Cashier\RewardRedemptionController::class,
        'availableRewards',
    ])->name('cashier.rewards.available');

    Route::post('/cashier/reward-redemptions', [
        \App\Http\Controllers\Cashier\RewardRedemptionController::class,
        'store',
    ])->name('cashier.reward-redemptions.store');

    Route::get('/cashier/reward-redemptions', [
        \App\Http\Controllers\Cashier\RewardRedemptionController::class,
        'index',
    ])->name('cashier.reward-redemptions.index');

    Route::patch('/cashier/reward-redemptions/{redemption}/cancel', [
        \App\Http\Controllers\Cashier\RewardRedemptionController::class,
        'cancel',
    ])->name('cashier.reward-redemptions.cancel');

});

/*
|--------------------------------------------------------------------------
| Profile Routes
|--------------------------------------------------------------------------
|
| These are available to any authenticated user.
|
*/

Route::middleware('auth')->group(function () {

    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');

});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

require __DIR__.'/auth.php';