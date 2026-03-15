<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Support\ImageStorage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class BannerController extends Controller
{
    // GET /api/banners
    public function index()
    {
        try {
            $banners = Banner::orderBy('created_at', 'desc')->get();
            return response()->json(['success' => true, 'data' => $banners]);
        } catch (\Exception $e) {
            \Log::error('getBanners error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // POST /api/banners (expects multipart/form-data with 'image' and 'mobile_image' files and other fields)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'description' => 'nullable|string',
            'link_url' => 'nullable|url',
            'is_active' => 'nullable|boolean',
            'image' => 'required|file|image|max:5120',
            'mobile_image' => 'required|file|image|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 400);
        }

        try {
            // store desktop image
            $desktopPath = ImageStorage::storeWebp($request->file('image'), 'banners');

            // store mobile image
            $mobilePath = ImageStorage::storeWebp($request->file('mobile_image'), 'banners', 'mobile');

            $banner = Banner::create([
                'title' => trim($request->title),
                'description' => $request->description ?? null,
                'image_url' => 'storage/' . $desktopPath,
                'mobile_image_url' => 'storage/' . $mobilePath,
                'link_url' => $request->link_url ?? null,
                'is_active' => $request->has('is_active') ? (bool)$request->is_active : true,
            ]);

            return response()->json(['success' => true, 'message' => 'Banner added', 'banner_id' => $banner->banner_id], 201);
        } catch (\Exception $e) {
            \Log::error('addBanner error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // DELETE /api/banners/{id}
    public function destroy($id)
    {
        try {
            $banner = Banner::find($id);
            if (!$banner) return response()->json(['success' => false, 'error' => 'Banner not found'], 404);

            // delete images if exist (paths stored as 'storage/...')
            if ($banner->image_url) {
                $p = preg_replace('#^backend/storage/app/public/#', '', $banner->image_url);
                if ($p && Storage::disk('public')->exists($p)) {
                    try { Storage::disk('public')->delete($p); } catch (\Exception $e) { \Log::warning("Failed deleting banner image: $p"); }
                }
            }
            if ($banner->mobile_image_url) {
                $p2 = preg_replace('#^backend/storage/app/public/#', '', $banner->mobile_image_url);
                if ($p2 && Storage::disk('public')->exists($p2)) {
                    try { Storage::disk('public')->delete($p2); } catch (\Exception $e) { \Log::warning("Failed deleting banner mobile image: $p2"); }
                }
            }

            $banner->delete();
            return response()->json(['success' => true, 'message' => 'Banner deleted']);
        } catch (\Exception $e) {
            \Log::error('deleteBanner error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }
}
