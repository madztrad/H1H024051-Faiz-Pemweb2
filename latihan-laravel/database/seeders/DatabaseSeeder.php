<?php

namespace Database\Seeders;
use App\Models\Matakuliah;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Mahasiswa;
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
{
    $this->call(ProgramStudiSeeder::class);
    $this->call(MatakuliahSeeder::class);

    $daftarMahasiswa = Mahasiswa::factory()->count(30)->create();

    $daftarMatakuliah = Matakuliah::all();

    foreach ($daftarMahasiswa as $mahasiswa) {
        $mataKuliahDiambil = $daftarMatakuliah->random(rand(2, 4));

        foreach ($mataKuliahDiambil as $mk) {
            $mahasiswa->matakuliah()->attach($mk->id, [
                'nilai' => fake()->randomFloat(2, 50, 100),
            ]);
        }
    }
}
    
}
