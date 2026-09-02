<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Data Mahasiswa</title>
    <!-- Tambahan styling sederhana agar tampilan lebih rapi -->
    <style>
        body { font-family: sans-serif; margin: 40px; }
        .card { border: 1px solid #ccc; padding: 20px; border-radius: 8px; width: 300px; }
    </style>
</head>
<body>
    <h2>Data dari API Go Fiber</h2>
    
    <div class="card">
        <p><strong>Nama:</strong> {{ $mahasiswa['nama'] }}</p>
        <p><strong>NIM:</strong> {{ $mahasiswa['nim'] }}</p>
        <p><strong>Prodi:</strong> {{ $mahasiswa['program studi'] }}</p>
    </div>
</body>
</html>
