const hamburger = document.getElementById('hamburger');
const sidebar   = document.getElementById('sidebar');
const overlay   = document.getElementById('overlay');
hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
});
overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
});

let targetRowDelete  = null;
let targetRowEdit    = null;
let newImageData     = "";   
let activeFilter     = "all";
let kodeAsliBefore   = "";   

const getStatusByStock = (stok) => {
    stok = parseInt(stok);
    if (isNaN(stok) || stok <= 0) return "Habis";
    if (stok < 5)  return "Hampir Habis";
    return "Tersedia";
};

const getStatusClass = (status) => {
    if (status === "Tersedia")     return "tersedia";
    if (status === "Hampir Habis") return "hampir";
    return "habis";
};

const getKategoriFix = (kategori) =>
    (kategori || "").toLowerCase().includes("indoor") ? "indoor" : "outdoor";

const buildRow = (item) => {
    const stok      = parseInt(item.stok);
    const status    = getStatusByStock(stok);
    const statusCls = getStatusClass(status);
    const katFix    = getKategoriFix(item.kategori);
    const hargaFmt  = parseInt(item.harga).toLocaleString("id-ID");
    const imgSrc    = item.gambar || "";
    const kode      = item.kode    || "-";
    const tanggal   = item.tanggal || "-";

    return `
    <tr data-kategori="${katFix}">
        <td><img src="${imgSrc}" class="thumb" alt="${item.nama}"></td>
        <td>${kode}</td>
        <td>${item.nama}</td>
        <td>${item.kategori}</td>
        <td>${hargaFmt}</td>
        <td>${item.stok}</td>
        <td>${tanggal}</td>
        <td><span class="status ${statusCls}">${status}</span></td>
        <td>
            <button class="btn-edit"   onclick="openEdit(this)">&#9999;&#65039; Edit</button>
            <button class="btn-delete" onclick="openDelete(this)">&#128465; Hapus</button>
        </td>
    </tr>`;
};

const renderTable = () => {
    const data  = JSON.parse(localStorage.getItem("produk")) || [];
    const tbody = document.getElementById("tableBody");

    /* array method: .map() + .join() → innerHTML */
    tbody.innerHTML = data.map(item => buildRow(item)).join("");

    document.getElementById("emptyData").style.display = data.length === 0 ? "block" : "none";

    updateSummaryFromStorage();
    applySearchAndFilter();
};

const filterTable = (category, e) => {
    activeFilter = category;
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    if (e && e.target) e.target.classList.add("active");
    applySearchAndFilter();
};

document.getElementById("searchInput").addEventListener("input", () => {
    applySearchAndFilter();
});

const applySearchAndFilter = () => {
    const keyword    = document.getElementById("searchInput").value.trim().toLowerCase();
    const rows       = document.querySelectorAll("#tableBody tr");
    let visibleCount = 0;

    rows.forEach(row => {
        const kode     = row.children[1] ? row.children[1].innerText.toLowerCase() : "";
        const nama     = row.children[2] ? row.children[2].innerText.toLowerCase() : "";
        const kategori = row.getAttribute("data-kategori") || "";

        const matchFilter = activeFilter === "all" || kategori === activeFilter;
        const matchSearch = keyword === "" || kode.includes(keyword) || nama.includes(keyword);

        if (matchFilter && matchSearch) {
            row.style.display = "";
            visibleCount++;
        } else {
            row.style.display = "none";
        }
    });

    document.getElementById("emptySearch").style.display =
        (visibleCount === 0 && rows.length > 0) ? "block" : "none";
};

const openDelete = (button) => {
    targetRowDelete = button.closest("tr");
    document.getElementById("deleteModal").style.display = "flex";
};

const closeDelete = () => {
    document.getElementById("deleteModal").style.display = "none";
    targetRowDelete = null;
};

const confirmDelete = () => {
    if (!targetRowDelete) return;

    const kode = targetRowDelete.children[1].innerText.trim();

    let data = JSON.parse(localStorage.getItem("produk")) || [];
    data = data.filter(p => p.kode !== kode);
    localStorage.setItem("produk", JSON.stringify(data));

    targetRowDelete.remove();
    closeDelete();
    updateSummaryFromStorage();
    applySearchAndFilter();
};

const goInput = () => { window.location.href = "inputproduk.html"; };

const openEdit = (button) => {
    targetRowEdit  = button.closest("tr");
    const cells    = targetRowEdit.querySelectorAll("td");

    kodeAsliBefore = cells[1].innerText.trim();

    const imgEl = cells[0].querySelector("img");
    document.getElementById("editPreview").src    = imgEl ? imgEl.getAttribute("src") : "";
    document.getElementById("editKode").value     = cells[1].innerText.trim();
    document.getElementById("editNama").value     = cells[2].innerText.trim();
    document.getElementById("editKategori").value = cells[3].innerText.trim();

    const hargaRaw = cells[4].innerText.replace(/\./g, "").replace(/[^\d]/g, "");
    document.getElementById("editHarga").value    = hargaRaw;
    document.getElementById("editStok").value     = cells[5].innerText.trim();
    document.getElementById("editTanggal").value  = cells[6].innerText.trim();
    document.getElementById("autoStatus").value   = cells[7].innerText.trim();

    newImageData = "";   
    document.getElementById("editUpload").value = "";
    document.getElementById("editModal").style.display = "flex";
};

document.getElementById("editUpload").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        newImageData = event.target.result;   
        document.getElementById("editPreview").src = newImageData;
    };
    reader.readAsDataURL(file);
});

document.getElementById("editStok").addEventListener("input", function() {
    document.getElementById("autoStatus").value = getStatusByStock(this.value);
});

const saveEdit = () => {
    if (!targetRowEdit) return;

    const cells    = targetRowEdit.querySelectorAll("td");
    const kode     = document.getElementById("editKode").value.trim();
    const nama     = document.getElementById("editNama").value.trim();
    const kategori = document.getElementById("editKategori").value;
    const harga    = document.getElementById("editHarga").value;
    const stok     = document.getElementById("editStok").value;
    const tanggal  = document.getElementById("editTanggal").value;
    const status   = getStatusByStock(stok);
    const statusCls = getStatusClass(status);

    if (!kode || !nama || !harga || stok === "") {
        alert("Harap lengkapi semua field!");
        return;
    }

    const imgSrc = newImageData ||
        (cells[0].querySelector("img") ? cells[0].querySelector("img").getAttribute("src") : "");

    cells[0].innerHTML = `<img src="${imgSrc}" class="thumb" alt="${nama}">`;
    cells[1].innerText = kode;
    cells[2].innerText = nama;
    cells[3].innerText = kategori;
    cells[4].innerText = parseInt(harga).toLocaleString("id-ID");
    cells[5].innerText = stok;
    cells[6].innerText = tanggal;
    cells[7].innerHTML = `<span class="status ${statusCls}">${status}</span>`;
    targetRowEdit.setAttribute("data-kategori", getKategoriFix(kategori));

    targetRowEdit.classList.add("row-update");
    setTimeout(() => targetRowEdit.classList.remove("row-update"), 1000);

    let data  = JSON.parse(localStorage.getItem("produk")) || [];
    const idx = data.findIndex(p => p.kode === kodeAsliBefore);

    if (idx !== -1) {
        data[idx] = { kode, nama, kategori, harga, stok, tanggal, gambar: imgSrc };
    } else {
        data.push({ kode, nama, kategori, harga, stok, tanggal, gambar: imgSrc });
    }

    localStorage.setItem("produk", JSON.stringify(data));

    closeEdit();
    updateSummaryFromStorage();
    applySearchAndFilter();
};

const closeEdit = () => {
    document.getElementById("editModal").style.display = "none";
    targetRowEdit  = null;
    newImageData   = "";
    kodeAsliBefore = "";
    document.getElementById("editUpload").value = "";
};

const updateSummaryFromStorage = () => {
    const data = JSON.parse(localStorage.getItem("produk")) || [];

    const stats = data.reduce((acc, p) => {
        const stok = parseInt(p.stok) || 0;
        acc.totalStok += stok;
        if (getKategoriFix(p.kategori) === "indoor") acc.indoor++;
        else acc.outdoor++;
        if (stok < 5) acc.hampirHabis++;   
        return acc;
    }, { indoor: 0, outdoor: 0, totalStok: 0, hampirHabis: 0 });

    document.getElementById("sum-indoor").innerText  = stats.indoor      + " Produk";
    document.getElementById("sum-outdoor").innerText = stats.outdoor     + " Produk";
    document.getElementById("sum-stok").innerText    = stats.totalStok   + " Pcs";
    document.getElementById("sum-hampir").innerText  = stats.hampirHabis + " Produk";
};

const seedDefaultData = () => {
    if (localStorage.getItem("produk") !== null) return;
    const defaults = [
        { kode: "MF-001", nama: "Anggrek Bulan", kategori: "Tanaman Indoor",  harga: "150000", stok: "8",  tanggal: "2026-01-10", gambar: "anggrek bulan.jpg" },
        { kode: "MF-002", nama: "Kaktus",         kategori: "Tanaman Outdoor", harga: "50000",  stok: "3",  tanggal: "2026-02-05", gambar: "kaktus.jpg" },
        { kode: "MF-003", nama: "Marigold",        kategori: "Tanaman Outdoor", harga: "50000",  stok: "3",  tanggal: "2026-02-10", gambar: "marigold.jpg" },
        { kode: "MF-004", nama: "Aglonema",        kategori: "Tanaman Indoor",  harga: "80000",  stok: "20", tanggal: "2026-03-01", gambar: "aglonema.jpg" },
        { kode: "MF-005", nama: "Lidah Mertua",    kategori: "Tanaman Indoor",  harga: "90000",  stok: "6",  tanggal: "2026-03-15", gambar: "lidah mertua.jpg" }
    ];
    localStorage.setItem("produk", JSON.stringify(defaults));
};

document.addEventListener("DOMContentLoaded", () => {
    seedDefaultData();
    renderTable();
});