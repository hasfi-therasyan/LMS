# Menonaktifkan Co-authored-by Cursor di Repo Ini

Agar **Cursor** tidak lagi menambahkan `Co-authored-by: Cursor <cursoragent@cursor.com>` ke commit (dan cursoragent tidak muncul di GitHub):

## 1. Di Cursor IDE (wajib)

1. Buka **Settings**: `Ctrl + ,` (Windows/Linux) atau `Cmd + ,` (Mac).
2. Di kolom pencarian ketik: **co-author** atau **Commit Attribution**.
3. **Matikan** opsi yang berkaitan dengan “Add Cursor as co-author” / “Commit attribution” / “Include Cursor in commits”.
4. **Tutup dan buka lagi Cursor** (restart) agar pengaturan benar-benar dipakai.

Jika tidak ketemu, coba: **Cursor Settings** (ikon roda gigi) → **Features** / **Git** → cari opsi commit atau attribution.

## 2. Cek sebelum commit

- Sebelum **Commit**, buka isi commit message.
- Jika masih ada baris `Co-authored-by: Cursor ...`, **hapus manual** atau batalkan commit, perbaiki pengaturan Cursor, lalu commit lagi.

## 3. Di repo ini (sudah diatur)

- **SECURITY.md** – Aturan: tidak boleh ada Co-authored-by Cursor/cursoragent.
- **GitHub Action** – CI akan gagal jika ada commit message berisi `Co-authored-by: Cursor` atau `cursoragent@cursor.com`, sehingga push/merge bisa dicegah.

## 4. Menghapus cursoragent dari GitHub

- Riwayat commit di repo ini sudah dibersihkan (filter-branch) dari Co-authored-by Cursor.
- Jika cursoragent **masih tampil** di daftar contributor:
  - Tunggu beberapa jam (cache GitHub).
  - Pastikan tidak ada **Cursor GitHub App** yang dipasang untuk repo ini:  
    **Repo → Settings → Integrations → GitHub Apps** → uninstall “Cursor” jika ada.

Setelah itu, Co-authored-by Cursor tidak akan ditambahkan lagi dan cursoragent tidak akan muncul dari commit di repo ini.
