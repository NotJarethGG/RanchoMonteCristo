<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Sube las imágenes de la galería a Cloudinary.
 *
 * Se habla con la API REST directamente en lugar de sumar un paquete: son dos
 * llamadas y así no hay una dependencia más que mantener.
 *
 * Si no hay credenciales, `ready()` devuelve false y el llamador cae al disco
 * local. Eso mantiene el desarrollo sin configuración y evita que la app se
 * rompa si alguien despliega sin las variables.
 */
class CloudinaryUploader
{
    private const BASE = 'https://api.cloudinary.com/v1_1';

    public function __construct(
        private readonly ?string $cloudName,
        private readonly ?string $apiKey,
        private readonly ?string $apiSecret,
        private readonly string $folder,
    ) {
    }

    public static function fromConfig(): self
    {
        return new self(
            config('cloudinary.cloud_name'),
            config('cloudinary.api_key'),
            config('cloudinary.api_secret'),
            config('cloudinary.folder'),
        );
    }

    public function ready(): bool
    {
        return filled($this->cloudName) && filled($this->apiKey) && filled($this->apiSecret);
    }

    /**
     * Sube el archivo y devuelve su URL y su identificador en Cloudinary.
     * Devuelve null ante cualquier fallo para que el llamador use el disco local.
     *
     * @return array{url: string, public_id: string}|null
     */
    public function upload(UploadedFile $file): ?array
    {
        if (! $this->ready()) {
            return null;
        }

        $params = [
            'folder' => $this->folder,
            'timestamp' => (string) now()->timestamp,
        ];

        try {
            $response = Http::timeout(30)
                ->attach('file', $file->getContent(), $file->getClientOriginalName())
                ->post(self::BASE."/{$this->cloudName}/image/upload", [
                    ...$params,
                    'api_key' => $this->apiKey,
                    'signature' => $this->sign($params),
                ]);

            if ($response->failed()) {
                Log::warning('Cloudinary rechazó la subida', ['respuesta' => $response->json()]);

                return null;
            }

            return [
                'url' => $response->json('secure_url'),
                'public_id' => $response->json('public_id'),
            ];
        } catch (ConnectionException $e) {
            Log::warning('No se pudo conectar con Cloudinary', ['error' => $e->getMessage()]);

            return null;
        }
    }

    /** Borra la imagen de Cloudinary. El resultado no es crítico: se registra y sigue. */
    public function delete(string $publicId): bool
    {
        if (! $this->ready()) {
            return false;
        }

        $params = ['public_id' => $publicId, 'timestamp' => (string) now()->timestamp];

        try {
            $response = Http::timeout(15)->asForm()
                ->post(self::BASE."/{$this->cloudName}/image/destroy", [
                    ...$params,
                    'api_key' => $this->apiKey,
                    'signature' => $this->sign($params),
                ]);

            return $response->successful() && $response->json('result') === 'ok';
        } catch (ConnectionException $e) {
            Log::warning('No se pudo borrar en Cloudinary', ['error' => $e->getMessage()]);

            return false;
        }
    }

    /**
     * Firma que exige Cloudinary: los parámetros ordenados alfabéticamente,
     * concatenados como query string, con el secreto al final, en SHA-1.
     *
     * @param  array<string, string>  $params
     */
    private function sign(array $params): string
    {
        ksort($params);

        return sha1(urldecode(http_build_query($params)).$this->apiSecret);
    }
}
