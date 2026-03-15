<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $table = 'reviews';
    protected $primaryKey = 'review_id';
    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'reviewer_name',
        'rating',
        'comment'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    // CRUD
    public static function add($data)
    {
        $review = self::create($data);
        Product::updateAverageRating($data['product_id']);
        return $review;
    }

    public static function getByProduct($productId)
    {
        return self::where('product_id', $productId)->orderBy('review_id', 'desc')->get();
    }

    public static function remove($id)
    {
        $review = self::find($id);
        if ($review) {
            $productId = $review->product_id;
            $review->delete();
            Product::updateAverageRating($productId);
        }
    }
}
