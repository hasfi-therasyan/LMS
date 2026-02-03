# Cara Menghapus Semua Deployments dari GitHub

## 📋 Metode 1: Via GitHub Web Interface (Paling Mudah)

### Step 1: Hapus Deployment Environments

1. **Buka GitHub Repository**
   - https://github.com/hasfi-therasyan/LMS
   - Login ke GitHub

2. **Settings → Environments**
   - Klik **"Settings"** tab di repository
   - Scroll ke **"Environments"** di sidebar kiri
   - Klik **"Environments"**

3. **Hapus Setiap Environment**
   - Klik environment yang ingin dihapus (misalnya: `production`, `preview`, `vercel`, `railway`)
   - Scroll ke bawah
   - Klik **"Delete environment"**
   - Konfirmasi dengan mengetik nama environment
   - Klik **"Delete"**

4. **Ulangi untuk semua environments**

---

### Step 2: Hapus Deployment History

1. **Buka GitHub Repository**
   - https://github.com/hasfi-therasyan/LMS

2. **Deployments Tab**
   - Klik tab **"Deployments"** (jika ada)
   - Atau buka: `https://github.com/hasfi-therasyan/LMS/deployments`

3. **Hapus Deployment**
   - Klik deployment yang ingin dihapus
   - Klik **"..."** (three dots) → **"Delete"**
   - Konfirmasi

**Note:** Beberapa deployments mungkin tidak bisa dihapus jika masih active.

---

### Step 3: Disconnect Integrations

#### A. Disconnect Vercel

1. **Vercel Dashboard**
   - https://vercel.com
   - Login
   - Pilih project

2. **Settings → Git**
   - Klik **"Settings"** tab
   - Klik **"Git"** di sidebar
   - Klik **"Disconnect"** pada connected repository

3. **Atau dari GitHub:**
   - GitHub → Settings → Applications → Authorized OAuth Apps
   - Cari **"Vercel"**
   - Klik **"Revoke"**

#### B. Disconnect Railway

1. **Railway Dashboard**
   - https://railway.app
   - Login
   - Pilih project

2. **Settings → Git**
   - Klik **"Settings"** tab
   - Klik **"Git"** di sidebar
   - Klik **"Disconnect"** pada connected repository

3. **Atau dari GitHub:**
   - GitHub → Settings → Applications → Authorized OAuth Apps
   - Cari **"Railway"**
   - Klik **"Revoke"**

#### C. Disconnect Netlify (jika ada)

1. **Netlify Dashboard**
   - https://app.netlify.com
   - Login
   - Pilih site

2. **Site settings → Build & deploy → Continuous Deployment**
   - Klik **"Stop build"** atau **"Disconnect"**

---

### Step 4: Hapus GitHub Actions Workflows (jika ada)

1. **Buka GitHub Repository**
   - https://github.com/hasfi-therasyan/LMS

2. **Actions Tab**
   - Klik tab **"Actions"**
   - Jika ada workflows, klik **"..."** → **"Delete workflow"**

3. **Atau Hapus File Workflow:**
   - Buka `.github/workflows/` directory
   - Hapus semua file `.yml` atau `.yaml`
   - Commit dan push

---

## 📋 Metode 2: Via GitHub CLI (Command Line)

### Install GitHub CLI (jika belum):

```bash
# Windows (via winget)
winget install GitHub.cli

# Atau download dari: https://cli.github.com
```

### Login:

```bash
gh auth login
```

### Hapus Deployments:

```bash
# List semua deployments
gh api repos/hasfi-therasyan/LMS/deployments

# Hapus deployment (ganti DEPLOYMENT_ID dengan ID dari list)
gh api -X DELETE repos/hasfi-therasyan/LMS/deployments/DEPLOYMENT_ID
```

### Hapus Environments:

```bash
# List semua environments
gh api repos/hasfi-therasyan/LMS/environments

# Hapus environment (ganti ENVIRONMENT_NAME dengan nama environment)
gh api -X DELETE repos/hasfi-therasyan/LMS/environments/ENVIRONMENT_NAME
```

---

## 📋 Metode 3: Hapus Semua Sekaligus (Script)

### PowerShell Script (Windows):

```powershell
# Install GitHub CLI dulu jika belum
# winget install GitHub.cli

# Login
gh auth login

# Hapus semua deployments
$deployments = gh api repos/hasfi-therasyan/LMS/deployments | ConvertFrom-Json
foreach ($deployment in $deployments) {
    Write-Host "Deleting deployment: $($deployment.id)"
    gh api -X DELETE "repos/hasfi-therasyan/LMS/deployments/$($deployment.id)"
}

# Hapus semua environments
$environments = gh api repos/hasfi-therasyan/LMS/environments | ConvertFrom-Json
foreach ($env in $environments.environments) {
    Write-Host "Deleting environment: $($env.name)"
    gh api -X DELETE "repos/hasfi-therasyan/LMS/environments/$($env.name)"
}
```

---

## 🎯 Quick Steps (Recommended)

### Cara Paling Cepat:

1. **GitHub Repository** → **Settings** → **Environments**
   - Hapus semua environments

2. **Disconnect Integrations:**
   - Vercel Dashboard → Settings → Git → Disconnect
   - Railway Dashboard → Settings → Git → Disconnect

3. **GitHub** → **Settings** → **Applications** → **Authorized OAuth Apps**
   - Revoke access untuk Vercel, Railway, Netlify (jika ada)

---

## ⚠️ Important Notes

1. **Deployments tidak akan otomatis terhapus** setelah disconnect integrations
   - Anda perlu hapus manual dari GitHub

2. **Beberapa deployments mungkin tidak bisa dihapus** jika masih active
   - Pastikan service sudah di-stop di Vercel/Railway

3. **Hapus environments akan menghapus semua deployment history** untuk environment tersebut

4. **Revoke OAuth access** akan mencegah future deployments

---

## ✅ Checklist

- [ ] Hapus semua environments di GitHub Settings
- [ ] Disconnect Vercel integration
- [ ] Disconnect Railway integration
- [ ] Disconnect Netlify integration (jika ada)
- [ ] Revoke OAuth access untuk semua services
- [ ] Hapus GitHub Actions workflows (jika ada)
- [ ] Hapus deployment history (jika memungkinkan)

---

## 🔍 Verify

Setelah selesai, cek:
- GitHub → Repository → **Deployments** tab → Seharusnya kosong
- GitHub → Settings → **Environments** → Seharusnya kosong
- GitHub → Settings → **Applications** → Tidak ada Vercel/Railway

---

## 📞 Need Help?

Jika masih ada deployments yang tidak bisa dihapus:
1. Pastikan service sudah di-stop di Vercel/Railway
2. Tunggu beberapa menit
3. Coba hapus lagi
4. Atau gunakan GitHub CLI untuk force delete
