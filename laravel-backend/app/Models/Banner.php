<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $table = 'banners';
    protected $primaryKey = 'banner_id';
    public $timestamps = false;

    protected $fillable = [
        'title',
        'description',
        'image_url',
        'mobile_image_url',
        'link_url',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    // CRUD-like helpers
    public static function getAll()
    {
        return self::orderBy('banner_id', 'desc')->get();
    }

    public static function add($data)
    {
        return self::create($data);
    }

    public static function remove($id)
    {
        return self::where('banner_id', $id)->delete();
    }
}
