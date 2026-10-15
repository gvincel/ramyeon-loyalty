<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    /**
     * Display paginated customer feedback.
     */
    public function index(): Response
    {
        $feedback = Feedback::query()
            ->with('customer:id,first_name,last_name,customer_code')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Feedback', [
            'feedback' => $feedback,
        ]);
    }
}