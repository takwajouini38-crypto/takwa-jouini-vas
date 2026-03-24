<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FtpSetting extends Model
{
    protected $fillable = [
        'name',
        'host',
        'port',
        'username',
        'password',
        'is_active',
        'is_default',
    ];

    protected $hidden = [
        'password',
    ];
}