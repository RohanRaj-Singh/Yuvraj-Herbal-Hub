<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\BannerController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AdminAuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('')->group(function () {
    // ----------------- ADMIN AUTH -----------------
    Route::post('/admin/login/request-code', [AdminAuthController::class, 'requestCode']);
    Route::post('/admin/login/verify-code', [AdminAuthController::class, 'verifyCode']);

    // ----------------- BANNERS -----------------
    Route::post('/banners', [BannerController::class, 'store']); // addBanner
    Route::get('/banners', [BannerController::class, 'index']); // getBanners
    Route::delete('/banners/{id}', [BannerController::class, 'destroy']); // deleteBanner


    // ----------------- CATEGORIES -----------------
    Route::post('/categories', [CategoryController::class, 'store']); // addCategory
    Route::get('/categories', [CategoryController::class, 'index']); // getCategories
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']); // deleteCategory


    // ----------------- PRODUCTS -----------------
    Route::post('/products', [ProductController::class, 'store']); // addProduct
    Route::get('/products', [ProductController::class, 'index']); // getProducts
    Route::get('/products/name/{name}', [ProductController::class, 'getByName']); // getProductByName
    Route::get('/products/category/{category}', [ProductController::class, 'getByCategory']); // getProductsByCategory
    Route::put('/products/{id}', [ProductController::class, 'update']); // editProduct
    Route::put('/products/{product_id}/review', [ProductController::class, 'updateReview']); // updateProductReview
    Route::delete('/products/{id}', [ProductController::class, 'destroy']); // deleteProduct
    Route::get('/products/{id}', [ProductController::class, 'show']); // getProductById
    Route::post('/products/{id}/review', [ReviewController::class, 'store']); // addProductReview
    Route::get('/products/{id}/reviews', [ReviewController::class, 'getByProduct']); // getProductReviews


    // ----------------- ORDERS -----------------
Route::get('/orders', [OrderController::class, 'index']); // getOrders
Route::get('/orders/{id}', [OrderController::class, 'show']); // ✅ get single order
Route::post('/orders', [OrderController::class, 'store']); // addOrder
Route::put('/orders/{id}', [OrderController::class, 'update']); // updateOrder
Route::delete('/orders/{id}', [OrderController::class, 'destroy']); // deleteOrder
Route::get('/orders/{id}/customer', [OrderController::class, 'getCustomerFromOrder']);
Route::get('/orders/payment/{status}', [OrderController::class, 'getByPaymentStatus']);


    // ----------------- DASHBOARD -----------------
    Route::get('/dashboard', [DashboardController::class, 'index']); // getDashboard
    Route::get('/monthly-trends', [DashboardController::class, 'monthlyTrends']); // getMonthlyTrends
    Route::get('/order-status', [DashboardController::class, 'orderStatusDistribution']); // getOrderStatusDistribution
});
