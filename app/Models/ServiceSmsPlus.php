<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceSmsPlus extends Model
{
    protected $table = 'services_sms_plus';

    protected $fillable = [
        'nom_service',
        'nom_fournisseur',
        'numero_court',
        'keyword',
        'type',
        'prix'
    ];
}