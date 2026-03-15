<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AdminAuthController extends Controller
{
    private const CACHE_KEY = 'admin_login_code';
    private const TTL_MINUTES = 5;
    private const MAX_ATTEMPTS = 3;

    public function requestCode(Request $request)
    {
        $ownerEmail = env('OWNER_EMAIL');
        if (!$ownerEmail) {
            return response()->json(['success' => false, 'error' => 'Admin email not configured'], 500);
        }

        $code = (string)random_int(100000, 999999);

        Cache::put(self::CACHE_KEY, [
            'hash' => Hash::make($code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(self::TTL_MINUTES)->toISOString(),
        ], now()->addMinutes(self::TTL_MINUTES));

        try {
            Mail::raw("Your admin login code is: {$code}\n\nThis code expires in 5 minutes.", function ($message) use ($ownerEmail) {
                $message->to($ownerEmail)
                    ->subject('Admin Login Code');
            });
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'error' => 'Failed to send login code. Please try again later.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Code sent to owner email',
            'expires_in' => self::TTL_MINUTES * 60,
            'attempts_remaining' => self::MAX_ATTEMPTS,
        ]);
    }

    public function verifyCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 400);
        }

        $payload = Cache::get(self::CACHE_KEY);
        if (!$payload) {
            return response()->json(['success' => false, 'error' => 'Code expired. Please request a new one.'], 400);
        }

        $expiresAt = $payload['expires_at'] ?? null;
        if ($expiresAt) {
            $expiresAt = Carbon::parse($expiresAt);
        }
        if ($expiresAt && now()->greaterThan($expiresAt)) {
            Cache::forget(self::CACHE_KEY);
            return response()->json(['success' => false, 'error' => 'Code expired. Please request a new one.'], 400);
        }

        $attempts = (int)($payload['attempts'] ?? 0);
        if ($attempts >= self::MAX_ATTEMPTS) {
            return response()->json(['success' => false, 'error' => 'Too many attempts. Request a new code.'], 429);
        }

        if (!Hash::check($request->code, $payload['hash'] ?? '')) {
            $attempts++;
            $ttl = $expiresAt ?? now()->addMinutes(self::TTL_MINUTES);
            Cache::put(self::CACHE_KEY, [
                'hash' => $payload['hash'] ?? '',
                'attempts' => $attempts,
                'expires_at' => ($expiresAt ? $expiresAt->toISOString() : now()->addMinutes(self::TTL_MINUTES)->toISOString()),
            ], $ttl);

            $remaining = max(self::MAX_ATTEMPTS - $attempts, 0);
            return response()->json([
                'success' => false,
                'error' => 'Invalid code.',
                'attempts_remaining' => $remaining,
            ], 400);
        }

        Cache::forget(self::CACHE_KEY);

        return response()->json([
            'success' => true,
            'message' => 'Admin authenticated',
        ]);
    }
}
