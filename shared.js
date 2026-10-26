// Dipakai oleh file game di folder games/. Isinya sama dengan modul Auth dan Score di index.html.
// Jika kamu mengubah salah satunya (misal pindah ke database), ubah keduanya.
// Autentikasi. Saat ini mengecek hash kode di data (MathPlayData).
// Untuk pindah ke Firebase/Supabase: ganti isi verifyCode() saja,
// kembalikan { ok: true, sekolah: "Nama Sekolah" } atau { ok: false }.
const Auth = {
  _m: null,
  async hash(teks) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(teks));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  },
  async verifyCode(kode) {
    const h = await this.hash(kode.trim().toUpperCase());
    const s = MathPlayData.sekolah.find(x => x.hash === h);
    return s ? { ok: true, sekolah: s.nama } : { ok: false };
  },
  // Sesi berlaku selama tab terbuka. Jika penyimpanan browser diblokir, dipakai memori sementara.
  setSession(data) { this._m = data; try { sessionStorage.setItem("mp_sesi", JSON.stringify(data)); } catch (e) {} },
  getSession() {
    try { return JSON.parse(sessionStorage.getItem("mp_sesi")) || this._m; } catch (e) { return this._m; }
  },
  logout() { this._m = null; try { sessionStorage.removeItem("mp_sesi"); } catch (e) {} }
};

// Skor. Saat ini disimpan di browser perangkat ini (localStorage).
// Untuk pindah ke database: ganti isi saveScore() dan list() agar memanggil server.
// Semua game cukup memanggil Score.saveScore(...), tidak perlu diubah.
const Score = {
  KEY: "mp_skor", _m: [],
  // Contoh: Score.saveScore({ kelas: 1, bab: 1, skor: 8, maks: 10, durasiDetik: 95, rataRataDetik: 5.9 })
  // Kolom tambahan (seperti durasiDetik) ikut tersimpan.
  async saveScore({ kelas, bab, skor, maks, ...ekstra }) {
    const sesi = Auth.getSession() || {};
    const catatan = { sekolah: sesi.sekolah || "", nama: sesi.nama || "", kelas, bab, skor, maks, ...ekstra, waktu: new Date().toISOString() };
    const semua = await this.list();
    semua.push(catatan);
    this._m = semua;
    try { localStorage.setItem(this.KEY, JSON.stringify(semua)); } catch (e) {}
    return catatan;
  },
  async list() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch (e) { return this._m.slice(); }
  }
};
