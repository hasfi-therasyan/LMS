# How to Kill All Localhost Ports (Windows)

## Method 1: Kill All Node.js Processes (Easiest)

**PowerShell:**
```powershell
taskkill /F /IM node.exe
```

**Command Prompt:**
```cmd
taskkill /F /IM node.exe
```

Ini akan menutup **semua** proses Node.js, termasuk:
- Frontend server (Next.js)
- Backend server (Express)
- Semua proses Node.js lainnya

## Method 2: Kill Specific Ports

### Kill Port 3000 (Frontend)
```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Kill Port 3001 (Backend)
```powershell
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Kill Multiple Ports at Once
```powershell
3000, 3001, 3002, 3003 | ForEach-Object {
    Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess | 
    ForEach-Object { Stop-Process -Id $_ -Force }
}
```

## Method 3: Kill All Ports in Range (3000-3010)

```powershell
3000..3010 | ForEach-Object {
    Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess | 
    ForEach-Object { Stop-Process -Id $_ -Force }
}
```

## Method 4: Find and Kill All Ports Manually

### Step 1: Find All Listening Ports
```powershell
netstat -ano | findstr LISTENING
```

### Step 2: Find Specific Port (e.g., 3000)
```powershell
netstat -ano | findstr :3000
```

### Step 3: Kill Process by PID
```powershell
taskkill /PID <PID_NUMBER> /F
```

Replace `<PID_NUMBER>` with the actual Process ID from step 2.

## Method 5: One-Liner to Kill All Common Dev Ports

```powershell
3000, 3001, 3002, 3003, 5000, 5001, 8000, 8080, 9000 | ForEach-Object {
    $port = $_
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $connections | Select-Object -ExpandProperty OwningProcess | ForEach-Object {
            Write-Host "Killing process $_ on port $port"
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
    }
}
```

## Method 6: Kill All Processes Using Localhost

```powershell
Get-Process | Where-Object {$_.Path -like "*node*"} | Stop-Process -Force
```

## Quick Reference

### Most Common Ports for This Project:
- **3000** - Frontend (Next.js)
- **3001** - Backend (Express)

### Kill Both at Once:
```powershell
3000, 3001 | ForEach-Object {
    Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess | 
    ForEach-Object { Stop-Process -Id $_ -Force }
}
```

## Verify Ports are Free

After killing processes, verify:
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

Should return nothing (or only TIME_WAIT which will clear automatically).

## Safety Note

⚠️ **Warning:** Method 1 (`taskkill /F /IM node.exe`) will kill **ALL** Node.js processes on your system, not just your development servers. Use with caution if you have other Node.js applications running.

## Recommended Approach

For this LMS project, use this command to kill both frontend and backend:

```powershell
3000, 3001 | ForEach-Object {
    Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess | 
    ForEach-Object { Stop-Process -Id $_ -Force }
}
```

This is safer than killing all Node.js processes.
