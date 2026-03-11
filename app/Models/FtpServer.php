<?php
// app/Models/FtpServer.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class FtpServer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'host', 'port', 'username', 'password', 'remote_path', 'priority', 'is_active'
    ];

    // Décryptage automatique du mot de passe à l'accès
    public function getPasswordAttribute($value)
    {
        return $value ? Crypt::decryptString($value) : null;
    }

    // Chiffrement automatique à la sauvegarde
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = $value ? Crypt::encryptString($value) : null;
    }
}