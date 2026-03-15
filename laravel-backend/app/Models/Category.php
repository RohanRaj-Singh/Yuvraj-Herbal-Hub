<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';
    protected $primaryKey = 'category_id';
    public $timestamps = false;

    protected $fillable = [
        'title',
        'image_url',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id', 'category_id');
    }

    public static function getAll()
    {
        return self::orderBy('category_id', 'desc')->get();
    }

    public static function add($data)
    {
        return self::create($data);
    }

    public static function remove($id)
    {
        return self::where('category_id', $id)->delete();
    }
}
