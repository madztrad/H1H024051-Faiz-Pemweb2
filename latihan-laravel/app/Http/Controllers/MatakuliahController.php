<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MatakuliahController extends Controller
{
    public function index(Request $request)
{
    $kataKunci = $request->query('q', '');

    $daftarMatakuliah = [
        ['kode' => 'IF101', 'nama' => 'Algoritma', 'sks' => 3],
        ['kode' => 'IF102', 'nama' => 'Basis Data', 'sks' => 4],
        ['kode' => 'IF103', 'nama' => 'Jaringan Komputer', 'sks' => 2],
        ['kode' => 'IF104', 'nama' => 'Pemrograman Web II', 'sks' => 3],
        ['kode' => 'IF105', 'nama' => 'Kecerdasan Buatan', 'sks' => 3],
    ];

    if ($kataKunci !== '') {
        $daftarMatakuliah = array_filter($daftarMatakuliah, function ($mk) use ($kataKunci) {
            return str_contains(strtolower($mk['nama']), strtolower($kataKunci));
        });
    }

    return view('matakuliah.index', [
        'daftarMatakuliah' => $daftarMatakuliah,
        'kataKunci' => $kataKunci,
    ]);
}
}
