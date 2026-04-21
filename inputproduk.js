const hamburger = document.getElementById('hamburger');
const sidebar   = document.getElementById('sidebar');
const overlay   = document.getElementById('overlay');

const toggleSidebar = () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
};

hamburger.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', toggleSidebar);

const seedDefaultData = () => {
    if (localStorage.getItem('produk') !== null) return;
    const defaults = [
        { kode: "MF-001", nama: "Anggrek Bulan", kategori: "Tanaman Indoor",  harga: "150000", stok: "8",  tanggal: "2026-01-10", gambar: "anggrek bulan.jpg" },
        { kode: "MF-002", nama: "Kaktus",         kategori: "Tanaman Outdoor", harga: "50000",  stok: "3",  tanggal: "2026-02-05", gambar: "kaktus.jpg" },
        { kode: "MF-003", nama: "Marigold",        kategori: "Tanaman Outdoor", harga: "50000",  stok: "3",  tanggal: "2026-02-10", gambar: "marigold.jpg" },
        { kode: "MF-004", nama: "Aglonema",        kategori: "Tanaman Indoor",  harga: "80000",  stok: "20", tanggal: "2026-03-01", gambar: "aglonema.jpg" },
        { kode: "MF-005", nama: "Lidah Mertua",    kategori: "Tanaman Indoor",  harga: "90000",  stok: "6",  tanggal: "2026-03-15", gambar: "lidah mertua.jpg" }
    ];
    localStorage.setItem('produk', JSON.stringify(defaults));
};

seedDefaultData();

const updateDashboard = () => {
    const data = JSON.parse(localStorage.getItem('produk')) || [];
    document.getElementById('dash-total').textContent = data.length;

    const nilai = data.reduce((acc, p) =>
        acc + ((parseInt(p.harga) || 0) * (parseInt(p.stok) || 0)), 0);
    document.getElementById('dash-nilai').textContent = 'Rp ' + nilai.toLocaleString('id-ID');

    const menipis = data.filter(p => parseInt(p.stok) < 5).length;
    document.getElementById('dash-menipis').textContent = menipis;
};

updateDashboard();

const kodeRegex = /^[A-Za-z0-9\-]+$/;

const validateField = (inputEl, errorId, condition, message) => {
    const errEl = document.getElementById(errorId);
    if (!condition) {
        inputEl.classList.add('error');
        inputEl.classList.remove('success');
        if (message) errEl.textContent = message;
        errEl.classList.add('show');
        return false;
    } else {
        inputEl.classList.remove('error');
        inputEl.classList.add('success');
        errEl.classList.remove('show');
        return true;
    }
};

const resetForm = () => {
    document.getElementById('formProduk').reset();
    document.querySelectorAll('.form-produk input, .form-produk select')
        .forEach(el => el.classList.remove('error', 'success'));
    document.querySelectorAll('.error-msg')
        .forEach(el => el.classList.remove('show'));
};

document.getElementById('btnReset').addEventListener('click', resetForm);

document.getElementById('formProduk').addEventListener('submit', function(e) {
    e.preventDefault();

    const kode     = document.getElementById('kodeBarang');
    const nama     = document.getElementById('namaProduk');
    const kategori = document.getElementById('kategoriProduk');
    const harga    = document.getElementById('hargaProduk');
    const stok     = document.getElementById('stokProduk');
    const tanggal  = document.getElementById('tanggalMasuk');
    const gambar   = document.getElementById('gambarProduk');

    const v1 = validateField(kode, 'err-kode',
        kode.value.trim() !== '' && kodeRegex.test(kode.value.trim()),
        "Kode hanya boleh huruf, angka, dan tanda '-'");

    const v2 = validateField(nama, 'err-nama',
        nama.value.trim().length >= 3,
        "Nama produk minimal 3 karakter");

    const v3 = validateField(kategori, 'err-kategori',
        kategori.value !== '',
        "Kategori wajib dipilih");

    const v4 = validateField(harga, 'err-harga',
        harga.value !== '' && parseInt(harga.value) > 0,
        "Harga wajib diisi dan harus lebih dari 0");

    const v5 = validateField(stok, 'err-stok',
        stok.value !== '' && parseInt(stok.value) >= 0,
        "Stok wajib diisi dan tidak boleh negatif");

    const v6 = validateField(tanggal, 'err-tanggal',
        tanggal.value !== '',
        "Tanggal masuk wajib diisi");

    const v7 = validateField(gambar, 'err-gambar',
        gambar.files.length > 0,
        "Gambar produk wajib diupload");

    if (![v1, v2, v3, v4, v5, v6, v7].every(Boolean)) return;

    let data = JSON.parse(localStorage.getItem('produk')) || [];

    if (data.some(p => p.kode.toLowerCase() === kode.value.trim().toLowerCase())) {
        validateField(kode, 'err-kode', false, "Kode sudah dipakai, gunakan kode lain");
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        data.push({
            kode:     kode.value.trim(),
            nama:     nama.value.trim(),
            kategori: kategori.value,
            harga:    harga.value,
            stok:     stok.value,
            tanggal:  tanggal.value,
            gambar:   reader.result  
        });

        localStorage.setItem('produk', JSON.stringify(data));
        alert("Produk berhasil disimpan!");
        window.location.href = "manajemenproduk.html";
    };

    reader.readAsDataURL(gambar.files[0]);
});

document.getElementById('kodeBarang').addEventListener('input', function() {
    validateField(this, 'err-kode',
        this.value.trim() !== '' && kodeRegex.test(this.value.trim()),
        "Kode hanya boleh huruf, angka, dan tanda '-'");
});

document.getElementById('namaProduk').addEventListener('input', function() {
    validateField(this, 'err-nama',
        this.value.trim().length >= 3,
        "Nama produk minimal 3 karakter");
});

document.getElementById('kategoriProduk').addEventListener('change', function() {
    validateField(this, 'err-kategori',
        this.value !== '',
        "Kategori wajib dipilih");
});

document.getElementById('hargaProduk').addEventListener('input', function() {
    validateField(this, 'err-harga',
        this.value !== '' && parseInt(this.value) > 0,
        "Harga wajib diisi dan harus lebih dari 0");
});

document.getElementById('stokProduk').addEventListener('input', function() {
    validateField(this, 'err-stok',
        this.value !== '' && parseInt(this.value) >= 0,
        "Stok wajib diisi dan tidak boleh negatif");
});

document.getElementById('tanggalMasuk').addEventListener('change', function() {
    validateField(this, 'err-tanggal',
        this.value !== '',
        "Tanggal masuk wajib diisi");
});

document.getElementById('gambarProduk').addEventListener('change', function() {
    validateField(this, 'err-gambar',
        this.files.length > 0,
        "Gambar produk wajib diupload");
});
