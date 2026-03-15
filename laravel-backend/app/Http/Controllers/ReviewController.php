<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    // POST /api/products/{id}/review
    public function store(Request $request, $id)
    {
        $validator = Validator::make(array_merge($request->all(), ['product_id' => $id]), [
            'reviewer_name' => 'required|string',
            'comment' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'product_id' => 'required|integer|exists:products,product_id',
        ]);

        if ($validator->fails()) return response()->json(['success' => false, 'error' => $validator->errors()->first()], 400);

        $connection = DB::connection();
        $transaction = $connection->getPdo();
        DB::beginTransaction();
        try {
            $review = Review::create([
                'product_id' => $id,
                'reviewer_name' => $request->reviewer_name,
                'rating' => (int)$request->rating,
                'comment' => $request->comment,
            ]);

            // update product average rating
            $avg = Review::where('product_id', $id)->avg('rating');
            Product::where('product_id', $id)->update(['avg_review_rating' => $avg]);

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Review added and product rating updated', 'review_id' => $review->review_id], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('addProductReview error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error during review submission'], 500);
        }
    }

    // GET /api/products/{id}/reviews
    public function getByProduct($id)
    {
        try {
            $reviews = Review::where('product_id', $id)->orderBy('created_at', 'desc')->get();
            return response()->json(['success' => true, 'data' => $reviews]);
        } catch (\Exception $e) {
            \Log::error('getProductReviews error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // DELETE /api/reviews/{id}  (not wired by routes.js but provided if needed)
    public function destroy($id)
    {
        try {
            $review = Review::find($id);
            if (!$review) return response()->json(['success' => false, 'error' => 'Review not found'], 404);
            $productId = $review->product_id;
            $review->delete();
            // update avg
            $avg = Review::where('product_id', $productId)->avg('rating') ?? 0;
            Product::where('product_id', $productId)->update(['avg_review_rating' => $avg]);
            return response()->json(['success' => true, 'message' => 'Review deleted']);
        } catch (\Exception $e) {
            \Log::error('deleteProductReview error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }
}
