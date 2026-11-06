<?php

namespace Tests\Feature;
use Inertia\Testing\AssertableInertia as Assert;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_the_root_url_renders_the_public_homepage(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(
            fn (\Inertia\Testing\AssertableInertia $page) => $page->component('Legal/Home')
        );
    }
}
