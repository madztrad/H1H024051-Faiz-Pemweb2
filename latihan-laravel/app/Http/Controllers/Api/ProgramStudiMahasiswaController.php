<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MahasiswaResource;
use App\Models\ProgramStudi;
use Illuminate\Http\Request;

class ProgramStudiMahasiswaController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, ProgramStudi $programStudi)
    {
        $kueri = $programStudi->mahasiswa()->with('programStudi')->orderBy('nama');

        if ($request->filled('cari')) {
            $kataKunci = $request->query('cari');
            $kueri->where(function ($sub) use ($kataKunci) {
                $sub->where('nama', 'like', '%'.$kataKunci.'%')
                    ->orWhere('nim', 'like', '%'.$kataKunci.'%');
            });
        }

        $perHalaman = min($request->integer('per_halaman', 10), 100);

        return MahasiswaResource::collection($kueri->paginate($perHalaman));
    }
}
