# Fix: Port 3001 Already in Use

## Problem
Error: `EADDRINUSE: address already in use :::3001`

Ini berarti ada proses lain yang sudah menggunakan port 3001.

## Solution Options

### Option 1: Kill Process Using Port 3001 (Recommended)

**Step 1: Find Process Using Port 3001**

Buka PowerShell dan jalankan:
```powershell
netstat -ano | findstr :3001
```

Ini akan menampilkan output seperti:
```
TCP    0.0.0.0:3001           0.0.0.0:0              LISTENING       12345
```

Angka terakhir (12345) adalah PID (Process ID).

**Step 2: Kill the Process**

Ganti `12345` dengan PID yang Anda dapatkan:
```powershell
taskkill /PID 12345 /F
```

**Step 3: Try Starting Backend Again**

```powershell
npm run dev
```

### Option 2: Change Backend Port

Jika Anda tidak ingin menutup proses yang ada, ubah port backend:

**Step 1: Update `backend/.env`**

Tambahkan atau ubah:
```
PORT=3002
```

**Step 2: Update `frontend/.env.local`**

Tambahkan atau ubah:
```
NEXT_PUBLIC_API_URL=http://localhost:3002
```

**Step 3: Restart Both Servers**

Backend akan berjalan di port 3002, frontend akan connect ke port 3002.

### Option 3: Quick PowerShell One-Liner

Untuk Windows PowerShell, gunakan command ini untuk langsung kill process di port 3001:

```powershell
Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

Kemudian jalankan:
```powershell
npm run dev
```

## Most Common Cause

Biasanya ini terjadi karena:
1. Backend server masih berjalan di terminal lain
2. Proses backend sebelumnya tidak ditutup dengan benar
3. Ada aplikasi lain yang menggunakan port 3001

## Prevention

Selalu pastikan untuk:
- Menutup backend server dengan `Ctrl+C` sebelum menutup terminal
- Menutup semua terminal yang menjalankan backend sebelum menjalankan yang baru
