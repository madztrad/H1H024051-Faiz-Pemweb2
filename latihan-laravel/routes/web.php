<?php

use Illuminate\Support\Facades\Route;
Use App\Http\Controllers\MahasiswaController;
Route::get('/', [MahasiswaController::class, 'index']);
