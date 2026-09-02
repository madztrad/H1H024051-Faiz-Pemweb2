<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
class MahasiswaController extends Controller
{
    function index()
    {
        $response = Http::get('http://127.0.0.1:3000/api/mahasiswa');
        $mahasiswa = $response->json();

        return view('mahasiswa', compact('mahasiswa'));
    }
}
