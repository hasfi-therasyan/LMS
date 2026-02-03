# 🔧 Fix Path Alias Issue di Vercel

## ❓ **Masalah**

Error: `Module not found: Can't resolve '@/store/authStore'`

Path alias `@/*` tidak ter-resolve saat build di Vercel.

## ✅ **Solusi**

Next.js 14 dengan App Router seharusnya otomatis membaca `paths` dari `tsconfig.json`, tapi kadang perlu konfigurasi tambahan.

### **Opsi 1: Pastikan tsconfig.json Benar** (Sudah dilakukan)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### **Opsi 2: Webpack Alias di next.config.js** (Sudah dilakukan)

```javascript
webpack: (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, './src'),
  };
  return config;
}
```

### **Opsi 3: Alternative - Gunakan Relative Paths** (Jika masih error)

Jika path alias masih tidak bekerja, bisa ubah semua import dari `@/` ke relative paths:

**Sebelum:**
```typescript
import { useAuthStore } from '@/store/authStore';
```

**Sesudah:**
```typescript
import { useAuthStore } from '../store/authStore';
```

Tapi ini akan require banyak perubahan.

---

## 🎯 **Cek Apakah File Ada**

File-file sudah ada:
- ✅ `frontend/src/store/authStore.ts` - exists
- ✅ `frontend/src/lib/api.ts` - exists
- ✅ `frontend/src/components/` - exists

Jadi masalahnya adalah path resolution, bukan missing files.

---

## 🔍 **Debug Steps**

1. **Cek tsconfig.json** - baseUrl dan paths sudah benar
2. **Cek next.config.js** - webpack alias sudah ditambahkan
3. **Cek file structure** - semua file ada di tempat yang benar

---

## 💡 **Kemungkinan Masalah**

1. **Next.js 14 App Router** mungkin memerlukan konfigurasi yang berbeda
2. **Vercel build environment** mungkin berbeda dari local
3. **Webpack alias** mungkin tidak ter-apply dengan benar

---

## 🚀 **Next Steps**

1. Coba deploy lagi dengan fix terbaru
2. Jika masih error, pertimbangkan menggunakan relative paths
3. Atau coba update Next.js ke versi terbaru
