<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobTask extends Model
{
    protected $table = 'job_monitoring';
protected $fillable = ['name', 'type', 'status'];
}
