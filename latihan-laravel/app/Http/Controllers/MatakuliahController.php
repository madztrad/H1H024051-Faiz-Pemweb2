<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MatakuliahController extends Controller
{
    public function index()
    {
        $daftarMatakuliah = [
            ['kode' => 'TK213', 'nama' => 'Praktikum N1', 'sks' => 2023],
            ['kode' => 'TK214', 'nama' => 'Pemweb', 'sks' => 2023],
            ['kode' => 'TK215', 'nama' => 'IoT', 'sks' => 2024],
        ];

        return view('matakuliah.index', ['daftarMatakuliah' => $daftarMatakuliah]);
    }

    public function show(string $kode)
    {
        return view('matakuliah.show', ['kode' => $kode]);
    }
    public function cari(Request $request)
{
$kataKunci = $request->query('q', '');
return response()->json([
'kata_kunci' => $kataKunci,
'metode' => $request->method(),
'path' => $request->path(),
]);
}
}
