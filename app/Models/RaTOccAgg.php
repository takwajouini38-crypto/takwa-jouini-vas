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

    // Accessor nom service
    public function getServiceNomAttribute(): ?string
    {
        return $this->relationLoaded('serviceSms') && $this->serviceSms
            ? $this->serviceSms->nom_service
            : null;
    }

    // Accessor prix service
    public function getServicePrixAttribute(): ?float
    {
        return $this->relationLoaded('serviceSms') && $this->serviceSms
            ? $this->serviceSms->prix
            : null;
    }

    // Scopes
    public function scopeByKeyword($query, string $keyword)
    {
        return $query->where('keyword', $keyword);
    }

    public function scopeBetweenDates($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('start_date', [$startDate, $endDate]);
    }

    public function scopeByMsisdnList($query, array $msisdns)
    {
        return $query->whereIn('b_msisdn', $msisdns);
    }

    public function scopeByMsisdn($query, string $msisdn)
    {
        return $query->where('b_msisdn', $msisdn);
    }
}