<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function op()
    {
        return view('dashboard.op');
    }

    public function biz()
    {
        return view('dashboard.biz');
    }
}
