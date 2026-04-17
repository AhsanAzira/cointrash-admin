/* ======================================================
   CoinTrash — Operator Panel JS (Full Database Update)
   ====================================================== */

// ===== CONFIGURATION =====
const API_URL = 'api.php'; // Pastikan file ini satu folder dengan index.html
const COIN_TO_RUPIAH = 10; // 1 koin = Rp 10

// ===== STATE =====
let TRASH_TYPES = [];     // Diambil dari tabel waste_types
let transactions = [];    // Diambil dari tabel transactions
let selectedUser = null;  // Menyimpan user hasil verifikasi
let itemCount = 0;        // Counter untuk ID baris sampah

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async () => {
  setupNav();
  updateClock();
  setInterval(updateClock, 1000);
  
  setupUserSearch();

  try {
    await loadPrices();
    await loadHistory();
    addTrashItem(); 
  } catch (error) {
    console.error("Gagal inisialisasi data:", error);
  }
});

// ===== API CALLS (DATABASE SYNC) =====

async function loadPrices() {
  const response = await fetch(`${API_URL}?action=get_prices`);
  TRASH_TYPES = await response.json();
  renderPriceList();
}

async function loadHistory() {
  const response = await fetch(`${API_URL}?action=get_history`);
  transactions = await response.json();
  renderHistory();
  renderStats();
}

function setupUserSearch() {
  const userInput = document.getElementById("user-id");
  if (!userInput) return;

  userInput.addEventListener("input", async () => {
    const val = userInput.value.trim();
    if (val.length < 3) {
      document.getElementById("user-preview").classList.add("hidden");
      selectedUser = null;
      return;
    }

    try {
      const response = await fetch(`${API_URL}?action=verify_user&search=${val}`);
      const user = await response.json();

      const preview = document.getElementById("user-preview");
      const display = document.getElementById("user-display");

      if (user) {
        selectedUser = user; 
        display.textContent = `${user.NAME} (ID: ${user.id})`;
        preview.classList.remove("hidden");
      } else {
        selectedUser = null;
        preview.classList.add("hidden");
      }
    } catch (error) {
      console.error("Gagal verifikasi user:", error);
    }
  });
}

// ===== UI LOGIC (TRASH INPUT) =====

function addTrashItem() {
  const container = document.getElementById("trash-items");
  const id = "item-" + (++itemCount);
  
  const options = TRASH_TYPES.map(t =>
    `<option value="${t.id}">${t.name}</option>`
  ).join("");

  const div = document.createElement("div");
  div.className = "trash-item";
  div.id = id;
  div.innerHTML = `
    <select onchange="recalculate()" aria-label="Jenis sampah">
      ${options}
    </select>
    <input type="number" min="0.1" step="0.1" placeholder="Berat (kg)" 
           oninput="recalculate()" aria-label="Berat kg" />
    <div class="item-coin-preview" id="coin-${id}">— koin</div>
    <button type="button" class="btn-remove-item" onclick="removeItem('${id}')" title="Hapus">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;
  container.appendChild(div);
  recalculate();
}

function removeItem(id) {
  const el = document.getElementById(id);
  if (el && document.querySelectorAll(".trash-item").length > 1) {
    el.remove();
  }
  recalculate();
}

function recalculate() {
  const items = getItems();
  let totalWeight = 0, totalCoins = 0, typeCount = 0;

  items.forEach(item => {
    const type = TRASH_TYPES.find(t => t.id == item.typeId);
    if (type && item.weight > 0) {
      const coins = Math.round(type.price_per_kg * item.weight);
      totalWeight += item.weight;
      totalCoins += coins;
      typeCount++;
      const previewEl = document.getElementById("coin-" + item.rowId);
      if (previewEl) previewEl.textContent = coins + " koin";
    }
  });

  document.getElementById("total-weight").textContent = totalWeight.toFixed(2) + " kg";
  document.getElementById("total-types").textContent = typeCount + " jenis";
  document.getElementById("total-coins").innerHTML = totalCoins + ' <span class="coin-unit">koin</span>';
  document.getElementById("total-rupiah").textContent = (totalCoins * COIN_TO_RUPIAH).toLocaleString("id-ID");
}

function getItems() {
  const rows = document.querySelectorAll(".trash-item");
  return Array.from(rows).map(row => {
    const sel = row.querySelector("select");
    const inp = row.querySelector("input[type=number]");
    return {
      rowId: row.id,
      typeId: sel ? sel.value : null,
      typeName: sel ? sel.options[sel.selectedIndex].text : "",
      weight: inp ? parseFloat(inp.value) || 0 : 0,
    };
  });
}

// ===== FORM SUBMISSION (MYSQL SYNC) =====

document.getElementById("trash-form").addEventListener("submit", async function(e) {
  e.preventDefault();

  if (!selectedUser) {
    alert("Cari dan verifikasi user terlebih dahulu!");
    return;
  }

  const items = getItems().filter(i => i.weight > 0);
  if (items.length === 0) {
    alert("Input berat sampah yang valid!");
    return;
  }

  const condition = document.querySelector('input[name="condition"]:checked').value;
  const multiplier = condition === "kotor" ? 0.8 : condition === "campuran" ? 0.9 : 1.0;

  const selectedType = TRASH_TYPES.find(t => t.id == items[0].typeId);
  const finalCoins = Math.round(selectedType.price_per_kg * items[0].weight * multiplier);

  const payload = {
    user_id: selectedUser.id,
    waste_type_id: items[0].typeId,
    weight: items[0].weight,
    coins: finalCoins
  };

  try {
    const response = await fetch(`${API_URL}?action=save_transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.status === 'success') {
      showSuccessModal({ userName: selectedUser.NAME, totalCoins: finalCoins });
      resetForm();
      await loadHistory();
    } else {
      alert("Error: " + result.message);
    }
  } catch (error) {
    console.error("Gagal menyimpan transaksi:", error);
  }
});

// ===== RENDERING DATA =====

function renderPriceList() {
  const el = document.getElementById("price-list");
  if (!el) return;
  el.innerHTML = TRASH_TYPES.map(t => `
    <div class="price-row">
      <span class="price-name">
        <span class="price-dot" style="background:var(--green)"></span>
        ${t.name}
      </span>
      <span class="price-val">${t.price_per_kg} koin/kg</span>
    </div>
  `).join("");
}

function renderHistory() {
  const body = document.getElementById("history-body");
  if (!body) return;
  
  if (transactions.length === 0) {
    body.innerHTML = `<tr class="empty-row"><td colspan="6">Belum ada transaksi hari ini</td></tr>`;
    return;
  }

  body.innerHTML = transactions.map(tx => {
    const time = new Date(tx.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    return `
      <tr>
        <td style="font-variant-numeric:tabular-nums;color:var(--text-2)">${time}</td>
        <td><strong>${tx.user_name}</strong><br><span style="color:var(--text-3);font-size:0.75rem">ID: ${tx.user_id}</span></td>
        <td style="color:var(--text-2)">${tx.waste_name}</td>
        <td style="font-variant-numeric:tabular-nums">${tx.weight} kg</td>
        <td><strong style="color:var(--coin-dark)">${parseInt(tx.coins).toLocaleString("id-ID")}</strong> koin</td>
        <td><span class="badge-success">✓ ${tx.status}</span></td>
      </tr>
    `;
  }).join("");
}

function renderStats() {
  if (transactions.length === 0) return;

  const totalTx = transactions.length;
  const totalKg = transactions.reduce((s, t) => s + parseFloat(t.weight), 0);
  const totalCoins = transactions.reduce((s, t) => s + parseInt(t.coins), 0);

  document.getElementById("stat-total-tx").textContent = totalTx;
  document.getElementById("stat-total-kg").textContent = totalKg.toFixed(1) + " kg";
  document.getElementById("stat-total-coins-out").textContent = totalCoins.toLocaleString("id-ID");
  document.getElementById("stat-total-rp").textContent = "Rp " + (totalCoins * COIN_TO_RUPIAH).toLocaleString("id-ID");

  const breakdown = {};
  transactions.forEach(tx => {
    if (!breakdown[tx.waste_name]) breakdown[tx.waste_name] = 0;
    breakdown[tx.waste_name] += parseFloat(tx.weight);
  });

  const el = document.getElementById("breakdown-list");
  const entries = Object.entries(breakdown);
  const maxVal = Math.max(...entries.map(([, v]) => v));

  el.innerHTML = entries.map(([name, kg]) => {
    const pct = (kg / maxVal) * 100;
    return `
      <div class="breakdown-row">
        <span class="breakdown-label">${name}</span>
        <div class="breakdown-bar-wrap">
          <div class="breakdown-bar" style="width:${pct}%;background:var(--green)"></div>
        </div>
        <span class="breakdown-val">${kg.toFixed(1)} kg</span>
      </div>
    `;
  }).join("");
}

// ===== HELPER FUNCTIONS (CLOCK, NAV, ETC) =====

function updateClock() {
  const el = document.getElementById("live-time");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })
    + "  " + now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function setupNav() {
  document.querySelectorAll(".nav-item").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const page = link.dataset.page;
      document.querySelectorAll(".nav-item").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
      const target = document.getElementById("page-" + page);
      if (target) target.classList.add("active");
    });
  });
}

function resetForm() {
  document.getElementById("user-id").value = "";
  document.getElementById("notes").value = "";
  document.getElementById("user-preview").classList.add("hidden");
  document.getElementById("trash-items").innerHTML = "";
  selectedUser = null;
  itemCount = 0;
  addTrashItem();
}

function showSuccessModal(tx) {
  const modal = document.getElementById("success-modal");
  document.getElementById("modal-summary").textContent = `Pengguna: ${tx.userName}`;
  document.getElementById("modal-coins").textContent = tx.totalCoins.toLocaleString("id-ID");
  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("success-modal").classList.add("hidden");
}

function simulateScan() {
  alert("Gunakan kolom input untuk mencari user berdasarkan Nama atau Email.");
}

function exportCSV() {
  if (transactions.length === 0) { alert("Data kosong."); return; }
  const header = ["Waktu", "User", "Sampah", "Berat", "Koin", "Status"];
  const rows = transactions.map(tx => [tx.created_at, tx.user_name, tx.waste_name, tx.weight, tx.coins, tx.status]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `riwayat_cointrash.csv`;
  a.click();
}