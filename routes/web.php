<?php

use App\Http\Controllers\Admin\CashierController;
use App\Http\Controllers\Admin\CustomerController;
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

    Route::get('/admin/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

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

    Route::post('/admin/customers', [CustomerController::class, 'store'])
    ->name('admin.customers.store');

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

    Route::post('/cashier/transactions/find-customer', [
        \App\Http\Controllers\Cashier\TransactionController::class,
        'findCustomer',
    ])->name('cashier.transactions.find-customer');

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