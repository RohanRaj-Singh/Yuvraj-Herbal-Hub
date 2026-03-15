<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';
    protected $primaryKey = 'product_id';
    public $timestamps = false;

    protected $fillable = [
        'category_id',
        'sku',
        'title',
        'description',
        'image_url',
        'cost_price',
        'selling_price',
        'discount_percent',
        'stock_quantity',
        'avg_review_rating',
        'is_active'
    ];

    protected $casts = [
        'discount_percent' => 'float',
        'avg_review_rating' => 'float',
        'is_active' => 'boolean'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'product_id', 'product_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'product_id', 'product_id');
    }

    // CRUD-style methods
    public static function getAll()
    {
        return self::with('category')->orderBy('product_id', 'desc')->get();
    }

    public static function add($data)
    {
        return self::create($data);
    }

    public static function getById($id)
    {
        return self::with('category', 'reviews')->find($id);
    }

    public static function getByName($name)
    {
        return self::where('title', 'like', "%{$name}%")->get();
    }

    public static function getByCategory($category)
    {
        return self::whereHas('category', function ($q) use ($category) {
            $q->where('title', 'like', "%{$category}%");
        })->get();
    }

    public static function editProduct($id, $data)
    {
        return self::where('product_id', $id)->update($data);
    }

    public static function remove($id)
    {
        return self::where('product_id', $id)->delete();
    }

    public static function updateAverageRating($productId)
    {
        $avg = Review::where('product_id', $productId)->avg('rating');
        return self::where('product_id', $productId)->update(['avg_review_rating' => $avg]);
    }
}
