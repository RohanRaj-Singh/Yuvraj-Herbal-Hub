<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageStorage
{
    public static function storeWebp(UploadedFile $file, string $dir, string $nameSuffix = ''): string
    {
        $originalBase = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $slug = Str::slug($originalBase);
        $safeBase = $slug !== '' ? $slug : 'image';
        $suffix = $nameSuffix !== '' ? '_' . $nameSuffix : '';
        $baseName = time() . $suffix . '_' . $safeBase;

        if (!function_exists('imagewebp')) {
            return self::storeOriginal($file, $dir, $baseName);
        }

        $filename = $baseName . '.webp';
        $path = trim($dir, '/') . '/' . $filename;

        Storage::disk('public')->makeDirectory($dir);
        $targetPath = Storage::disk('public')->path($path);

        $data = @file_get_contents($file->getRealPath());
        if ($data === false) {
            throw new \RuntimeException('Failed to read uploaded image.');
        }

        $img = @imagecreatefromstring($data);
        if ($img === false) {
            throw new \RuntimeException('Unsupported image format.');
        }

        if (function_exists('imagepalettetotruecolor')) {
            @imagepalettetotruecolor($img);
        }
        @imagealphablending($img, true);
        @imagesavealpha($img, true);

        $quality = 82;
        $ok = @imagewebp($img, $targetPath, $quality);
        imagedestroy($img);

        if (!$ok) {
            return self::storeOriginal($file, $dir, $baseName);
        }

        return $path;
    }

    private static function storeOriginal(UploadedFile $file, string $dir, string $baseName): string
    {
        $ext = $file->extension() ?: 'jpg';
        return $file->storeAs($dir, $baseName . '.' . $ext, 'public');
    }
}
