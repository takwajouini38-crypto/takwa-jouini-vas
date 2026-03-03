<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\JobTask;

class JobTaskController extends Controller
{
    public function index(Request $request)
    {
        $jobs = JobTask::all(); // ou paginate(10) si beaucoup

        return Inertia::render('JobDashboard', [
            'jobs' => $jobs,
            'title' => 'Suivi des Jobs', // pour le layout
        ]);
    }
}