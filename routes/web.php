<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::view('/', 'app');

Route::fallback(function () {
    $path = request()->path();

    if (
        str_starts_with($path, 'api/') ||
        str_starts_with($path, 'build/') ||
        str_starts_with($path, 'storage/') ||
        preg_match('/\.[A-Za-z0-9]+$/', $path)
    ) {
        abort(404);
    }

    return view('app');
});
