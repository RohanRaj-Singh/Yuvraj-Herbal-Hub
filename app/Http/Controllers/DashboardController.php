<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    // GET /api/dashboard
    public function index()
    {
        try {
            $totalProducts = Product::count();
            $totalCategories = Category::count();
            $totalOrders = Order::count();

            $completed = Order::where('order_status','Delivered')->count();
            $canceled = Order::where('order_status','Cancelled')->count();
            $returned = Order::where('payment_status','Refunded')->count();
            $new_orders = Order::where('order_status','Pending')->count();

            // total_profit like JS: sum((price_per_item - cost_price) * quantity) for paid and certain order_status
            $profitRow = DB::selectOne("
                SELECT IFNULL(SUM((oi.price_per_item - p.cost_price) * oi.quantity),0) AS total_profit
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.order_id
                JOIN products p ON oi.product_id = p.product_id
                WHERE o.payment_status = 'Paid'
                AND o.order_status IN ('Delivered', 'Processing', 'Shipped')
            ");

            $response = [
                'total_products' => $totalProducts,
                'total_categories' => $totalCategories,
                'total_orders' => $totalOrders,
                'completed' => $completed,
                'canceled' => $canceled,
                'returned' => $returned,
                'new_orders' => $new_orders,
                'total_profit' => $profitRow->total_profit ?? 0,
            ];

            return response()->json(['success' => true, 'data' => $response]);
        } catch (\Exception $e) {
            \Log::error('getDashboard error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // GET /api/monthly-trends
    public function monthlyTrends()
    {
        try {
            $rows = DB::select("
                SELECT 
                    DATE_FORMAT(o.created_at, '%Y-%m') AS month,
                    SUM(CASE WHEN o.order_status = 'Delivered' THEN (oi.price_per_item - p.cost_price) * oi.quantity ELSE 0 END) AS profit,
                    COUNT(DISTINCT o.order_id) AS orders
                FROM orders o
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN products p ON oi.product_id = p.product_id
                WHERE o.payment_status = 'Paid'
                GROUP BY month
                ORDER BY month ASC
                LIMIT 12
            ");

            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            \Log::error('getMonthlyTrends error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // GET /api/order-status
    public function orderStatusDistribution()
    {
        try {
            $rows = DB::select("
                SELECT order_status AS name, COUNT(*) AS value
                FROM orders
                GROUP BY order_status
            ");
            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            \Log::error('getOrderStatusDistribution error: '.$e);
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }
}
