<?php 
namespace App\Services;

use App\Models\FtpSetting;

class FtpService
{
    public function connect()
    {
        $ftp = FtpSetting::where('is_default', true)
                         ->where('is_active', true)
                         ->first();

        if (!$ftp) {
            throw new \Exception("Aucun serveur FTP actif");
        }

        $conn = @ftp_connect($ftp->host, $ftp->port);

        if (!$conn) {
            throw new \Exception("Connexion FTP échouée");
        }

        if (!@ftp_login($conn, $ftp->username, $ftp->password)) {
            throw new \Exception("Login FTP échoué");
        }

        return $conn;
    }

    public function listFiles($path = ".")
    {
        $conn = $this->connect();
        $files = ftp_nlist($conn, $path);
        ftp_close($conn);

        return $files;
    }

    public function upload($localFile, $remoteFile)
    {
        $conn = $this->connect();
        $result = ftp_put($conn, $remoteFile, $localFile, FTP_BINARY);
        ftp_close($conn);

        return $result;
    }

    public function download($remoteFile, $localFile)
    {
        $conn = $this->connect();
        $result = ftp_get($conn, $localFile, $remoteFile, FTP_BINARY);
        ftp_close($conn);

        return $result;
    }
}