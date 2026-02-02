# Revision Notes - AI Context Change

## Perubahan Utama

**Tanggal**: Sekarang
**Revisi**: AI tidak perlu ekstrak teks dari jobsheet

## Perubahan yang Dilakukan

### 1. AI Context Building
- **Sebelumnya**: AI menerima teks yang diekstrak dari PDF jobsheet/module
- **Sekarang**: AI hanya menerima semua pertanyaan kuis sebagai konteks
- **Alasan**: AI fokus pada kuis yang diberikan, tidak perlu memahami jobsheet

### 2. File yang Diubah

#### `backend/src/config/gemini.ts`
- Fungsi `buildAIContext()` diubah untuk menerima semua pertanyaan kuis
- Menghapus parameter `moduleText`
- System prompt diupdate untuk fokus pada kuis, bukan module content

#### `backend/src/routes/ai.ts`
- Menghapus query untuk mengambil `extracted_text` dari module
- Mengambil semua pertanyaan dari kuis untuk konteks AI
- Update query untuk tidak fetch data module yang tidak diperlukan

#### `backend/src/routes/modules.ts`
- Menghapus ekstraksi teks dari PDF saat upload
- Field `extracted_text` di database tetap ada tapi diisi `null`
- Menghapus import `extractTextFromPDF` (tidak digunakan lagi)

### 3. Database
- Field `extracted_text` di table `modules` tetap ada (untuk kompatibilitas)
- Tidak perlu dihapus, cukup diisi `null` atau dibiarkan kosong

### 4. Alur Baru

**Sebelumnya:**
1. Lecturer upload PDF → Extract text → Simpan ke database
2. Student submit quiz → AI dapat konteks dari extracted text + quiz questions

**Sekarang:**
1. Lecturer upload PDF → Hanya simpan file, tidak extract text
2. Student submit quiz → AI dapat konteks dari semua quiz questions saja

### 5. Keuntungan Perubahan
- ✅ Lebih sederhana - tidak perlu ekstraksi PDF
- ✅ Lebih cepat - tidak ada proses ekstraksi saat upload
- ✅ AI fokus pada kuis yang relevan
- ✅ Mengurangi dependency pada PDF parsing

### 6. Catatan
- PDF upload masih berfungsi untuk disimpan dan dilihat mahasiswa
- AI chatbot tetap berfungsi dengan baik dengan konteks kuis saja
- Tidak ada breaking changes untuk frontend

## Testing Checklist

- [ ] Upload module PDF (tidak ada error)
- [ ] Create quiz dengan beberapa pertanyaan
- [ ] Student submit quiz dengan jawaban salah
- [ ] AI chatbot muncul dan berdiskusi tentang pertanyaan yang salah
- [ ] AI memberikan hints dan penjelasan berdasarkan konteks kuis
- [ ] Conversation history tersimpan dengan benar
