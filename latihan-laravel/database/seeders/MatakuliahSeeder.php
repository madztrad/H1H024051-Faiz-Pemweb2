<?php

namespace Database\Seeders;

use App\Models\Matakuliah;
use Illuminate\Database\Seeder;

class MatakuliahSeeder extends Seeder
{
    public function run(): void
    {
        $daftar = [
            ['kode' => 'IF101', 'nama' => 'Algoritma dan Pemrograman', 'sks' => 3, 'semester' => 1],
            ['kode' => 'IF201', 'nama' => 'Struktur Data', 'sks' => 3, 'semester' => 2],
            ['kode' => 'IF301', 'nama' => 'Basis Data', 'sks' => 3, 'semester' => 3],
            ['kode' => 'IF401', 'nama' => 'Pemrograman Web II', 'sks' => 3, 'semester' => 4],
            ['kode' => 'IF501', 'nama' => 'Kecerdasan Buatan', 'sks' => 3, 'semester' => 5],
        ];

        foreach ($daftar as $item) {
            Matakuliah::create($item);
        }
    }
}