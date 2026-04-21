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

let targetRow   = null;
let targetHapus = null;

document.querySelector('.filter-status').addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-btn')) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    const status = e.target.dataset.status;
    document.querySelectorAll('#tablePesanan tr').forEach(row => {
        const rowStatus = row.dataset.status || '';
        row.style.display = (status === 'all' || rowStatus === status) ? '' : 'none';
    });
});

const openUbah = (btn) => {
    targetRow = btn.closest('tr');
    document.querySelectorAll("input[name='statusPesanan']").forEach(r => r.checked = false);
    document.getElementById('modalStatus').style.display = 'flex';
};

const tutupModal = () => {
    document.getElementById('modalStatus').style.display = 'none';
    targetRow = null;
};

const simpanStatus = () => {
    const selected = document.querySelector("input[name='statusPesanan']:checked");
    if (!selected) { alert('Pilih status terlebih dahulu!'); return; }
    if (!targetRow) return;

    const statusBaru = selected.value;
    const statusKey  = statusBaru.toLowerCase().replace(' ', '');
    const statusCell = targetRow.querySelector('.status');
    statusCell.textContent = statusBaru;
    statusCell.className   = 'status ' + statusKey;
    targetRow.dataset.status = statusKey;

    tutupModal();
};

const openHapus = (btn) => {
    targetHapus = btn.closest('tr');
    document.getElementById('modalHapus').style.display = 'flex';
};

const tutupHapus = () => {
    document.getElementById('modalHapus').style.display = 'none';
    targetHapus = null;
};

const konfirmasiHapus = () => {
    if (targetHapus) targetHapus.remove();
    tutupHapus();
};