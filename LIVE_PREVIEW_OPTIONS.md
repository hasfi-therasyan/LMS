# Live Preview Options untuk LMS

## ✅ Yang Sudah Ada (Built-in Next.js)

**Next.js sudah punya built-in dev server yang sangat baik!**

### Fitur yang Sudah Ada:
- ✅ **Hot Reload** - Auto refresh saat save file
- ✅ **Fast Refresh** - React components update tanpa kehilangan state
- ✅ **Error Overlay** - Error muncul langsung di browser
- ✅ **Source Maps** - Debug langsung di browser
- ✅ **Network Tab** - Monitor API calls

**Tidak perlu extension tambahan!** Next.js dev server sudah lebih baik dari Live Server extension.

## 🔌 VS Code Extensions (Optional)

Jika tetap ingin extension, berikut beberapa opsi:

### 1. **Live Server** (Ritwick Dey)
- **Bukan dari Microsoft**, tapi populer
- Extension ID: `ritwickdey.LiveServer`
- **Note:** Tidak diperlukan untuk Next.js (sudah punya built-in)

### 2. **Browser Preview** (auchenberg)
- Preview langsung di VS Code
- Extension ID: `auchenberg.vscode-browser-preview`
- Bisa preview di panel VS Code

### 3. **Live Preview** (Microsoft) ⭐
- **Extension resmi dari Microsoft!**
- Extension ID: `ms-vscode.live-server`
- Built-in di VS Code (tidak perlu install)
- **Cara pakai:**
  1. Right-click pada file HTML
  2. Pilih "Show Preview" atau "Show Preview in Side"
  3. Atau tekan `Ctrl+Shift+V` (Windows) / `Cmd+Shift+V` (Mac)

### 4. **Preview on Web Server** (yuichinukiyama)
- Extension ID: `yuichinukiyama.vscode-preview-server`
- Preview dengan web server lokal

## 🎯 Recommended: Gunakan Next.js Built-in

**Untuk Next.js project, gunakan built-in dev server:**

```bash
cd frontend
npm run dev
```

Kemudian buka: **http://localhost:3000**

### Keuntungan:
- ✅ Hot reload otomatis
- ✅ Fast refresh untuk React
- ✅ Error overlay
- ✅ Tidak perlu extension
- ✅ Lebih cepat dan powerful

## 🌐 Browser DevTools

### Microsoft Edge DevTools
1. Buka http://localhost:3000 di Edge
2. Tekan **F12** untuk DevTools
3. Features:
   - **Device Emulation** (Ctrl+Shift+M)
   - **Network Monitor**
   - **Console**
   - **Elements Inspector**

### Chrome DevTools (Sama seperti Edge)
- Device toolbar untuk mobile preview
- Responsive design mode

## 📱 Mobile Preview

### Option 1: Browser DevTools
1. Buka http://localhost:3000
2. Tekan **F12** → **Toggle Device Toolbar** (Ctrl+Shift+M)
3. Pilih device (iPhone, iPad, etc.)

### Option 2: Network Access
1. Cari IP address PC Anda: `ipconfig` (Windows)
2. Akses dari mobile: `http://YOUR_IP:3000`
3. Pastikan PC dan mobile di network yang sama

## 🚀 Quick Start

### Untuk Development:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Buka browser: **http://localhost:3000**

### Hot Reload Otomatis:
- ✅ Save file → Auto refresh
- ✅ Tidak perlu manual refresh
- ✅ State tetap terjaga (Fast Refresh)

## 💡 Tips

1. **Gunakan Browser DevTools** untuk debugging
2. **Device Emulation** untuk mobile preview
3. **Network Tab** untuk monitor API calls
4. **Console** untuk debug JavaScript

## ❌ Tidak Perlu Extension

Untuk Next.js project, **tidak perlu** extension seperti:
- Live Server (untuk static HTML)
- Browser Preview (Next.js sudah built-in)
- Live Preview (untuk HTML files)

**Next.js dev server sudah lebih baik!**
