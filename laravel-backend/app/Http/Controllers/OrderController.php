<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    // 🧾 GET /api/orders
    // Optional: ?id= to fetch a single order
    public function index(Request $request)
    {
        try {
            $id = $request->query('id');
            if ($id) {
                $order = Order::with(['items.product'])->where('order_id', $id)->first();
                if (!$order) return response()->json(['success' => false, 'error' => 'Order not found'], 404);
                return response()->json(['success' => true, 'data' => $order]);
            } else {
                $orders = Order::orderBy('created_at', 'desc')->get();
                return response()->json(['success' => true, 'data' => $orders]);
            }
        } catch (\Exception $e) {
            \Log::error('getOrders error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // 🧾 POST /api/orders
    // Create new order + email notification to owner + customer
    public function store(Request $request)
    {
        $payload = $request->all();

        if (!isset($payload['items']) || !is_array($payload['items']) || count($payload['items']) === 0) {
            return response()->json(['success' => false, 'error' => 'items array is required'], 400);
        }

        DB::beginTransaction();
        try {
            // ✅ Calculate total
            $computedTotal = 0;
            foreach ($payload['items'] as $it) {
                $computedTotal += (float)$it['quantity'] * (float)$it['price_per_item'];
            }
            $total_amount = isset($payload['total_amount']) ? (float)$payload['total_amount'] : $computedTotal;

            // ✅ Create the order
            $order = Order::create([
                'customer_name'   => $payload['customer_name'] ?? null,
                'contact_number'  => $payload['contact_number'] ?? null,
                'whatsapp_number' => $payload['whatsapp_number'] ?? null,
                'email'           => $payload['email'] ?? null,
                'shipping_address'=> $payload['shipping_address'] ?? null,
                'postal_code'     => $payload['postal_code'] ?? null,
                'total_amount'    => $total_amount,
                'order_status'    => $payload['order_status'] ?? 'Pending',
                'payment_status'  => $payload['payment_status'] ?? 'Unpaid',
            ]);

            // ✅ Add order items and update stock
            foreach ($payload['items'] as $it) {
                if (!isset($it['product_id'])) throw new \Exception('product_id is required for each item');

                $prod = Product::where('product_id', $it['product_id'])->lockForUpdate()->first();
                if (!$prod) throw new \Exception("Product {$it['product_id']} not found");
                if ($prod->stock_quantity < $it['quantity']) throw new \Exception("Insufficient stock for product {$it['product_id']}");

                OrderItem::create([
                    'order_id'       => $order->order_id,
                    'product_id'     => $it['product_id'],
                    'quantity'       => (int)$it['quantity'],
                    'price_per_item' => (float)$it['price_per_item'],
                ]);

                $prod->decrement('stock_quantity', $it['quantity']);
            }

            DB::commit();

            // ✅ Prepare order summary
            $orderData = Order::with(['items.product'])->find($order->order_id);
            $summaryText = $this->buildOrderSummaryText($orderData);

            // ✅ Send emails (owner + customer)
            try {
                // Owner notification
                $ownerEmail = env('OWNER_EMAIL');
                if ($ownerEmail) {
                    Mail::raw($summaryText, function ($m) use ($order, $ownerEmail) {
                        $m->from(config('mail.from.address'), config('mail.from.name'));
                        $m->to($ownerEmail);
                        $m->subject("🛒 New Order Received #{$order->order_id}");
                    });
                }

                // Customer confirmation
                if ($order->email) {
                    Mail::raw($summaryText, function ($m) use ($order) {
                        $m->from(config('mail.from.address'), config('mail.from.name'));
                        $m->to($order->email);
                        $m->subject("✅ Order Confirmation #{$order->order_id}");
                    });
                }
            } catch (\Exception $mailErr) {
                \Log::error('Email sending failed: ' . $mailErr->getMessage());
                // still succeed even if email fails
            }

            return response()->json([
                'success'   => true,
                'message'   => 'Order created successfully',
                'order_id'  => $order->order_id
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('addOrder error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    // ✏️ PUT /api/orders/{id}
    public function update(Request $request, $id)
    {
        try {
            $order = Order::find($id);
            if (!$order) return response()->json(['success' => false, 'error' => 'Order not found'], 404);

            $allowed = [
                'customer_name', 'contact_number', 'whatsapp_number', 'email',
                'shipping_address', 'postal_code', 'total_amount', 'order_status', 'payment_status'
            ];

            $update = [];
            foreach ($allowed as $f) {
                if ($request->has($f)) $update[$f] = $request->input($f);
            }

            if (empty($update)) return response()->json(['success' => false, 'error' => 'No fields to update'], 400);

            $order->update($update);
            return response()->json(['success' => true, 'message' => 'Order updated']);
        } catch (\Exception $e) {
            \Log::error('updateOrder error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // 🗑️ DELETE /api/orders/{id}
    public function destroy($id)
    {
        try {
            $order = Order::find($id);
            if (!$order) return response()->json(['success' => false, 'error' => 'Order not found'], 404);

            $order->delete();
            return response()->json(['success' => true, 'message' => 'Order deleted']);
        } catch (\Exception $e) {
            \Log::error('deleteOrder error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // 👤 GET /api/orders/{id}/customer
    public function getCustomerFromOrder($id)
    {
        try {
            $order = Order::select(['customer_name','contact_number','whatsapp_number','email','shipping_address','postal_code'])
                ->where('order_id', $id)->first();
            if (!$order) return response()->json(['success' => false, 'error' => 'Order not found'], 404);
            return response()->json(['success' => true, 'data' => $order]);
        } catch (\Exception $e) {
            \Log::error('getCustomerFromOrder error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // 💰 GET /api/orders/payment/{status}
    public function getByPaymentStatus($status)
    {
        try {
            $rows = Order::where('payment_status', $status)->orderBy('created_at','desc')->get();
            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            \Log::error('getOrdersByPaymentStatus error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // ⏰ GET /api/orders?start=&end=
    public function getByTime(Request $request)
    {
        $start = $request->query('start');
        $end = $request->query('end');
        if (!$start || !$end) return response()->json(['success' => false, 'error' => 'start and end query params required'], 400);

        try {
            $rows = Order::whereBetween('created_at', [$start, $end])->orderBy('created_at','desc')->get();
            return response()->json(['success' => true, 'data' => $rows]);
        } catch (\Exception $e) {
            \Log::error('getOrdersByTime error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // 📦 GET /api/orders/{id}
    public function show($id)
    {
        try {
            $order = Order::with(['items.product'])->where('order_id', $id)->first();
            if (!$order) return response()->json(['success' => false, 'error' => 'Order not found'], 404);

            $total = 0;
            foreach ($order->items as $item) {
                $total += (float)$item->quantity * (float)$item->price_per_item;
            }
            $order->computed_total = round($total, 2);

            return response()->json(['success' => true, 'data' => $order]);
        } catch (\Exception $e) {
            \Log::error('getOrderById error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Database error'], 500);
        }
    }

    // 📜 Helper: plain text order summary
    protected function buildOrderSummaryText($order)
    {
        $lines = [];
        $lines[] = "🛒 Order #{$order->order_id}";
        $lines[] = "Customer: " . ($order->customer_name ?? 'N/A');
        $lines[] = "Contact: " . ($order->contact_number ?? 'N/A');
        $lines[] = "Email: " . ($order->email ?? 'N/A');
        $lines[] = "Shipping: " . ($order->shipping_address ?? 'N/A');
        $lines[] = "Postal Code: " . ($order->postal_code ?? 'N/A');
        $lines[] = "Total: {$order->total_amount}";
        $lines[] = "Status: {$order->order_status} / {$order->payment_status}";
        $lines[] = "\nItems:";
        foreach ($order->items as $it) {
            $title = optional($it->product)->title ?? "Product #{$it->product_id}";
            $lines[] = "- {$title} x {$it->quantity} @ {$it->price_per_item}";
        }
        $lines[] = "\nThank you for your purchase!";
        return implode("\n", $lines);
    }
}
