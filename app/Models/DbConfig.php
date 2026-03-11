<?php
// app/Models/DbConfig.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class DbConfig extends Model
{
    use HasFactory;

    protected $table = 'db_configs';
    protected $fillable = [
        'host', 'port', 'service_name', 'username', 'password', 'is_active'
    ];

    public function getPasswordAttribute($value)
    {
        return $value ? Crypt::decryptString($value) : null;
    }

    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = $value ? Crypt::encryptString($value) : null;
    }
}