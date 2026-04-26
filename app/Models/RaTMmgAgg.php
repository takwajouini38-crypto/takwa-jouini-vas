<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RaTMmgAgg extends Model
{
    protected $table = 'ra_t_mmg_agg';
    public $timestamps = false;

    protected $fillable = [
        'b_msisdn',
        'start_date',
        'start_hour',
        'event_type',
        'call_type',
        'event_status',
        'subscriber_type',
        'service_type',
        'cdr_count'
    ];

    protected $casts = [
        'start_date' => 'date',
        'start_hour' => 'integer',
        'cdr_count' => 'integer',
    ];

    public function serviceSms(): BelongsTo
    {
        return $this->belongsTo(ServiceSmsPlus::class, 'service_type', 'keyword');
    }

    
}