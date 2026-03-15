<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Support\ImageStorage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    // GET /api/categories
    public function index()
    {
        try {
            $categories = Category::orderBy('created_at', 'desc')->get();
            return response()->json(['success' => true, 'data' => $categories]);
        } catch (\Exception $e) {
            \Log::error('getCategories error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // POST /api/categories (multipart/form-data with 'image')
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'image' => 'required|file|image|max:5120',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 400);
        }

        try {
            $path = ImageStorage::storeWebp($request->file('image'), 'categories');

            $category = Category::create([
                'title' => $request->title,
                'image_url' => 'storage/' . $path,
                'is_active' => $request->has('is_active') ? (bool)$request->is_active : true,
            ]);

            return response()->json(['success' => true, 'message' => 'Category added', 'category_id' => $category->category_id], 201);
        } catch (\Exception $e) {
            \Log::error('addCategory error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // DELETE /api/categories/{id}
    public function destroy($id)
    {
        try {
            $cat = Category::find($id);
            if (!$cat) return response()->json(['success' => false, 'error' => 'Category not found'], 404);

            if ($cat->image_url) {
                $p = preg_replace('#^storage/#', '', $cat->image_url);
                if ($p && Storage::disk('public')->exists($p)) {
                    try { Storage::disk('public')->delete($p); } catch (\Exception $e) { \Log::warning("Failed deleting category image: $p"); }
                }
            }

            $cat->delete();
            return response()->json(['success' => true, 'message' => 'Category deleted']);
        } catch (\Exception $e) {
            \Log::error('deleteCategory error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }
}
