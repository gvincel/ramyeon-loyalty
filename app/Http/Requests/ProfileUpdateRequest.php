<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // If the user is a cashier, they update their username. No email required.
        if ($this->user()->role === 'cashier') {
            return [
                'name' => ['required', 'string', 'max:255'],
                'username' => [
                    'required', 
                    'string', 
                    'max:50', 
                    'regex:/\A[a-zA-Z0-9._-]+\z/', 
                    Rule::unique(User::class)->ignore($this->user()->id)
                ],
            ];
        }

        // Admins update their email.
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];
    }
}
