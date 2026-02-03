# 🗑️ Cara Menghapus Deployment Vercel via CLI

## 📋 Step-by-Step Guide

### **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

Atau jika menggunakan yarn:
```bash
yarn global add vercel
```

### **Step 2: Login ke Vercel**

```bash
vercel login
```

Ini akan membuka browser untuk login. Setelah login, CLI akan otomatis ter-authenticate.

### **Step 3: Navigate ke Project Directory**

```bash
cd C:\HASFI\WORK\LMS
```

### **Step 4: Link Project (Jika Belum)**

```bash
vercel link
```

Pilih project yang ingin di-link. Jika sudah pernah link sebelumnya, skip step ini.

### **Step 5: List Semua Deployments**

```bash
vercel ls
```

Ini akan menampilkan semua deployments dengan format:
```
[deployment-url] [status] [created] [duration]
```

Contoh output:
```
https://lms-blush-nine.vercel.app  Ready    2h ago    45s
https://lms-abc123.vercel.app      Ready    1d ago    30s
```

### **Step 6: Hapus Deployment**

**Opsi A: Hapus berdasarkan URL**
```bash
vercel rm https://lms-blush-nine.vercel.app --yes
```

**Opsi B: Hapus berdasarkan ID (jika tahu ID-nya)**
```bash
vercel rm [deployment-id] --yes
```

**Opsi C: Hapus semua deployments (HATI-HATI!)**
```bash
vercel ls | grep -v "Production" | awk '{print $1}' | xargs -I {} vercel rm {} --yes
```

### **Step 7: Verifikasi**

```bash
vercel ls
```

Pastikan deployment yang dihapus sudah tidak ada di list.

---

## 🔍 Troubleshooting

### **Error: "Not authenticated"**
```bash
vercel login
```

### **Error: "Project not found"**
```bash
vercel link
```

### **Error: "Permission denied"**
- Pastikan Anda adalah owner atau admin project
- Cek di Vercel Dashboard → Project → Settings → Team

---

## 📝 Contoh Lengkap

```bash
# 1. Install CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Navigate ke project
cd C:\HASFI\WORK\LMS

# 4. Link project (jika belum)
vercel link

# 5. List deployments
vercel ls

# Output:
# https://lms-blush-nine.vercel.app  Ready    2h ago    45s
# https://lms-abc123.vercel.app      Ready    1d ago    30s

# 6. Hapus deployment tertentu
vercel rm https://lms-blush-nine.vercel.app --yes

# 7. Verifikasi
vercel ls
```

---

## ⚠️ Peringatan

- `--yes` flag akan langsung menghapus tanpa konfirmasi
- Tanpa `--yes`, CLI akan meminta konfirmasi
- Hapus deployment adalah **permanent** dan tidak bisa di-undo
- Production deployment mungkin tidak bisa dihapus jika ada protection

---

## ✅ Tips

1. **Hapus satu per satu** untuk lebih aman
2. **Backup dulu** jika deployment penting
3. **Cek production deployment** sebelum hapus (biasanya ada badge "Production")
4. **Gunakan `vercel ls`** untuk melihat semua deployments sebelum hapus

---

## 🆘 Jika Masih Tidak Bisa

Jika masih tidak bisa menghapus via CLI, coba:

1. **Cek permissions**: Pastikan Anda adalah owner/admin
2. **Cek Vercel Dashboard**: Mungkin ada opsi di Settings → Deployments
3. **Contact Vercel Support**: Jika benar-benar stuck
