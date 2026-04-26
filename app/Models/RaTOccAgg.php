<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RaTOccAgg extends Model
{
    protected $table = 'ra_t_occ_agg';
    public $timestamps = false;

    protected $fillable = [
        'b_msisdn',
        'start_date',
        'start_hour',
        'call_type',
        'event_type',
        'subscriber_type',
        'keyword',
        'cdr_count',
        'charge_amount'
    ];

    protected $casts = [
        'start_date' => 'date',
        'start_hour' => 'integer',
        'cdr_count' => 'integer',
        'charge_amount' => 'float',
    ];

    // Relation vers Service
    public function serviceSms(): BelongsTo
    {
        return $this->belongsTo(ServiceSmsPlus::class, 'keyword', 'keyword');
    }

   

    
}