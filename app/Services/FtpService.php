<?php 
namespace App\Services;

use App\Models\FtpSetting;
use Illuminate\Support\Facades\Log;

class FtpService
{
    private function getConfig()
    {
        $ftp = FtpSetting::where('is_default', true)
            ->where('is_active', true)
            ->first();

        if (!$ftp) {
            throw new \Exception("Aucun serveur FTP actif trouvé");
        }

        return $ftp;
    }

    public function connect()
{
    $ftp = $this->getConfig();

    // On essaie d'abord la connexion sécurisée SSL
    $conn = @ftp_ssl_connect($ftp->host, $ftp->port);

    // Si le SSL échoue, on tente la connexion normale (fallback)
    if (!$conn) {
        $conn = ftp_connect($ftp->host, $ftp->port);
    }

    if (!$conn) {
        Log::error("FTP connection failed", ['host' => $ftp->host]);
        throw new \Exception("Connexion FTP échouée");
    }

    $login = ftp_login($conn, $ftp->username, $ftp->password);

    if (!$login) {
        ftp_close($conn);
        Log::error("FTP login failed", ['user' => $ftp->username]);
        throw new \Exception("Login FTP échoué");
    }

    ftp_pasv($conn, true); 

    return $conn;
}
    public function listFiles($path = ".")
    {
        $conn = $this->connect();

        $files = ftp_nlist($conn, $path) ?: [];

        ftp_close($conn);

        return $files;
    }

    public function upload($localFile, $remoteFile)
    {
        $conn = $this->connect();

        $result = ftp_put($conn, $remoteFile, $localFile, FTP_BINARY);

        ftp_close($conn);

        Log::info("FTP upload", [
            'local' => $localFile,
            'remote' => $remoteFile,
            'status' => $result
        ]);

        return $result;
    }

    public function download($remoteFile, $localFile)
    {
        $conn = $this->connect();

        $result = ftp_get($conn, $localFile, $remoteFile, FTP_BINARY);

        ftp_close($conn);

        Log::info("FTP download", [
            'remote' => $remoteFile,
            'local' => $localFile,
            'status' => $result
        ]);

        return $result;
    }
    /**
 * Déplace un fichier sur le serveur FTP (utile pour l'archivage)
 */
public function move($oldPath, $newPath)
{
    $conn = $this->connect();
    
    // On s'assure que le dossier de destination existe (ex: 'mmg/processed')
    // dirname($newPath) extrait 'mmg/processed' du chemin complet
    $directory = dirname($newPath);
    @ftp_mkdir($conn, $directory);
    
    // On renomme (déplace) le fichier
    $result = ftp_rename($conn, $oldPath, $newPath);
    
    ftp_close($conn);
    
    return $result;
}
}