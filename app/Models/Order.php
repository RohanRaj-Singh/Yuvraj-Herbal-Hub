<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';
    protected $primaryKey = 'order_id';
    public $timestamps = false;

    protected $fillable = [
        'customer_name',
        'contact_number',
        'whatsapp_number',
        'email',
        'shipping_address',
        'postal_code',
        'total_amount',
        'order_status',
        'payment_status'
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }

    // CRUD logic
    public static function add($data, $items)
    {
        DB::beginTransaction();
        try {
            $order = self::create($data);
            foreach ($items as $item) {
                $item['order_id'] = $order->order_id;
                OrderItem::create($item);
                Product::where('product_id', $item['product_id'])
                    ->decrement('stock_quantity', $item['quantity']);
            }
            DB::commit();
            return $order->load('items');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public static function getAll()
    {
        return self::with('items.product')->orderBy('order_id', 'desc')->get();
    }

    public static function getById($id)
    {
        return self::with('items.product')->find($id);
    }

    public static function updateOrder($id, $data)
    {
        return self::where('order_id', $id)->update($data);
    }

    public static function remove($id)
    {
        return self::where('order_id', $id)->delete();
    }

    public static function getByPaymentStatus($status)
    {
        return self::where('payment_status', $status)->get();
    }

    public static function getByDateRange($from, $to)
    {
        return self::whereBetween('created_at', [$from, $to])->get();
    }
}
