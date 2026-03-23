<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ra_t_mmg_tmp', function (Blueprint $table) {

            // Pas de id car table Oracle n'en a pas (table brute TMP)
            $table->string('aggregation_group', 255)->nullable();
            $table->string('apn', 255)->nullable();
            $table->string('a_imsi', 255)->nullable();
            $table->string('a_msisdn', 255)->nullable();
            $table->string('a_msisdn_orig', 255)->nullable();
            $table->string('bearer_service', 255)->nullable();
            $table->string('b_datasource', 255)->nullable();
            $table->string('b_imsi', 255)->nullable();
            $table->string('b_msisdn', 255)->nullable();
            $table->string('b_msisdn_orig', 255)->nullable();
            $table->string('call_reference', 255)->nullable();
            $table->string('call_type', 255)->nullable();
            $table->string('cause_for_closing', 255)->nullable();
            $table->string('cdr_search_detail_id', 255)->nullable();
            $table->string('cell_id', 255)->nullable();
            $table->string('cgi_id_key', 255)->nullable();
            $table->string('charge_amnt_step', 255)->nullable();
            $table->string('charge_amount_orig', 255)->nullable();
            $table->string('c_num', 255)->nullable();
            $table->string('c_num_orig', 255)->nullable();
            $table->string('data_volume', 255)->nullable();
            $table->string('data_volume_down', 255)->nullable();
            $table->string('data_volume_up', 255)->nullable();
            $table->string('duration_step', 255)->nullable();
            $table->string('estimated_amount', 255)->nullable();
            $table->string('event_duration', 255)->nullable();
            $table->string('event_status', 255)->nullable();
            $table->string('event_type', 255)->nullable();
            $table->string('event_type_orig', 255)->nullable();
            $table->string('filename', 255)->nullable();
            $table->string('filter_code', 255)->nullable();
            $table->string('imei', 255)->nullable();
            $table->string('last_partial', 255)->nullable();
            $table->string('ne', 255)->nullable();
            $table->string('orig_start_time', 255)->nullable();
            $table->string('partial_seq_id', 255)->nullable();
            $table->string('partner', 255)->nullable();
            $table->string('partner_code', 255)->nullable();
            $table->string('pgw_address', 255)->nullable();
            $table->string('price_plan_code', 255)->nullable();
            $table->string('proc_date', 255)->nullable();
            $table->string('proc_hour', 255)->nullable();
            $table->string('radio_type', 255)->nullable();
            $table->string('rate_code', 255)->nullable();
            $table->string('record_id', 255)->nullable();
            $table->string('record_status', 255)->nullable();
            $table->string('record_type', 255)->nullable();
            $table->string('roaming_type', 255)->nullable();
            $table->string('served_msrn', 255)->nullable();
            $table->string('service_id', 255)->nullable();
            $table->string('service_partner', 255)->nullable();
            $table->string('service_type', 255)->nullable();
            $table->string('sgsn_address', 255)->nullable();
            $table->string('sms_centre', 255)->nullable();
            $table->string('start_date_time_home', 255)->nullable();
            $table->string('start_time', 255)->nullable();
            $table->string('subscriber_type', 255)->nullable();
            $table->string('teleservice', 255)->nullable();
            $table->string('test_flag', 255)->nullable();
            $table->string('ton_a', 255)->nullable();
            $table->string('ton_b', 255)->nullable();
            $table->string('ton_c', 255)->nullable();
            $table->string('traffic_type', 255)->nullable();
            $table->string('trunk_in', 255)->nullable();
            $table->string('trunk_out', 255)->nullable();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ra_t_mmg_tmp');
    }
};