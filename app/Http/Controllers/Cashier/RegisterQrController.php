<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class RegisterQrController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Cashier/RegisterQr/Index', [
            'registerUrl' => route('customer.register'),
        ]);
    }
}