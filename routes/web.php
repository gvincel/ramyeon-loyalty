<?php

use App\Http\Controllers\Admin\CashierController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Cashier\CustomerController as CashierCustomerController;
use App\Http\Controllers\Admin\RewardController;
use App\Http\Controllers\Admin\DashboardController;
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
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
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

    Route::get('/cashier/dashboard', function () {
        return Inertia::render('Cashier/Dashboard');
    })->name('cashier.dashboard');

    Route::get('/cashier/customers/register', function () {
        return Inertia::render('Cashier/Customers/Register');
    })->name('cashier.customers.register');

    Route::get('/cashier/customers', [
        CashierCustomerController::class,
        'index',
    ])->name('cashier.customers.index');

    Route::get('/cashier/customers/{customer}', [
        CashierCustomerController::class,
        'show',
    ])->whereNumber('customer')->name('cashier.customers.show');

    Route::post('/cashier/customers', [
        CashierCustomerController::class,
        'store',
    ])->name('cashier.customers.store');

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