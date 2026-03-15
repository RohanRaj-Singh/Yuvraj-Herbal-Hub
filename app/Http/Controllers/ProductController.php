<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Review;
use App\Support\ImageStorage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    // GET /api/products
    public function index()
    {
        try {
            $products = Product::with('category')->orderBy('created_at', 'desc')->get();
            // add category_title for compatibility with frontend
            $products->transform(function ($p) {
                $p->category_title = optional($p->category)->title;
                return $p;
            });
            return response()->json(['success' => true, 'data' => $products]);
        } catch (\Exception $e) {
            \Log::error('getProducts error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // POST /api/products (multipart/form-data with 'image')
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|integer|exists:categories,category_id',
            'title' => 'required|string',
            'image' => 'required|file|image|max:5120',
            'cost_price' => 'required|numeric',
            'selling_price' => 'required|numeric',
            'sku' => 'nullable|string',
            'description' => 'nullable|string',
            'discount_percent' => 'nullable|numeric',
            'stock_quantity' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 400);
        }

        try {
            $path = ImageStorage::storeWebp($request->file('image'), 'products');

            $product = Product::create([
                'category_id' => $request->category_id,
                'sku' => $request->sku ?? null,
                'title' => $request->title,
                'description' => $request->description ?? null,
                'image_url' => 'storage/' . $path,
                'cost_price' => (float)$request->cost_price,
                'selling_price' => (float)$request->selling_price,
                'discount_percent' => $request->discount_percent ? (float)$request->discount_percent : 0.0,
                'stock_quantity' => $request->stock_quantity ? (int)$request->stock_quantity : 0,
                'is_active' => $request->has('is_active') ? (bool)$request->is_active : true,
            ]);

            return response()->json(['success' => true, 'message' => 'Product added', 'product_id' => $product->product_id], 201);
        } catch (\Exception $e) {
            \Log::error('addProduct error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // GET /api/products/name/{name}
    public function getByName($name)
    {
        try {
            $products = Product::with('category')
                ->where('title', 'like', "%{$name}%")
                ->get()
                ->map(function ($p) {
                    $p->category_title = optional($p->category)->title;
                    return $p;
                });

            return response()->json(['success' => true, 'data' => $products]);
        } catch (\Exception $e) {
            \Log::error('getProductByName error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // GET /api/products/category/{category}
    public function getByCategory($category)
    {
        try {
            if (preg_match('/^\d+$/', $category)) {
                $products = Product::with('category')->where('category_id', $category)->get();
            } else {
                $products = Product::with('category')->whereHas('category', function ($q) use ($category) {
                    $q->where('title', 'like', "%{$category}%");
                })->get();
            }

            $products->transform(function ($p) {
                $p->category_title = optional($p->category)->title;
                return $p;
            });

            return response()->json(['success' => true, 'data' => $products]);
        } catch (\Exception $e) {
            \Log::error('getProductsByCategory error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // PUT /api/products/{id} (multipart/form-data optional 'image')
    public function update(Request $request, $id)
    {
        try {
            $product = Product::find($id);
            if (!$product) return response()->json(['success' => false, 'error' => 'Product not found'], 404);

            $validator = Validator::make($request->all(), [
                'category_id' => 'nullable|integer|exists:categories,category_id',
                'sku' => 'nullable|string',
                'title' => 'nullable|string',
                'description' => 'nullable|string',
                'image' => 'nullable|file|image|max:5120',
                'cost_price' => 'nullable|numeric',
                'selling_price' => 'nullable|numeric',
                'discount_percent' => 'nullable|numeric',
                'stock_quantity' => 'nullable|integer',
                'is_active' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'error' => $validator->errors()->first()], 400);
            }

            $update = [];
            $fields = ['category_id','sku','title','description','cost_price','selling_price','discount_percent','stock_quantity','is_active'];
            foreach ($fields as $f) {
                if ($request->has($f)) {
                    $update[$f] = in_array($f, ['cost_price','selling_price','discount_percent']) ? (float)$request->input($f) : ($f === 'stock_quantity' ? (int)$request->input($f) : ($f === 'is_active' ? (bool)$request->input($f) : $request->input($f)));
                }
            }

            if ($request->hasFile('image')) {
                // delete old file
                if ($product->image_url) {
                    $old = preg_replace('#^storage/#', '', $product->image_url);
                    if ($old && Storage::disk('public')->exists($old)) {
                        try { Storage::disk('public')->delete($old); } catch (\Exception $e) { \Log::warning("Failed deleting old product image: $old"); }
                    }
                }
                $path = ImageStorage::storeWebp($request->file('image'), 'products');
                $update['image_url'] = 'storage/' . $path;
            }

            if (empty($update)) return response()->json(['success' => false, 'error' => 'No fields to update'], 400);

            $product->update($update);
            return response()->json(['success' => true, 'message' => 'Product updated']);
        } catch (\Exception $e) {
            \Log::error('editProduct error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // PUT /api/products/{product_id}/review  (update avg_review_rating manually)
    public function updateReview(Request $request, $product_id)
    {
        $validator = Validator::make($request->all(), [
            'avg_review_rating' => 'required|numeric',
        ]);
        if ($validator->fails()) return response()->json(['success' => false, 'error' => $validator->errors()->first()], 400);

        try {
            $product = Product::find($product_id);
            if (!$product) return response()->json(['success' => false, 'error' => 'Product not found'], 404);

            $product->avg_review_rating = (float)$request->input('avg_review_rating');
            $product->save();

            return response()->json(['success' => true, 'message' => 'Product review rating updated']);
        } catch (\Exception $e) {
            \Log::error('updateProductReview error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // DELETE /api/products/{id}
    public function destroy($id)
    {
        try {
            $product = Product::find($id);
            if (!$product) return response()->json(['success' => false, 'error' => 'Product not found'], 404);

            if ($product->image_url) {
                $old = preg_replace('#^storage/#', '', $product->image_url);
                if ($old && Storage::disk('public')->exists($old)) {
                    try { Storage::disk('public')->delete($old); } catch (\Exception $e) { \Log::warning("Failed deleting product image: $old"); }
                }
            }

            $product->delete();
            return response()->json(['success' => true, 'message' => 'Product deleted']);
        } catch (\Exception $e) {
            \Log::error('deleteProduct error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // GET /api/products/{id}
    public function show($id)
    {
        try {
            $product = Product::with('category')->find($id);
            if (!$product) return response()->json(['success' => false, 'error' => 'Product not found'], 404);
            $product->category_title = optional($product->category)->title;
            return response()->json(['success' => true, 'data' => $product]);
        } catch (\Exception $e) {
            \Log::error('getProductById error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }
}
